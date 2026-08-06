---
title: Local Storage
description: Overview of the Product SDK local-storage package — a per-Product, per-device key-value store backed by the Host, with namespacing and JSON helpers.
categories: Apps
---

# Local Storage

## Introduction

[`@parity/product-sdk-local-storage`](https://paritytech.github.io/product-sdk/api/local-storage/) is an async key-value store backed by the Host container's storage. It gives your Product a small, per-device place to keep state — settings, drafts, cached identifiers — with optional key namespacing and typed JSON helpers, without touching raw browser `localStorage`.

The store is scoped per Product, so keys never collide with other Products, and reads are error-tolerant: a missing or failed read resolves to `null` rather than throwing.

## When to Use It

- To persist small app state inside a Host: preferences, drafts, cached values, or a session identifier.
- To namespace keys per Product with a `prefix`, so `theme` becomes `my-product:theme` and stays isolated.
- To hand a store to higher-level SDK pieces; for example, the session-key manager in [Keys](/apps/product-sdk/keys/) takes a store to persist its mnemonic.
- Not a general-purpose browser shim: the store requires a Host and has no standalone browser fallback. For raw Host storage without the key-value convenience layer, use the [Host](/apps/product-sdk/host/) package directly.

## Core Concepts

- **`createLocalKvStore(options)`**: The single factory. It is async because it detects the Host storage backend, and it returns a `LocalKvStore`.
- **`LocalKvStore`**: The returned store. It exposes `get`, `set`, and `remove` for strings, plus `getJSON` and `setJSON` for typed JSON values.
- **Namespacing**: Pass a `prefix` to isolate this Product's keys from everything else in the Host's storage.
- **Error-tolerant reads**: `get` and `getJSON` return `null` for a missing key or a failed read; writes and removes log failures rather than throwing. Only the factory throws, when no Host is present.

## Persist and Read App State

Create a namespaced store, then read and write both strings and JSON:

```typescript
import { createLocalKvStore } from '@parity/product-sdk-local-storage';

const store = await createLocalKvStore({ prefix: 'my-product' });

await store.set('theme', 'dark');
const theme = await store.get('theme'); // string | null

await store.setJSON('draft', { title: 'Untitled', body: '' });
const draft = await store.getJSON<{ title: string; body: string }>('draft');

await store.remove('draft');
```

## Limitations

- `createLocalKvStore` throws if no Host storage is detected; the store is Host-only.
- Write and remove failures are logged, not thrown, so a failed `set` looks like success to the caller.
- Reads never throw: both errors and missing keys surface as `null`.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Persist Data Locally**

    ---

    The task-focused recipe: JSON helpers, prefixes, and React usage, step by step.

    [:octicons-arrow-right-24: Persist Data Locally](/apps/build/persist-data-locally/)

-   <span class="badge learn">Learn</span> **Keys**

    ---

    A common consumer of this store: the session-key manager persists its mnemonic here.

    [:octicons-arrow-right-24: Keys](/apps/product-sdk/keys/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `local-storage` surface: `createLocalKvStore` and `LocalKvStore`.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/local-storage/)

</div>
