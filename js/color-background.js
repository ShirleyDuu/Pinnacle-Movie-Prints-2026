// In Color mode, the page background follows the dominant hue of the poster row
// nearest the top of the gallery. Other sorting modes always retain a black canvas.
let colorBackgroundFrame;
let colorSpectrumPointerIsDown = false;

// These stops mirror the CSS spectrum, so the marker always sits on the same
// color that is currently driving the page background.
const spectrumStopByHue = Object.freeze({
  354: 0, 6: 2, 18: 10, 30: 18, 42: 25, 54: 30, 66: 36,
  138: 47, 162: 58, 186: 63, 198: 68, 210: 72, 222: 75,
  234: 78, 294: 83, 318: 84, 330: 85, 342: 86
});

function enterColorSorting() {
  document.body.classList.add('color-sorting');
  setupColorSpectrumControls();
  window.addEventListener('scroll', requestColorBackgroundUpdate, { passive: true });
  requestColorBackgroundUpdate();
}

function exitColorSorting() {
  document.body.classList.remove('color-sorting');
  document.body.style.removeProperty('--color-sorting-background');
  document.body.style.removeProperty('--color-sorting-glass-background');
  document.body.style.removeProperty('--color-sorting-header-start');
  document.body.style.removeProperty('--color-sorting-header-mid');
  document.body.style.removeProperty('--color-sorting-header-fade');
  window.removeEventListener('scroll', requestColorBackgroundUpdate);
}

function setColorSortingPalette(hue, saturation, lightness) {
  const rootStyle = document.body.style;
  rootStyle.setProperty('--color-sorting-background', `hsl(${hue} ${saturation}% ${lightness}%)`);
  rootStyle.setProperty('--color-sorting-glass-background', `hsl(${hue} ${saturation}% ${lightness}% / 0.40)`);
  rootStyle.setProperty('--color-sorting-header-start', `hsl(${hue} ${saturation}% ${lightness}% / 0.72)`);
  rootStyle.setProperty('--color-sorting-header-mid', `hsl(${hue} ${saturation}% ${lightness}% / 0.52)`);
  rootStyle.setProperty('--color-sorting-header-fade', `hsl(${hue} ${saturation}% ${lightness}% / 0.20)`);
}

function requestColorBackgroundUpdate() {
  cancelAnimationFrame(colorBackgroundFrame);
  colorBackgroundFrame = requestAnimationFrame(updateColorSortingBackground);
}

function updateColorSortingBackground() {
  if (!document.body.classList.contains('color-sorting')) return;
  const posters = Array.from(document.querySelectorAll('#poster-gallery a[data-poster-hue]'));
  if (!posters.length) return;

  const guideLine = document.querySelector('.home-gallery-header').getBoundingClientRect().bottom + 28;
  const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  const nearestPoster = atPageEnd ? posters[posters.length - 1] : posters.reduce((nearest, poster) => {
    const distance = Math.abs(poster.getBoundingClientRect().top - guideLine);
    return distance < nearest.distance ? { poster, distance } : nearest;
  }, { poster: posters[0], distance: Infinity }).poster;
  updateColorSpectrumMarker(nearestPoster, posters);
  if (nearestPoster.dataset.posterNeutral === 'true') {
    const tone = Number(nearestPoster.dataset.posterNeutralTone);
    const lightness = Number.isFinite(tone) ? tone : 19;
    setColorSortingPalette(0, 0, lightness);
    return;
  }

  const hue = Number(nearestPoster.dataset.posterHue);
  if (Number.isFinite(hue) && hue < 360) {
    setColorSortingPalette(hue, 64, 37);
  }
}

function updateColorSpectrumMarker(activePoster, posters) {
  const spectrum = document.querySelector('.color-spectrum');
  if (!spectrum || colorSpectrumPointerIsDown) return;
  const progress = spectrumProgressForPoster(activePoster);
  spectrum.querySelector('.color-spectrum-marker').style.top = `${progress * 100}%`;
  spectrum.setAttribute('aria-valuenow', String(Math.round(progress * 100)));
}

function spectrumProgressForPoster(poster) {
  if (poster.dataset.posterNeutral === 'true') {
    const tone = Number(poster.dataset.posterNeutralTone);
    const normalizedTone = Number.isFinite(tone) ? Math.min(38, Math.max(8, tone)) : 19;
    return 0.88 + ((38 - normalizedTone) / 30) * 0.12;
  }
  const hue = Number(poster.dataset.posterHue);
  return (spectrumStopByHue[hue] ?? 0) / 100;
}

function scrollToSpectrumProgress(progress) {
  const posters = Array.from(document.querySelectorAll('#poster-gallery a[data-poster-hue]'));
  const spectrum = document.querySelector('.color-spectrum');
  if (!posters.length || !spectrum) return;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const target = posters.reduce((nearest, poster) => {
    const distance = Math.abs(spectrumProgressForPoster(poster) - clampedProgress);
    return distance < nearest.distance ? { poster, distance } : nearest;
  }, { poster: posters[0], distance: Infinity }).poster;
  const headerBottom = document.querySelector('.home-gallery-header').getBoundingClientRect().bottom;
  const targetTop = window.scrollY + target.getBoundingClientRect().top - headerBottom - 28;
  spectrum.querySelector('.color-spectrum-marker').style.top = `${clampedProgress * 100}%`;
  spectrum.setAttribute('aria-valuenow', String(Math.round(clampedProgress * 100)));
  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
}

function spectrumProgressFromPointer(event) {
  const spectrum = document.querySelector('.color-spectrum');
  const bounds = spectrum.getBoundingClientRect();
  return (event.clientY - bounds.top) / bounds.height;
}

function setupColorSpectrumControls() {
  const spectrum = document.querySelector('.color-spectrum');
  if (!spectrum || spectrum.dataset.controlsReady) return;
  spectrum.dataset.controlsReady = 'true';

  spectrum.addEventListener('pointerdown', event => {
    if (!document.body.classList.contains('color-sorting')) return;
    colorSpectrumPointerIsDown = true;
    spectrum.setPointerCapture(event.pointerId);
    scrollToSpectrumProgress(spectrumProgressFromPointer(event));
  });

  spectrum.addEventListener('pointermove', event => {
    if (colorSpectrumPointerIsDown) scrollToSpectrumProgress(spectrumProgressFromPointer(event));
  });

  spectrum.addEventListener('pointerup', event => {
    colorSpectrumPointerIsDown = false;
    if (spectrum.hasPointerCapture(event.pointerId)) spectrum.releasePointerCapture(event.pointerId);
  });

  spectrum.addEventListener('pointercancel', () => { colorSpectrumPointerIsDown = false; });

  spectrum.addEventListener('keydown', event => {
    const current = Number(spectrum.getAttribute('aria-valuenow')) / 100;
    if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToSpectrumProgress(current + 0.04);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToSpectrumProgress(current - 0.04);
    } else if (event.key === 'Home') {
      event.preventDefault();
      scrollToSpectrumProgress(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      scrollToSpectrumProgress(1);
    }
  });
}
