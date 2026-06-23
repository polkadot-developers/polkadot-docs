---
title: TrUAPI Reference
description: TrUAPI is the protocol between Polkadot Hosts and the Products that run inside them, covering signing, chain interaction, storage, and messaging.
categories: Apps, Reference
---

# TrUAPI

## Introduction

TrUAPI is the protocol every Polkadot Product uses to talk to the Host running it. It is the _only_ interface a Product has to the rest of the world. Every chain interaction, storage write, outbound request, signing operation, and Proof of Personhood proof crosses this boundary, and the Host on the other side enforces the sandbox.

In the Polkadot Triangle, three Hosts run Products. TrUAPI is the contract by which a Product talks to whichever Host is loading it. Most Product developers will never call TrUAPI directly. The [Product SDK](/reference/glossary/#polkadot-sdk) (the `@parity/product-sdk` family of packages) wraps it in typed methods. The methods you call still go through TrUAPI, and the Host validates and routes everything.

!!! note "TrUAPI and its packages"
    TrUAPI is the name of the protocol specification maintained at [`paritytech/truapi`](https://github.com/paritytech/truapi). It ships as two layers of packages: [`@parity/truapi`](https://www.npmjs.com/package/@parity/truapi) is the low-level generated protocol client (the wire), and the [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk) family is the higher-level SDK most Products use. This reference uses "TrUAPI" for the protocol surface and names the `@parity/product-sdk-*` package in the [Packages](/reference/apps/protocol/truapi/packages/) table that wraps each group.

This reference documents the protocol surface in three layers:

1. **Conceptual model**: Why the Host-Product boundary exists, what derived sub-accounts mean, and how the sandbox enforces isolation. See [Sandbox and Sub-Accounts](/reference/apps/protocol/truapi/sandbox/).
2. **Operational properties**: The protocol's versioning model and the packages that implement it. See [Versioning](/reference/apps/protocol/truapi/versioning/) and [Packages](/reference/apps/protocol/truapi/packages/).
3. **Method groups**: Eleven groups covering the capabilities a Product reaches for. One page per group is linked in [The Eleven Method Groups](#the-eleven-method-groups). A few host-lifecycle methods sit outside these groups; see the note below.

!!! warning "Provisional"
    The complete per-method reference for TrUAPI remains provisional. The method-group pages below cover what each group is for and the conceptual contract; the exhaustive per-method signatures, parameter shapes, and return types will be added as the surface stabilizes.

## Two Audiences

TrUAPI has two distinct readerships, and the per-method pages are written to serve both at once:

- **Product developers**: You build Products that call the TrUAPI surface. You need to know what each method does, what permissions gate it, what it returns, and how the Product SDK wraps it.
- **Host developers**: You build Hosts that implement the TrUAPI surface. You need to know what each method must guarantee, how to validate the Product's call, and how to enforce the sandbox at every entry point.

A Product developer can usually rely on the Product SDK (the [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk) family of packages) and never call TrUAPI directly. A Host developer is reading the same pages to know what the SDK calls underneath, and what their Host has to honor.

## The Eleven Method Groups

| Group                                                                                     | Covers                                                                                               |
|:-----------------------------------------------------------------------------------------:|:----------------------------------------------------------------------------------------------------:|
| [TrUAPI Calls](/reference/apps/protocol/truapi/calls/)                    | The lifecycle calls Products use to identify themselves and the Host uses to introduce capabilities. |
| [Permissions](/reference/apps/protocol/truapi/permissions/)               | Declaring, querying, and gating on Product capabilities.                                             |
| [Local Storage](/reference/apps/protocol/truapi/local-storage/)           | The `KvStore` API for per-Product, per-device key-value persistence.                                 |
| [Account Management](/reference/apps/protocol/truapi/account-management/) | Resolving per-Product sub-accounts and reading their state.                                          |
| [Signing](/reference/apps/protocol/truapi/signing/)                       | The mediated signing flow for building transactions and dispatching them through the paired App.     |
| [Chat](/reference/apps/protocol/truapi/chat/)                             | Room and bot registration, typed message publishing, custom message rendering.                       |
| [Statement Store](/reference/apps/protocol/truapi/statement-store/)       | Publishing and subscribing to gossip-distributed signed statements on People Chain.                  |
| [Preimage](/reference/apps/protocol/truapi/preimage/)                     | Off-chain content addressed by hash for on-chain operations to dereference.                          |
| [Chain Interaction](/reference/apps/protocol/truapi/chain-interaction/)   | Reading chain state and subscribing to changes through the Host.                                     |
| [Payment](/reference/apps/protocol/truapi/payment/)                       | Payment-flow primitives (general `Balances` transfers and the Pocket flow).                          |
| [Entropy](/reference/apps/protocol/truapi/entropy/)                       | Deterministic per-Product entropy derived from the user's root key (key-derivation, not randomness). |

!!! note "Methods outside the eleven groups"
    A small number of host-lifecycle methods in the TrUAPI v0.2 spec are not part of any of the eleven groups above — `host_navigate_to`, `host_push_notification`, and `host_feature_supported`. They are Host-environment hooks rather than Product capabilities, and are documented per-Host rather than in this protocol surface.

!!! warning "Cross-Host conformance is the target, not yet the guarantee"
    TrUAPI is specified as a single canonical surface, and the intent is that a Product runs unchanged across every Host. Today that holds between Polkadot Web and Polkadot Desktop, which share the TypeScript host-container (SCALE, `host_*` calls). The mobile Polkadot App — the canonical signer for transactions — currently exposes a hand-written JSON bridge whose method names differ from the spec and, in places, between iOS and Android. Treat "the same surface on every Host" as the conformance goal the spec defines, not a settled property of every shipping Host. See the cross-host conformance tracking in the SDK team's work.

## High-Level Diagram

!!! warning "Provisional"
    The canonical TrUAPI architecture diagram showing the Host, the Product, the SDK layers in between, and the eleven method groups as a single map — is still being finalized. It will be embedded here and referenced from the section overview once confirmed.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Sandbox and Sub-Accounts**

    ---

    Why a Product gets a derived sub-account rather than the user's root identity, and why the Host API is the only egress.

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
