
// -------------------- update sorting mode and display -------------------- //

const sortingModeText = document.getElementById('sorting-mode');
const sortingIcon = document.getElementById('sorting-icon');
const sortingCircle = document.getElementById('sorting-circle');

sortingCircle.addEventListener('click', updateSortingMode);

async function updateSortingMode() {
  let sortedMovies;
  if (sortingIcon.src.includes("ranking.svg")) {
      sortingCircle.classList.remove('color-mode');
      exitColorSorting();
      sortingIcon.src = "./assets/icons/title.svg";
      sortingIcon.style.height = '28px'; 
      sortingModeText.innerText = "Title";
      setSortingNavigatorMode('title');
      // Sort images by title when the icon is title
      sortedMovies = sortMoviesByTitle(movies);
      storeSortingState('title');

  } else if (sortingIcon.src.includes("title.svg")) {
      sortingCircle.classList.remove('color-mode');
      exitColorSorting();
      sortingIcon.src = "./assets/icons/year.svg";
      sortingIcon.style.width = '21.5px'; 
      sortingModeText.innerText = "Year";
      setSortingNavigatorMode('year');
      // Sort images by year when the icon is year
      sortedMovies = sortMoviesByYear(movies);
      storeSortingState('year');

  } else if (sortingIcon.src.includes("year.svg")) {
      sortingIcon.src = "./assets/icons/color.png";
      sortingCircle.classList.add('color-mode');
      sortingIcon.style.width = '100%';
      sortingIcon.style.height = '100%';
      sortingModeText.innerText = "Color";
      setSortingNavigatorMode('color');
      enterColorSorting();
      sortedMovies = sortMoviesByColor(movies);
      storeSortingState('color');

  } else if (sortingIcon.src.includes("color.png")) {
      sortingIcon.src = "./assets/icons/ranking.svg";
      sortingCircle.classList.remove('color-mode');
      exitColorSorting();
      sortingIcon.style.width = '22px'; 
      sortingIcon.style.height = '22px';
      sortingModeText.innerText = "Ranking";
      setSortingNavigatorMode('ranking');
      // Sort images by ranking when the icon is ranking
      sortedMovies = sortMoviesByRanking(movies);
      storeSortingState('ranking');
  }

  // Update the images display
  updateImagesDisplay(sortedMovies);
};


function storeSortingState(sortingMethod) {
  sessionStorage.setItem('currentSorting', sortingMethod);
}

// Color is the gallery's landing state; the normal cycle continues with Ranking, Title, and Year.
function initializeDefaultColorSorting() {
  sortingIcon.src = "./assets/icons/color.png";
  sortingCircle.classList.add('color-mode');
  sortingIcon.style.width = '100%';
  sortingIcon.style.height = '100%';
  sortingModeText.innerText = "Color";
  setSortingNavigatorMode('color');
  enterColorSorting();
  updateImagesDisplay(sortMoviesByColor(movies));
  storeSortingState('color');
}

initializeDefaultColorSorting();

