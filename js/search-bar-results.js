// The purpose of this script is to modify the default search functionality
// so that the "Type to start searching" text does not render in the search
// results dropdown and so that the dropdown only appears once a user has started
// to type in the input field
document.addEventListener('DOMContentLoaded', function () {
  // Only show the search results if the user has started to type
  // Select the search input and output elements
  const searchInput = document.querySelector('.md-search__input');
  const searchOutput = document.querySelector('.md-search__output');

  // Listen for input events on the search field
  searchInput.addEventListener('input', function () {
    // Add the "visible" class if there is text in the input field
    if (searchInput.value.trim() !== '') {
      searchOutput.classList.add('visible');
    } else {
      // Remove the "visible" class if input is empty
      searchOutput.classList.remove('visible');
    }
  });

  // Do not show the search results if it contains the text: "Type to start searching"
  const searchResultMeta = document.querySelector('.md-search-result__meta');

  if (searchResultMeta) {
    // Define a function to check and update the text
    const checkAndUpdateText = () => {
      if (searchResultMeta.textContent.trim() === "Type to start searching") {
        searchResultMeta.textContent = "";
      }
    };

    // Create a MutationObserver to observe changes in the element
    const observer = new MutationObserver(checkAndUpdateText);

    // Start observing the element for changes in child elements or text
    observer.observe(searchResultMeta, { childList: true, subtree: true, characterData: true });

    // Run the initial check in case the text was already present
    checkAndUpdateText();
  }
});

