// The purpose of this script is to move the header up out of view while
// the user is scrolling down a page
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
  const header = document.querySelector('.md-header__inner');
  if (window.scrollY > lastScrollY) {
    // User is scrolling down - hide the header
    header.classList.add('hidden');
  } else {
    // User is scrolling up - show the header
    header.classList.remove('hidden');
  }
  lastScrollY = window.scrollY;
});
