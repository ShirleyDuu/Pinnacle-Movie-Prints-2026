
// -------------------- update-sorting functions -------------------- //

const imagesContainer = document.querySelector('#poster-gallery');
let posterColorsByName = new Map();

// Function to sort movies by title
function sortMoviesByTitle(movies) {
    return Object.entries(movies).sort(([key1, val1], [key2, val2]) => {
      const bucketDifference = titleNavigatorBuckets.indexOf(getTitleBucket(val1.title)) - titleNavigatorBuckets.indexOf(getTitleBucket(val2.title));
      return bucketDifference || val1.title.localeCompare(val2.title);
    });
  }
  
// Function to sort movies by year
function sortMoviesByYear(movies) {
    return Object.entries(movies).sort(([key1, val1], [key2, val2]) => {
      return val1.year - val2.year;
    });
}

// Function to sort movies by ranking
function sortMoviesByRanking(movies) {
    return Object.entries(movies).sort(([key1], [key2]) => {
      let rank1 = parseInt(key1.split(' ')[0]);
      let rank2 = parseInt(key2.split(' ')[0]);
      return rank1 - rank2;
    });
}

// Read the generated fixed order; no poster pixels are analyzed at runtime.
function sortMoviesByColor(movies) {
    const movieByRank = new Map(Object.entries(movies).map(entry => [Number(entry[0].split(' ')[0]), entry]));
    posterColorsByName = new Map();
    const neutralCount = fixedColorPosterOrder.filter(item => item.isNeutral).length;
    let neutralIndex = 0;
    return fixedColorPosterOrder.map(({ rank, hue, isNeutral }) => {
        const entry = movieByRank.get(rank);
        // Grayscale posters fade from a lighter neutral gray to almost black in their fixed order.
        const neutralTone = isNeutral
          ? Math.round(38 - (neutralIndex++ * 30) / Math.max(neutralCount - 1, 1))
          : null;
        posterColorsByName.set(entry[0], { hue, isNeutral, neutralTone });
        return entry;
    });
}

// Function to update the images display based on the sorted array
function updateImagesDisplay(sortedArray) {
    const imagesContainer = document.querySelector('#poster-gallery');
    if (imagesContainer) {
        imagesContainer.innerHTML = ''; // Clear current images
        sortedArray.forEach(([imageName, movie]) => {
        const imgElement = document.createElement("img");
        imgElement.src = "./assets/posters/" + imageName;
        imgElement.alt = movie.title; // Add alt text for accessibility
    
        const linkElement = document.createElement("a");
        linkElement.href = "./poster-detail.html?imageUrl=" + encodeURIComponent("./assets/posters/" + imageName);
        linkElement.dataset.posterRank = String(Number(imageName.split(' ')[0]));
        linkElement.dataset.posterYear = String(movie.year);
        linkElement.dataset.posterTitleBucket = getTitleBucket(movie.title);
        const color = posterColorsByName.get(imageName);
        if (color) {
            linkElement.dataset.posterHue = color.hue;
            linkElement.dataset.posterNeutral = color.isNeutral;
            if (color.neutralTone !== null) linkElement.dataset.posterNeutralTone = color.neutralTone;
        }
        linkElement.appendChild(imgElement);
    
        imagesContainer.appendChild(linkElement);
    })
    if (document.body.classList.contains('color-sorting')) updateColorSortingBackground();
    if (typeof requestSortingNavigatorUpdate === 'function') requestSortingNavigatorUpdate();
    } else {
        console.error('The images container (#poster-gallery) does not exist in the DOM.');
    };
}
  
