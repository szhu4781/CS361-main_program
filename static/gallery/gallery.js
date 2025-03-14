document.addEventListener("DOMContentLoaded", function (){
    //Variables for full-size image display--------------------------
    const modal = document.getElementById("modal");
    const modalImg = document.getElementById("full-size-image");
    const close = document.querySelector(".close");
    const infoButton = document.querySelector(".display-info");  
    const infoDiv = document.getElementById("image-info");  
    //---------------------------------------------------------------
    //Variables for displaying image context-------------------------------------
    const editContext = document.querySelector(".edit-context");   
    const contextForm = document.getElementById("context-form");
    const saveContext = document.getElementById("save-context");
    //---------------------------------------------------------------
    //Variables for rating system-------------------------------
    const rateButton = document.querySelector(".add-rating");
    const ratingForm = document.getElementById("rating-form");
    const ratingInput = document.getElementById("rating-input")
    const submitRating = document.getElementById("submit-rating");
    //---------------------------------------------------------------
    //Variables for categorizing and tagging images------------------------------
    const categorizeButton = document.querySelector('.categorize');
    const dropdown = document.getElementById('category-dropdown');
    const categorySelect = document.getElementById('selection');
    const categoryConfirm = document.getElementById('confirm-selection');
    const tagButton = document.querySelector('.tag-image');
    //---------------------------------------------------------------
    //Variables for searching images---------------------------------
    const searchButton = document.getElementById("search-button");
    const searchMsg = document.getElementById("search-message");
    const clearSearch = document.getElementById("clear-search");
    //----------------------------------------------------------------------
    //Variables for downloading images--------------------------------------
    const downloadButton = document.querySelector('.download');
    //---------------------------------------------------------------
    //Variables for toggling theme----------------------------------------
    const toggleButton = document.getElementById('mode-toggle');
    //---------------------------------------------------------------
    //---------------------------------------------------------------

    //Variables for slider animation
    let i = 0;
    let is_animate = false;
      
    //Function for updating image when using slider
    function updateImage(direction){
        //Prevents multiple clicks during transition
        if(is_animate) return;
        is_animate = true;

        const prev = document.querySelector('.prev_img');
        const current = document.querySelector('.current_img');
        const next = document.querySelector('.next_img');

        prev.style.transition = "transform 1s ease-in-out, opacity 1s ease-in-out";
        current.style.transition = "transform 1s ease-in-out, opacity 1s ease-in-out";
        next.style.transition = "transform 1s ease-in-out, opacity 1s ease-in-out";

        //When the direction changes, apply a fade effect to the
        //current image, and increase/decrease opacity for the
        //previous/next image
        if(direction === "next"){
            next.style.zIndex = "3";
            prev.style.zIndex = "1";

            prev.style.transform = "translateX(-240%) scale(0.8)";
            prev.style.opacity = "0.5";

            current.style.transform = "translateX(-100%) scale(0.9)";
            current.style.opacity = "0.7";

            next.style.transform = "translateX(0) scale(1)";
            next.style.opacity = "1";
            
        }
        else {
            prev.style.zIndex = "3";
            next.style.zIndex = "1";
        
            prev.style.transform = "translateX(0) scale(1)";
            prev.style.opacity = "1";

            current.style.transform = "translateX(100%) scale(0.9)";
            current.style.opacity = "0.7";

            next.style.transform = "translateX(240%) scale(0.8)";
            next.style.opacity = "0.5";
        }

        //Transition delay
        setTimeout(() => {
            if(direction === "next"){
                i = (i + 1) % images.length;
            }
            else {
                i = (i - 1 + images.length) % images.length;
            }

            prev.src = images[(i - 1 + images.length) % images.length];
            current.src = images[i];
            next.src = images[(i + 1) % images.length];

            document.getElementById("current_img").src = images[i];

            //Reset the position after transition
            prev.style.transition = "none";
            current.style.transition = "none";
            next.style.transition = "none";

            prev.style.transform = "translateX(-100%) scale(0.9)";
            prev.style.opacity = "0.7";
            prev.style.zIndex = "1";

            current.style.transform = "translateX(0) scale(1)";
            current.style.opacity = "1";
            current.style.zIndex = "3";

            next.style.transform = "translateX(100%) scale(0.9)";
            next.style.opacity = "0.7";
            next.style.zIndex = "1";

            is_animate = false;
        }, 1000);
    }

    function nextImage() {
        updateImage("next");
    }

    function prevImage() {
        updateImage("prev");
    }

    //Toggle image info
    infoButton.addEventListener("click", function (){
        //Get the filename of current image and fetch
        //the context, average rating, category, and tags
        const imageId = modalImg.src.split('/').pop();
        fetchContext(imageId);
        fetchAvgRating(imageId);
        fetchCategory(imageId);
        fetchTags(imageId);

        //Hide info if it's already displayed and if
        //user clicks on the button
        if(infoDiv.style.display === "block" || 
            contextForm.style.display === "block" ||
            ratingForm.style.display === "block" || 
            dropdown.style.display === "block"){
            infoDiv.style.display = "none";
            modal.style.maxHeight = "100%";
        }
        else {
            const filename = modalImg.src.split('/').pop();
            const uploadDate = imgDates[filename];

            infoDiv.innerHTML = `<p>Uploaded on: ${uploadDate}</p>`;
            infoDiv.style.display = "block";
            modal.style.maxHeight = "100%";
        }
    })

    //Delay for opening full-sized image
    setTimeout(() => {
        const images = document.querySelectorAll(".current_img");

        //Displays the full-sized image modal
        images.forEach(img => {
            img.addEventListener("click", function () {
                modal.style.display = "flex";
                document.body.classList.add("no-scroll");
                modalImg.src = img.src;
            });
        });
        
    }, 500);

    //Close button for modal
    close.addEventListener("click", function (){
        modal.style.display = "none";
        document.body.classList.remove("no-scroll");
    });

    //Click anywhere on screen to close modal
    modal.addEventListener("click", function (e){
        if(e.target === modal){
            modal.style.display = "none";
            document.body.classList.remove("no-scroll");
        }
    });

    //Click events for the image slider buttons
    document.querySelector('.left').addEventListener('click', prevImage);
    document.querySelector('.right').addEventListener('click', nextImage);

    //------------------------------------------------------------------------------------//    
    //Microservice A Integration: Image Rating System designed by Joseph Messer
    //------------------------------------------------------------------------------------//
    //Function for fetching average ratings for each image
    function fetchAvgRating(imageId){
        fetch(`http://localhost:5256/ratings/${imageId}`)
        .then(response => response.json())
        .then(data => {
            let avgRating = data.average_rating;

            //Round the average rating to the nearest decimal
            //Check if the rating exists or not
            if(avgRating){
                avgRating = avgRating.toFixed(1);
            } else {
                avgRating = "N/A";
            }
            
            const ratingDiv = document.createElement('div');
            ratingDiv.className = "rating-info";
            ratingDiv.innerHTML = `Overall Rating: ${avgRating || "N/A"}`;

            //Append the rating info into the infoDiv
            infoDiv.appendChild(ratingDiv);
        })
        .catch(error => console.error("Error fetching rating: ", error));
    }

    //Display rating form when the user clicks Rate It button
    rateButton.addEventListener("click", function(){
        if(ratingForm.style.display === "block" || 
            infoDiv.style.display === "block" ||
            contextForm.style.display === "block" ||
            dropdown.style.display === "block"){
            ratingForm.style.display = "none";
        } else {
            ratingForm.style.display = "block";
        } 
    });

    //Submit rating button
    submitRating.addEventListener("click", function(){
        const rateValue = parseFloat(ratingInput.value);
        const imageId = modalImg.src.split('/').pop();

        //Check if the rating is a valid value before submitting
        if(isNaN(rateValue) || rateValue < 1 || rateValue > 5){
            alert("Please enter a value between 1 and 5.");
            return;
        }

        //Fetch the microservice host
        fetch(`http://localhost:5256/ratings`, {
            method: "POST",
            headers: {"Content-Type": " application/json"},
            body: JSON.stringify({ user_id: "123", product_id: imageId, rating: rateValue})
        })
        .then(response => response.json())
        .then(data => {
            //Refresh rating after submitting
            console.log("Rating submitted: ", data);
            fetchAvgRating(imageId);
            ratingForm.style.display = "none";
            ratingInput.value = "";
        })
        .catch(error => console.error("Error submitting rating: ", error));
    });
     //------------------------------------------------------------------------------------//    
    //Microservice B Integration: Categorize and Tag Images
    //------------------------------------------------------------------------------------//
    // Fetch categories from microservice
    let categories = [];
    fetch("http://localhost:7777/categories")
        .then(response => response.json())
        .then(data => {
            categories = data.categories;
            console.log("Categories fetched:", categories);

            // Populate the dropdown with categories
            categories.forEach(category => {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categorySelect.appendChild(option);
            });
        })
        .catch(error => console.error("Error fetching categories:", error));

    // Event listener for categorizing an image
    categorizeButton.addEventListener("click", function (){
        if(dropdown.style.display === "block" || 
            ratingForm.style.display === "block" || 
            infoDiv.style.display === "block"){
                dropdown.style.display = 'none';
            } else {
                dropdown.style.display = "block";
            }
    });

    //Handle selection
    if(categoryConfirm){
        categoryConfirm.addEventListener("click", function(){
            const selectedCategory = categorySelect.value;
            const imageName = modalImg.src.split('/').pop(); // Get the current image name

            if (selectedCategory) {
                categorizeImage(imageName, selectedCategory);
                dropdown.style.display = "none"; // Hide the dropdown after selection
            } else {
                alert("Please select a category.");
            }
        });
    } else {
        console.error("button not found");
    }

    // Function to categorize an image
    function categorizeImage(imageName, category) {
        fetch("http://localhost:7777/categorize", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image_name: imageName, category: category }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(`Image categorized successfully: ${imageName} -> ${category}`);
            } else {
                alert(`Error: ${data.error}`);
            }
        })
        .catch(error => console.error("Error categorizing image:", error));
    }

    // Function to fetch the category of the current image
    function fetchCategory(imageId) {
        fetch(`http://localhost:7777/categories/${imageId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("network error");
            }
            return response.json();
        })
        .then(data => {
            let category = data.category || "Uncategorized"; 
            const categoryDiv = document.createElement('div');
            categoryDiv.className = "category-info";
            categoryDiv.innerHTML = `<p>Category: ${category}</p>`;

            // Append category info to the image info div
            infoDiv.appendChild(categoryDiv);
        })
        .catch(error => {
            //If there's an error, set a default placeholder
            console.error("Error fetching category: ", error);
            const categoryDiv = document.createElement('div');
            categoryDiv.className = "category-info";
            categoryDiv.innerHTML = `<p>Category: Uncategorized</p>`;
            infoDiv.appendChild(categoryDiv);
        });
    }    

    // Function to tag an image
    function tagImage(imageName, tags) {
        fetch("http://localhost:7777/tags", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_name: imageName, tags: tags }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert(`Tags updated successfully: ${imageName} -> ${tags.join(", ")}`);
            } else {
                alert(`Error: ${data.error}`);
            }
        })
        .catch(error => console.error("Error tagging image:", error));
    }

    //Function to fetch the tags of the current image
    function fetchTags(imageId){
        fetch(`http://localhost:7777/tags/${imageId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("network error");
            }
            return response.json();
        })
        .then(data => {
            let tags;

            //Format it so there's a space after commas
            if(data.tags.length > 0){
                tags = data.tags.join(", ");
            } else {
                "No tags";
            }

            //Create a new div to store the tags
            const tagDiv = document.createElement('div');
            tagDiv.className = "tag-info";
            tagDiv.innerHTML = `<p>Tags: ${tags} </p>`;

            // Append tag info to the image info div
            infoDiv.appendChild(tagDiv);
        })
        .catch(error => {
            //If there's an error, set a default placeholder
            console.error("error fetching tag: ", error);
            const tagDiv = document.createElement('div');
            tagDiv.className = "tag-info";
            tagDiv.innerHTML = `<p>Tags: No tags</p>`;
            infoDiv.appendChild(tagDiv);
        });
    }

    // Event listener for tagging an image
    tagButton.addEventListener("click", function(){
        const imageName = modalImg.src.split('/').pop(); // Get the current image name
        const tags = prompt("Enter tags for this image (comma-separated):"); // Prompt user for tags

        if (tags) {
            const tagList = tags.split(',').map(tag => tag.trim()); // Split tags into an array
            tagImage(imageName, tagList);
        } else {
            alert("Please enter at least one tag.");
        }
    });

    //-------------------------------------------------------------------------------------//
    //Microservice C Integration: Adding Image Context and Searching Images
    //-------------------------------------------------------------------------------------//
    //Event listener for updating image context
    saveContext.addEventListener("click", function(){
        const imageId = modalImg.src.split('/').pop();
        const newName = document.getElementById("name-input").value;
        const newDescription = document.getElementById("description-input").value;
    
        fetch("http://localhost:4444/context", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image_name: imageId, name: newName, description: newDescription }),
        })
        .then(response => response.json())
        .then(data => {
            alert(`Image info updated: ${newName} - ${newDescription}`);
            document.getElementById("context-form").style.display = "none";
            fetchContext(imageId);  // Refresh the context display
        })
        .catch(error => console.error("Error updating context:", error));
    });
    
    //Function to fetch context of specific image
    function fetchContext(imageId){
        fetch(`http://localhost:4444/context/${imageId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error("network error");
            }
            return response.json();
        })
        .then(data => {
            let imageName = data.name || "N/A";
            let description = data.description || "No description available";

            //Create a new div to store the context
            const contextDiv = document.createElement('div');
            contextDiv.className = "context-info";
            contextDiv.innerHTML = `<p>Name: ${imageName}</p>
                                    <p>Description: ${description}</p>`;

            // Append context info to the image info div
            infoDiv.appendChild(contextDiv);
        })
        .catch(error => {
            console.error("error fetching tag: ", error);
            const contextDiv = document.createElement('div');
            contextDiv.className = "context-info";
            contextDiv.innerHTML = `<p>Name: N/A</p>
                                    <p>Description: No description available</p>`;
            infoDiv.appendChild(contextDiv);
        });
    }

    //Event listener for adding context to image
    editContext.addEventListener("click", function(){
        if(infoDiv.style.display === "block" || 
            contextForm.style.display === "block" ||
            ratingForm.style.display === "block" || 
            dropdown.style.display === "block"){
            contextForm.style.display = "none";
        }
        else {
            contextForm.style.display = "block";
        }
    });

    //Event listener for searching images
    searchButton.addEventListener("click", function(){
        const searchQuery = document.getElementById("search-input").value.trim();

        //Check if the user has inputted something into the searchbar
        if (!searchQuery) {
            alert("Please enter a search query.");
            return;
        }

        //Fetch the search through the microservice
        fetch(`http://localhost:4444/search?query=${encodeURIComponent(searchQuery)}`)
        .then(response => response.json())
        .then(data => {
            //Display matching images corresponding to search result
            if (data.matching_images) {
                // Hide all images
                document.querySelectorAll(".container img").forEach(img => {
                    img.style.display = "none";
                    document.querySelectorAll(".current_img").forEach(img =>{
                        img.addEventListener("click", function () {
                            modal.style.display = "flex";
                            document.body.classList.add("no-scroll");
                            modalImg.src = img.src;
                        }); 
                    })
                });

                // Show only matching images
                if (data.matching_images.length > 0) {
                    // Show only matching images and reset their class
                    data.matching_images.forEach((imageName, index) => {
                        const imgElement = document.querySelector(`img[src$="${imageName}"]`);
                        if (imgElement) {
                            imgElement.style.display = "block";
                            
                            // First matching image becomes current_img
                            if (index === 0) {
                                imgElement.classList.add("current_img");
                            }
                        }
                    });
                }
                //Display a message explaining search results on bottom of searchbar
                searchMsg.textContent = `Found ${data.matching_images.length} matching images`;
            } else {
                searchMsg.textContent = "No matching images found.";
            }
        })
        .catch(error => console.error("Error searching images:", error));
    });

    //Event listener for clearing search results
    clearSearch.addEventListener("click", function(){
        // Clear search input
        document.getElementById("search-input").value = "";
    
        // Get all images
        const allImages = document.querySelectorAll(".container img");
    
        // Show all images again
        allImages.forEach(img => {
            img.style.display = "block";
            img.classList.remove("prev_img", "current_img", "next_img"); // Remove existing classes
        });
    
        // Reset slider format 
        if (allImages.length > 0) {
            allImages[0].classList.add("prev_img");
            if (allImages.length > 1) {
                allImages[1].classList.add("current_img");
            }
            if (allImages.length > 2) {
                allImages[allImages.length - 1].classList.add("next_img");
            }
        }
        // Reset search message
        searchMsg.textContent = "";
    });    

    //------------------------------------------------------------------------------------//    
    //Microservice D Integration: Downloading Images and Theme Toggling
    //------------------------------------------------------------------------------------//
    downloadButton.addEventListener("click", function(){
        const imageElement = document.getElementById("current_img");
        const imageUrl = imageElement.src;
        const imageName = imageUrl.split('/').pop(); //Extract file name
        const downloadUrl = `http://localhost:5001/download/${imageName}`;
        window.open(downloadUrl, "_blank");
    });

    //Fetch the microservice host
    fetch("http://localhost:5001/mode")
        .then(response => response.json())
        .then(data => {
            const userMode = data.mode;
            applyTheme(userMode);
        })
        .catch(error => console.error('error fetching theme:', error));
    
    //Button for toggling theme
    toggleButton.addEventListener("click", function(){
        let current_theme;

        //If the body has class dark-mode, switch to light mode
        if(document.body.classList.contains("dark-mode")){
            current_theme = "light";
        } else {
            current_theme = "dark";
        }

        applyTheme(current_theme);

        //Save preference to microservice
        fetch("http://localhost:5001/mode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ mode: current_theme }),
        })
        .then(response => response.json())
        .then(data => console.log(data.message))
        .catch(error => console.error("error setting theme", error));
    });
});

//------------------------------------------------------------------------------------//    
//Microservice D Integration: Deleting Images as Admin and Theme Toggling
//------------------------------------------------------------------------------------//
// Function to delete an image
function deleteImage() {
    const imageElement = document.getElementById("current_img");
    const imageUrl = imageElement.src;
    const imageName = imageUrl.split('/').pop(); //Extract file name

    //Validation message
    if (confirm(`Are you sure you want to delete ${imageName}?`)) {
        // Send a DELETE request to the microservice
        fetch(`http://localhost:5001/delete/${imageName}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                alert('Image deleted successfully!');
                location.reload(); // Refresh page to update gallery
            } else {
                alert('Failed to delete the image: ' + data.error);
            }
        })
        .catch(error => {
            console.error('error:', error);
            alert('An error occurred while deleting the image.');
        });
    }
}

const modeLabel = document.querySelector('.mode-label');

//Function for applying web app theme
function applyTheme(mode){
    //Check if theme is dark or light, remove and replace
    //the corresponding one
    if(mode === "dark"){
        document.body.classList.add("dark-mode");
        document.body.classList.remove("light-mode");
        modeLabel.textContent = "Dark";
    } else {
        document.body.classList.add("light-mode");
        document.body.classList.remove("dark-mode");
        modeLabel.textContent = "Light";
    }
}