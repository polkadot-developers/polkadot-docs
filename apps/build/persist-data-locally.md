---
title: Persist Data Locally
description: Learn how to store and retrieve application data between sessions in a Polkadot Product using the @parity/product-sdk-local-storage package.
categories: Apps
tutorial_badge: Beginner
---

# Persist Data Locally

## Introduction

This guide covers the `@parity/product-sdk-local-storage` package, which provides a `LocalKvStore` for storing and retrieving key-value data between sessions. Use it for device-local data like saved preferences, unsubmitted drafts, or cached responses. Data is scoped to your Product and device; it does not sync across devices or leak between Products on the same Host.

!!! info "Storage options for your Product"
    `LocalKvStore` is the right tool for device-local, per-Product key-value data. When your data needs to outlive the device or be visible to other users, reach for an on-chain layer instead:

    - **Local KvStore** (this page): Per-Product, per-device key-value. User preferences, drafts, cached values. Not synced across devices.
    - **Bulletin Chain**: Content-addressed, on-chain, retained ~2 weeks by default and renewable. Content readers fetch later by hash: profile photos, published articles, app bundles. See [Store Data on Chain](/apps/build/store-data-on-chain/).
    - **Statement Store**: Gossip-distributed, short-lived (default 30s TTL), allowance-gated. Real-time signaling between users: chat messages, presence, typing indicators. See [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/).

## Prerequisites

Before getting started, ensure you have:

- A Polkadot Product project running locally (see [Set Up Your Project](/apps/build/#set-up-your-project))
- Node.js 20 or later with ESM support (`@parity/product-sdk-local-storage` is ESM only)

## Install the SDK

You have two installation options depending on your needs:

- **Umbrella package** (recommended starting point): Install the full SDK in one command. Convenient when your Product uses several SDK features (local storage, signing, cloud storage, etc.) and bundle size is not a concern.

    ```bash
    npm install @parity/product-sdk
    ```

- **Individual package**: Install only what you use. Keeps your bundle smaller and makes dependencies explicit; switch to this later as a bundle-size optimization.

    ```bash
    npm install @parity/product-sdk-local-storage
    ```

All import paths shown in this guide work with both options.

!!! note "Code examples"
    Each snippet in this guide is a standalone file you add to your Product's source tree. The filenames match the `title` shown in the code block header (for example, `initialize.ts`, `set-get-string.ts`). They are not meant to be concatenated; import and use each one independently wherever it fits in your Product.

## Initialize the Store

`createLocalKvStore()` is an async factory. You must `await` it before performing any read or write, because the function connects to the Host storage backend before the store is usable.

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

Pass a `prefix` option to `createLocalKvStore()` to prepend `prefix:` to every key operated on by that store instance. For example, `createLocalKvStore({ prefix: 'feature' })` stores the key `'setting'` internally as `'feature:setting'`.

```typescript title="prefixed-store.ts"
--8<-- 'code/apps/build/persist-data-locally/prefixed-store.ts'
```

The Host-enforced Product-level namespace is separate from any developer-defined prefix. The Host's Product namespace is applied on top of your `prefix`, so a key `'setting'` in a `{ prefix: 'feature' }` store ends up stored as something like `'myproduct.dot:feature:setting'`, without you needing to construct that path yourself.

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
- `createLocalKvStore()` requires a Host backend. Running outside a host container, it throws `Host storage unavailable`; there is no browser `localStorage` fallback. Run your Product inside Polkadot Desktop to use local storage.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    When data must outlive the device and be fetchable by anyone, move it to the Bulletin Chain.

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

-   <span class="badge guide">Guide</span> **Deploy Your Product**

    ---

    You've covered the capabilities; ship your Product to a live `.dot` name with the Quick Start deploy routes.

    [:octicons-arrow-right-24: Quick Start](/apps/quick-start/)

-   <span class="badge external">External</span> **product-sdk API Reference**

    ---

    The full `product-sdk` surface beyond this recipe: every package, class, and method.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/){target=\_blank}

</div>
