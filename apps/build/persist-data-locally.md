---
title: Persist Data Locally
description: Learn how to store and retrieve application data between sessions in a Polkadot Product using the @parity/product-sdk-local-storage package.
categories: Apps
---

# Persist Data Locally

!!! info "Packages"
    **Primary:** [`local-storage`](/apps/build/#the-product-sdk-packages)

## Introduction

If your Product needs to remember something between sessions — a saved theme, an unsubmitted draft, a cached response — this is the page. The `@parity/product-sdk-local-storage` package gives you a `LocalKvStore`: a string-keyed store with convenience methods for both plain strings and JSON-serializable values, and the same interface wherever your Product runs.

Two things to know up front:

- **It's local to the device.** Data written on one device isn't visible on another — there's no cross-device sync. If the data must follow the user everywhere, it belongs on-chain instead (see the callout below).
- **It's isolated per Product.** The Host namespaces every key by your Product's `.dot` domain, so two Products on the same Host can't read or write each other's data — automatically, with nothing for you to manage.

`createLocalKvStore()` auto-detects the backend at runtime. When your Product runs inside a Polkadot Host (Desktop, the Polkadot App, or Web), reads and writes route through the Host. When your Product runs outside a Host — for example, during local development in a browser tab — the store falls back to the browser's `localStorage`. The same application code works in both environments with no changes.

Within a single Product, storage is shared across every modality the Product runs in — full-screen view, dashboard card, and chat widget all see the same values.

!!! info "Storage options for your Product"
    `LocalKvStore` is the right tool for device-local, per-Product key-value data. When your data needs to outlive the device or be visible to other users, reach for an on-chain layer instead:

    - **Local KvStore** (this page) — per-Product, per-device key-value. User preferences, drafts, cached values. Not synced across devices.
    - **Bulletin Chain** — content-addressed, on-chain, retained ~2 weeks by default and renewable. Content readers fetch later by hash — profile photos, published articles, app bundles. See [Store Data on Chain](/apps/build/store-data-on-chain/){target=_blank}.
    - **Statement Store** — gossip-distributed, short-lived (default 30s TTL), allowance-gated. Real-time signaling between users — chat messages, presence, typing indicators. See [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/){target=_blank}.

## Prerequisites

Before starting, ensure you have:

- A Polkadot Product project — from a [Quick Start](/apps/quick-start/) deploy or a [Local Development](/apps/local-development/) setup
- Install Node.js and npm

## Install the SDK

You have two installation options depending on your needs:

- **Individual package** — install only what you use. Keeps your bundle smaller and makes dependencies explicit.

    ```bash
    npm install @parity/product-sdk-local-storage
    ```

- **Umbrella package** — install the full SDK in one command. Convenient when your Product uses several SDK features (local storage, signing, cloud storage, etc.) and bundle size is not a concern.

    ```bash
    npm install @parity/product-sdk
    ```

All import paths shown in this guide work with both options.

## Initialize the Store

`createLocalKvStore()` is an async factory. You must `await` it before performing any read or write, because the function inspects the runtime environment to choose the correct backend.

```typescript title="initialize.ts"
--8<-- 'code/apps/build/persist-data-locally/initialize.ts'
```

`createLocalKvStore()` accepts an optional `LocalKvStoreOptions` argument. The supported option is `prefix`, which is covered in [Namespace Keys with Prefixes](#namespace-keys-with-prefixes).

## Store String Values

Use `store.set(key, value)` to write a string value for a key. Use `store.get(key)` to read it back. If the key has not been set, `get` returns `null`.

```typescript title="set-get-string.ts"
--8<-- 'code/apps/build/persist-data-locally/set-get-string.ts'
```

## Store JSON Values

Use `store.setJSON(key, value)` to write any JSON-serializable value. The store handles serialization for you. Use `store.getJSON<T>(key)` to read it back; the generic type parameter `T` enables type-safe retrieval. If the key does not exist, `getJSON` returns `null`.

```typescript title="set-get-json.ts"
--8<-- 'code/apps/build/persist-data-locally/set-get-json.ts'
```

## Remove Stored Values

Use `store.remove(key)` to delete a key. The method does not throw if the key does not exist, so you can call it safely without first checking whether the value is present.

```typescript title="remove.ts"
--8<-- 'code/apps/build/persist-data-locally/remove.ts'
```

## Namespace Keys with Prefixes

Within a Product, multiple features may share the same `LocalKvStore`. Prefixes partition the namespace further to avoid key collisions between those features.

Pass a `prefix` option to `createLocalKvStore()` to prepend `prefix:` to every key operated on by that store instance. For example, `createLocalKvStore({ prefix: "feature" })` stores the key `"setting"` internally as `"feature:setting"`.

```typescript title="prefixed-store.ts"
--8<-- 'code/apps/build/persist-data-locally/prefixed-store.ts'
```

The Host-enforced Product-level namespace is separate from any developer-defined prefix. The Host's Product namespace is applied on top of your `prefix`, so a key `"setting"` in a `{ prefix: "feature" }` store ends up stored as something like `"myproduct.dot:feature:setting"` — without you needing to construct that path yourself.

## Use React Hooks

If your Product is a React application, `@parity/product-sdk` provides hooks that integrate local storage directly into the React component lifecycle. The hooks read the current value on mount and re-render the component whenever it changes.

Wrap your application in `ProductSDKProvider` once at the root, then call the hooks anywhere inside the tree:

```tsx title="providers.tsx"
--8<-- 'code/apps/build/persist-data-locally/providers.tsx'
```

`useLocalStorageString` manages a plain string value. `useLocalStorage<T>` manages a JSON-serializable value typed by `T`. Both hooks return a tuple of `[currentValue, setValue, { loading, error }]`:

```tsx title="local-storage-hooks.tsx"
--8<-- 'code/apps/build/persist-data-locally/local-storage-hooks.tsx'
```

To remove a key or clear all storage for your Product, access `app.localStorage` from `useProductSDK()` directly:

```tsx title="remove-and-clear.tsx"
--8<-- 'code/apps/build/persist-data-locally/remove-and-clear.tsx'
```

!!! note
    `app.localStorage.clear()` removes every key scoped to your Product. It is equivalent to calling `remove()` on each key individually.

## Limitations

- Storage is not synced across devices. Values written on one Host instance are not visible on another.
- `app.localStorage.clear()` and `store.remove()` are scoped to your Product. You cannot read or modify another Product's keys.
- React hooks (`useLocalStorage`, `useLocalStorageString`) are only available via the umbrella package `@parity/product-sdk`. The standalone `@parity/product-sdk-local-storage` package exposes no React hooks.
- When running outside a host container, the store falls back to the browser's `localStorage`. Browser `localStorage` has no persistence guarantees in private or incognito sessions — data may be cleared when the tab closes.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Store Data On-Chain**

    ---

    For data that must be recorded and verifiable on-chain.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/)

-   <span class="badge guide">Guide</span> **Read Chain State**

    ---

    Query live chain data from within your Polkadot Product.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/)

</div>
