---
title: Local Storage Method Group
description: TrUAPI method group for per-Product, per-device key-value persistence — the surface behind the @polkadot-apps/storage KvStore.
categories: Apps, Reference
---

# Local Storage

## Introduction

The **Local Storage** method group exposes the per-Product, per-device key-value store a Product uses to remember things between sessions — user preferences, drafts, cached values. The Product SDK wraps this surface as a `KvStore` in the [`@polkadot-apps/storage`](https://www.npmjs.com/package/@polkadot-apps/storage){target=\_blank} package.

Two properties matter for how this group is shaped:

- **Per-Product namespacing is automatic.** The Host prepends every key with a prefix derived from the Product's `.dot` domain. A Product cannot accidentally read or write another Product's keys; the boundary is at the Host, not in the Product's code.
- **The backend depends on the Host.** Inside Polkadot Desktop, reads and writes go to the Host's on-device storage. Inside Polkadot Web, the Host backs them with browser-managed storage. The SDK abstracts the difference; the Product's code is identical either way.

## Conceptual Contract

The group exposes the standard key-value surface plus a few helpers:

- **`get(key)` / `set(key, value)` / `remove(key)`** — read, write, delete a string-valued key.
- **`getJSON(key)` / `setJSON(key, value)`** — read and write JSON-serializable values, with the Host handling encoding.
- **Prefixed-namespace creation** — a Product can carve out further sub-namespaces inside its own per-Product space, useful when multiple Product features share the store and want to avoid collisions.

Reads return `null` for absent keys; deletes are idempotent (no error on missing keys).

!!! warning "Provisional"
    Quota policy (per-Product byte caps, eviction rules), the exact per-Host backend behavior (especially around Web's browser-managed storage), and any subscription-style key-change notifications are still being finalized. The basic key-value contract above is stable.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Persist Data Locally**

    ---

    The Product-side how-to: initializing the store, reading and writing values, prefix namespaces, error handling.

    [:octicons-arrow-right-24: Get Started](/apps/build/persist-data-locally/){target=\_blank}

</div>
