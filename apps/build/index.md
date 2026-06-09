---
title: Build
description: Build Polkadot Product capabilities with the product-sdk packages: signing, on-chain reads, decentralized storage, off-chain pub/sub, and local persistence.
categories: Apps
---

# Build

The Build guides are user journeys anchored to the [`product-sdk`](https://github.com/paritytech/product-sdk){target=\_blank} packages — each one takes a single capability and walks you from an empty project to working Product code. They apply no matter how you started: a [Quick Start](/apps/quick-start/) deploy (RevX or CLI) or a [Local Development](/apps/local-development/) setup. Pick the capability you need; the guide names the packages it uses up front.

## Capabilities

<div class="grid cards" markdown>

-   :material-draw-pen:{ .lg } __Sign and Submit Transactions__

    ---

    Derive product-scoped accounts and sign payloads or transactions — approvals route to the Polkadot App.

    [`signer`](#the-product-sdk-packages) · [`tx`](#the-product-sdk-packages) · [`address`](#the-product-sdk-packages)

    [:octicons-arrow-right-24: Sign and Submit Transactions](/apps/build/sign-and-submit/)

-   :material-database-search:{ .lg } __Read On-Chain Data__

    ---

    Connect to one or more chains and read storage, constants, and account state through the Host.

    [`chain-client`](#the-product-sdk-packages)

    [:octicons-arrow-right-24: Read On-Chain Data](/apps/build/read-chain-state/)

-   :material-cloud-upload:{ .lg } __Store Data on Chain__

    ---

    Upload and retrieve content-addressed data on the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/){target=\_blank} — durable, verifiable by CID.

    [`cloud-storage`](#the-product-sdk-packages)

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

-   :material-broadcast:{ .lg } __Publish and Subscribe to Off-Chain Data__

    ---

    Real-time signed pub/sub between users via the [Statement Store](/reference/apps/infrastructure/statement-store/){target=\_blank} — presence, signaling, ephemeral state.

    [`statement-store`](#the-product-sdk-packages)

    [:octicons-arrow-right-24: Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/)

-   :material-content-save:{ .lg } __Persist Data Locally__

    ---

    Per-Product, per-device key-value storage that works inside a Host or in a plain browser tab.

    [`local-storage`](#the-product-sdk-packages)

    [:octicons-arrow-right-24: Persist Data Locally](/apps/build/persist-data-locally/)

</div>

## The product-sdk Packages

Each guide is built around one _primary_ package and weaves in _utility_ packages where they're needed. Here's what each one is for:

| Package | What it does | Guide |
|---------|--------------|-------|
| `signer` | Derives product-scoped accounts and requests signatures, routing every approval to the user's Polkadot App. Your Product signs without ever handling keys. | [Sign and Submit Transactions](/apps/build/sign-and-submit/) |
| `chain-client` | A typed, host-routed client for reading on-chain storage, constants, and account state across one or more chains — no RPC infrastructure to run. | [Read On-Chain Data](/apps/build/read-chain-state/) |
| `cloud-storage` | A high-level client for the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/){target=\_blank}, Polkadot's content-addressed storage. Uploads and retrieves data by CID, with chunking, manifests, and authorization handled for you. | [Store Data on Chain](/apps/build/store-data-on-chain/) |
| `statement-store` | A pub/sub client for the [Statement Store](/reference/apps/infrastructure/statement-store/){target=\_blank}: publish and subscribe to signed, short-lived statements gossiped peer-to-peer off-chain. Ideal for real-time signaling between users. | [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/) |
| `local-storage` | A per-Product, per-device key-value store that auto-detects its backend (Host or the browser), so the same code works everywhere. | [Persist Data Locally](/apps/build/persist-data-locally/) |

The guides also use these **utility** packages where relevant:

- `tx` — build, sign, and track the lifecycle of transactions (used alongside `signer`).
- `address` — encode, decode, and validate SS58 addresses.
- `descriptors` — typed chain metadata for the `chain-client` Bring Your Own Descriptors path.
- `host` — low-level access to the Host API (for example, the preimage manager used for sponsored uploads).

## Umbrella or Individual Packages

Every guide works with either install style — choose based on your needs:

- **Umbrella package** — `npm install @parity/product-sdk`. One dependency that re-exports everything. Convenient when your Product uses several capabilities and bundle size is not a concern.
- **Individual packages** — `npm install @parity/product-sdk-cloud-storage` (and so on). Install only what you use to keep your bundle smaller and your dependencies explicit.

Import paths are identical either way, so you can start with the umbrella package and switch to individual packages later as a bundle-size optimization. Each guide opens with a **Packages** banner naming the primary package it's built around plus any utility packages it weaves in.
