/**
 * Polkadot Utilities
 *
 * Interactive encoding, hashing, and address utility tools for Polkadot development.
 * Covers string/hex encoding, balance conversion, hashing (Blake2, XXHash),
 * and address derivation helpers used throughout the Polkadot ecosystem.
 *
 * Libraries required: @polkadot/util, @polkadot/util-crypto, @polkadot/keyring
 */

(function () {
  'use strict';

  var DEBOUNCE_MS = 300;
  var COPY_FEEDBACK_MS = 2000;

  var COPY_SVG =
    '<svg class="pu-copy-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<rect x="9" y="9" width="13" height="13" rx="2" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<path d="M5 15H4C2.89543 15 2 14.1046 2 13V4C2 2.89543 2.89543 2 4 2H13C14.1046 2 15 2.89543 15 4V5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  var CHECK_SVG =
    '<svg class="pu-check-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M20 6L9 17L4 12" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>';

  function copyBtn(targetId) {
    return (
      '<button type="button" class="pu-copy-btn" data-target="' +
      targetId +
      '" title="Copy to clipboard" aria-label="Copy to clipboard">' +
      COPY_SVG +
      CHECK_SVG +
      '<span class="pu-copy-feedback" aria-live="polite">Copied!</span>' +
      '</button>'
    );
  }

  function inputWithCopy(id, placeholder, isOutput) {
    var cls = isOutput ? 'pu-input pu-output-field' : 'pu-input';
    var ro = isOutput ? ' readonly spellcheck="false"' : '';
    return (
      '<div class="pu-input-with-copy">' +
      '<input type="text" id="' +
      id +
      '" class="' +
      cls +
      '" placeholder="' +
      placeholder +
      '"' +
      ro +
      '>' +
      copyBtn(id) +
      '</div>'
    );
  }

  function fieldGroup(labelText, labelFor, inputHTML) {
    return (
      '<div class="pu-field-group">' +
      '<label class="pu-field-label" for="' +
      labelFor +
      '">' +
      labelText +
      '</label>' +
      inputHTML +
      '</div>'
    );
  }

  function toolCard(id, title, directionClass, directionText, bodyHTML) {
    return (
      '<div class="pu-tool-card" id="' +
      id +
      '">' +
      '<div class="pu-tool-header">' +
      '<h3 class="pu-tool-title">' +
      title +
      '</h3>' +
      '<span class="pu-direction-badge ' +
      directionClass +
      '">' +
      directionText +
      '</span>' +
      '</div>' +
      '<div class="pu-io-area">' +
      bodyHTML +
      '</div>' +
      '<div class="pu-tool-error" id="' +
      id +
      '-err"></div>' +
      '</div>'
    );
  }

  function attachCopyHandlers(root) {
    root.querySelectorAll('.pu-copy-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-target');
        var target = document.getElementById(targetId);
        if (!target || !target.value.trim()) return;
        var text = target.value.trim();

        function onCopied() {
          btn.classList.add('copied');
          btn.setAttribute('title', 'Copied!');
          btn.setAttribute('aria-label', 'Copied!');
          setTimeout(function () {
            btn.classList.remove('copied');
            btn.setAttribute('title', 'Copy to clipboard');
            btn.setAttribute('aria-label', 'Copy to clipboard');
          }, COPY_FEEDBACK_MS);
        }

        navigator.clipboard.writeText(text).then(onCopied).catch(function () {
          try {
            target.select();
            target.setSelectionRange(0, 99999);
            if (document.execCommand('copy')) onCopied();
          } catch (e) {
            console.error('Copy failed:', e);
          }
        });
      });
    });
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

  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  function initTools() {
    var _util = polkadotUtil;
    var stringToHex = _util.stringToHex;
    var hexToString = _util.hexToString;
    var bnToHex = _util.bnToHex;
    var hexToBn = _util.hexToBn;
    var u8aToHex = _util.u8aToHex;
    var hexToU8a = _util.hexToU8a;
    var stringToU8a = _util.stringToU8a;
    var bnToU8a = _util.bnToU8a;
    var isHex = _util.isHex;
    var compactToU8a = _util.compactToU8a;
    var compactFromU8a = _util.compactFromU8a;

    var _crypto = polkadotUtilCrypto;
    var blake2AsHex = _crypto.blake2AsHex;
    var blake2AsU8a = _crypto.blake2AsU8a;
    var xxhashAsHex = _crypto.xxhashAsHex;
    var encodeAddress = _crypto.encodeAddress;
    var decodeAddress = _crypto.decodeAddress;

    var Keyring = polkadotKeyring.Keyring;

    // -------------------------------------------------------------------------
    // ENCODING & DECODING
    // -------------------------------------------------------------------------

    function buildEncodingSection() {
      var root = document.getElementById('encoding-root');
      if (!root) return;

      root.innerHTML =
        '<div class="pu-tools-grid">' +
        toolCard(
          'pu-string-hex',
          'String &#8644; Hex',
          'pu-bidirectional',
          '&#8644; Bidirectional',
          fieldGroup('String', 'pu-sh-str', '<input type="text" id="pu-sh-str" class="pu-input" placeholder="Hello, Polkadot!">') +
            fieldGroup(
              'Hex',
              'pu-sh-hex',
              inputWithCopy('pu-sh-hex', '0x48656c6c6f...', false),
            ),
        ) +
        toolCard(
          'pu-balance-hex',
          'Balance &#8644; Hex <span class="pu-tag">Little Endian</span>',
          'pu-bidirectional',
          '&#8644; Bidirectional',
          fieldGroup('Balance', 'pu-bh-bal', '<input type="text" id="pu-bh-bal" class="pu-input" placeholder="1000000000000">') +
            fieldGroup('Hex (LE)', 'pu-bh-hex', inputWithCopy('pu-bh-hex', '0x...', false)),
        ) +
        toolCard(
          'pu-u8a-hex',
          'u8 Array &#8644; Hex',
          'pu-bidirectional',
          '&#8644; Bidirectional',
          fieldGroup('u8 Array', 'pu-u8-arr', '<input type="text" id="pu-u8-arr" class="pu-input" placeholder="1, 2, 3, 255">') +
            fieldGroup('Hex', 'pu-u8-hex', inputWithCopy('pu-u8-hex', '0x010203ff', false)),
        ) +
        toolCard(
          'pu-number-hex',
          'Number &#8644; Hex',
          'pu-bidirectional',
          '&#8644; Bidirectional',
          fieldGroup('Number', 'pu-nh-num', '<input type="number" id="pu-nh-num" class="pu-input" value="42">') +
            '<div class="pu-options-row">' +
            '<div class="pu-option">' +
            '<label class="pu-field-label" for="pu-nh-bits">Bits</label>' +
            '<input type="number" id="pu-nh-bits" class="pu-input pu-input-sm" value="32" min="8" step="8">' +
            '</div>' +
            '<div class="pu-option pu-option-checkbox">' +
            '<label class="pu-checkbox-label"><input type="checkbox" id="pu-nh-compact" class="pu-checkbox"> Compact</label>' +
            '</div>' +
            '<div class="pu-option pu-option-checkbox">' +
            '<label class="pu-checkbox-label"><input type="checkbox" id="pu-nh-le" class="pu-checkbox"> Little Endian</label>' +
            '</div>' +
            '</div>' +
            fieldGroup('Hex', 'pu-nh-hex', inputWithCopy('pu-nh-hex', '0x2a000000', false)),
        ) +
        '</div>';

      attachCopyHandlers(root);

      // Tool 1 — String ↔ Hex
      var shStr = document.getElementById('pu-sh-str');
      var shHex = document.getElementById('pu-sh-hex');
      var shErr = document.getElementById('pu-string-hex-err');

      shStr.addEventListener(
        'input',
        debounce(function () {
          clearError(shErr, shStr);
          try {
            shHex.value = shStr.value ? stringToHex(shStr.value) : '';
          } catch (e) {
            showError(shErr, shStr, e.message || 'Conversion failed.');
          }
        }, DEBOUNCE_MS),
      );

      shHex.addEventListener(
        'input',
        debounce(function () {
          clearError(shErr, shHex);
          var val = shHex.value.trim();
          if (!val) {
            shStr.value = '';
            return;
          }
          if (!isHex(val)) {
            showError(shErr, shHex, 'Enter a valid hex string (0x...).');
            return;
          }
          try {
            shStr.value = hexToString(val);
          } catch (e) {
            showError(shErr, shHex, e.message || 'Conversion failed.');
          }
        }, DEBOUNCE_MS),
      );

      // Tool 2 — Balance ↔ Hex (LE)
      var bhBal = document.getElementById('pu-bh-bal');
      var bhHex = document.getElementById('pu-bh-hex');
      var bhErr = document.getElementById('pu-balance-hex-err');

      bhBal.addEventListener(
        'input',
        debounce(function () {
          clearError(bhErr, bhBal);
          var val = bhBal.value.trim();
          if (!val) {
            bhHex.value = '';
            return;
          }
          try {
            bhHex.value = bnToHex(val, { bitLength: 128, isLe: true });
          } catch (e) {
            showError(bhErr, bhBal, e.message || 'Enter a valid integer.');
          }
        }, DEBOUNCE_MS),
      );

      bhHex.addEventListener(
        'input',
        debounce(function () {
          clearError(bhErr, bhHex);
          var val = bhHex.value.trim();
          if (!val) {
            bhBal.value = '';
            return;
          }
          if (!isHex(val)) {
            showError(bhErr, bhHex, 'Enter a valid hex string (0x...).');
            return;
          }
          try {
            bhBal.value = hexToBn(val, { isLe: true }).toString();
          } catch (e) {
            showError(bhErr, bhHex, e.message || 'Conversion failed.');
          }
        }, DEBOUNCE_MS),
      );

      // Tool 3 — u8 Array ↔ Hex
      var u8Arr = document.getElementById('pu-u8-arr');
      var u8Hex = document.getElementById('pu-u8-hex');
      var u8Err = document.getElementById('pu-u8a-hex-err');

      u8Arr.addEventListener(
        'input',
        debounce(function () {
          clearError(u8Err, u8Arr);
          var val = u8Arr.value.trim();
          if (!val) {
            u8Hex.value = '';
            return;
          }
          try {
            var parts = val
              .replace(/\s/g, '')
              .split(',')
              .filter(Boolean);
            var array = new Uint8Array(
              parts.map(function (p) {
                var n = parseInt(p, 10);
                if (isNaN(n) || n < 0 || n > 255) throw new Error('Values must be 0–255.');
                return n;
              }),
            );
            u8Hex.value = u8aToHex(array);
          } catch (e) {
            showError(u8Err, u8Arr, e.message || 'Enter comma-separated numbers (0–255).');
          }
        }, DEBOUNCE_MS),
      );

      u8Hex.addEventListener(
        'input',
        debounce(function () {
          clearError(u8Err, u8Hex);
          var val = u8Hex.value.trim();
          if (!val) {
            u8Arr.value = '';
            return;
          }
          if (!isHex(val)) {
            showError(u8Err, u8Hex, 'Enter a valid hex string (0x...).');
            return;
          }
          try {
            var bytes = hexToU8a(val);
            u8Arr.value = Array.from(bytes).join(', ');
          } catch (e) {
            showError(u8Err, u8Hex, e.message || 'Conversion failed.');
          }
        }, DEBOUNCE_MS),
      );

      // Tool 4 — Number ↔ Hex
      var nhNum = document.getElementById('pu-nh-num');
      var nhBits = document.getElementById('pu-nh-bits');
      var nhCompact = document.getElementById('pu-nh-compact');
      var nhLe = document.getElementById('pu-nh-le');
      var nhHex = document.getElementById('pu-nh-hex');
      var nhErr = document.getElementById('pu-number-hex-err');

      function toggleCompactMode() {
        var compact = nhCompact.checked;
        nhBits.disabled = compact;
        nhLe.disabled = compact;
        nhBits.closest('.pu-option').style.opacity = compact ? '0.4' : '1';
        nhLe.closest('.pu-option').style.opacity = compact ? '0.4' : '1';
      }

      function num2hex() {
        clearError(nhErr, nhNum);
        var val = nhNum.value.trim();
        if (!val) {
          nhHex.value = '';
          return;
        }
        try {
          if (nhCompact.checked) {
            nhHex.value = u8aToHex(compactToU8a(parseInt(val, 10)));
          } else {
            nhHex.value = bnToHex(val, {
              bitLength: parseInt(nhBits.value, 10) || 32,
              isLe: nhLe.checked,
            });
          }
        } catch (e) {
          showError(nhErr, nhNum, e.message || 'Enter a valid integer.');
        }
      }

      function hex2num() {
        clearError(nhErr, nhHex);
        var val = nhHex.value.trim();
        if (!val) {
          nhNum.value = '';
          return;
        }
        if (!isHex(val)) {
          showError(nhErr, nhHex, 'Enter a valid hex string (0x...).');
          return;
        }
        try {
          if (nhCompact.checked) {
            var result = compactFromU8a(hexToU8a(val));
            nhNum.value = result[1].toString();
          } else {
            nhNum.value = hexToBn(val, { isLe: nhLe.checked }).toString();
          }
        } catch (e) {
          showError(nhErr, nhHex, e.message || 'Conversion failed.');
        }
      }

      nhCompact.addEventListener('change', function () {
        toggleCompactMode();
        num2hex();
      });
      nhNum.addEventListener('input', debounce(num2hex, DEBOUNCE_MS));
      nhBits.addEventListener('input', debounce(num2hex, DEBOUNCE_MS));
      nhLe.addEventListener('change', num2hex);
      nhHex.addEventListener('input', debounce(hex2num, DEBOUNCE_MS));

      toggleCompactMode();
      num2hex();
    }

    // -------------------------------------------------------------------------
    // HASHING
    // -------------------------------------------------------------------------

    function buildHashingSection() {
      var root = document.getElementById('hashing-root');
      if (!root) return;

      function hashCard(id, title, inputId, bitsId, bitsDefault, outId) {
        return toolCard(
          id,
          title,
          'pu-unidirectional',
          '&#8594; Hash',
          fieldGroup('Input', inputId, '<input type="text" id="' + inputId + '" class="pu-input" placeholder="Hello, Polkadot!">') +
            '<div class="pu-options-row">' +
            '<div class="pu-option">' +
            '<label class="pu-field-label" for="' +
            bitsId +
            '">Bits</label>' +
            '<input type="number" id="' +
            bitsId +
            '" class="pu-input pu-input-sm" value="' +
            bitsDefault +
            '" min="8" step="8">' +
            '</div>' +
            '</div>' +
            fieldGroup('Hash', outId, inputWithCopy(outId, '0x...', true)),
        );
      }

      root.innerHTML =
        '<div class="pu-tools-grid">' +
        hashCard('pu-blake2', 'Blake2 a String', 'pu-b2-input', 'pu-b2-bits', 256, 'pu-b2-out') +
        hashCard('pu-blake2-concat', 'Blake2 Concat', 'pu-b2c-input', 'pu-b2c-bits', 128, 'pu-b2c-out') +
        hashCard('pu-xxhash', 'XXHash a String', 'pu-xx-input', 'pu-xx-bits', 128, 'pu-xx-out') +
        hashCard('pu-xxhash-concat', 'XXHash Concat', 'pu-xxc-input', 'pu-xxc-bits', 64, 'pu-xxc-out') +
        '</div>';

      attachCopyHandlers(root);

      // Tool 5 — Blake2
      var b2Input = document.getElementById('pu-b2-input');
      var b2Bits = document.getElementById('pu-b2-bits');
      var b2Out = document.getElementById('pu-b2-out');
      var b2Err = document.getElementById('pu-blake2-err');

      function doBlake2() {
        clearError(b2Err, b2Input);
        if (!b2Input.value) {
          b2Out.value = '';
          return;
        }
        try {
          b2Out.value = blake2AsHex(b2Input.value, parseInt(b2Bits.value, 10) || 256);
        } catch (e) {
          showError(b2Err, b2Input, e.message || 'Hashing failed.');
        }
      }

      b2Input.addEventListener('input', debounce(doBlake2, DEBOUNCE_MS));
      b2Bits.addEventListener('input', debounce(doBlake2, DEBOUNCE_MS));

      // Tool 6 — Blake2 Concat
      var b2cInput = document.getElementById('pu-b2c-input');
      var b2cBits = document.getElementById('pu-b2c-bits');
      var b2cOut = document.getElementById('pu-b2c-out');
      var b2cErr = document.getElementById('pu-blake2-concat-err');

      function doBlake2Concat() {
        clearError(b2cErr, b2cInput);
        var val = b2cInput.value;
        if (!val) {
          b2cOut.value = '';
          return;
        }
        try {
          var bits = parseInt(b2cBits.value, 10) || 128;
          var inputData = isHex(val) ? hexToU8a(val) : val;
          var hash = blake2AsHex(inputData, bits);
          hash += isHex(val) ? val.slice(2) : stringToHex(val).slice(2);
          b2cOut.value = hash;
        } catch (e) {
          showError(b2cErr, b2cInput, e.message || 'Hashing failed.');
        }
      }

      b2cInput.addEventListener('input', debounce(doBlake2Concat, DEBOUNCE_MS));
      b2cBits.addEventListener('input', debounce(doBlake2Concat, DEBOUNCE_MS));

      // Tool 7 — XXHash
      var xxInput = document.getElementById('pu-xx-input');
      var xxBits = document.getElementById('pu-xx-bits');
      var xxOut = document.getElementById('pu-xx-out');
      var xxErr = document.getElementById('pu-xxhash-err');

      function doXXHash() {
        clearError(xxErr, xxInput);
        if (!xxInput.value) {
          xxOut.value = '';
          return;
        }
        try {
          xxOut.value = xxhashAsHex(xxInput.value, parseInt(xxBits.value, 10) || 128);
        } catch (e) {
          showError(xxErr, xxInput, e.message || 'Hashing failed.');
        }
      }

      xxInput.addEventListener('input', debounce(doXXHash, DEBOUNCE_MS));
      xxBits.addEventListener('input', debounce(doXXHash, DEBOUNCE_MS));

      // Tool 8 — XXHash Concat
      var xxcInput = document.getElementById('pu-xxc-input');
      var xxcBits = document.getElementById('pu-xxc-bits');
      var xxcOut = document.getElementById('pu-xxc-out');
      var xxcErr = document.getElementById('pu-xxhash-concat-err');

      function doXXHashConcat() {
        clearError(xxcErr, xxcInput);
        var val = xxcInput.value;
        if (!val) {
          xxcOut.value = '';
          return;
        }
        try {
          var bits = parseInt(xxcBits.value, 10) || 64;
          var inputData = isHex(val) ? hexToU8a(val) : val;
          var hash = xxhashAsHex(inputData, bits);
          hash += isHex(val) ? val.slice(2) : stringToHex(val).slice(2);
          xxcOut.value = hash;
        } catch (e) {
          showError(xxcErr, xxcInput, e.message || 'Hashing failed.');
        }
      }

      xxcInput.addEventListener('input', debounce(doXXHashConcat, DEBOUNCE_MS));
      xxcBits.addEventListener('input', debounce(doXXHashConcat, DEBOUNCE_MS));
    }

    // -------------------------------------------------------------------------
    // ADDRESS UTILITIES
    // -------------------------------------------------------------------------

    function buildAddressSection() {
      var root = document.getElementById('address-root');
      if (!root) return;

      root.innerHTML =
        '<div class="pu-tools-grid">' +
        // Tool 9 — AccountId ↔ Hex
        toolCard(
          'pu-account-hex',
          'AccountId &#8644; Hex',
          'pu-bidirectional',
          '&#8644; Bidirectional',
          fieldGroup('AccountId', 'pu-ah-acct', '<input type="text" id="pu-ah-acct" class="pu-input" placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY">') +
            fieldGroup('Hex', 'pu-ah-hex', inputWithCopy('pu-ah-hex', '0xd43593...', false)),
        ) +
        // Tool 10 — Seed → Address
        toolCard(
          'pu-seed-address',
          'Seed &#8594; Address',
          'pu-unidirectional',
          '&#8594; Derive',
          fieldGroup('URI / Seed', 'pu-sa-seed', '<input type="text" id="pu-sa-seed" class="pu-input" placeholder="//Alice">') +
            fieldGroup('Address (sr25519)', 'pu-sa-addr', inputWithCopy('pu-sa-addr', '', true)),
        ) +
        // Tool 11 — Change Address Prefix
        toolCard(
          'pu-change-prefix',
          'Change Address Prefix',
          'pu-unidirectional',
          '&#8594; Re-encode',
          fieldGroup('Address', 'pu-cp-addr', '<input type="text" id="pu-cp-addr" class="pu-input" placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY">') +
            '<div class="pu-options-row">' +
            '<div class="pu-option">' +
            '<label class="pu-field-label" for="pu-cp-prefix">SS58 Prefix</label>' +
            '<input type="number" id="pu-cp-prefix" class="pu-input pu-input-sm" min="0" placeholder="42">' +
            '</div>' +
            '</div>' +
            fieldGroup('Result', 'pu-cp-out', inputWithCopy('pu-cp-out', '', true)),
        ) +
        // Tool 12 — Module ID → Address
        toolCard(
          'pu-module-address',
          'Module ID &#8594; Address',
          'pu-unidirectional',
          '&#8594; Derive',
          fieldGroup(
            'Module ID <span class="pu-field-hint">(8 chars)</span>',
            'pu-ma-modid',
            '<input type="text" id="pu-ma-modid" class="pu-input" placeholder="py/trsry" maxlength="8">',
          ) + fieldGroup('Address', 'pu-ma-out', inputWithCopy('pu-ma-out', '', true)),
        ) +
        // Tool 13 — Para ID → Address
        toolCard(
          'pu-para-address',
          'Para ID &#8594; Address',
          'pu-unidirectional',
          '&#8594; Derive',
          fieldGroup('Para ID', 'pu-pa-paraid', '<input type="number" id="pu-pa-paraid" class="pu-input" placeholder="1000" min="0">') +
            '<div class="pu-options-row">' +
            '<div class="pu-option">' +
            '<label class="pu-field-label" for="pu-pa-type">Type</label>' +
            '<select id="pu-pa-type" class="pu-select">' +
            '<option value="para">Child (para)</option>' +
            '<option value="sibl">Sibling (sibl)</option>' +
            '</select>' +
            '</div>' +
            '</div>' +
            fieldGroup('Address', 'pu-pa-out', inputWithCopy('pu-pa-out', '', true)),
        ) +
        // Tool 14 — Sub-Account Generator
        toolCard(
          'pu-sub-account',
          'Sub-Account Generator',
          'pu-unidirectional',
          '&#8594; Derive',
          fieldGroup('Address', 'pu-sub-addr', '<input type="text" id="pu-sub-addr" class="pu-input" placeholder="5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY">') +
            '<div class="pu-options-row">' +
            '<div class="pu-option">' +
            '<label class="pu-field-label" for="pu-sub-index">Index</label>' +
            '<input type="number" id="pu-sub-index" class="pu-input pu-input-sm" value="0" min="0" max="65535">' +
            '</div>' +
            '</div>' +
            fieldGroup('Sub-Account', 'pu-sub-out', inputWithCopy('pu-sub-out', '', true)),
        ) +
        '</div>';

      attachCopyHandlers(root);

      // Tool 9 — AccountId ↔ Hex
      var ahAcct = document.getElementById('pu-ah-acct');
      var ahHex = document.getElementById('pu-ah-hex');
      var ahErr = document.getElementById('pu-account-hex-err');

      ahAcct.addEventListener(
        'input',
        debounce(function () {
          clearError(ahErr, ahAcct);
          var val = ahAcct.value.trim();
          if (!val) {
            ahHex.value = '';
            return;
          }
          try {
            ahHex.value = u8aToHex(decodeAddress(val));
          } catch (e) {
            showError(ahErr, ahAcct, e.message || 'Invalid AccountId.');
          }
        }, DEBOUNCE_MS),
      );

      ahHex.addEventListener(
        'input',
        debounce(function () {
          clearError(ahErr, ahHex);
          var val = ahHex.value.trim();
          if (!val) {
            ahAcct.value = '';
            return;
          }
          if (!isHex(val)) {
            showError(ahErr, ahHex, 'Enter a valid hex string (0x...).');
            return;
          }
          try {
            ahAcct.value = encodeAddress(val);
          } catch (e) {
            showError(ahErr, ahHex, e.message || 'Conversion failed.');
          }
        }, DEBOUNCE_MS),
      );

      // Tool 10 — Seed → Address
      var saSeed = document.getElementById('pu-sa-seed');
      var saAddr = document.getElementById('pu-sa-addr');
      var saErr = document.getElementById('pu-seed-address-err');

      saSeed.addEventListener(
        'input',
        debounce(function () {
          clearError(saErr, saSeed);
          var val = saSeed.value.trim();
          if (!val) {
            saAddr.value = '';
            return;
          }
          try {
            var keyring = new Keyring({ type: 'sr25519' });
            var pair = keyring.addFromUri(val);
            saAddr.value = pair.address;
          } catch (e) {
            showError(saErr, saSeed, e.message || 'Invalid URI or seed phrase.');
          }
        }, DEBOUNCE_MS),
      );

      // Tool 11 — Change Address Prefix
      var cpAddr = document.getElementById('pu-cp-addr');
      var cpPrefix = document.getElementById('pu-cp-prefix');
      var cpOut = document.getElementById('pu-cp-out');
      var cpErr = document.getElementById('pu-change-prefix-err');

      function doChangePrefix() {
        clearError(cpErr, cpAddr);
        var addr = cpAddr.value.trim();
        var prefixVal = cpPrefix.value.trim();
        if (!addr) {
          cpOut.value = '';
          return;
        }
        try {
          var decoded = decodeAddress(addr);
          var prefix = prefixVal !== '' ? parseInt(prefixVal, 10) : undefined;
          cpOut.value = prefix !== undefined ? encodeAddress(decoded, prefix) : encodeAddress(decoded);
        } catch (e) {
          showError(cpErr, cpAddr, e.message || 'Invalid address.');
        }
      }

      cpAddr.addEventListener('input', debounce(doChangePrefix, DEBOUNCE_MS));
      cpPrefix.addEventListener('input', debounce(doChangePrefix, DEBOUNCE_MS));

      // Tool 12 — Module ID → Address
      var maModId = document.getElementById('pu-ma-modid');
      var maOut = document.getElementById('pu-ma-out');
      var maErr = document.getElementById('pu-module-address-err');

      maModId.addEventListener(
        'input',
        debounce(function () {
          clearError(maErr, maModId);
          var val = maModId.value;
          if (!val) {
            maOut.value = '';
            return;
          }
          if (val.length !== 8) {
            showError(maErr, maModId, 'Module ID must be exactly 8 characters (e.g. py/trsry).');
            maOut.value = '';
            return;
          }
          try {
            var encoded = stringToU8a(('modl' + val).padEnd(32, '\0'));
            maOut.value = encodeAddress(encoded);
          } catch (e) {
            showError(maErr, maModId, e.message || 'Conversion failed.');
          }
        }, DEBOUNCE_MS),
      );

      // Tool 13 — Para ID → Address
      var paParaId = document.getElementById('pu-pa-paraid');
      var paType = document.getElementById('pu-pa-type');
      var paOut = document.getElementById('pu-pa-out');
      var paErr = document.getElementById('pu-para-address-err');

      function doParaAddress() {
        clearError(paErr, paParaId);
        var val = paParaId.value.trim();
        if (!val) {
          paOut.value = '';
          return;
        }
        try {
          var type = paType.value;
          var typeBytes = stringToU8a(type);
          var paraIdBytes = bnToU8a(parseInt(val, 10), { bitLength: 32, isLe: true });
          var combined = new Uint8Array(32);
          combined.set(typeBytes);
          combined.set(paraIdBytes, 4);
          paOut.value = encodeAddress(combined);
        } catch (e) {
          showError(paErr, paParaId, e.message || 'Invalid Para ID.');
        }
      }

      paParaId.addEventListener('input', debounce(doParaAddress, DEBOUNCE_MS));
      paType.addEventListener('change', doParaAddress);

      // Tool 14 — Sub-Account Generator
      var subAddr = document.getElementById('pu-sub-addr');
      var subIndex = document.getElementById('pu-sub-index');
      var subOut = document.getElementById('pu-sub-out');
      var subErr = document.getElementById('pu-sub-account-err');

      function doSubAccount() {
        clearError(subErr, subAddr);
        var addr = subAddr.value.trim();
        if (!addr) {
          subOut.value = '';
          return;
        }
        try {
          var seedBytes = stringToU8a('modlpy/utilisuba');
          var whoBytes = decodeAddress(addr);
          var indexBytes = bnToU8a(parseInt(subIndex.value, 10) || 0, { bitLength: 16, isLe: true });
          var combined = new Uint8Array(50);
          combined.set(seedBytes);
          combined.set(whoBytes, 16);
          combined.set(indexBytes, 48);
          var entropy = blake2AsU8a(combined, 256);
          subOut.value = encodeAddress(entropy);
        } catch (e) {
          showError(subErr, subAddr, e.message || 'Invalid address.');
        }
      }

      subAddr.addEventListener('input', debounce(doSubAccount, DEBOUNCE_MS));
      subIndex.addEventListener('input', debounce(doSubAccount, DEBOUNCE_MS));
    }

    // -------------------------------------------------------------------------
    // INIT
    // -------------------------------------------------------------------------

    function onReady() {
      buildEncodingSection();
      buildHashingSection();
      buildAddressSection();
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', onReady);
    } else {
      onReady();
    }
  }

  // Poll until all three Polkadot.js libraries are available
  var checks = 0;
  var maxChecks = 50;
  var interval = setInterval(function () {
    checks++;
    if (
      typeof polkadotUtil !== 'undefined' &&
      typeof polkadotUtilCrypto !== 'undefined' &&
      typeof polkadotKeyring !== 'undefined'
    ) {
      clearInterval(interval);
      initTools();
    } else if (checks >= maxChecks) {
      clearInterval(interval);
      console.error('Polkadot.js libraries failed to load within timeout.');
    }
  }, 100);
})();
