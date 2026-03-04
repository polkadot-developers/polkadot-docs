---
title: Polkadot Utilities
description: Interactive encoding, hashing, and address utility tools for Polkadot development. Convert strings, balances, and numbers to hex, hash inputs with Blake2 and XXHash, and derive or re-encode Polkadot addresses.
categories: Tooling
extra_javascript:
  - https://cdn.jsdelivr.net/npm/@polkadot/util@latest/bundle-polkadot-util.js
  - https://cdn.jsdelivr.net/npm/@polkadot/util-crypto@latest/bundle-polkadot-util-crypto.js
  - https://cdn.jsdelivr.net/npm/@polkadot/keyring@latest/bundle-polkadot-keyring.js
  - /js/polkadot-utilities.js
extra_css:
  - /assets/stylesheets/polkadot-utilities.css
---

# Polkadot Utilities

This page provides interactive utilities for common Polkadot-SDK-based development tasks. Tools are powered by the [@polkadot/util](https://github.com/polkadot-js/common/tree/master/packages/util){target=\_blank}, [@polkadot/util-crypto](https://github.com/polkadot-js/common/tree/master/packages/util-crypto){target=\_blank}, and [@polkadot/keyring](https://github.com/polkadot-js/common/tree/master/packages/keyring){target=\_blank} libraries and run entirely in your browser.

## Encoding & Decoding

Convert between strings, numbers, byte arrays, and their hexadecimal representations. Bidirectional tools update both fields in real time as you type.

<div id="encoding-root"></div>

## Hashing

Hash arbitrary inputs using Blake2 and XXHash — the two hashing algorithms used throughout the Polkadot SDK for storage key derivation and other primitives. The **concat** variants append the original input to the hash output, matching the `Blake2_128Concat` and `Twox64Concat` storage hashers.

<div id="hashing-root"></div>

## Address Utilities

Derive, convert, and re-encode Polkadot addresses. These tools cover the full range of address types used in the Polkadot ecosystem — from standard SS58 addresses and Ethereum-compatible addresses to pallet module accounts, sovereign accounts for parachains, and derived sub-accounts.

<div id="address-root"></div>
