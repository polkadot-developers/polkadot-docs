---
title: Polkadot Web Reference
description: Reference for Polkadot Web (dot.li) — the browser-based Host that loads Polkadot Products by their .dot name without requiring a desktop installation.
categories: Apps, Reference
---

# Polkadot Web

## Introduction

**Polkadot Web** is the browser-based Host in the Triangle architecture, served at `dot.li`. It is the third sibling alongside the [Polkadot App](/reference/apps/hosts/polkadot-app/){target=\_blank} and [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/){target=\_blank}, and its job is the same as theirs: load Polkadot Products inside a Host-governed sandbox and mediate everything they touch — signing, chain access, storage, outbound requests — through the Host API.

What makes Polkadot Web different from Polkadot Desktop is not the model but the *delivery*. Web runs in a regular browser instead of an installed application, which changes the trust surface (the browser is the runtime), the visiting flow (Products are loaded by navigating in a browser tab, not from an installer's address bar), and the upgrade path (Products and the Host itself update on page load, not via an OS installer). The Product surface a developer targets — the `.dot` name, the TrUAPI surface, the per-Product sub-account — is the same.

!!! warning "Provisional"
    Polkadot Web is being actively built and several of its developer-facing surfaces are not yet finalized. Pages in this subsection document the conceptual model and the parts that are stable; surface-level specifics carry per-page provisional callouts and will be filled in once confirmed.

## Architecture

At a high level, three properties matter to a Product developer building for Web:

- **Browser-tab runtime.** Polkadot Web is a regular browser page at `dot.li`. Products are loaded inside it, not as standalone tabs.
- **Same sandbox contract as Desktop.** A Product running on Web sees the same per-Product account model, the same TrUAPI surface, and the same permission system as a Product running on Desktop. Code that works in Desktop will work on Web (with surface differences called out per-page in this subsection).
- **Pairs with the Polkadot App for signing.** Like Desktop, Polkadot Web does not hold the user's signing key. A browser session pairs with the user's paired App, and every signed action goes through the App for per-transaction approval.

## Visiting and Shield States

Two concepts are specific enough to Web to deserve their own pages:

- **[Visiting a Product](/reference/apps/hosts/polkadot-web/visiting/){target=\_blank}** — how a `.dot` name is resolved and a Product is loaded into a browser tab, and how this differs from Desktop's address-bar flow.
- **[Shield States](/reference/apps/hosts/polkadot-web/shield-states/){target=\_blank}** — the security-indicator UI that surfaces the trust posture of the currently loaded Product (whether the bundle is verified, whether the Host has the expected state, and so on).

## Host API on Web

The TrUAPI surface a Product calls on Web is materially the same as on Desktop. There are a small number of capabilities where the underlying behavior differs because of the browser context (storage, outbound requests, media access), and those are documented at [Host API](/reference/apps/hosts/polkadot-web/host-api/){target=\_blank}.

## Onchain `polkadot.com`

A Polkadot Product can also serve as the meta-surface that points to other Products — a discovery layer running as a Product itself. The canonical instance of this is [Onchain polkadot.com](/reference/apps/hosts/polkadot-web/onchain-polkadot-com/){target=\_blank}, which is the on-chain-published presence backing the `polkadot.com` site.

## Upload Journeys

!!! warning "Provisional"
    The flows for publishing content from a Polkadot Web Host — uploading assets, registering a `.dot` Product, updating a published bundle from within Web — are still being defined. They will be documented here once finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Visiting a Product**

    ---

    How Polkadot Web resolves a `.dot` name and loads the resulting Product into a browser tab.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-web/visiting/)

- <span class="badge learn">Learn</span> **Shield States**

    ---

    The security-indicator UI on Web and what each shield state means for a Product the user is interacting with.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-web/shield-states/)

- <span class="badge learn">Learn</span> **Host API on Web**

    ---

    Where the Web Host's TrUAPI surface differs in behavior from Desktop because of the browser context.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-web/host-api/)

</div>
