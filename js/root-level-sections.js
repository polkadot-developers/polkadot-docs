// The purpose of this script is to add a specific class to root-level
// index pages, which allows the styling of the navigation menu to be
// more easily changed
document.addEventListener('DOMContentLoaded', function () {
  // Get the current pathname
  const path = window.location.pathname;

  // Check if the path contains exactly one item in its path
  const pathParts = path.split('/').filter((part) => part !== ''); // Split by '/' and remove empty parts
  if (pathParts.length === 1) {
    // Select the target element
    const sidebarInner = document.querySelector(
      '.md-sidebar--primary .md-sidebar__inner'
    );
    if (sidebarInner) {
      sidebarInner.classList.add('root-level-sidebar');
    }
  }
});
