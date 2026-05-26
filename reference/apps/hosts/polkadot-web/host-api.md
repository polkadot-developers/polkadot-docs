---
title: Host API on Polkadot Web
description: Reference for the TrUAPI Host API surface as exposed by Polkadot Web — what is shared with Polkadot Desktop and where browser-context behavior differs.
categories: Apps, Reference
---

# Host API on Polkadot Web

## Introduction

The Host API surface a Product calls on Polkadot Web is **the same TrUAPI surface as on Polkadot Desktop**. The same method groups, the same signatures, the same SDK packages — code written for Desktop runs on Web. This page exists to document the *exceptions* to that statement: the small number of capabilities whose underlying behavior is materially different because the runtime is a browser, not an installed application.

For the full TrUAPI reference (method groups, versioning, package table), see the forthcoming **Protocol → TrUAPI** section.

!!! warning "Provisional"
    The per-method-group behavioral matrix between Polkadot Web and Polkadot Desktop is still being finalized. This page documents the categories where behavior is known to differ and the conceptual reason for each; the per-method specifics will be added once the surface is confirmed.

## What Is the Same

By default, assume **everything is the same on Web as on Desktop**:

- Chain interaction, storage reads, transaction building, and `signAndSubmit` work identically.
- Per-Product sub-accounts derive the same way and resolve to the same addresses.
- Permissions are declared the same way in the manifest and gate the same capabilities at the Host-API boundary.
- Signing routes to the paired Polkadot App with the same per-transaction approval model.

A Product that targets Web can use the same `@parity/product-sdk` packages and the same TrUAPI method group calls; the SDK abstracts away the Host difference at every point where it matters.

## Where Browser-Context Differs

Three categories are where browser-context behavior diverges and a Product developer may need Web-specific handling:

- **Local storage backing.** The Product SDK's [`KvStore`](/apps/build/persist-data-locally/){target=\_blank} routes through the Host on Web exactly as on Desktop, but the underlying backend the Host uses is different (browser-managed storage rather than the installed-app's on-device storage). Capacity, eviction behavior, and clear-history semantics follow the browser's rules.
- **Outbound requests under the `ExternalRequest` permission.** Pattern-scoped outbound requests still work, but the request itself is dispatched from a browser context — meaning CORS, cookies, and the browser's network policies all apply on top of the Host's pattern enforcement. A request the Host would allow may still be blocked by the browser if the target server's CORS policy rejects it.
- **Media capabilities (`Microphone`, etc.).** Media-access permissions on Web are gated by both the Host's permission system *and* the browser's media-permission prompt. The user has to grant both. Build UI that handles the two-prompt path gracefully.

A Product that uses none of those three categories — most Products — needs no Web-specific code at all.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Persist Data Locally**

    ---

    The Product-side how-to for `KvStore`, including the cross-environment behavior the Web Host inherits.

    [:octicons-arrow-right-24: Get Started](/apps/build/persist-data-locally/){target=\_blank}

- <span class="badge guide">Guide</span> **Request Permissions**

    ---

    The how-to for declaring and handling permissions, including the categories that pick up extra browser-prompt behavior on Web.

    [:octicons-arrow-right-24: Get Started](/apps/build/request-permissions/){target=\_blank}

</div>
