---
title: TrUAPI Packages
description: Which SDK package wraps which TrUAPI method group, and where the boundary between Product code and Host code lives.
categories: Apps, Reference
---

# Packages

## Introduction

A Product developer rarely calls TrUAPI directly. The [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk){target=\_blank} family of packages is the typed wrapper, and most Products will install one of them per capability they consume. This page is the map: which package wraps which TrUAPI method group, and which Product-side how-to guide demonstrates each.

!!! warning "Provisional"
    Package names and version pins are being firmed up as the SDK matures. This page documents the packages that exist today; specifics (exact versions, package boundaries that may consolidate or split) will be confirmed as the surface stabilizes.

## Package Map

| TrUAPI Method Group | SDK Package | Product-Side How-To |
|---|---|---|
| [TrUAPI Calls](/reference/apps/protocol/truapi/calls/){target=\_blank} | `@parity/product-sdk` (core) | n/a (lifecycle, implicit) |
| [Permissions](/reference/apps/protocol/truapi/permissions/){target=\_blank} | `@parity/product-sdk` (core) | [Request Permissions](/apps/build/request-permissions/){target=\_blank} |
| [Local Storage](/reference/apps/protocol/truapi/local-storage/){target=\_blank} | [`@polkadot-apps/storage`](https://www.npmjs.com/package/@polkadot-apps/storage){target=\_blank} | [Persist Data Locally](/apps/build/persist-data-locally/){target=\_blank} |
| [Account Management](/reference/apps/protocol/truapi/account-management/){target=\_blank} | [`@polkadot-apps/signer`](https://www.npmjs.com/package/@polkadot-apps/signer){target=\_blank} / [`@polkadot-apps/address`](https://www.npmjs.com/package/@polkadot-apps/address){target=\_blank} | [Accounts and Signing](/apps/build/accounts-and-signing/){target=\_blank} |
| [Signing](/reference/apps/protocol/truapi/signing/){target=\_blank} | `@polkadot-apps/signer` / [`@polkadot-apps/tx`](https://www.npmjs.com/package/@polkadot-apps/tx){target=\_blank} | [Accounts and Signing](/apps/build/accounts-and-signing/){target=\_blank} |
| [Chat](/reference/apps/protocol/truapi/chat/){target=\_blank} | `@parity/product-sdk` chat APIs | [Add Chat](/apps/build/add-chat/){target=\_blank} |
| [Statement Store](/reference/apps/protocol/truapi/statement-store/){target=\_blank} | [`@parity/product-sdk-statement-store`](https://www.npmjs.com/package/@parity/product-sdk-statement-store){target=\_blank} | [Exchange Ephemeral Messages](/apps/build/exchange-ephemeral-messages/){target=\_blank} |
| [Preimage](/reference/apps/protocol/truapi/preimage/){target=\_blank} | [`@parity/product-sdk-host`](https://www.npmjs.com/package/@parity/product-sdk-host){target=\_blank} (Preimage manager) | (covered in Bulletin Chain how-to) |
| [Chain Interaction](/reference/apps/protocol/truapi/chain-interaction/){target=\_blank} | [`@polkadot-apps/chain-client`](https://www.npmjs.com/package/@polkadot-apps/chain-client){target=\_blank} + [`polkadot-api`](https://www.npmjs.com/package/polkadot-api){target=\_blank} (PAPI) | [Read Chain State](/apps/build/read-chain-state/){target=\_blank} |
| [Payment](/reference/apps/protocol/truapi/payment/){target=\_blank} | `@polkadot-apps/tx` + [`@polkadot-apps/utils`](https://www.npmjs.com/package/@polkadot-apps/utils){target=\_blank} | [Accept a Payment](/apps/build/accept-a-payment/){target=\_blank} |
| [Entropy](/reference/apps/protocol/truapi/entropy/){target=\_blank} | `@parity/product-sdk` (entropy APIs) | n/a (forthcoming) |

## The Boundary Between Product Code and Host Code

A useful way to read the map above is by where the package executes:

- **Pure Product packages** (`@polkadot-apps/storage`, `@polkadot-apps/signer`, `@polkadot-apps/chain-client`, `@polkadot-apps/tx`, etc.) execute inside the Product sandbox. They are typed wrappers that build a TrUAPI call and dispatch it through the Host API. Your Product depends on them at compile time.
- **The Product-SDK umbrella** (`@parity/product-sdk`) ties them together at the top of a Product and wires up the App / chain / storage surfaces with consistent defaults.
- **Host implementations of TrUAPI** live in the Hosts themselves, not in any Product-side package. A Product does not depend on Host code at compile time; it depends on the Host honoring the TrUAPI contract at run time.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Versioning**

    ---

    How the package versions in the map above map to TrUAPI protocol versions.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/versioning/)

</div>
