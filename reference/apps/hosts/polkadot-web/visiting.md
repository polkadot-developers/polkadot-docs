---
title: Visiting a Product on Polkadot Web
description: How Polkadot Web resolves a .dot name and loads the resulting Product inside a browser tab, including the visiting flow that differs from Desktop.
categories: Apps, Reference
---

# Visiting a Product

## Introduction

The defining flow of Polkadot Web is visiting a Polkadot Product by its `.dot` name from inside a regular browser tab. The mechanism is conceptually the same as Polkadot Desktop's address-bar resolution, but the delivery is different. There is no installed application, and the entry point is a URL.

This page is the reference for what happens between the user typing a `.dot` name and the Product running inside the Web Host.

## The Visiting Flow

From the user's perspective:

1. The user navigates to `dot.li/<name>` (or otherwise enters a `.dot` name in the Web Host's UI).
2. Web resolves the `.dot` name through DotNS, retrieving the content reference (CID) for the published Product bundle.
3. Web fetches the bundle from the Bulletin Chain (or its delivery layer) by CID.
4. Web prepares the sandboxed container the Product will run inside and loads the bundle.
5. The Product is now running in the user's browser, with the Host API available for it to call.

If the user is not already signed in via their Polkadot App, the Host triggers the pairing handshake before any signed action becomes possible. Reading chain state, browsing the Product's UI, and interacting with anything that does not require signing all work before sign-in.

## How This Differs from Polkadot Desktop

The Product's experience is the same; the path to the Product is what differs:

- **No installer**: Desktop is a specialized browser the user installs; Web is a URL.
- **Browser-tab entry**: Web inherits the browser's history, back/forward, and tab model. A Product on Web behaves more like a navigated webpage than an opened application.
- **Updates on load**: Each visit fetches the published bundle. Web has no "update available" prompt. The user gets the version DotNS resolves to for that visit.

The trade-off is on the trust surface: Web depends on the user's browser as part of its runtime. The Host can verify the bundle it fetched matches the CID DotNS resolved to, but the user has to trust the browser to honor the sandbox. The [Shield States](/reference/apps/hosts/polkadot-web/shield-states/){target=\_blank} reference documents how Web surfaces this trust posture in its UI.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Shield States**

    ---

    How Polkadot Web surfaces the trust posture of the loaded Product, including what each shield state means and when it changes.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-web/shield-states/)

</div>
