// Analyze the real files in assets/posters. Low-saturation pixels (black, white, grey)
// are excluded; similar hues are grouped in 12-degree bins before selecting a dominant hue.
const posterColorCache = new Map();

async function getPosterColor(imageName) {
  if (posterColorCache.has(imageName)) return posterColorCache.get(imageName);

  const analysis = new Promise((resolve) => {
    const image = new Image();
    image.src = `./assets/posters/${imageName}`;
    image.onload = () => {
      const size = 48;
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      context.drawImage(image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      const bins = Array.from({ length: 30 }, () => ({ weight: 0, saturation: 0 }));

      for (let i = 0; i < pixels.length; i += 4) {
        const { hue, saturation, lightness } = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
        if (saturation < 0.20 || lightness < 0.08 || lightness > 0.94) continue;
        const bin = Math.min(29, Math.floor(hue / 12));
        const weight = saturation * (0.75 + Math.abs(lightness - 0.5));
        bins[bin].weight += weight;
        bins[bin].saturation += saturation * weight;
      }

      const winner = bins.reduce((best, bin, index) =>
        bin.weight > best.weight ? { ...bin, index } : best,
        { weight: 0, saturation: 0, index: 0 }
      );
      resolve({
        hue: winner.index * 12 + 6,
        saturation: winner.weight ? winner.saturation / winner.weight : 0,
        isNeutral: winner.weight === 0
      });
    };
    image.onerror = () => resolve({ hue: 360, saturation: 0, isNeutral: true });
  });

  posterColorCache.set(imageName, analysis);
  return analysis;
}

function rgbToHsl(red, green, blue) {
  const r = red / 255;
  const g = green / 255;
  const b = blue / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;
  if (delta === 0) return { hue: 0, saturation: 0, lightness };

  const saturation = delta / (1 - Math.abs(2 * lightness - 1));
  let hue;
  if (max === r) hue = 60 * (((g - b) / delta) % 6);
  else if (max === g) hue = 60 * ((b - r) / delta + 2);
  else hue = 60 * ((r - g) / delta + 4);
  return { hue: (hue + 360) % 360, saturation, lightness };
}
