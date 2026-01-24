function normalizeId(text) {
  return text
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]/g, '');
}

document.addEventListener('DOMContentLoaded', () => {
  const containers = document.querySelectorAll('.toggle-container');

  containers.forEach((container) => {
    const group = container.dataset.toggleGroup;
    const buttons = container.querySelectorAll('.toggle-btn');
    const panels = container.querySelectorAll('.toggle-panel');

    if (!buttons.length || !panels.length) return;

    // Sidebar TOC <nav>
    function getSidebarTOC() {
      return document.querySelector('nav.md-nav.md-nav--secondary');
    }

    function getAllSidebarTOCs() {
      return document.querySelectorAll('nav.md-nav.md-nav--secondary');
    }

    // Determine canonical variant
    const canonicalButton = Array.from(buttons).find(
      (b) => b.dataset.canonical === 'true'
    );
    const canonicalVariant = canonicalButton
      ? canonicalButton.dataset.variant
      : buttons[0].dataset.variant;

    // -----------------------------
    // Assign normalized IDs (UNCHANGED LOGIC)
    // -----------------------------
    panels.forEach((panel) => {
      const variant = panel.dataset.variant;
      const isCanonical = variant === canonicalVariant;

      const headers = panel.querySelectorAll('h1, h2, h3, h4, h5, h6');
      headers.forEach((h) => {
        const text = Array.from(h.childNodes)
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent)
          .join('')
          .trim();

        const baseId = normalizeId(text);
        const fullId = isCanonical ? baseId : `${variant}-${baseId}`;

        h.id = fullId;

        const link = h.querySelector('.headerlink');
        if (link) {
          link.setAttribute('href', `#${fullId}`);
        }
      });
    });

    // -----------------------------
    // TOC injection
    // -----------------------------
    // Store the original canonical TOC so we can restore it
    const originalCanonicalTOC = getSidebarTOC()?.outerHTML;

    function swapTOC(variant) {
      const allSidebars = getAllSidebarTOCs();

      const sidebar = getSidebarTOC();
      if (!sidebar) {
        console.error('[toggle] No sidebar found');
        return;
      }

      // If switching to canonical, restore original TOC
      if (variant === canonicalVariant) {
        if (originalCanonicalTOC) {
          const temp = document.createElement('div');
          temp.innerHTML = originalCanonicalTOC;
          const restoredSidebar = temp.firstElementChild;
          if (restoredSidebar) {
            // Replace ALL matching sidebars
            allSidebars.forEach((sb) => {
              const tempCopy = document.createElement('div');
              tempCopy.innerHTML = originalCanonicalTOC;
              const clone = tempCopy.firstElementChild;
              sb.parentNode.replaceChild(clone, sb);
            });
          }
        }
        return;
      }

      const panel = container.querySelector(
        `.toggle-panel[data-variant="${variant}"]`
      );
      if (!panel || !panel.dataset.tocHtml) return;

      // Replace ALL matching sidebars, not just the first one
      allSidebars.forEach((sb, i) => {
        const temp = document.createElement('div');
        temp.innerHTML = panel.dataset.tocHtml;
        const newSidebar = temp.firstElementChild;

        if (newSidebar) {
          sb.parentNode.replaceChild(newSidebar, sb);
        }
      });
    }

    // -----------------------------
    // Initial variant from URL
    // -----------------------------
    const hash = window.location.hash.slice(1);
    let activeVariant = canonicalVariant;

    if (hash.startsWith(`${group}-`)) {
      const maybeVariant = hash.replace(`${group}-`, '').split('-')[0];
      if ([...buttons].some((b) => b.dataset.variant === maybeVariant)) {
        activeVariant = maybeVariant;
      }
    }

    // Initial activation
    buttons.forEach((b) =>
      b.classList.toggle('active', b.dataset.variant === activeVariant)
    );
    panels.forEach((p) =>
      p.classList.toggle('active', p.dataset.variant === activeVariant)
    );
    // Only swap TOC on page load if active variant is not canonical
    swapTOC(activeVariant);

    // -----------------------------
    // Toggle click handler
    // -----------------------------
    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const variant = btn.dataset.variant;

        buttons.forEach((b) => b.classList.toggle('active', b === btn));
        panels.forEach((p) =>
          p.classList.toggle('active', p.dataset.variant === variant)
        );

        swapTOC(variant);

        if (btn.dataset.canonical === 'true') {
          history.replaceState(null, '', window.location.pathname);
        } else {
          window.location.hash = `${group}-${variant}`;
        }
      });
    });
  });
});
