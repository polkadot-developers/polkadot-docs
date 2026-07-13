/* Polkadot Docs Assistant widget.
   Self-hosted chat over the docs corpus — replaces the former kapa.ai embed.
   Talks to the assistant API (see the service repo): POST /chat, POST /feedback.

   Configured from the script tag in main.html:
     <script defer src="js/docs-assistant.js" data-api-url="https://..."></script>
   If data-api-url is empty the widget renders nothing (dark launch).
*/

(function () {
  'use strict';

  if (typeof window === 'undefined') return;

  const script = document.currentScript;
  const API_BASE = (script && script.dataset.apiUrl ? script.dataset.apiUrl : '').replace(/\/$/, '');
  if (!API_BASE) return; // no endpoint configured — ship dark

  const HISTORY_TURNS = 6; // question+answer pairs sent back for follow-up rewriting
  const history = [];
  const sessionId = 'da-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

  // ---------- tiny markdown renderer (no dependencies) ----------
  function escapeHtml(s) {
    // Must escape quotes too: the answer is untrusted LLM output rendered via
    // innerHTML, and mdInline interpolates captured text into href="..." — an
    // unescaped " would break out of the attribute and inject a handler (XSS).
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function mdInline(s) {
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(\S([^*\n]*?\S)?)\*/g, '<em>$1</em>')  // require non-space at the *edges* so "2 * 3" isn't emphasis
      // s is already HTML-escaped, so a real URL has no quote/space; if any escaped
      // quote survived in the captured URL, refuse to build a link (render literal).
      .replace(/\[([^\]]+)\]\((https?:(?:[^()\s]|\([^()\s]*\))+)\)/g, function (m, text, url) {
        return /&quot;|&#39;/.test(url) ? m : '<a href="' + url + '" target="_blank" rel="noopener">' + text + '</a>';
      });
  }
  function md(src) {
    let s = escapeHtml(src || '');
    s = s.replace(/\[[a-z0-9\-]+#[a-z0-9\-]+\]/gi, ''); // citation tokens become source chips
    const lines = s.split(/\n/);
    let out = '';
    let i = 0;
    const special = /^\s*([-*]\s+|\d+\.\s+|#{1,6}\s+|```)/;
    while (i < lines.length) {
      if (/^\s*```/.test(lines[i])) {
        const code = [];
        i++;
        while (i < lines.length && !/^\s*```/.test(lines[i])) { code.push(lines[i]); i++; }
        i++;
        out += '<pre><code>' + code.join('\n') + '</code></pre>';
      } else if (/^\s*[-*]\s+/.test(lines[i])) {
        const ul = [];
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { ul.push('<li>' + mdInline(lines[i].replace(/^\s*[-*]\s+/, '')) + '</li>'); i++; }
        out += '<ul>' + ul.join('') + '</ul>';
      } else if (/^\s*\d+\.\s+/.test(lines[i])) {
        const ol = [];
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { ol.push('<li>' + mdInline(lines[i].replace(/^\s*\d+\.\s+/, '')) + '</li>'); i++; }
        out += '<ol>' + ol.join('') + '</ol>';
      } else if (/^\s*#{1,6}\s+/.test(lines[i])) {
        out += '<h4>' + mdInline(lines[i].replace(/^\s*#{1,6}\s+/, '')) + '</h4>';
        i++;
      } else if (lines[i].trim() === '') {
        i++;
      } else {
        const p = [];
        while (i < lines.length && lines[i].trim() !== '' && !special.test(lines[i])) { p.push(lines[i]); i++; }
        out += '<p>' + mdInline(p.join(' ').trim()) + '</p>';
      }
    }
    return out;
  }

  // ---------- DOM ----------
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  // s.url comes from the API (untrusted); only allow it as an href if it's http(s),
  // matching the scheme guard mdInline applies to links in the answer body.
  function httpUrl(u) {
    try { return /^https?:$/i.test(new URL(u, location.href).protocol) ? u : null; }
    catch (e) { return null; }
  }

  const btn = el('button', 'da-launcher');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Open the docs assistant');
  btn.innerHTML =
    '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 3C6.5 3 2 6.9 2 11.7c0 2.7 1.4 5.1 3.7 6.7-.1.9-.5 2.3-1.6 3.6 0 0 2.4-.3 4.5-1.7 1.1.3 2.2.4 3.4.4 5.5 0 10-3.9 10-8.7S17.5 3 12 3z"/></svg>' +
    '<span>Ask the docs</span>';

  const panel = el('div', 'da-panel');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Polkadot Docs Assistant');
  panel.innerHTML =
    '<div class="da-head">' +
    '  <div><strong>Polkadot Docs Assistant</strong><small>Answers from the docs, with sources</small></div>' +
    '  <button type="button" class="da-close" aria-label="Close">&#10005;</button>' +
    '</div>' +
    '<div class="da-msgs"></div>' +
    '<div class="da-input">' +
    '  <input type="text" placeholder="Ask about the Polkadot docs…" autocomplete="off" aria-label="Your question">' +
    '  <button type="button" class="da-send">Send</button>' +
    '</div>' +
    '<div class="da-note">AI-generated from the documentation — verify against the linked sources and use your best judgement. ' +
    'Please don’t share personal or private information. ' +
    'By submitting a query you agree to <a href="https://polkadot.com/legal-disclosures/" target="_blank" rel="noopener">these conditions</a>. ' +
    'Need more help? <a href="https://support.polkadot.network/" target="_blank" rel="noopener">Polkadot Support</a>.</div>';

  const msgs = panel.querySelector('.da-msgs');
  const input = panel.querySelector('input');
  const sendBtn = panel.querySelector('.da-send');

  function togglePanel(open) {
    const isOpen = typeof open === 'boolean' ? open : !panel.classList.contains('da-open');
    panel.classList.toggle('da-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) input.focus();
  }
  btn.addEventListener('click', function () { togglePanel(); });
  panel.querySelector('.da-close').addEventListener('click', function () { togglePanel(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panel.classList.contains('da-open')) togglePanel(false);
  });

  // ---------- messages ----------
  function addUser(text) {
    msgs.appendChild(el('div', 'da-msg da-user', text));
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addBot(data, question) {
    const wrap = el('div', 'da-msg da-bot');
    wrap.innerHTML = md(data.answer);

    if (data.sources && data.sources.length) {
      const chips = el('div', 'da-cites');
      const seen = {};
      data.sources.forEach(function (s) {
        const pid = (s.ref || '').split('#')[0];
        if (seen[pid]) return;
        seen[pid] = true;
        const href = s.url && httpUrl(s.url);
        let chip;
        if (href) {
          chip = el('a', 'da-chip', s.page_title || s.title || pid);
          chip.href = href;
          chip.target = '_blank';
          chip.rel = 'noopener';
        } else {
          chip = el('span', 'da-chip', s.page_title || s.title || pid);
        }
        chip.title = s.ref;
        chips.appendChild(chip);
      });
      wrap.appendChild(chips);
    }

    const fb = el('div', 'da-fb');
    ['up', 'down'].forEach(function (rating) {
      const b = el('button', 'da-fb-btn', rating === 'up' ? '👍' : '👎');
      b.type = 'button';
      b.setAttribute('aria-label', rating === 'up' ? 'Good answer' : 'Bad answer');
      b.addEventListener('click', function () {
        Array.prototype.forEach.call(fb.children, function (c) { c.classList.remove('da-on'); });
        b.classList.add('da-on');
        fetch(API_BASE + '/feedback', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ question: question, answer: data.answer, rating: rating, session_id: sessionId })
        }).catch(function () {});
      });
      fb.appendChild(b);
    });
    wrap.appendChild(fb);

    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function send() {
    const q = input.value.trim();
    if (!q || sendBtn.disabled) return;
    input.value = '';
    sendBtn.disabled = true;
    addUser(q);
    const thinking = el('div', 'da-msg da-bot da-thinking');
    thinking.setAttribute('role', 'status');
    thinking.setAttribute('aria-label', 'Searching the docs and writing an answer');
    thinking.innerHTML =
      '<span class="da-thinking-icon" aria-hidden="true">' +
      '  <svg viewBox="0 0 24 24" width="16" height="16"><path fill="currentColor" d="M12 2l1.6 4.9a4 4 0 0 0 2.5 2.5L21 11l-4.9 1.6a4 4 0 0 0-2.5 2.5L12 22l-1.6-4.9a4 4 0 0 0-2.5-2.5L3 13l4.9-1.6a4 4 0 0 0 2.5-2.5L12 2z"/></svg>' +
      '</span>' +
      '<span class="da-dots" aria-hidden="true"><span></span><span></span><span></span></span>';
    msgs.appendChild(thinking);
    msgs.scrollTop = msgs.scrollHeight;

    fetch(API_BASE + '/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ question: q, history: history.slice(-HISTORY_TURNS * 2), session_id: sessionId })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (data) {
        thinking.remove();
        addBot(data, q);
        history.push({ role: 'user', content: q }, { role: 'assistant', content: data.answer });
      })
      .catch(function () {
        thinking.classList.remove('da-thinking');
        thinking.removeAttribute('aria-label'); // drop the stale "Searching…" label
        thinking.setAttribute('role', 'alert');  // announce the error, not the old status
        thinking.textContent = 'The assistant is temporarily unavailable. Please try again in a moment, or browse the docs directly.';
      })
      .then(function () {
        sendBtn.disabled = false;
        input.focus();
      });
  }
  sendBtn.addEventListener('click', send);
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });

  document.body.appendChild(btn);
  document.body.appendChild(panel);
})();
