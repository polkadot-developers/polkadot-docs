---
title: Polkadot Desktop Reference
description: Reference for Polkadot Desktop, the desktop Host that loads Products by .dot name, mediates signing to the App, and enforces sandbox permissions.
categories: Apps, Reference
---

# Polkadot Desktop

## Introduction

Polkadot Desktop is the workstation app where developers and users actually run Polkadot Products. Think of it as a specialized browser — but instead of typing a URL, the user types a `.dot` name, and instead of rendering arbitrary web pages, Desktop fetches a published Product bundle from decentralized cloud storage and runs it inside a sandbox where signing, storage, and outbound network requests are all mediated by the Host.

Desktop never holds the user's private key. The key lives on the paired [Polkadot App](/reference/apps/hosts/polkadot-app/) on the user's phone. Desktop holds only a derived session public key, enough to identify the user and construct per-Product accounts. Every signing operation routes back to the App for user approval.

This section documents Desktop's developer-facing surface: how a Product runs inside it, how signing works end to end, how the permissions model enforces sandbox boundaries, and how Desktop exposes [Statement Store](/reference/apps/hosts/polkadot-desktop/statement-store/), [Preimage](/reference/apps/hosts/polkadot-desktop/preimage/), and [Pocket](/reference/apps/hosts/polkadot-desktop/pocket/) features to Products and users.

## How It Works

From a Product developer's perspective, three properties define how Desktop behaves:

- **`.dot`-name addressing**: A published Product is addressed by its `.dot` name. Desktop resolves the name through [dotNS](/reference/apps/infrastructure/dotns/), fetches the published bundle, and loads it in the sandbox. During development, Desktop's address bar accepts `localhost:PORT` as a whitelisted bypass so you can iterate against a local dev server. See [Set Up Your Project](/apps/build/#set-up-your-project).
- **Sandboxed runtime**: A Product runs inside a sandboxed container, not an arbitrary browser tab. It cannot make outbound network requests, access local storage, or sign transactions except through the Host API. See [Permissions](/reference/apps/hosts/polkadot-desktop/permissions/).
- **Mediated signing**: Every transaction a Product submits, whether dispatched through the Product SDK or directly through TrUAPI, goes through Desktop's signing modal and on to the paired App. There is no path for a Product to sign without user approval. See [Signing](/reference/apps/hosts/polkadot-desktop/signing/).

## Where Desktop Fits in the SDK Surface

Desktop both consumes and produces the [TrUAPI](/reference/apps/protocol/truapi/) surface:

- It consumes Host API methods from the App (signing, PoP proofs) and from infrastructure layers (Bulletin Chain, Statement Store, dotNS) when its own features (Pocket, Preimage, Statement Store mediation) need to talk to those layers.
- It produces the surface Products call into: chain interaction, local storage, account management, signing, statement submission, preimage submission, and so on. The Product SDK (`@parity/product-sdk` and friends) is a typed wrapper over that surface.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Signing**

    ---

    The full mediated-signing flow: how a `signAndSubmit` call travels from a Product through Desktop to the paired App and back, including the `ChainSubmit` permission model and the timeout or rejection failure modes you need to handle.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/signing/)

- <span class="badge learn">Learn</span> **Permissions**

    ---

    What a Product can do inside the Desktop sandbox is gated by declared permissions. Reference for the permission types, the manifest declaration model, and how denial is surfaced.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/permissions/)

- <span class="badge learn">Learn</span> **Statement Store via Host API**

    ---

    How a Product publishes to and subscribes from the Statement Store through Desktop's mediated surface.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/statement-store/)

- <span class="badge learn">Learn</span> **Preimage**

    ---

    Preimage submission through Desktop, including the Statement-vs-Preimage distinction for off-chain content.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/preimage/)

- <span class="badge learn">Learn</span> **Pocket**

    ---

    Desktop's peer-to-peer send flow. Pair this with the [App-side recipient view](/reference/apps/hosts/polkadot-app/pocket/) for the full round trip.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/pocket/)

</div>
