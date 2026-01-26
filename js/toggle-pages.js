function updateToggleSlider(container) {
  const buttons = container.querySelectorAll('.toggle-btn');
  if (!buttons.length) return;

  // Create the slider element if it doesn't exist
  let sliderEl = container.querySelector('.toggle-slider');
  if (!sliderEl) {
    sliderEl = document.createElement('div');
    sliderEl.className = 'toggle-slider';
    container.querySelector('.toggle-buttons').prepend(sliderEl);
  }

  const activeBtn = container.querySelector('.toggle-btn.active');
  if (!activeBtn) return;

  // Calculate position relative to the container
  const btnRect = activeBtn.getBoundingClientRect();
  const containerRect = container
    .querySelector('.toggle-buttons')
    .getBoundingClientRect();

  sliderEl.style.width = btnRect.width + 'px';
  sliderEl.style.transform = `translateX(${
    btnRect.left - containerRect.left
  }px)`;
}

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.toggle-container');

  containers.forEach((container) => {
    // Initial slider update
    updateToggleSlider(container);

    const buttons = container.querySelectorAll('.toggle-btn');
    const panels = container.querySelectorAll('.toggle-panel');

    if (!buttons.length || !panels.length) return;

    // Determine canonical variant
    const canonicalButton = Array.from(buttons).find(
      (b) => b.dataset.canonical === 'true'
    );
    const canonicalVariant = canonicalButton
      ? canonicalButton.dataset.variant
      : buttons[0].dataset.variant;

    // -----------------------------
    // Assign normalized IDs
    // -----------------------------
    panels.forEach((panel) => {
      const variant = panel.dataset.variant;
      const isCanonical = variant === canonicalVariant;

      const headers = panel.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headers.forEach((h) => {
        // Get text content excluding child elements like .headerlink
        const baseId = Array.from(h.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent)
          .join('')
          .trim()
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w\-]/g, '');

        const fullId = isCanonical ? baseId : `${variant}-${baseId}`;
        h.id = fullId;

        const link = h.querySelector('.headerlink');
        if (link) {
          link.setAttribute('href', `#${fullId}`);
        }
      });
    });

    // -----------------------------
    // TOC injection - store original canonical TOC for restoration
    // -----------------------------
    const originalCanonicalTOC = document.querySelector(
      'nav.md-nav.md-nav--secondary'
    )?.outerHTML;

    function swapTOC(variant) {
      const allSidebars = document.querySelectorAll(
        'nav.md-nav.md-nav--secondary'
      );

      if (!allSidebars.length) {
        console.error('[toggle] No sidebar found');
        return;
      }

      // If switching to canonical, restore original TOC
      if (variant === canonicalVariant) {
        if (originalCanonicalTOC) {
          allSidebars.forEach((sidebar) => {
            const temp = document.createElement('div');
            temp.innerHTML = originalCanonicalTOC;
            const clone = temp.firstElementChild;
            if (clone) {
              sidebar.parentNode.replaceChild(clone, sidebar);
            }
          });
        }
        return;
      }

      const panel = container.querySelector(
        `.toggle-panel[data-variant="${variant}"]`
      );
      if (!panel || !panel.dataset.tocHtml) return;

      // Replace all matching sidebars
      allSidebars.forEach((sidebar) => {
        const temp = document.createElement('div');
        temp.innerHTML = panel.dataset.tocHtml;
        const newSidebar = temp.firstElementChild;

        if (newSidebar) {
          sidebar.parentNode.replaceChild(newSidebar, sidebar);
        }
      });
    }

    // -----------------------------
    // Initial variant from URL
    // -----------------------------
    function getInitialVariant() {
      const hash = window.location.hash.slice(1);
      const isValidVariant = [...buttons].some(
        (b) => b.dataset.variant === hash
      );
      return isValidVariant ? hash : canonicalVariant;
    }

    function activateVariant(variant) {
      buttons.forEach((b) =>
        b.classList.toggle('active', b.dataset.variant === variant)
      );
      panels.forEach((p) =>
        p.classList.toggle('active', p.dataset.variant === variant)
      );
      swapTOC(variant);
    }

    // Initial activation
    const activeVariant = getInitialVariant();
    activateVariant(activeVariant);

    // -----------------------------
    // Toggle click handler
    // -----------------------------
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const variant = btn.dataset.variant;
        const isCanonical = btn.dataset.canonical === 'true';

        activateVariant(variant);
        updateToggleSlider(container);

        // Update URL
        if (isCanonical) {
          history.replaceState(null, '', window.location.pathname);
        } else {
          window.location.hash = variant;
        }
      });
    });
  });
});
