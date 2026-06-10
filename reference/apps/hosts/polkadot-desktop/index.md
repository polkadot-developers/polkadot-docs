---
title: Polkadot Desktop Reference
description: Reference for Polkadot Desktop, the desktop Host that loads Products by .dot name, mediates signing to the App, and enforces sandbox permissions.
categories: Apps, Reference
---

# Polkadot Desktop

## Introduction

Polkadot Desktop is the desktop Host in the Triangle architecture, alongside the [Polkadot App](/reference/apps/hosts/polkadot-app/){target=\_blank} and Polkadot Web. It is a specialized browser, but instead of resolving a domain through DNS and rendering arbitrary web content, Desktop resolves a `.dot` name through an on-chain lookup, fetches the resulting Product bundle, and loads it inside a Host-governed sandbox where signing, storage, chain access, and outbound network requests are all mediated by the Host API.

Desktop never holds the user's private key. The key lives on the paired Polkadot App on the user's phone; Desktop holds a derived session public key that lets it identify the user and construct per-Product sub-accounts, but every signing operation routes back to the App for the user to approve.

This section documents Desktop's developer-facing surface, including how a Product runs inside it, how signing works in detail, how the permissions model enforces sandbox boundaries, and how Desktop exposes the Statement Store, Preimage, and Pocket features to Products and users.

## Architecture

From a Product developer's perspective, three properties are load-bearing:

- **`.dot`-name addressing**: A published Product is addressed by its `.dot` name. Desktop resolves the name through DotNS, fetches the published bundle, and loads it in the sandbox. During development, Desktop's address bar accepts `localhost:PORT` as a whitelisted bypass so you can iterate against a local dev server. See [Set Up Your Project](/apps/build/#set-up-your-project){target=\_blank}.
- **Sandboxed runtime**: A Product runs inside a sandboxed container, not as an arbitrary browser tab. The Product cannot make outbound network requests, access local storage, or sign transactions except through the Host API. See [Permissions](/reference/apps/hosts/polkadot-desktop/permissions/){target=\_blank}.
- **Mediated signing**: Every transaction a Product submits, whether the dispatch is through the Product SDK or directly through TrUAPI, goes through Desktop's signing modal and on to the paired App. The Product never has the option to sign without user approval. See [Signing](/reference/apps/hosts/polkadot-desktop/signing/){target=\_blank}.

## Host API Consumption

Desktop is both a consumer and a producer on the Host API surface:

- It consumes Host API methods from the App (signing, PoP proofs) and from infrastructure layers (Bulletin Chain, Statement Store, dotNS) when its own features (Pocket, Preimage management, Statement Store mediation) need to talk to those layers.
- It produces the Host API surface that Products running inside it call: the TrUAPI method groups for chain interaction, local storage, account management, signing, statement submission, preimage submission, and so on. The Product SDK (`@parity/product-sdk` and friends) is a typed wrapper over that surface.

For the per-method-group reference, see [TrUAPI](/reference/apps/protocol/truapi/){target=\_blank}.

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

    Desktop's peer-to-peer send flow. Pair this with the [App-side recipient view](/reference/apps/hosts/polkadot-app/pocket/){target=\_blank} for the full round trip.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/pocket/)

</div>
