---
title: TrUAPI Reference
description: TrUAPI is the protocol between Polkadot Hosts and the Products that run inside them — eleven method groups covering signing, chain interaction, storage, messaging, and more.
categories: Apps, Reference
---

# TrUAPI

## Introduction

**TrUAPI** is the protocol between Polkadot Hosts and the Products that run inside them. It is the only interface a Product has to the rest of the world: every chain interaction, every storage write, every outbound request, every signing operation, every PoP proof — they all cross the TrUAPI boundary, and the Host on the other side of that boundary is what enforces the sandbox.

If the Triangle architecture is "three Hosts running Products," TrUAPI is the contract by which a Product talks to the Host that is running it.

This reference documents the protocol surface in three layers:

1. The **conceptual model** — why the Host-Product boundary exists, what derived sub-accounts mean, how the sandbox enforces isolation. See [Sandbox and Sub-Accounts](/reference/apps/protocol/truapi/sandbox/){target=\_blank}.
2. The **operational properties** — the protocol's versioning model and the packages that implement it. See [Versioning](/reference/apps/protocol/truapi/versioning/){target=\_blank} and [Packages](/reference/apps/protocol/truapi/packages/){target=\_blank}.
3. The **method groups** — eleven groups covering every capability a Product can reach. One page per group, linked below.

!!! warning "Provisional"
    The complete per-method reference for TrUAPI is still being finalized. The method-group pages below cover what each group is for and the conceptual contract; the exhaustive per-method signatures, parameter shapes, and return types will be added as the surface stabilizes.

## Two Audiences

TrUAPI has two distinct readerships, and the per-method pages are written to serve both at once:

- **Product developers** — you build Products that *call* the TrUAPI surface. You want to know what each method does, what permissions gate it, what it returns, and how the Product SDK wraps it.
- **Host developers** — you build Hosts that *implement* the TrUAPI surface. You want to know what each method must guarantee, how to validate the Product's call, and how to enforce the sandbox at every entry point.

A Product developer can usually rely on the Product SDK (the [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk){target=\_blank} family of packages) and never call TrUAPI directly. A Host developer is reading the same pages to know what the SDK calls underneath, and what their Host has to honor.

## The Eleven Method Groups

| Group | Covers |
|---|---|
| [TrUAPI Calls](/reference/apps/protocol/truapi/calls/){target=\_blank} | The lifecycle calls Products use to identify themselves and the Host uses to introduce capabilities. |
| [Permissions](/reference/apps/protocol/truapi/permissions/){target=\_blank} | Declaring, querying, and gating on Product capabilities. |
| [Local Storage](/reference/apps/protocol/truapi/local-storage/){target=\_blank} | The `KvStore` surface — per-Product, per-device key-value persistence. |
| [Account Management](/reference/apps/protocol/truapi/account-management/){target=\_blank} | Resolving per-Product sub-accounts and reading their state. |
| [Signing](/reference/apps/protocol/truapi/signing/){target=\_blank} | The mediated signing flow — building transactions and dispatching them through the paired App. |
| [Chat](/reference/apps/protocol/truapi/chat/){target=\_blank} | Room and bot registration, typed message publishing, custom message rendering. |
| [Statement Store](/reference/apps/protocol/truapi/statement-store/){target=\_blank} | Publishing and subscribing to gossip-distributed signed statements on People Chain. |
| [Preimage](/reference/apps/protocol/truapi/preimage/){target=\_blank} | Off-chain content addressed by hash for on-chain operations to dereference. |
| [Chain Interaction](/reference/apps/protocol/truapi/chain-interaction/){target=\_blank} | Reading chain state and subscribing to changes through the Host. |
| [Payment](/reference/apps/protocol/truapi/payment/){target=\_blank} | Payment-flow primitives (general `Balances` transfers and the Pocket flow). |
| [Entropy](/reference/apps/protocol/truapi/entropy/){target=\_blank} | Verifiable randomness the Host provides to Products. |

## High-Level Diagram

!!! warning "Provisional"
    The canonical TrUAPI architecture diagram — showing the Host, the Product, the SDK layers in between, and the eleven method groups as a single map — is still being finalized. It will be embedded here and referenced from the section overview once confirmed.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Sandbox and Sub-Accounts**

    ---

    Why a Product gets a derived sub-account rather than the user's root identity, and why the Host API is the only egress — the architectural reason TrUAPI exists.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/sandbox/)

- <span class="badge learn">Learn</span> **Versioning**

    ---

    How TrUAPI versions evolve and what compatibility a Product can rely on across them.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/versioning/)

- <span class="badge learn">Learn</span> **Packages**

    ---

    The package map: which SDK package wraps which TrUAPI method group, and where the boundary between Product code and Host code lives.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/packages/)

</div>
