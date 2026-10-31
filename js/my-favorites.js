
// -------------------- update my favorites page -------------------- //

const myFavoritesList = document.getElementById('my-favorites-posters');
const noFavoritesTextId = 'no-favorites-message'; 

// Retrieve the favorites from localStorage or default to an empty array
const starImages = JSON.parse(localStorage.getItem('starImages')) || [];

// Function to update the display of favorites on the page
function updateFavoritesDisplay() {
    // Clear the current display
    myFavoritesList.innerHTML = '';

    if (starImages.length === 0) {
        // Display a message if there are no favorites
        const noFavoritesMessage = document.createElement('p');
        noFavoritesMessage.id = noFavoritesTextId;
        noFavoritesMessage.textContent = "You haven't added any posters to My Favorites yet!";
        myFavoritesList.appendChild(noFavoritesMessage);
    } else {
        // Display each favorite poster
        starImages.forEach(imagePath => {
            // Create an <img> element
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Favorite Poster';
            imgElement.classList.add('favorites-img');

            // Create a link element that leads to a detail page with the image as a parameter
            const detailPageUrl = "./poster-detail.html?imageUrl=" + encodeURIComponent(imagePath) + "&from=myFavorites";
            const linkElement = document.createElement('a');
            linkElement.href = detailPageUrl;
            linkElement.appendChild(imgElement); // Append the <img> to the <a>

            // Append the <a> to the list
            myFavoritesList.appendChild(linkElement);
        });
    }
}

updateFavoritesDisplay();
