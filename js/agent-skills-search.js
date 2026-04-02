/* Agent Skills Search script
   Handles search, filtering, and rendering for the agent skills search
   component on the AI Resources page.
*/

(function () {
  'use strict';

  if (typeof window === 'undefined') {
    return;
  }

  // ---------- Analytics ----------

  function sendAnalytics(actionId) {
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'ai_file_action', {
          event_category: 'engagement',
          event_label: actionId,
        });
      } catch (e) {
        /* silently fail */
      }
    }
  }

  // ---------- Debounce ----------

  function debounce(fn, delay) {
    let timer;
    return function () {
      const args = arguments;
      const ctx = this;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(ctx, args);
      }, delay);
    };
  }

  // ---------- Fetch with cache ----------

  let cachedIndex = null;

  async function fetchIndex(url) {
    if (cachedIndex) return cachedIndex;
    const response = await fetch(url, { credentials: 'omit' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    cachedIndex = await response.json();
    return cachedIndex;
  }

  // ---------- Filter ----------

  function filterSkills(skills, query) {
    const q = query.toLowerCase();
    return skills.filter(
      (skill) =>
        skill.title.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q),
    );
  }

  // ---------- Render ----------

  function renderResults(container, skills, baseUrl) {
    container.innerHTML = '';

    if (!skills.length) {
      const empty = document.createElement('p');
      empty.className = 'agent-skills-search__empty';
      empty.textContent = 'No skills found.';
      container.appendChild(empty);
      return;
    }

    skills.forEach(function (skill) {
      const skillUrl = baseUrl + skill.file;

      const card = document.createElement('div');
      card.className = 'agent-skills-search__card';

      const title = document.createElement('p');
      title.className = 'agent-skills-search__card-title';
      title.textContent = skill.title;

      const desc = document.createElement('p');
      desc.className = 'agent-skills-search__card-desc';
      desc.textContent = skill.description;

      const actions = document.createElement('div');
      actions.className = 'agent-skills-search__card-actions';

      const viewLink = document.createElement('a');
      viewLink.href = skillUrl;
      viewLink.target = '_blank';
      viewLink.rel = 'noopener';
      viewLink.className = 'agent-skills-search__card-link';
      viewLink.textContent = 'View';
      viewLink.addEventListener('click', function () {
        sendAnalytics('skills-search-view');
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = skillUrl;
      downloadLink.download = skill.file;
      downloadLink.className = 'agent-skills-search__card-link';
      downloadLink.textContent = 'Download';
      downloadLink.addEventListener('click', function () {
        sendAnalytics('skills-search-download');
      });

      actions.appendChild(viewLink);
      actions.appendChild(downloadLink);
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(actions);
      container.appendChild(card);
    });
  }

  // ---------- Init ----------

  function init() {
    const searchContainer = document.getElementById('agent-skills-search');
    if (!searchContainer) return;

    const input = searchContainer.querySelector('.agent-skills-search__input');
    const results = searchContainer.querySelector(
      '.agent-skills-search__results',
    );
    if (!input || !results) return;

    const indexUrl = searchContainer.dataset.skillsIndex;
    if (!indexUrl) return;

    const baseUrl = indexUrl.replace('index.json', '');

    const handleInput = debounce(async function () {
      const query = input.value.trim();

      if (!query) {
        results.innerHTML = '';
        return;
      }

      try {
        const data = await fetchIndex(indexUrl);
        const matched = filterSkills(data.skills, query);
        renderResults(results, matched, baseUrl);
      } catch (error) {
        console.error('Skills search error:', error);
        results.innerHTML = '';
      }
    }, 250);

    input.addEventListener('input', handleInput);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
