// A lightweight WebGL mesh bends the whole poster image, following the same
// rendering approach as the supplied paper-fold reference rather than adding
// a separate folded-corner decoration.
const curlCorners = Object.freeze(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
const curlGrid = 24;
const curlVS = `
attribute vec2 aUv;
uniform int uCorner; uniform float uCurl; uniform float uAspect;
varying vec2 vUv; varying float vFold;
// Arc-length-preserving cylinder bend: material beyond the diagonal crease
// rolls instead of stretching, matching the paper-fold reference's approach.
vec3 bend(vec3 p, vec2 normal, float crease, float angle, float width) {
  float x = dot(p.xy, normal) - crease;
  if (x <= 0.) return p;
  vec2 axis = vec2(normal.y, -normal.x);
  float zAlong = dot(p.xy, axis), xc = min(x, width);
  float phi = angle * xc / width, radius = width / angle;
  float forward = radius * sin(phi), lift = radius * (1. - cos(phi));
  if (x > width) { forward += (x - width) * cos(angle); lift += (x - width) * sin(angle); }
  vFold = clamp(x / width, 0., 1.);
  // Every corner uses this exact curve. Changing only the normal mirrors the
  // lower-corner curl into the other three positions without a hard crease.
  return vec3((crease + forward) * normal + zAlong * axis, lift);
}
void main() {
  vec2 halfSheet = vec2(.5, .5 * uAspect);
  vec2 sign = uCorner == 0 ? vec2(-1., 1.) : uCorner == 1 ? vec2(1., 1.) : uCorner == 2 ? vec2(-1., -1.) : vec2(1., -1.);
  // There is one canonical curl: the lower-right corner. Every other corner
  // is the exact same surface mirrored into place, rather than a separately
  // parameterized curl. Texture coordinates remain unmirrored below.
  vec2 mirror = vec2(sign.x, -sign.y);
  vec2 normal = normalize(vec2(halfSheet.x, -halfSheet.y));
  float edge = dot(vec2(halfSheet.x, -halfSheet.y), normal);
  float depth = length(halfSheet) * (.30 + .50 * uCurl);
  vFold = 0.;
  vec3 localPaper = bend(vec3((aUv.x - .5) * mirror.x, ((.5 - aUv.y) * uAspect) * mirror.y, 0.), normal, edge - depth, 1.1 + 4.9 * uCurl, depth);
  vec3 paper = vec3(localPaper.xy * mirror, localPaper.z);
  float camera = 1. + paper.z * .90;
  vec2 clip = vec2(paper.x / .5, paper.y / (.5 * uAspect)) / camera;
  // Positive lift is closer to the viewer, regardless of which corner moves.
  gl_Position = vec4(clip, -paper.z * .10, 1.);
  vUv = aUv;
}`;
const curlFS = `
precision mediump float;
uniform sampler2D uImage;
uniform float uBorder;
varying vec2 vUv; varying float vFold;
void main() {
  vec4 tex = texture2D(uImage, vUv);
  float paperLight = .96 + sin(vFold * 3.14159) * .18 - vFold * .12;
  // The source image has no CSS border once the canvas replaces it. Draw the
  // original white 1px edge in texture space so it bends with the paper.
  float edgeDistance = min(min(vUv.x, 1. - vUv.x), min(vUv.y, 1. - vUv.y));
  float border = 1. - smoothstep(uBorder, uBorder * 2., edgeDistance);
  gl_FragColor = vec4(mix(tex.rgb * paperLight, vec3(1.), border), tex.a);
}`;

function makeShader(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source); gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}

function makeMesh(gl) {
  const vertices = [], indices = [];
  for (let y = 0; y <= curlGrid; y++) for (let x = 0; x <= curlGrid; x++) vertices.push(x / curlGrid, y / curlGrid);
  for (let y = 0; y < curlGrid; y++) for (let x = 0; x < curlGrid; x++) {
    const i = y * (curlGrid + 1) + x;
    indices.push(i, i + 1, i + curlGrid + 1, i + 1, i + curlGrid + 2, i + curlGrid + 1);
  }
  const positions = gl.createBuffer(), elements = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positions); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elements); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
  return { positions, elements, count: indices.length };
}

function createCurlRenderer(link) {
  const image = link.querySelector('img');
  // Let the CSS fallback handle the very rare first hover before an image is
  // decoded. A later hover will promote it to the WebGL version.
  if (!image || !image.complete || !image.naturalWidth) return null;
  const canvas = document.createElement('canvas');
  canvas.className = 'poster-curl-canvas'; link.appendChild(canvas);
  const gl = canvas.getContext('webgl', { alpha: true, premultipliedAlpha: false });
  if (!gl) { canvas.remove(); return null; }
  const program = gl.createProgram();
  try {
    gl.attachShader(program, makeShader(gl, gl.VERTEX_SHADER, curlVS));
    gl.attachShader(program, makeShader(gl, gl.FRAGMENT_SHADER, curlFS));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) { console.warn('Poster curl unavailable', error); canvas.remove(); return null; }
  const texture = gl.createTexture();
  try {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    // The mesh has its own top-to-bottom UV convention. Flipping the source
    // here reverses the complete poster whenever the canvas takes over.
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(parameter => gl.texParameteri(gl.TEXTURE_2D, parameter, gl.LINEAR));
    [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(parameter => gl.texParameteri(gl.TEXTURE_2D, parameter, gl.CLAMP_TO_EDGE));
  } catch (error) {
    console.warn('Poster curl texture unavailable', error); canvas.remove(); return null;
  }
  link.classList.add('webgl-curl-ready');
  return { link, image, canvas, gl, program, texture, mesh: makeMesh(gl), corner: 0, amount: 0, target: 0, frame: 0 };
}

function drawCurl(renderer) {
  const { gl, canvas, image, program, texture, mesh } = renderer;
  const rect = image.getBoundingClientRect(), scale = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(rect.width * scale)), height = Math.max(1, Math.round(rect.height * scale));
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  // The curl mesh overlaps the flat sheet. Without a depth buffer, triangles
  // drawn later cover an upper-left curl but happen to reveal a lower-right
  // curl because of grid draw order. Treat lifted paper as foreground so all
  // four mirrored corners layer identically.
  gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.clearDepth(1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.useProgram(program);
  gl.bindBuffer(gl.ARRAY_BUFFER, mesh.positions);
  const attribute = gl.getAttribLocation(program, 'aUv');
  gl.enableVertexAttribArray(attribute); gl.vertexAttribPointer(attribute, 2, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, mesh.elements);
  gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(gl.getUniformLocation(program, 'uImage'), 0);
  // Match the original image's 1 CSS-pixel border, including on Retina screens.
  gl.uniform1f(gl.getUniformLocation(program, 'uBorder'), scale / Math.min(width, height));
  gl.uniform1i(gl.getUniformLocation(program, 'uCorner'), renderer.corner);
  gl.uniform1f(gl.getUniformLocation(program, 'uCurl'), renderer.amount);
  gl.uniform1f(gl.getUniformLocation(program, 'uAspect'), rect.height / rect.width);
  gl.drawElements(gl.TRIANGLES, mesh.count, gl.UNSIGNED_SHORT, 0);
}

function animateCurl(renderer) {
  if (renderer.frame) return;
  const step = () => {
    renderer.amount += (renderer.target - renderer.amount) * .2;
    drawCurl(renderer);
    if (Math.abs(renderer.target - renderer.amount) > .008) {
      renderer.frame = requestAnimationFrame(step);
    } else {
      renderer.amount = renderer.target;
      renderer.frame = 0;
      if (renderer.target === 0) renderer.link.classList.remove('poster-curl-active');
    }
  };
  renderer.frame = requestAnimationFrame(step);
}

const curlRenderers = new WeakMap();
// A file:// page in Chrome cannot upload local images to WebGL. Remember that
// one failed attempt per poster rather than leaking a new WebGL context on
// every pointer movement while the CSS fallback is active.
const curlUnavailable = new WeakSet();

function discardRenderer(link) {
  const renderer = curlRenderers.get(link);
  if (renderer) {
    cancelAnimationFrame(renderer.frame);
    renderer.canvas.remove();
    curlRenderers.delete(link);
  }
  link.classList.remove('webgl-curl-ready', 'poster-curl-active', ...curlCorners.map(corner => `curl-${corner}`));
}

function rendererFor(link) {
  // A newly selected detail poster may still be decoding. Leave it eligible
  // for a later hover instead of incorrectly marking its curl unavailable.
  const image = link.querySelector('img');
  if (!image || !image.complete || !image.naturalWidth) return null;
  if (curlUnavailable.has(link)) return null;
  let renderer = curlRenderers.get(link);
  // When returning with the browser Back button, the page can be restored
  // from its back-forward cache while its WebGL drawing context has been
  // discarded. Recreate the canvas instead of keeping a frozen renderer.
  if (renderer && renderer.gl.isContextLost()) {
    discardRenderer(link);
    renderer = null;
  }
  if (!renderer) {
    renderer = createCurlRenderer(link);
    if (renderer) curlRenderers.set(link, renderer);
    else curlUnavailable.add(link);
  }
  return renderer;
}

document.addEventListener('DOMContentLoaded', () => {
  // Sorting, searching, and saved collections can replace poster cards after
  // page load. Find and enrol the current card on first hover instead of
  // keeping a one-time list that would leave newly rendered posters inert.
  const curlTargetSelector = '#poster-gallery a, #my-favorites-posters a, #seen-before-posters a, .poster-detail-curl';
  const targetFor = element => {
    const target = element.closest(curlTargetSelector);
    if (target) target.classList.add('poster-curl-target');
    return target;
  };
  const updateCurl = event => {
    const link = targetFor(event.target); if (!link) return;
    const rect = link.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    // Pick the geometrically closest of all four corners. This makes the
    // curl swap naturally as the cursor crosses the poster's diagonals.
    const choices = [
      ['top-left', x * x + y * y],
      ['top-right', (1 - x) * (1 - x) + y * y],
      ['bottom-left', x * x + (1 - y) * (1 - y)],
      ['bottom-right', (1 - x) * (1 - x) + (1 - y) * (1 - y)]
    ];
    const [name, distance] = choices.reduce((nearest, choice) => choice[1] < nearest[1] ? choice : nearest);
    link.classList.remove(...curlCorners.map(corner => `curl-${corner}`));
    link.classList.add('poster-curl-active', `curl-${name}`);
    const renderer = rendererFor(link); if (!renderer) return;
    renderer.corner = curlCorners.indexOf(name);
    // Full roll at the corner; retain a subtle lift through the centre so
    // users can still discover the interaction without a dead zone.
    renderer.target = .42 + .46 * (1 - Math.min(1, Math.sqrt(distance) / .72));
    animateCurl(renderer);
  };
  document.addEventListener('pointermove', updateCurl);
  document.addEventListener('pointerout', event => {
    const link = event.target.closest('.poster-curl-target');
    if (!link || link.contains(event.relatedTarget)) return;
    link.classList.remove('poster-curl-active', ...curlCorners.map(corner => `curl-${corner}`));
    const renderer = curlRenderers.get(link);
    if (renderer) { renderer.target = 0; animateCurl(renderer); }
  });

  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    document.querySelectorAll('.poster-curl-target').forEach(discardRenderer);
  });

  // A detail-page selection swaps the central image in place. Its texture
  // must be rebuilt so a previous poster is never curled over the new one.
  document.addEventListener('posterchange', () => {
    const detailTarget = document.querySelector('.poster-detail-curl');
    if (detailTarget) discardRenderer(detailTarget);
  });
});
