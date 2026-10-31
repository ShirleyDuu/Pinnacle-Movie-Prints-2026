
// -------------------- search movie -------------------- //

document.addEventListener('DOMContentLoaded', () => {
    const searchIcon = document.getElementById('search-icon');
    const searchInput = document.getElementById('search-input');
    const popupContainer = document.getElementById('popup-container');
    const closePopup = document.getElementById('close-circle');
    const body = document.body;
    const searchResultTitle = document.getElementById('search-result-title'); 
  
    function disableScroll() {
      body.style.overflow = 'hidden';
    }
  
    function enableScroll() {
      body.style.overflow = 'auto';
    }
  
    function showPopup(matchedMovies, searchText) {
      const popupPosters = document.getElementById('popup-posters');
      popupPosters.innerHTML = '';
  
      if (Object.keys(matchedMovies).length > 0) {
          const searchResultsNames = [];
          Object.keys(matchedMovies).forEach((imageFileName) => {
              const movie = matchedMovies[imageFileName];
              searchResultsNames.push(movie.title); // Collect movie titles
  
              // Create the img element
              const img = document.createElement('img');
              img.src = `assets/posters/${imageFileName}`;
              img.alt = movie.title; // Use movie title as alt text for accessibility
  
              // Create the link element wrapping the image
              const link = document.createElement('a');
              link.href = `./poster-detail.html?fromSearch=true&imageUrl=${encodeURIComponent("assets/posters/" + imageFileName)}`;
              link.appendChild(img); // Append the image to the link
  
              // Append the link element to the popupPosters
              popupPosters.appendChild(link);
  
          });
          sessionStorage.setItem('searchResults', JSON.stringify(searchResultsNames));
          searchResultTitle.textContent = searchText; // Display the search text
  
      } else {
          searchResultTitle.textContent = 'No results'; // Display 'No results' if nothing is found
      }
  
      popupContainer.style.display = 'flex';
      disableScroll(); // Disable scrolling of poster gallery when the popup is displayed
  }
  
  
    searchIcon.addEventListener('click', () => {
      const searchText = searchInput.value.toLowerCase();
      if (searchText.trim() === '') {
        showPopup({}, ''); // No input text provided
      } else {
        const matchedMovies = Object.keys(movies).filter((key) => {
          const movie = movies[key];
          return (
            movie.title.toLowerCase().includes(searchText) ||
            movie.year.toString().includes(searchText) ||
            movie.director.toLowerCase().includes(searchText) ||
            movie.producer.toLowerCase().includes(searchText) ||
            movie.writer.toLowerCase().includes(searchText) ||
            movie.cast.toLowerCase().includes(searchText)
          );
        }).reduce((obj, key) => {
          obj[key] = movies[key];
          return obj;
        }, {});
    
        showPopup(matchedMovies, searchText);
      }
    });
  
    closePopup.addEventListener('click', () => {
      popupContainer.style.display = 'none';
      enableScroll();
      searchResultTitle.textContent = ''; // Clear the search result title when closing the popup
    });
  });
  