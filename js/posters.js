
// -------------------- display the posters -------------------- //

// Function to create and append poster elements to the gallery
function createAndAppendPosterElements(movies) {
  const gallery = document.querySelector("#poster-gallery");

  // Loop through each movie in the movies object
  for (const imageName in movies) {
    if (movies.hasOwnProperty(imageName)) {
      const val = imageName; 
      const detailPageUrl = "./poster-detail.html?imageUrl=" + encodeURIComponent("./assets/posters/" + val);

      // Create img element for poster
      const imgElement = document.createElement("img");
      imgElement.src = "./assets/posters/" + val;
      imgElement.alt = movies[imageName].title; // Add alt text for accessibility

      // Create a link element wrapping the image
      const linkElement = document.createElement("a");
      linkElement.href = detailPageUrl;
      linkElement.appendChild(imgElement);

      // Append the link element to the gallery
      gallery.appendChild(linkElement);
    }
  }
}

// The home page initializes directly into Color mode in update-sorting.js.
// Keeping the gallery empty until that fixed color order is ready prevents a
// momentary Ranking-order render on first load.
