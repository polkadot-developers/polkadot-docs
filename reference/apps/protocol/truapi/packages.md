---
title: TrUAPI Packages
description: Which SDK package wraps which TrUAPI method group, and where the boundary between Product code and Host code lives in the package reference.
categories: Apps, Reference
---

# Packages

## Introduction

A Product developer rarely calls TrUAPI directly. The [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk){target=\_blank} family of packages is the typed wrapper, and most Products will install one of them per capability they consume. This page maps which package wraps which TrUAPI method group, and which Product-side how-to guide demonstrates each.

!!! warning "Provisional"
    Package names and version pins remain provisional while the SDK matures. This page documents known packages and boundaries; exact versions and future package splits are outside the current scope.

## Package Map

| TrUAPI Method Group                                                                       | SDK Package                                                                                                                                                                                        | Product-Side How-To                                                                     |
|:-----------------------------------------------------------------------------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|:---------------------------------------------------------------------------------------:|
| [TrUAPI Calls](/reference/apps/protocol/truapi/calls/){target=\_blank}                    | `@parity/product-sdk` (core)                                                                                                                                                                       | n/a (lifecycle, implicit)                                                               |
| [Permissions](/reference/apps/protocol/truapi/permissions/){target=\_blank}               | `@parity/product-sdk` (core)                                                                                                                                                                       | [Request Permissions](/apps/build/request-permissions/){target=\_blank}                 |
| [Local Storage](/reference/apps/protocol/truapi/local-storage/){target=\_blank}           | [`@parity/product-sdk-local-storage`](https://www.npmjs.com/package/@parity/product-sdk-local-storage){target=\_blank}                                                                                                   | [Persist Data Locally](/apps/build/persist-data-locally/){target=\_blank}               |
| [Account Management](/reference/apps/protocol/truapi/account-management/){target=\_blank} | [`@parity/product-sdk-signer`](https://www.npmjs.com/package/@parity/product-sdk-signer){target=\_blank} / [`@parity/product-sdk-address`](https://www.npmjs.com/package/@parity/product-sdk-address){target=\_blank}  | [Sign and Submit Transactions](/apps/build/sign-and-submit/){target=\_blank}               |
| [Signing](/reference/apps/protocol/truapi/signing/){target=\_blank}                       | `@parity/product-sdk-signer` / [`@parity/product-sdk-tx`](https://www.npmjs.com/package/@parity/product-sdk-tx){target=\_blank}                                                                                   | [Sign and Submit Transactions](/apps/build/sign-and-submit/){target=\_blank}               |
| [Chat](/reference/apps/protocol/truapi/chat/){target=\_blank}                             | `@parity/product-sdk` chat APIs                                                                                                                                                                    | [Add Chat](/apps/build/add-chat/){target=\_blank}                                       |
| [Statement Store](/reference/apps/protocol/truapi/statement-store/){target=\_blank}       | [`@parity/product-sdk-statement-store`](https://www.npmjs.com/package/@parity/product-sdk-statement-store){target=\_blank}                                                                         | [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/){target=\_blank} |
| [Preimage](/reference/apps/protocol/truapi/preimage/){target=\_blank}                     | [`@parity/product-sdk-host`](https://www.npmjs.com/package/@parity/product-sdk-host){target=\_blank} (Preimage manager)                                                                            | (covered in Bulletin Chain how-to)                                                      |
| [Chain Interaction](/reference/apps/protocol/truapi/chain-interaction/){target=\_blank}   | [`@parity/product-sdk-chain-client`](https://www.npmjs.com/package/@parity/product-sdk-chain-client){target=\_blank} and [`polkadot-api`](https://www.npmjs.com/package/polkadot-api){target=\_blank} (PAPI) | [Read Chain State](/apps/build/read-chain-state/){target=\_blank}                       |
| [Payment](/reference/apps/protocol/truapi/payment/){target=\_blank}                       | `@parity/product-sdk-tx` and [`@parity/product-sdk-utils`](https://www.npmjs.com/package/@parity/product-sdk-utils){target=\_blank}                                                                               | [Accept a Payment](/apps/build/accept-a-payment/){target=\_blank}                       |
| [Entropy](/reference/apps/protocol/truapi/entropy/){target=\_blank}                       | `@parity/product-sdk` (deterministic entropy derivation)                                                                                                                                          | n/a (forthcoming)                                                                       |

## The Boundary Between Product Code and Host Code

A useful way to read the package map is by where the package executes:

- **Pure Product packages**: Packages such as `@parity/product-sdk-local-storage`, `@parity/product-sdk-signer`, `@parity/product-sdk-chain-client`, and `@parity/product-sdk-tx` execute inside the Product sandbox. They are typed wrappers that build a TrUAPI call and dispatch it through the Host API. Your Product depends on them at compile time.
- **Product-SDK umbrella**: `@parity/product-sdk` ties them together at the top of a Product and wires up the App / chain / storage surfaces with consistent defaults.
- **Host implementations of TrUAPI**: Host implementations live in the Hosts themselves, not in any Product-side package. A Product does not depend on Host code at compile time; it depends on the Host honoring the TrUAPI contract at run time.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Versioning**

    ---

    How package versions map to TrUAPI protocol versions.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/versioning/)

</div>
