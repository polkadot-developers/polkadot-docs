document.addEventListener("DOMContentLoaded", () => {
    const SCROLL_OFFSET = 70; // Adjust based on your header height
    const TOC_SELECTOR_LEFT = '.md-nav__link'; // Left nav links
    const TOC_SELECTOR_RIGHT = '.md-nav__item--active ~ .md-nav__link'; // Adjust for right nav if you have one

    // Smooth scroll with offset
    function scrollToHash(hash) {
        const target = document.querySelector(hash);
        if (!target) return;

        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - SCROLL_OFFSET;

        window.scrollTo({
            top: targetPosition,
            behavior: 'auto'
        });
    }

    // Update active TOC link
    function updateTOC() {
        const headings = document.querySelectorAll('.md-content__inner h1, .md-content__inner h2, .md-content__inner h3');
        const scrollPosition = window.scrollY + SCROLL_OFFSET + 5; // small buffer

        let activeHeading = headings[0];

        for (const heading of headings) {
            if (heading.offsetTop <= scrollPosition) {
                activeHeading = heading;
            } else {
                break;
            }
        }

        // Left nav
        document.querySelectorAll(TOC_SELECTOR_LEFT).forEach(link => {
            link.classList.remove('md-nav__link--active');
            if (link.getAttribute('href') === `#${activeHeading.id}`) {
                link.classList.add('md-nav__link--active');
            }
        });

        // Right nav (optional)
        document.querySelectorAll(TOC_SELECTOR_RIGHT).forEach(link => {
            link.classList.remove('md-nav__link--active');
            if (link.getAttribute('href') === `#${activeHeading.id}`) {
                link.classList.add('md-nav__link--active');
            }
        });
    }

    // On page load, scroll to hash correctly
    if (window.location.hash) {
        scrollToHash(window.location.hash);
    }

    // Handle clicks on anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const hash = this.getAttribute('href');
            history.pushState(null, null, hash);
            scrollToHash(hash);
            updateTOC();
        });
    });

    // Update TOC on scroll
    window.addEventListener('scroll', updateTOC);

    // Triple verification: check periodically in case of delayed rendering
    setInterval(updateTOC, 500);
});
