
// -------------------- update icons on the detail page -------------------- //

const downloadIcon = document.getElementById('download-icon');
const posterDetailImg = document.getElementById('poster-detail-img');
const movieTitleElement = document.getElementById('movie-title');

// -------------------- download -------------------- //

// Set up the click event listener for the download icon
downloadIcon.addEventListener('click', function() {
    // Create an anchor (<a>) element
    const anchor = document.createElement('a');
    // Use the 'src' attribute of the poster image as the href for the anchor
    anchor.href = posterDetailImg.src;
    // The download attribute will be the movie title text
    anchor.download = movieTitleElement.innerText + '.jpg'; // Add the appropriate file extension
    // Append the anchor to the body
    document.body.appendChild(anchor);
    // Trigger a click on the anchor
    anchor.click();
});

// -------------------- add to favorites -------------------- //

// Retrieve the favorites from localStorage or default to an empty array
const starImages = JSON.parse(localStorage.getItem('starImages')) || [];
const starIcon = document.getElementById('my-favorites-icon');
starIcon.addEventListener('click', updateStarIcon);

//Function to update the star icon based on state
function updateStarIcon() {
    const posterImage = document.getElementById('poster-detail-img'); 
    const posterSrc = posterImage.src; 

    // Switch between solid (add) & empty (remove)
    if (starIcon.src.includes("star.svg")) {
        starIcon.src = "./assets/icons/star-solid.svg"; // Change to solid star
        console.log("Added to Favorites");
        addPosterToFavorites(posterSrc); // Add the poster to favorites
    } else if (starIcon.src.includes("star-solid.svg")) {
        starIcon.src = "./assets/icons/star.svg"; // Change back to empty star
        console.log("Removed from Favorites");
        removePosterFromFavorites(posterSrc); // Remove the poster from favorites
    }
}

// Function to add a poster to the favorites and save to localStorage
function addPosterToFavorites(posterSrc) {
    if (!starImages.includes(posterSrc)) {
        starImages.push(posterSrc);
        localStorage.setItem('starImages', JSON.stringify(starImages)); // Save to localStorage
        console.log(starImages);
    }
}

// Function to remove a poster from the favorites and save to localStorage
function removePosterFromFavorites(posterSrc) {
    const index = starImages.indexOf(posterSrc);
    if (index > -1) {
        starImages.splice(index, 1);
        localStorage.setItem('starImages', JSON.stringify(starImages)); // Save to localStorage
        console.log(starImages);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const posterDetailImg = document.getElementById('poster-detail-img');
    // Check if the current poster is in the favorites array
    if (starImages.includes(posterDetailImg.src)) {
        // If the poster is already a favorite, show the solid star
        starIcon.src = './assets/icons/star-solid.svg';
    } else {
        // If the poster is not a favorite, show the empty star
        starIcon.src = './assets/icons/star.svg';
    }
});

// -------------------- seen before -------------------- //

// Retrieve the seen before from localStorage or default to an empty array
const seenImages = JSON.parse(localStorage.getItem('seenImages')) || [];
const seenIcon = document.getElementById('seen-before-icon');
seenIcon.addEventListener('click', updateSeenIcon);

//Function to update the seen icon based on state
function updateSeenIcon() {
    const posterImage = document.getElementById('poster-detail-img'); 
    const posterSrc = posterImage.src; 

    // Switch between solid (add) & empty (remove)
    if (seenIcon.src.includes("seen.svg")) {
        seenIcon.src = "./assets/icons/seen-solid.svg"; // Change to solid seen
        console.log("Added to Seen");
        addPosterToSeen(posterSrc); // Add the poster to seen
    } else if (seenIcon.src.includes("seen-solid.svg")) {
        seenIcon.src = "./assets/icons/seen.svg"; // Change back to empty seen
        console.log("Removed from Seen");
        removePosterFromSeen(posterSrc); // Remove the poster from seen
    }
}

// Function to add a poster to seen before and save to localStorage
function addPosterToSeen(posterSrc) {
    if (!seenImages.includes(posterSrc)) {
        seenImages.push(posterSrc);
        localStorage.setItem('seenImages', JSON.stringify(seenImages)); // Save to localStorage
        console.log(seenImages);
    }
}

// Function to remove a poster from seen before and save to localStorage
function removePosterFromSeen(posterSrc) {
    const index = seenImages.indexOf(posterSrc);
    if (index > -1) {
        seenImages.splice(index, 1);
        localStorage.setItem('seenImages', JSON.stringify(seenImages)); // Save to localStorage
        console.log(seenImages);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const posterDetailImg = document.getElementById('poster-detail-img');
    // Check if the current poster is in seen array
    if (seenImages.includes(posterDetailImg.src)) {
        // If the poster is already seen, show the solid seen
        seenIcon.src = './assets/icons/seen-solid.svg';
    } else {
        // If the poster is not seen, show the empty seen
        seenIcon.src = './assets/icons/seen.svg';
    }
});



