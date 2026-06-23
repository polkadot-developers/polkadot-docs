/**
 * EVM to SS58 Address Converter
 * Using Polkadot.js libraries for 100% compatibility
 *
 * Conversion Logic:
 * - ETH → SS58: 20-byte ETH address is padded to 32 bytes with 0xEE suffix
 * - SS58 → ETH: If padded (ends with 0xEE), strips to original; otherwise Keccak256 hash
 */

(function () {
  'use strict';

  const MAPPED_ACCOUNT_ERROR =
    'Check the box to confirm you have mapped this account before converting SS58 → ETH.';
  const MIN_ADDRESS_LENGTH = 40;
  const DEBOUNCE_MS = 500;
  const COPY_FEEDBACK_MS = 2000;

  function initConverter() {
    if (
      typeof polkadotUtil === 'undefined' ||
      typeof polkadotUtilCrypto === 'undefined'
    ) {
      console.error('Polkadot.js libraries not loaded');
      return;
    }

    const { hexToU8a, u8aToHex } = polkadotUtil;
    const { encodeAddress, decodeAddress, keccak256AsU8a } = polkadotUtilCrypto;

    // =========================================================================
    // Core conversion functions
    // =========================================================================

    /**
     * Converts an Ethereum address to SS58 format.
     * 20-byte ETH address is padded to 32 bytes with 0xEE suffix.
     */
    function ethToSS58(ethAddress, ss58Prefix) {
      if (!ethAddress.match(/^0x[0-9a-fA-F]{40}$/)) {
        throw new Error(
          'Invalid Ethereum address format. Expected 0x followed by 40 hex characters.',
        );
      }

      const ethBytes = hexToU8a(ethAddress);
      const substrateBytes = new Uint8Array(32);
      substrateBytes.fill(0xee);
      substrateBytes.set(ethBytes, 0);

      return encodeAddress(substrateBytes, ss58Prefix);
    }

    /**
     * Converts an SS58 address to Ethereum format.
     * If last 12 bytes are 0xEE (ETH-derived), strips suffix; otherwise Keccak256 hash.
     */
    function ss58ToEth(ss58Address) {
      const substrateBytes = decodeAddress(ss58Address);
      const isEthDerived = substrateBytes
        .slice(20)
        .every((byte) => byte === 0xee);

      const ethBytes = isEthDerived
        ? substrateBytes.slice(0, 20)
        : keccak256AsU8a(substrateBytes).slice(-20);

      return toChecksumAddress(u8aToHex(ethBytes));
    }

    /**
     * Applies EIP-55 checksumming to an Ethereum address.
     */
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

    // =========================================================================
    // UI helpers
    // =========================================================================

    function showError(errorElement, inputElement, message) {
      errorElement.textContent = message;
      errorElement.classList.add('show');
      inputElement.classList.add('error');
    }

    function clearError(errorElement, inputElement) {
      errorElement.classList.remove('show');
      inputElement.classList.remove('error');
    }

    /**
     * Copy text to clipboard with visual feedback on the button.
     */
    function copyToClipboard(inputId, buttonElement) {
      const input = document.getElementById(inputId);
      if (!input || !input.value.trim() || !buttonElement) return;

      const text = input.value.trim();

      function showCopiedFeedback() {
        buttonElement.classList.add('copied');
        buttonElement.setAttribute('title', 'Copied!');
        buttonElement.setAttribute('aria-label', 'Copied!');
        setTimeout(() => {
          buttonElement.classList.remove('copied');
          buttonElement.setAttribute('title', 'Copy to clipboard');
          buttonElement.setAttribute('aria-label', 'Copy to clipboard');
        }, COPY_FEEDBACK_MS);
      }

      navigator.clipboard
        .writeText(text)
        .then(showCopiedFeedback)
        .catch(() => {
          // Fallback for older browsers or non-HTTPS
          try {
            input.select();
            input.setSelectionRange(0, 99999);
            if (document.execCommand('copy')) {
              showCopiedFeedback();
            }
          } catch (e) {
            console.error('Copy failed:', e);
          }
        });
    }

    // Expose for inline onclick handlers
    window.copyToClipboard = copyToClipboard;

    // =========================================================================
    // HTML injection
    // =========================================================================

    function buildConverterHTML() {
      const root = document.getElementById('account-converter-root');
      if (!root) return;

      root.innerHTML = `
<div class="converter-container">
    <h2 class="converter-heading">
        Address Format Converter (EVM ↔ SS58)
    </h2>
    <p class="converter-subtitle">Convert addresses between Ethereum and Polkadot networks</p>

    <div class="converter-box">
        <div class="converter-network-row">
            <label class="converter-network-label" for="network">Network</label>
            <select id="network" class="converter-network-select">
                <option value="0">Polkadot Hub</option>
                <option value="2">Kusama Hub</option>
                <option value="0">Polkadot Hub Testnet (Paseo)</option>
            </select>
        </div>

        <div class="converter-input-section">
            <div class="converter-input-wrapper">
                <label class="converter-input-label" for="ethAddress">ETH Address</label>
                <input 
                    type="text" 
                    id="ethAddress" 
                    class="converter-input"
                    placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEbb"
                    spellcheck="false"
                >
                <button type="button" class="converter-copy-button" onclick="copyToClipboard('ethAddress', this)" title="Copy to clipboard" aria-label="Copy to clipboard">
                    <svg class="converter-copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg class="converter-check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="converter-copy-feedback" aria-live="polite">Copied!</span>
                </button>
            </div>
            <div id="ethError" class="converter-error"></div>
        </div>

        <div class="converter-input-section">
            <div class="converter-input-wrapper">
                <label class="converter-input-label" for="ss58Address">SS58 Address</label>
                <input 
                    type="text" 
                    id="ss58Address" 
                    class="converter-input"
                    placeholder="5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM"
                    spellcheck="false"
                >
                <button type="button" class="converter-copy-button" onclick="copyToClipboard('ss58Address', this)" title="Copy to clipboard" aria-label="Copy to clipboard">
                    <svg class="converter-copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="9" y="9" width="13" height="13" rx="2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <svg class="converter-check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 6L9 17L4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="converter-copy-feedback" aria-live="polite">Copied!</span>
                </button>
            </div>
            <label class="converter-ss58-checkbox-label">
                <input type="checkbox" id="ss58MappedCheckbox" class="converter-ss58-checkbox">
                <span class="converter-ss58-checkbox-text">I have mapped this account previously</span>
            </label>
            <div id="ss58Error" class="converter-error"></div>
        </div>
    </div>

    <div class="converter-disclaimer">
        <span class="converter-disclaimer-title">Important:<br /></span>
        This tool converts <strong class="converter-text-bold">address formats only</strong> — it does <strong class="converter-text-bold">not derive or transfer private keys</strong>. You can only control funds if you have the original private key.
    </div>
</div>
      `.trim();
    }

    // =========================================================================
    // Event wiring
    // =========================================================================

    function onReady() {
      buildConverterHTML();

      // Cache DOM references
      const ethInput = document.getElementById('ethAddress');
      const ss58Input = document.getElementById('ss58Address');
      const networkSelect = document.getElementById('network');
      const ethError = document.getElementById('ethError');
      const ss58Error = document.getElementById('ss58Error');
      const mappedCheckbox = document.getElementById('ss58MappedCheckbox');

      if (!ethInput || !ss58Input || !networkSelect) return;

      // --- Conversion helpers using cached refs ---

      function convertEthToSS58() {
        clearError(ethError, ethInput);
        const ethAddress = ethInput.value.trim();

        if (!ethAddress) {
          ss58Input.value = '';
          return;
        }

        try {
          const ss58Prefix = parseInt(networkSelect.value);
          ss58Input.value = ethToSS58(ethAddress, ss58Prefix);
          ethInput.value = toChecksumAddress(ethAddress);
        } catch (error) {
          showError(ethError, ethInput, error.message);
          ss58Input.value = '';
        }
      }

      function convertSS58ToEth() {
        clearError(ss58Error, ss58Input);
        const ss58Address = ss58Input.value.trim();

        if (!ss58Address) {
          ethInput.value = '';
          return;
        }

        if (!mappedCheckbox || !mappedCheckbox.checked) {
          ethInput.value = '';
          showError(ss58Error, ss58Input, MAPPED_ACCOUNT_ERROR);
          return;
        }

        try {
          ethInput.value = ss58ToEth(ss58Address);
        } catch (error) {
          showError(ss58Error, ss58Input, error.message);
          ethInput.value = '';
        }
      }

      // --- Debounce timers ---
      let ethDebounce;
      let ss58Debounce;

      // ETH input
      ethInput.addEventListener('input', () => {
        clearError(ethError, ethInput);
        if (!ethInput.value.trim()) {
          ss58Input.value = '';
          return;
        }
        clearTimeout(ethDebounce);
        ethDebounce = setTimeout(() => {
          if (ethInput.value.trim().length >= 42) convertEthToSS58();
        }, DEBOUNCE_MS);
      });

      ethInput.addEventListener('paste', () => {
        setTimeout(() => {
          if (ethInput.value.trim()) convertEthToSS58();
        }, 50);
      });

      ethInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          convertEthToSS58();
        }
      });

      // SS58 input
      ss58Input.addEventListener('input', () => {
        clearError(ss58Error, ss58Input);
        const value = ss58Input.value.trim();
        if (!value) {
          ethInput.value = '';
          return;
        }

        if (!mappedCheckbox || !mappedCheckbox.checked) {
          ethInput.value = '';
          if (value.length >= MIN_ADDRESS_LENGTH) {
            showError(ss58Error, ss58Input, MAPPED_ACCOUNT_ERROR);
          }
          return;
        }

        clearTimeout(ss58Debounce);
        ss58Debounce = setTimeout(() => {
          if (value.length >= MIN_ADDRESS_LENGTH) convertSS58ToEth();
        }, DEBOUNCE_MS);
      });

      ss58Input.addEventListener('paste', () => {
        setTimeout(() => {
          if (ss58Input.value.trim()) convertSS58ToEth();
        }, 50);
      });

      ss58Input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          convertSS58ToEth();
        }
      });

      // Network change re-converts ETH → SS58
      networkSelect.addEventListener('change', () => {
        if (ethInput.value.trim()) convertEthToSS58();
      });

      // Checkbox toggle
      if (mappedCheckbox) {
        mappedCheckbox.addEventListener('change', () => {
          if (
            mappedCheckbox.checked &&
            ss58Input.value.trim().length >= MIN_ADDRESS_LENGTH
          ) {
            convertSS58ToEth();
          } else if (!mappedCheckbox.checked && ss58Input.value.trim()) {
            ethInput.value = '';
            showError(ss58Error, ss58Input, MAPPED_ACCOUNT_ERROR);
          }
        });
      }
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  // =========================================================================
  // Library polling — wait for Polkadot.js CDN scripts to load
  // =========================================================================

  if (
    typeof polkadotUtil !== 'undefined' &&
    typeof polkadotUtilCrypto !== 'undefined'
  ) {
    initConverter();
  } else {
    let checks = 0;
    const maxChecks = 50; // 5 seconds
    const interval = setInterval(() => {
      checks++;
      if (
        typeof polkadotUtil !== 'undefined' &&
        typeof polkadotUtilCrypto !== 'undefined'
      ) {
        clearInterval(interval);
        initConverter();
      } else if (checks >= maxChecks) {
        clearInterval(interval);
        console.error('Polkadot.js libraries failed to load after 5 seconds');
      }
    }, 100);
  }
})();
