// -------------------- ranking / title sorting navigators -------------------- //

const titleNavigatorBuckets = Object.freeze([
  ...'ABCDEFGHIJKLMNOPQRSTUVWXYZ', '#'
]);
const yearNavigatorStart = 1924;
const yearNavigatorEnd = 2019;
const yearNavigatorSpan = yearNavigatorEnd - yearNavigatorStart;

let activeNavigatorMode = 'color';
let sortingNavigatorFrame;
let activeSortingNavigator = null;

function getTitleBucket(title) {
  const firstCharacter = (title || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').charAt(0).toUpperCase();
  return /^[A-Z]$/.test(firstCharacter) ? firstCharacter : '#';
}

function createTitleNavigatorLabels() {
  const labels = document.querySelector('#title-navigator .title-labels');
  if (!labels || labels.childElementCount) return;
  labels.innerHTML = titleNavigatorBuckets
    .map(bucket => `<span class="title-label" data-title-bucket="${bucket}">${bucket}</span>`)
    .join('');
}

function setSortingNavigatorMode(mode) {
  activeNavigatorMode = mode;
  document.body.classList.toggle('ranking-sorting', mode === 'ranking');
  document.body.classList.toggle('year-sorting', mode === 'year');
  document.body.classList.toggle('title-sorting', mode === 'title');
  createTitleNavigatorLabels();
  requestSortingNavigatorUpdate();
}

function requestSortingNavigatorUpdate() {
  cancelAnimationFrame(sortingNavigatorFrame);
  sortingNavigatorFrame = requestAnimationFrame(updateSortingNavigator);
}

function activeNavigatorPosters() {
  return Array.from(document.querySelectorAll('#poster-gallery a'));
}

function navigatorPosterClosestToGuideLine(posters) {
  if (!posters.length) return null;
  const atPageEnd = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
  if (atPageEnd) return posters[posters.length - 1];
  const guideLine = document.querySelector('.home-gallery-header').getBoundingClientRect().bottom + 28;
  return posters.reduce((nearest, poster) => {
    const distance = Math.abs(poster.getBoundingClientRect().top - guideLine);
    return distance < nearest.distance ? { poster, distance } : nearest;
  }, { poster: posters[0], distance: Infinity }).poster;
}

function rankingForPoster(poster) {
  return Number(poster.dataset.posterRank);
}

function yearForPoster(poster) {
  return Number(poster.dataset.posterYear);
}

function titleBucketForPoster(poster) {
  return poster.dataset.posterTitleBucket || '#';
}

function updateSortingNavigator() {
  if (activeSortingNavigator || !['ranking', 'year', 'title'].includes(activeNavigatorMode)) return;
  const posters = activeNavigatorPosters();
  const activePoster = navigatorPosterClosestToGuideLine(posters);
  if (!activePoster) return;

  if (activeNavigatorMode === 'ranking') {
    const navigator = document.getElementById('ranking-navigator');
    const rank = rankingForPoster(activePoster);
    if (!navigator || !Number.isFinite(rank)) return;
    const progress = (rank - 1) / 167;
    navigator.querySelector('.navigator-thumb').style.top = `${progress * 100}%`;
    const currentRank = navigator.querySelector('.navigator-current-rank');
    currentRank.textContent = String(rank);
    currentRank.style.top = `${progress * 100}%`;
    currentRank.hidden = rank === 1 || rank === 168;
    navigator.setAttribute('aria-valuenow', String(rank));
    return;
  }

  if (activeNavigatorMode === 'year') {
    const navigator = document.getElementById('year-navigator');
    const year = yearForPoster(activePoster);
    if (!navigator || !Number.isFinite(year)) return;
    const progress = (year - yearNavigatorStart) / yearNavigatorSpan;
    navigator.querySelector('.navigator-thumb').style.top = `${progress * 100}%`;
    const currentYear = navigator.querySelector('.navigator-current-year');
    currentYear.textContent = String(year);
    currentYear.style.top = `${progress * 100}%`;
    currentYear.hidden = year === yearNavigatorStart || year === yearNavigatorEnd;
    navigator.setAttribute('aria-valuenow', String(year));
    return;
  }

  const navigator = document.getElementById('title-navigator');
  const bucket = titleBucketForPoster(activePoster);
  const bucketIndex = Math.max(0, titleNavigatorBuckets.indexOf(bucket));
  const progress = bucketIndex / (titleNavigatorBuckets.length - 1);
  navigator.querySelector('.title-marker').style.top = `${progress * 100}%`;
  navigator.setAttribute('aria-valuenow', bucket);
  navigator.querySelectorAll('.title-label').forEach(label => {
    label.classList.toggle('is-active', label.dataset.titleBucket === bucket);
  });
}

function scrollToNavigatorPoster(target) {
  if (!target) return;
  const headerBottom = document.querySelector('.home-gallery-header').getBoundingClientRect().bottom;
  const targetTop = window.scrollY + target.getBoundingClientRect().top - headerBottom - 28;
  window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
}

function navigatorProgressFromPointer(navigator, event) {
  const bounds = navigator.getBoundingClientRect();
  return Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height));
}

function moveRankingNavigator(progress) {
  const rank = Math.round(1 + progress * 167);
  const target = activeNavigatorPosters().find(poster => rankingForPoster(poster) === rank);
  const navigator = document.getElementById('ranking-navigator');
  const rankProgress = ((rank - 1) / 167) * 100;
  navigator.querySelector('.navigator-thumb').style.top = `${rankProgress}%`;
  const currentRank = navigator.querySelector('.navigator-current-rank');
  currentRank.textContent = String(rank);
  currentRank.style.top = `${rankProgress}%`;
  currentRank.hidden = rank === 1 || rank === 168;
  navigator.setAttribute('aria-valuenow', String(rank));
  scrollToNavigatorPoster(target);
}

function moveYearNavigator(progress) {
  const requestedYear = Math.round(yearNavigatorStart + progress * yearNavigatorSpan);
  const posters = activeNavigatorPosters();
  const target = posters.reduce((closest, poster) => {
    const distance = Math.abs(yearForPoster(poster) - requestedYear);
    return distance < closest.distance ? { poster, distance } : closest;
  }, { poster: posters[0], distance: Infinity }).poster;
  const year = yearForPoster(target);
  const navigator = document.getElementById('year-navigator');
  const yearProgress = ((year - yearNavigatorStart) / yearNavigatorSpan) * 100;
  navigator.querySelector('.navigator-thumb').style.top = `${yearProgress}%`;
  const currentYear = navigator.querySelector('.navigator-current-year');
  currentYear.textContent = String(year);
  currentYear.style.top = `${yearProgress}%`;
  currentYear.hidden = year === yearNavigatorStart || year === yearNavigatorEnd;
  navigator.setAttribute('aria-valuenow', String(year));
  scrollToNavigatorPoster(target);
}

function moveTitleNavigator(progress) {
  const bucketIndex = Math.round(progress * (titleNavigatorBuckets.length - 1));
  const bucket = titleNavigatorBuckets[bucketIndex];
  const target = activeNavigatorPosters().find(poster => titleBucketForPoster(poster) === bucket);
  const navigator = document.getElementById('title-navigator');
  navigator.querySelector('.title-marker').style.top = `${(bucketIndex / (titleNavigatorBuckets.length - 1)) * 100}%`;
  navigator.setAttribute('aria-valuenow', bucket);
  navigator.querySelectorAll('.title-label').forEach(label => {
    label.classList.toggle('is-active', label.dataset.titleBucket === bucket);
  });
  scrollToNavigatorPoster(target);
}

function moveActiveNavigator(progress) {
  if (activeNavigatorMode === 'ranking') moveRankingNavigator(progress);
  if (activeNavigatorMode === 'year') moveYearNavigator(progress);
  if (activeNavigatorMode === 'title') moveTitleNavigator(progress);
}

function setupSortingNavigatorControls() {
  ['ranking-navigator', 'year-navigator', 'title-navigator'].forEach(id => {
    const navigator = document.getElementById(id);
    if (!navigator || navigator.dataset.controlsReady) return;
    navigator.dataset.controlsReady = 'true';

    navigator.addEventListener('pointerdown', event => {
      if (navigator.id !== `${activeNavigatorMode}-navigator`) return;
      activeSortingNavigator = navigator;
      navigator.setPointerCapture(event.pointerId);
      moveActiveNavigator(navigatorProgressFromPointer(navigator, event));
    });

    navigator.addEventListener('pointermove', event => {
      if (activeSortingNavigator === navigator) moveActiveNavigator(navigatorProgressFromPointer(navigator, event));
    });

    const releasePointer = event => {
      if (activeSortingNavigator !== navigator) return;
      activeSortingNavigator = null;
      if (navigator.hasPointerCapture(event.pointerId)) navigator.releasePointerCapture(event.pointerId);
    };
    navigator.addEventListener('pointerup', releasePointer);
    navigator.addEventListener('pointercancel', () => { activeSortingNavigator = null; });

    navigator.addEventListener('keydown', event => {
      if (navigator.id !== `${activeNavigatorMode}-navigator`) return;
      const step = activeNavigatorMode === 'ranking'
        ? 1 / 167
        : activeNavigatorMode === 'year'
          ? 1 / yearNavigatorSpan
          : 1 / (titleNavigatorBuckets.length - 1);
      const current = activeNavigatorMode === 'ranking'
        ? (Number(navigator.getAttribute('aria-valuenow')) - 1) / 167
        : activeNavigatorMode === 'year'
          ? (Number(navigator.getAttribute('aria-valuenow')) - yearNavigatorStart) / yearNavigatorSpan
          : Math.max(0, titleNavigatorBuckets.indexOf(navigator.getAttribute('aria-valuenow'))) / (titleNavigatorBuckets.length - 1);
      if (event.key === 'ArrowDown' || event.key === 'ArrowRight') {
        event.preventDefault();
        moveActiveNavigator(current + step);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowLeft') {
        event.preventDefault();
        moveActiveNavigator(current - step);
      } else if (event.key === 'Home') {
        event.preventDefault();
        moveActiveNavigator(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        moveActiveNavigator(1);
      }
    });
  });

  window.addEventListener('scroll', requestSortingNavigatorUpdate, { passive: true });
}

document.addEventListener('DOMContentLoaded', setupSortingNavigatorControls);
