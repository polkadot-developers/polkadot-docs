---
title: Local Storage Method Group
description: TrUAPI Local Storage method group for per-Product, per-device key-value persistence, Host-managed namespaces, JSON helpers, and KvStore use.
categories: Apps, Reference
---

# Local Storage

## Introduction

The Local Storage method group exposes the per-Product, per-device key-value store a Product uses to remember values between sessions, such as user preferences, drafts, and cached values. The Product SDK wraps this group as a `KvStore` in the [`@polkadot-apps/storage`](https://www.npmjs.com/package/@polkadot-apps/storage){target=\_blank} package.

Two properties matter for how this group is shaped:

- **Per-Product namespacing**: The Host prepends every key with a prefix derived from the Product's `.dot` domain. A Product cannot accidentally read or write another Product's keys; the boundary is at the Host, not in the Product's code.
- **Host-dependent backend**: Inside Polkadot Desktop, reads and writes go to the Host's on-device storage. Inside Polkadot Web, the Host backs them with browser-managed storage. The SDK abstracts the difference; the Product's code is identical either way.

## Conceptual Contract

The group exposes the standard key-value surface plus a few helpers:

- **`get(key)`, `set(key, value)`, and `remove(key)`**: Read, write, and delete a string-valued key.
- **`getJSON(key)` and `setJSON(key, value)`**: Read and write JSON-serializable values, with the Host handling encoding.
- **Prefixed-namespace creation**: A Product can carve out further sub-namespaces inside its own per-Product space, useful when multiple Product features share the store and want to avoid collisions.

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
