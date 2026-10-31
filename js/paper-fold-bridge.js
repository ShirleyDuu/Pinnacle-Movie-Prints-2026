// Reuse the verified standalone Corner Curl renderer as a clean poster hover
// surface. The renderer UI is hidden; only its WebGL stage is shown.
let paperFoldFrame;
let paperFoldReady;

function getPaperFoldFrame() {
  if (paperFoldFrame) return paperFoldFrame;
  paperFoldFrame = document.createElement('iframe');
  paperFoldFrame.className = 'poster-paper-fold';
  paperFoldFrame.src = './paper-fold-preview.html';
  paperFoldReady = new Promise(resolve => {
    paperFoldFrame.addEventListener('load', () => {
      const doc = paperFoldFrame.contentDocument;
      const style = doc.createElement('style');
      style.textContent = '#panel,#gizmo,#secSun,#drop,#err{display:none!important}#app{display:block!important}#stage{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important}';
      doc.head.appendChild(style);
      doc.querySelector('[data-m="corner"]')?.click();
      resolve();
    }, { once: true });
  });
  return paperFoldFrame;
}

async function showPaperFold(link) {
  const image = link.querySelector('img');
  const frame = getPaperFoldFrame();
  if (frame.parentElement !== link) link.appendChild(frame);
  await paperFoldReady;
  const win = frame.contentWindow;
  const source = new win.Image();
  source.onload = () => win.uploadImage?.(source);
  source.src = image.currentSrc || image.src;
  link.classList.add('paper-fold-active');
}

document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('poster-gallery');
  if (!gallery) return;
  gallery.addEventListener('pointerover', event => {
    const link = event.target.closest('#poster-gallery a');
    if (link) showPaperFold(link);
  });
  gallery.addEventListener('pointerout', event => {
    const link = event.target.closest('#poster-gallery a');
    if (link && !link.contains(event.relatedTarget)) link.classList.remove('paper-fold-active');
  });
});
