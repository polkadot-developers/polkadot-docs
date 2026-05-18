(function () {
  'use strict';

  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize, { once: true });
  } else {
    initialize();
  }

  function initialize() {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const MANIFEST_SELECTOR = 'script[data-instant-preview-manifest]';
    const TEMPLATE_SELECTOR = 'template[data-instant-preview-template]';
    const ROOT_SELECTOR = '[data-instant-preview-root]';
    const ACTIVE_CLASS = 'md-tooltip2--active';
    const TOP_CLASS = 'md-tooltip2--top';
    const BOTTOM_CLASS = 'md-tooltip2--bottom';
    const SHOW_DELAY_MS = 140;
    const HIDE_DELAY_MS = 80;
    const HIDE_TRANSITION_MS = 250;
    const PREVIEW_OFFSET_PX = 16;
    const VIEWPORT_GAP_PX = 12;

    const localRegistry = parseRegistry(document, window.location.href);
    if (!localRegistry) {
      return;
    }

    const pageCache = new Map();
    pageCache.set(getFetchKey(new URL(window.location.href)), localRegistry);

    const preview = createPreviewRoot();
    const scopes = localRegistry.manifest.scopes || ['.md-content'];
    let activeLink = null;
    let showTimer = 0;
    let hideTimer = 0;
    let deactivateTimer = 0;
    let requestToken = 0;
    let activeAbortController = null;
    let cloneSequence = 0;

    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    document.addEventListener('focusin', handleFocusIn, true);
    document.addEventListener('focusout', handleFocusOut, true);
    document.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', hidePreview, true);
    preview.addEventListener('mouseenter', cancelHide);
    preview.addEventListener('mouseleave', scheduleHide);

    function handleMouseOver(event) {
      const link = findEligibleLink(event.target);
      if (!link) {
        return;
      }
      if (link === activeLink) {
        cancelHide();
        return;
      }
      scheduleShow(link, SHOW_DELAY_MS);
    }

    function handleMouseOut(event) {
      if (!activeLink) {
        return;
      }

      const related = event.relatedTarget;
      if (
        related instanceof Node &&
        (preview.contains(related) || activeLink.contains(related))
      ) {
        return;
      }

      scheduleHide();
    }

    function handleFocusIn(event) {
      const link = findEligibleLink(event.target);
      if (!link) {
        return;
      }

      scheduleShow(link, 0);
    }

    function handleFocusOut(event) {
      const related = event.relatedTarget;
      if (related instanceof Node && preview.contains(related)) {
        return;
      }

      scheduleHide();
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        hidePreview();
      }
    }

    function handleScroll(event) {
      const target = event.target;
      if (target instanceof Node && preview.contains(target)) {
        cancelHide();
        return;
      }
      hidePreview();
    }

    function scheduleShow(link, delayMs) {
      cancelHide();
      window.clearTimeout(showTimer);
      showTimer = window.setTimeout(function () {
        void openPreview(link);
      }, delayMs);
    }

    function scheduleHide() {
      cancelHide();
      hideTimer = window.setTimeout(hidePreview, HIDE_DELAY_MS);
    }

    function cancelHide() {
      window.clearTimeout(hideTimer);
      window.clearTimeout(deactivateTimer);
    }

    async function openPreview(link) {
      const token = ++requestToken;
      activeLink = link;

      if (activeAbortController) {
        activeAbortController.abort();
      }

      const targetUrl = new URL(link.href, window.location.href);
      const currentPageKey = getFetchKey(new URL(window.location.href));
      let registry =
        getFetchKey(targetUrl) === currentPageKey ? localRegistry : null;

      if (!registry) {
        activeAbortController = new AbortController();
        registry = await fetchRegistry(targetUrl, activeAbortController.signal);
      }

      if (!registry || token !== requestToken) {
        return;
      }

      const template = findTemplateForUrl(registry, targetUrl);
      if (!template) {
        hidePreview();
        return;
      }

      const content = cloneTemplateContent(
        template,
        registry.sourceUrl,
        ++cloneSequence
      );
      renderPreview(content, link);
    }

    function hidePreview() {
      requestToken += 1;
      window.clearTimeout(showTimer);
      cancelHide();

      if (activeAbortController) {
        activeAbortController.abort();
        activeAbortController = null;
      }

      clearLinkAccessibility(activeLink);
      activeLink = null;

      preview.classList.remove(ACTIVE_CLASS, TOP_CLASS, BOTTOM_CLASS);
      preview.setAttribute('aria-hidden', 'true');
      preview.querySelector('[data-instant-preview-content]').scrollTop = 0;

      deactivateTimer = window.setTimeout(function () {
        if (preview.classList.contains(ACTIVE_CLASS)) {
          return;
        }
        preview.hidden = true;
        preview
          .querySelector('[data-instant-preview-content]')
          .replaceChildren();
      }, HIDE_TRANSITION_MS);
    }

    function renderPreview(fragment, link) {
      const content = preview.querySelector('[data-instant-preview-content]');
      window.clearTimeout(deactivateTimer);

      content.replaceChildren(fragment);
      content.scrollTop = 0;
      preview.hidden = false;
      preview.setAttribute('aria-hidden', 'true');
      preview.classList.remove(ACTIVE_CLASS, TOP_CLASS, BOTTOM_CLASS);

      positionPreview(link, content);

      // Force layout so the active transition starts from the resting state.
      void preview.offsetWidth;
      preview.classList.add(ACTIVE_CLASS);
      preview.setAttribute('aria-hidden', 'false');

      link.setAttribute('aria-controls', preview.id);
      link.setAttribute('aria-haspopup', 'dialog');
    }

    function positionPreview(link, content) {
      const rect = link.getBoundingClientRect();
      const hostX = rect.left + window.scrollX + VIEWPORT_GAP_PX;
      const hostY = rect.top + window.scrollY;

      preview.style.setProperty('--md-tooltip-host-x', `${hostX}px`);
      preview.style.setProperty('--md-tooltip-host-y', `${hostY}px`);
      preview.style.setProperty('--md-tooltip-x', '0px');

      const belowY = rect.height + PREVIEW_OFFSET_PX;
      preview.style.setProperty('--md-tooltip-y', `${belowY}px`);
      preview.classList.add(BOTTOM_CLASS);

      const contentRect = content.getBoundingClientRect();
      const aboveY = -contentRect.height - PREVIEW_OFFSET_PX;
      const hasRoomBelow =
        rect.bottom + PREVIEW_OFFSET_PX + contentRect.height <=
        window.innerHeight - VIEWPORT_GAP_PX;
      const hasRoomAbove =
        rect.top - PREVIEW_OFFSET_PX - contentRect.height >= VIEWPORT_GAP_PX;
      const useTop = !hasRoomBelow && hasRoomAbove;

      preview.classList.toggle(TOP_CLASS, useTop);
      preview.classList.toggle(BOTTOM_CLASS, !useTop);
      preview.style.setProperty(
        '--md-tooltip-y',
        `${useTop ? aboveY : belowY}px`
      );
    }

    function findEligibleLink(target) {
      if (!(target instanceof Element)) {
        return null;
      }

      const link = target.closest('a[href]');
      if (!link) {
        return null;
      }
      if (link.closest(ROOT_SELECTOR)) {
        return null;
      }
      if (!isWithinScope(link)) {
        return null;
      }
      if (link.hasAttribute('download')) {
        return null;
      }

      const rawHref = link.getAttribute('href') || '';
      if (
        !rawHref ||
        rawHref === '#' ||
        rawHref.startsWith('mailto:') ||
        rawHref.startsWith('tel:') ||
        rawHref.startsWith('javascript:')
      ) {
        return null;
      }

      if (link.target && link.target !== '_self') {
        return null;
      }

      const targetUrl = new URL(link.href, window.location.href);
      if (targetUrl.origin !== window.location.origin) {
        return null;
      }

      return link;
    }

    function isWithinScope(link) {
      return scopes.some(function (selector) {
        return link.closest(selector);
      });
    }

    function createPreviewRoot() {
      const root = document.createElement('div');
      const content = document.createElement('div');

      root.hidden = true;
      root.id = 'instant-preview-dialog';
      root.setAttribute('data-instant-preview-root', '');
      root.setAttribute('role', 'dialog');
      root.setAttribute('aria-hidden', 'true');
      root.className = 'md-tooltip2';

      content.setAttribute('data-instant-preview-content', '');
      content.className = 'md-tooltip2__inner md-typeset';

      root.appendChild(content);
      document.body.appendChild(root);
      return root;
    }

    function clearLinkAccessibility(link) {
      if (!link) {
        return;
      }
      link.removeAttribute('aria-controls');
      link.removeAttribute('aria-describedby');
      link.removeAttribute('aria-haspopup');
    }

    function parseRegistry(doc, sourceUrl) {
      const manifestNode = doc.querySelector(MANIFEST_SELECTOR);
      if (!manifestNode) {
        return null;
      }

      let manifest;
      try {
        manifest = JSON.parse(manifestNode.textContent || '{}');
      } catch (_error) {
        return null;
      }

      const templates = new Map();
      doc.querySelectorAll(TEMPLATE_SELECTOR).forEach(function (template) {
        const templateId = template.getAttribute('data-instant-preview-template');
        if (templateId) {
          templates.set(templateId, template);
        }
      });

      return {
        manifest: manifest,
        templates: templates,
        sourceUrl: new URL(sourceUrl, window.location.href).toString(),
      };
    }

    async function fetchRegistry(targetUrl, signal) {
      const key = getFetchKey(targetUrl);
      if (pageCache.has(key)) {
        return pageCache.get(key);
      }

      try {
        const response = await fetch(key, {
          credentials: 'same-origin',
          signal: signal,
        });
        if (!response.ok) {
          return null;
        }

        const text = await response.text();
        const doc = new DOMParser().parseFromString(text, 'text/html');
        const registry = parseRegistry(doc, key);
        if (registry) {
          pageCache.set(key, registry);
        }
        return registry;
      } catch (_error) {
        return null;
      }
    }

    function getFetchKey(url) {
      const normalized = new URL(url.toString(), window.location.href);
      normalized.hash = '';
      return normalized.toString();
    }

    function findTemplateForUrl(registry, url) {
      const entry = findManifestEntry(registry.manifest, url);
      if (!entry) {
        return null;
      }

      return registry.templates.get(entry.template) || null;
    }

    function findManifestEntry(manifest, url) {
      const entries = manifest.entries || {};
      const candidates = buildCandidateKeys(url);

      for (let index = 0; index < candidates.length; index += 1) {
        const key = candidates[index];
        if (entries[key]) {
          return entries[key];
        }
      }

      return null;
    }

    function buildCandidateKeys(url) {
      const candidates = [];
      const hash = url.hash || '';
      const pathname = url.pathname || '/';

      addCandidate(candidates, `${pathname}${hash}`);

      if (pathname === '/') {
        addCandidate(candidates, `/index.html${hash}`);
        return candidates;
      }

      if (pathname.endsWith('/index.html')) {
        addCandidate(
          candidates,
          `${pathname.slice(0, -'/index.html'.length) || '/'}${hash}`
        );
        return candidates;
      }

      if (pathname.endsWith('.html')) {
        addCandidate(
          candidates,
          `${pathname.slice(0, -'.html'.length)}/${hash}`
        );
        return candidates;
      }

      if (pathname.endsWith('/')) {
        addCandidate(candidates, `${pathname}index.html${hash}`);
        addCandidate(candidates, `${pathname.slice(0, -1)}.html${hash}`);
      }

      return candidates;
    }

    function addCandidate(candidates, value) {
      if (!candidates.includes(value)) {
        candidates.push(value);
      }
    }

    function cloneTemplateContent(template, sourceUrl, sequence) {
      const holder = document.createElement('div');
      holder.innerHTML = template.innerHTML;
      normalizeFragment(holder, sourceUrl, sequence);

      const fragment = document.createDocumentFragment();
      while (holder.firstChild) {
        fragment.appendChild(holder.firstChild);
      }

      return fragment;
    }

    function normalizeFragment(root, sourceUrl, sequence) {
      const suffix = `$preview_${sequence}`;

      root.querySelectorAll('[id], [name], [for]').forEach(function (node) {
        if (node.hasAttribute('id')) {
          node.setAttribute('id', `${node.getAttribute('id')}${suffix}`);
        }
        if (node.hasAttribute('name')) {
          node.setAttribute('name', `${node.getAttribute('name')}${suffix}`);
        }
        if (node.hasAttribute('for')) {
          node.setAttribute('for', `${node.getAttribute('for')}${suffix}`);
        }
      });

      root.querySelectorAll('[href], [src]').forEach(function (node) {
        ['href', 'src'].forEach(function (attr) {
          const value = node.getAttribute(attr);
          if (!value) {
            return;
          }
          if (
            value.startsWith('mailto:') ||
            value.startsWith('tel:') ||
            /^[a-z]+:/i.test(value)
          ) {
            return;
          }

          node.setAttribute(attr, new URL(value, sourceUrl).toString());
        });
      });
    }
  }
})();
