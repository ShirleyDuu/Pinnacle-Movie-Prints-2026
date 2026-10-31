
// -------------------- update seen before page -------------------- //

const seenBeforeList = document.getElementById('seen-before-posters');
const noSeenTextId = 'no-seen-message'; 

// Retrieve the seen before from localStorage or default to an empty array
const seenImages = JSON.parse(localStorage.getItem('seenImages')) || [];


// Function to update the display of seen before on the page
function updateSeenDisplay() {
    // Clear the current display
    seenBeforeList.innerHTML = '';

    if (seenImages.length === 0) {
        // Display a message if there are no seen before
        const noSeenMessage = document.createElement('p');
        noSeenMessage.id = noSeenTextId;
        noSeenMessage.textContent = "You haven't added any posters to Seen Before yet!";
        seenBeforeList.appendChild(noSeenMessage);
    } else {
        // Display each seen poster
        seenImages.forEach(imagePath => {
            const imgElement = document.createElement('img');
            imgElement.src = imagePath;
            imgElement.alt = 'Seen Poster';
            imgElement.classList.add('seen-img');

            // Create a link element that leads to a detail page with the image as a parameter
            const detailPageUrl = "./poster-detail.html?imageUrl=" + encodeURIComponent(imagePath) + "&from=seenBefore";
            const linkElement = document.createElement('a');
            linkElement.href = detailPageUrl;
            linkElement.appendChild(imgElement); // Append the <img> to the <a>

            // Append the <a> to the list
            seenBeforeList.appendChild(linkElement);
        });
    }
}

updateSeenDisplay();


