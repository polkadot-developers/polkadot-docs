(function() {
  'use strict';

  if (typeof window === 'undefined') {
    return;
  }

  /*
    Shared helper module for all "LLMS" (Large Language Model Support) features.
    - Loads configure-from-json metadata to locate Markdown artifacts.
    - Provides helper functions (exposed via `window.LLMS`) for slug generation,
      URL resolution, fetch/download utilities, and path normalization.
    - Inputs: `window.location`, optional global overrides/meta tags, and `llms_config.json`.
    - Outputs: cached config data plus helper methods consumed by UI scripts.
  */
  const CONFIG_FALLBACK_URL = '/scripts/llms_config.json';

  const state = {
    // Global cache so other scripts can reuse config + derived URLs without refetching.
    config: null,
    configPromise: null,
    siteBase: window.location ? window.location.origin.replace(/\/+$/, '') : '',
    remoteBase: '',
    aiBaseCache: {
      raw: null,
      site: null
    }
  };

  function joinUrl(base, path) {
    const trimmedBase = (base || '').replace(/\/+$/, '');
    const trimmedPath = (path || '').replace(/^\/+/, '');
    if (!trimmedBase) {
      return trimmedPath ? `/${trimmedPath}` : '/';
    }
    return trimmedPath ? `${trimmedBase}/${trimmedPath}` : trimmedBase;
  }

  // Lightweight sanitizers used throughout slug + URL building.
  function stripSlashes(value) {
    return (value || '').replace(/^\/+|\/+$/g, '');
  }

  function stripLeading(value) {
    return (value || '').replace(/^\/+/, '');
  }

  function normalizePathname(pathname) {
    let path = decodeURIComponent(pathname || '/');

    const hashIndex = path.indexOf('#');
    if (hashIndex !== -1) {
      path = path.slice(0, hashIndex);
    }

    const queryIndex = path.indexOf('?');
    if (queryIndex !== -1) {
      path = path.slice(0, queryIndex);
    }

    path = path.replace(/index\.html$/i, '');
    path = path.replace(/\/+/g, '/');

    if (path.length > 1 && path.endsWith('/')) {
      path = path.slice(0, -1);
    }

    return path || '/';
  }

  function buildSlugFromPath(pathname) {
    if (!pathname || pathname === '/') {
      return 'index';
    }

    let route = pathname;
    if (route.endsWith('/index')) {
      route = route.slice(0, -'/index'.length);
    }

    route = route.replace(/^\/+/, '');
    if (!route) {
      return 'index';
    }

    const segments = route.split('/').filter(Boolean);
    if (!segments.length) {
      return 'index';
    }

    if (segments.length >= 2 && segments[0] === 'ai') {
      if (segments[1] === 'pages' || segments[1] === 'categories') {
        segments.splice(0, 2);
      }
    } else if (segments[0] === 'ai-pages' || segments[0] === 'ai-categories') {
      segments.splice(0, 1);
    }

    const slug = segments
      .map((segment) => segment.trim())
      .filter(Boolean)
      .map((segment) => segment.replace(/\s+/g, '-'))
      .map((segment) => segment.replace(/[^a-zA-Z0-9_-]/g, '-'))
      .map((segment) => segment.replace(/-+/g, '-'))
      .join('-')
      .toLowerCase()
      .replace(/^-+|-+$/g, '');

    return slug || 'index';
  }

  function getPageSlug(pathname) {
    const normalized = normalizePathname(pathname || window.location.pathname);
    return buildSlugFromPath(normalized);
  }

  // Resolves environment overrides (globals or meta tags) for base URLs only once.
  function getAiBaseUrls() {
    const cache = state.aiBaseCache;
    if (cache.raw !== null && cache.site !== null) {
      return cache;
    }

    const siteBase = state.siteBase;

    let rawBase = '';
    if (typeof window.AI_RAW_BASE === 'string') {
      rawBase = window.AI_RAW_BASE;
    } else if (typeof AI_RAW_BASE !== 'undefined') {
      rawBase = AI_RAW_BASE;
    } else {
      const metaBase = document.querySelector('meta[name="mkdocs-copy-to-llm-raw-base"]');
      if (metaBase && metaBase.content) {
        rawBase = metaBase.content;
      }
    }

    if (typeof rawBase === 'string') {
      rawBase = rawBase.trim().replace(/\/+$/, '');
    }

    cache.raw = rawBase;
    cache.site = siteBase;
    return cache;
  }

  function getConfigUrl() {
    if (typeof window.__LLMS_CONFIG_URL === 'string') {
      return window.__LLMS_CONFIG_URL;
    }

    const meta = document.querySelector('meta[name="mkdocs-llms-config-url"]');
    if (meta && meta.content) {
      return meta.content;
    }

    return CONFIG_FALLBACK_URL;
  }

  // Uses config.repository + outputs metadata to compute a raw GitHub base URL.
  function computeRemoteBase(config) {
    const repository = config?.repository || {};
    const outputs = config?.outputs || {};
    const files = outputs.files || {};

    if (repository.host === 'github' && repository.org && repository.repo && repository.default_branch) {
      const pagesDir = stripSlashes(files.pages_dir || 'pages');
      const fallbackArtifacts = joinUrl(stripSlashes(outputs.public_root || 'ai'), pagesDir);
      const artifactsPath = stripSlashes(repository.ai_artifacts_path || fallbackArtifacts);
      return joinUrl(`https://raw.githubusercontent.com/${repository.org}/${repository.repo}/${repository.default_branch}`, artifactsPath);
    }

    return '';
  }

  // Fetch `llms_config.json` once and cache both the promise and the parsed object.
  function loadConfig() {
    if (state.configPromise) {
      return state.configPromise;
    }

    if (typeof fetch !== 'function') {
      state.configPromise = Promise.resolve(null);
      return state.configPromise;
    }

    const configUrl = getConfigUrl();
    if (!configUrl) {
      state.configPromise = Promise.resolve(null);
      return state.configPromise;
    }

    if (typeof window.__LLMS_CONFIG_URL !== 'string') {
      window.__LLMS_CONFIG_URL = configUrl;
    }

    state.configPromise = fetch(configUrl, { credentials: 'omit' })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load config (${response.status})`);
        }
        return response.json();
      })
      .then((config) => {
        state.config = config;
        state.remoteBase = computeRemoteBase(config);

        if (state.remoteBase && !window.AI_RAW_BASE) {
          window.AI_RAW_BASE = state.remoteBase;
        }

        return state.config;
      })
      .catch((error) => {
        console.warn('LLMS shared: unable to load llms_config.json', error);
        state.config = null;
        state.remoteBase = '';
        return null;
      });

    return state.configPromise;
  }

  // Public entry point to ensure config is loaded before performing network operations.
  async function ready() {
    if (state.config || state.configPromise) {
      return state.configPromise || state.config;
    }
    return loadConfig();
  }

  // Returns whatever config object was fetched (may be null if fetch failed).
  function getConfig() {
    return state.config;
  }

  // Compute the local site-relative path for Markdown artifacts (`/ai/pages/...`).
  function getLocalPagesBase() {
    const config = state.config;
    const outputs = config?.outputs || {};
    const files = outputs.files || {};
    const publicRoot = `/${stripSlashes(outputs.public_root || 'ai')}`;
    const pagesDir = stripSlashes(files.pages_dir || 'pages');
    return joinUrl(publicRoot, pagesDir);
  }

  // Preserve ordering while removing duplicates created by overlapping base URLs.
  function dedupe(list) {
    const seen = [];
    list.forEach((item) => {
      if (item && !seen.includes(item)) {
        seen.push(item);
      }
    });
    return seen;
  }

  // Build a prioritized list of URLs where a slug's Markdown could exist.
  function getSlugCandidates(slug) {
    const normalizedSlug = (slug || 'index').toString().replace(/\.md$/i, '');
    const candidates = [];

    if (state.remoteBase) {
      candidates.push(joinUrl(state.remoteBase, `${normalizedSlug}.md`));
    }

    const localBase = getLocalPagesBase();
    if (localBase) {
      candidates.push(joinUrl(localBase, `${normalizedSlug}.md`));
      if (state.siteBase) {
        candidates.push(joinUrl(state.siteBase, joinUrl(localBase, `${normalizedSlug}.md`)));
      }
    }

    const { raw, site } = getAiBaseUrls();
    if (raw) {
      const rawBase = raw.replace(/\/+$/, '');
      const hasPagesSegment = /\/pages(?:\/?$)/.test(rawBase);
      const rawCandidate = hasPagesSegment
        ? joinUrl(raw, `${normalizedSlug}.md`)
        : joinUrl(raw, `pages/${normalizedSlug}.md`);
      candidates.push(rawCandidate);
    }

    if (site) {
      candidates.push(joinUrl(site, `ai/pages/${normalizedSlug}.md`));
    }

    candidates.push(joinUrl('', `ai/pages/${normalizedSlug}.md`));

    return dedupe(candidates);
  }

  // Simple fetch wrapper that tolerates 404s and returns `null` instead of throwing.
  async function fetchText(url) {
    try {
      const response = await fetch(url, { credentials: 'omit' });
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`HTTP ${response.status}`);
      }
      return await response.text();
    } catch (error) {
      console.error('LLMS shared: failed to fetch text', url, error);
      return null;
    }
  }

  // Walk the candidate list until a Markdown file returns successfully.
  async function fetchSlugContent(slug) {
    await ready();
    const candidates = getSlugCandidates(slug);
    for (const url of candidates) {
      const text = await fetchText(url);
      if (text) {
        return { text, url };
      }
    }
    return null;
  }

  // Same candidate iteration as `fetchSlugContent`, but pipes the first successful response into a download.
  async function downloadSlug(slug, filename) {
    await ready();
    const candidates = getSlugCandidates(slug);
    for (const url of candidates) {
      try {
        const response = await fetch(url, { credentials: 'omit' });
        if (!response.ok) {
          if (response.status === 404) {
            continue;
          }
          throw new Error(`HTTP ${response.status}`);
        }
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = objectUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(objectUrl);
        link.remove();
        return true;
      } catch (error) {
        console.error('LLMS shared: download failed, trying next candidate', url, error);
      }
    }
    return false;
  }

  // Normalizes different path syntaxes (full URLs, site-relative, artifact shortcuts) into a fetchable URL.
  function resolvePath(rawPath) {
    if (!rawPath) {
      return null;
    }

    const trimmedPath = rawPath.trim();
    if (/^https?:\/\//i.test(trimmedPath)) {
      return trimmedPath;
    }

    const { raw, site } = getAiBaseUrls();
    const rawBase = state.remoteBase || raw;
    const siteBase = state.siteBase;
    const normalized = stripLeading(trimmedPath);
    const outputs = state.config?.outputs || {};
    const publicRoot = `/${stripSlashes(outputs.public_root || 'ai')}`;

    const toSite = (path) => siteBase ? joinUrl(siteBase, path) : joinUrl('', path);
    const toRaw = (path) => {
      if (rawBase) {
        return joinUrl(rawBase, stripLeading(path.replace(/^ai\//, '')));
      }
      return toSite(joinUrl(publicRoot, path));
    };

    if (normalized.startsWith('ai/pages/') || normalized.startsWith('ai/categories/')) {
      return toRaw(normalized);
    }

    if (normalized.startsWith('pages/') || normalized.startsWith('categories/')) {
      return toRaw(`ai/${normalized}`);
    }

    if (trimmedPath.startsWith('/')) {
      return toSite(normalized);
    }

    if (normalized.startsWith('ai/')) {
      return toSite(normalized);
    }

    if (normalized === 'llms.txt' || normalized === 'llms-full.txt' || normalized === 'llms-full.jsonl') {
      return toSite(normalized);
    }

    if (normalized.startsWith('llms-files/')) {
      return toSite(normalized);
    }

    return rawBase ? joinUrl(rawBase, normalized) : toSite(normalized);
  }

  // Public helper for on-demand fetches when a consumer already knows the path string.
  async function fetchPathText(rawPath) {
    await ready();
    const url = resolvePath(rawPath);
    if (!url) {
      return null;
    }
    return fetchText(url);
  }

  // Export surface area consumed by UI widgets such as the copy-to-LLM buttons.
  window.LLMS = {
    ready,
    getConfig,
    getPageSlug,
    getSlugCandidates,
    fetchSlugContent,
    downloadSlug
  };

  // Kick off config fetch early; callers can await `LLMS.ready()` later if needed.
  ready();
})();
