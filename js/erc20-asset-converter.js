/**
 * Asset ID to ERC20 Precompile Address Converter
 *
 * Converts Assets pallet asset IDs (decimal) to ERC20 precompile addresses.
 * Format: 0x + assetId (8 hex) + 24 zeros + 01200000 (Paseo Asset Hub / Trust Backed Asset).
 * Uses EIP-55 checksum via Polkadot.js util-crypto.
 */

(function () {
  'use strict';

  const MAX_U32 = 4294967295;
  const DEBOUNCE_MS = 300;
  const COPY_FEEDBACK_MS = 2000;
  const OUTPUT_INPUT_ID = 'erc20AddressOutput';

  function initConverter() {
    if (typeof polkadotUtilCrypto === 'undefined') {
      console.error('Polkadot.js util-crypto not loaded');
      return;
    }

    const { keccak256AsU8a } = polkadotUtilCrypto;

    function padHex(num, length) {
      let hex = num.toString(16);
      while (hex.length < length) {
        hex = '0' + hex;
      }
      return hex;
    }

    function toChecksumAddress(address) {
      const addr = address.toLowerCase().replace('0x', '');
      if (addr.length !== 40) {
        throw new Error('Invalid Ethereum address length');
      }
      const hash = keccak256AsU8a(new TextEncoder().encode(addr));
      let checksummed = '0x';
      for (let i = 0; i < addr.length; i++) {
        if ((hash[Math.floor(i / 2)] >> (i % 2 === 0 ? 4 : 0)) & 0x8) {
          checksummed += addr[i].toUpperCase();
        } else {
          checksummed += addr[i];
        }
      }
      return checksummed;
    }

    function assetIdToERC20Address(assetId) {
      const assetIdHex = padHex(assetId, 8);
      const address = '0x' + assetIdHex + '0'.repeat(24) + '01200000';
      return toChecksumAddress(address);
    }

    function showError(errorEl, inputEl, message) {
      if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.add('show');
      }
      if (inputEl) inputEl.classList.add('error');
    }

    function clearError(errorEl, inputEl) {
      if (errorEl) errorEl.classList.remove('show');
      if (inputEl) inputEl.classList.remove('error');
    }

    function copyAddress(buttonElement) {
      const output = document.getElementById(OUTPUT_INPUT_ID);
      if (!output || !output.value.trim() || !buttonElement) return;
      const text = output.value.trim();

      function showCopiedFeedback() {
        buttonElement.classList.add('copied');
        buttonElement.setAttribute('title', 'Copied!');
        buttonElement.setAttribute('aria-label', 'Copied!');
        setTimeout(function () {
          buttonElement.classList.remove('copied');
          buttonElement.setAttribute('title', 'Copy to clipboard');
          buttonElement.setAttribute('aria-label', 'Copy to clipboard');
        }, COPY_FEEDBACK_MS);
      }

      navigator.clipboard
        .writeText(text)
        .then(showCopiedFeedback)
        .catch(function () {
          try {
            output.select();
            output.setSelectionRange(0, 99999);
            if (document.execCommand('copy')) showCopiedFeedback();
          } catch (e) {
            console.error('Copy failed:', e);
          }
        });
    }

    function buildConverterHTML() {
      const root = document.getElementById('erc20-asset-converter-root');
      if (!root) return;

      root.innerHTML =
        '<div class="erc20-asset-converter-container">' +
        '  <h2 class="erc20-asset-converter-heading">Asset ID to ERC20 Address Converter</h2>' +
        '  <p class="erc20-asset-converter-subtitle">Convert Assets pallet asset IDs to ERC20 precompile addresses</p>' +
        '  <div class="erc20-asset-converter-box">' +
        '    <div class="erc20-asset-converter-input-section">' +
        '      <div class="erc20-asset-converter-input-wrapper">' +
        '        <label class="erc20-asset-converter-label" for="erc20AssetId">Asset ID (Decimal)</label>' +
        '        <input type="number" id="erc20AssetId" class="erc20-asset-converter-input" min="0" max="' +
        MAX_U32 +
        '" placeholder="1984" inputmode="numeric">' +
        '      </div>' +
        '      <div id="erc20AssetIdError" class="erc20-asset-converter-error"></div>' +
        '    </div>' +
        '    <div id="erc20Results" class="erc20-asset-converter-results hidden">' +
        '      <div class="erc20-asset-converter-result-item">' +
        '        <span class="erc20-asset-converter-result-label">ERC20 Precompile Address</span>' +
        '        <div class="erc20-asset-converter-output-wrapper">' +
        '          <input type="text" id="' +
        OUTPUT_INPUT_ID +
        '" class="erc20-asset-converter-output" readonly spellcheck="false">' +
        '          <button type="button" class="erc20-asset-converter-copy-button" title="Copy to clipboard" aria-label="Copy to clipboard">' +
        '            <svg class="erc20-asset-converter-copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect x="9" y="9" width="13" height="13" rx="2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '            <svg class="erc20-asset-converter-check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20 6L9 17L4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
        '            <span class="erc20-asset-converter-copy-feedback" aria-live="polite">Copied!</span>' +
        '          </button>' +
        '        </div>' +
        '      </div>' +
        '    </div>' +
        '    <div class="erc20-asset-converter-info">' +
        '      <strong>Format:</strong> <code>0x</code> + assetId (8 hex) + 24 zeros + <code>01200000</code>' +
        '    </div>' +
        '  </div>' +
        '</div>';

      const assetIdInput = document.getElementById('erc20AssetId');
      const resultsEl = document.getElementById('erc20Results');
      const outputEl = document.getElementById(OUTPUT_INPUT_ID);
      const errorEl = document.getElementById('erc20AssetIdError');
      const copyBtn = root.querySelector('.erc20-asset-converter-copy-button');

      function updateAddress() {
        const raw = assetIdInput.value.trim();
        clearError(errorEl, assetIdInput);

        if (!raw) {
          resultsEl.classList.add('hidden');
          return;
        }

        const assetId = parseInt(raw, 10);
        if (isNaN(assetId) || assetId < 0 || assetId > MAX_U32 || raw !== String(assetId)) {
          showError(
            errorEl,
            assetIdInput,
            'Enter a whole number from 0 to ' + MAX_U32.toLocaleString() + '.',
          );
          resultsEl.classList.add('hidden');
          return;
        }

        try {
          const address = assetIdToERC20Address(assetId);
          outputEl.value = address;
          resultsEl.classList.remove('hidden');
        } catch (e) {
          showError(errorEl, assetIdInput, e.message || 'Conversion failed.');
          resultsEl.classList.add('hidden');
        }
      }

      let debounceTimer;
      assetIdInput.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(updateAddress, DEBOUNCE_MS);
      });
      assetIdInput.addEventListener('paste', function () {
        setTimeout(updateAddress, 50);
      });
      assetIdInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          updateAddress();
        }
      });

      if (copyBtn) {
        copyBtn.addEventListener('click', function () {
          copyAddress(this);
        });
      }

      updateAddress();
    }

    function onReady() {
      buildConverterHTML();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  if (typeof polkadotUtilCrypto !== 'undefined') {
    initConverter();
  } else {
    let checks = 0;
    const maxChecks = 50;
    const interval = setInterval(function () {
      checks++;
      if (typeof polkadotUtilCrypto !== 'undefined') {
        clearInterval(interval);
        initConverter();
      } else if (checks >= maxChecks) {
        clearInterval(interval);
        console.error('Polkadot.js util-crypto failed to load');
      }
    }, 100);
  }
})();
