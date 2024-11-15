// The purpose of this script is to move the header up out of view while
// the user is scrolling down a page
let lastScrollY = window.scrollY;
const header = document.querySelector('.md-header__inner');

window.addEventListener('scroll', () => {
  // Toggle header visibility based on scroll direction
  header.classList.toggle('hidden', window.scrollY > lastScrollY);
  lastScrollY = window.scrollY;
});
