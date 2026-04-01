/**
 * Asset ID to ERC20 Precompile Address Converter
 *
 * Converts Assets pallet asset IDs (decimal) to ERC20 precompile addresses.
 * Supports three asset types:
 *   - Trust-Backed: 0x + assetId (8 hex) + 24 zeros + 01200000
 *   - Foreign:      0x + foreignAssetIndex (8 hex) + 24 zeros + 02200000
 *   - Pool:         0x + assetId (8 hex) + 24 zeros + 03200000
 * Uses EIP-55 checksum via Polkadot.js util-crypto.
 */

(function () {
  'use strict';

  const MAX_U32 = 4294967295;
  const DEBOUNCE_MS = 300;
  const COPY_FEEDBACK_MS = 2000;
  const OUTPUT_INPUT_ID = 'erc20AddressOutput';

  const ASSET_TYPES = {
    trustBacked: {
      value: 'trustBacked',
      label: 'Trust-Backed Asset',
      suffix: '01200000',
      inputLabel: 'Asset ID (Decimal)',
      placeholder: '1984',
      resultLabel: 'ERC20 Precompile Address',
      formatInfo: '<strong>Format:</strong> <code>0x</code> + assetId (8 hex) + 24 zeros + <code>01200000</code>',
    },
    foreign: {
      value: 'foreign',
      label: 'Foreign Asset',
      suffix: '02200000',
      inputLabel: 'Foreign Asset Index (Decimal)',
      placeholder: '0',
      resultLabel: 'ERC20 Precompile Address (Foreign)',
      formatInfo: '<strong>Format:</strong> <code>0x</code> + foreignAssetIndex (8 hex) + 24 zeros + <code>02200000</code>',
    },
    pool: {
      value: 'pool',
      label: 'Pool Asset',
      suffix: '03200000',
      inputLabel: 'Pool Asset ID (Decimal)',
      placeholder: '0',
      resultLabel: 'ERC20 Precompile Address (Pool)',
      formatInfo: '<strong>Format:</strong> <code>0x</code> + assetId (8 hex) + 24 zeros + <code>03200000</code>',
    },
  };

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

    function idToERC20Address(id, assetType) {
      const suffix = (assetType && ASSET_TYPES[assetType]) ? ASSET_TYPES[assetType].suffix : ASSET_TYPES.trustBacked.suffix;
      const idHex = padHex(id, 8);
      const address = '0x' + idHex + '0'.repeat(24) + suffix;
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
      const assetIdInput = document.getElementById('erc20AssetId');
      const assetIdLabel = document.getElementById('erc20AssetIdLabel');
      const resultsEl = document.getElementById('erc20Results');
      const resultLabelEl = document.getElementById('erc20ResultLabel');
      const outputEl = document.getElementById(OUTPUT_INPUT_ID);
      const errorEl = document.getElementById('erc20AssetIdError');
      const formatInfoEl = document.getElementById('erc20FormatInfo');
      const copyBtn = document.querySelector('.erc20-asset-converter-copy-button');
      const typeRadios = document.querySelectorAll('.erc20-asset-converter-type-radio');

      function getSelectedType() {
        for (var i = 0; i < typeRadios.length; i++) {
          if (typeRadios[i].checked) return typeRadios[i].value;
        }
        return 'trustBacked';
      }

      function applyTypeLabels(assetType) {
        const config = ASSET_TYPES[assetType] || ASSET_TYPES.trustBacked;
        if (assetIdLabel) assetIdLabel.textContent = config.inputLabel;
        if (assetIdInput) assetIdInput.placeholder = config.placeholder;
        if (resultLabelEl) resultLabelEl.textContent = config.resultLabel;
        if (formatInfoEl) formatInfoEl.innerHTML = config.formatInfo;
      }

      function updateAddress() {
        const raw = assetIdInput.value.trim();
        const assetType = getSelectedType();
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
          const address = idToERC20Address(assetId, assetType);
          outputEl.value = address;
          resultsEl.classList.remove('hidden');
        } catch (e) {
          showError(errorEl, assetIdInput, e.message || 'Conversion failed.');
          resultsEl.classList.add('hidden');
        }
      }

      typeRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
          applyTypeLabels(getSelectedType());
          resultsEl.classList.add('hidden');
          if (outputEl) outputEl.value = '';
          clearError(errorEl, assetIdInput);
          if (assetIdInput.value.trim()) {
            updateAddress();
          }
        });
      });

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

      applyTypeLabels(getSelectedType());
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
