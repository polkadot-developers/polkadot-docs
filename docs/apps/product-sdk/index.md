---
title: Product SDK
description: Overview of the Product SDK, the TypeScript SDK for building Polkadot Products, including createApp, the package family, and links to the full API reference.
categories: Apps
---

# Product SDK

## Introduction

The [Product SDK](https://github.com/paritytech/product-sdk) is the TypeScript SDK for building Polkadot Products. It gives your Product typed access to everything the platform provides: chain reads, transaction signing, decentralized storage, off-chain messaging, smart contracts, and identity, all routed through the Host your Product runs inside.

The SDK never dials an RPC endpoint itself. Every sensitive operation (signing, chain access, storage) goes through the Host, which selects the network, holds the user's keys, and prompts for approval on the user's phone. Your Product calls a typed method; the Host mediates the rest.

Fallible operations return a typed `Result` instead of throwing, so you check `.ok` before reading `.value`. This pattern runs through the whole SDK and is covered in each [Build guide](/apps/build/).

## Two Ways to Use the SDK

The SDK ships as one umbrella package that re-exports most capabilities, plus individual per-capability packages you can install on their own:

- **Umbrella package**: `npm install @parity/product-sdk`. One dependency that provides the `createApp` entry point and re-exports most capabilities through subpaths such as `@parity/product-sdk/cloud-storage`. Convenient when your Product uses several capabilities and bundle size is not a concern. A few packages, notably `statement-store`, are not re-exported and are always installed on their own.
- **Individual packages**: `npm install @parity/product-sdk-chain-client @parity/product-sdk-signer` (and so on). Install only what you use to keep your bundle smaller and your dependencies explicit.

The import specifiers differ between the two: the umbrella exposes subpaths like `@parity/product-sdk/cloud-storage`, while the standalone package is `@parity/product-sdk-cloud-storage`. Switching styles means updating your imports.

The umbrella's subpaths are a fixed set: `address`, `chain`, `cloud-storage`, `contracts`, `core`, `crypto`, `host`, `identity`, `individuality`, `local-storage`, `react`, `testing`, and `wallet`. Two of those names do not match their leaf package — `@parity/product-sdk/chain` re-exports `chain-client`, and `@parity/product-sdk/wallet` re-exports `signer`, kept under the older name for compatibility.

Note what is *not* there: `tx`, `keys`, `statement-store`, and `terminal` have no umbrella subpath and are not re-exported from the root, so install those from their own packages even when you are otherwise on the umbrella. The root entry point does re-export the most common handful directly — `createApp`, `SignerManager`, `createChainClient`, `createLocalKvStore`, `CloudStorageClient`, `isInsideContainer`, and the `Result` trio (`ok`, `err`, `isErrorOf`).

## A Minimal Product

`createApp` is the fastest way in. It wires the wallet, local storage, chain client, and cloud storage behind one object:

```typescript
import { createApp } from '@parity/product-sdk';

const app = await createApp({
  name: 'my-app',
  logLevel: 'info',
});

// Connect to host-provided accounts.
const { accounts } = await app.wallet.connect();
console.log('Connected accounts:', accounts);

// Persist a value, namespaced under the app name in host storage.
await app.localStorage.set('lastVisit', new Date().toISOString());
const lastVisit = await app.localStorage.get('lastVisit');
console.log('Last visit:', lastVisit);
```

`createApp` returns an `App` exposing `wallet`, `localStorage`, `chain`, and `cloudStorage`, plus `getAppInfo`.

!!! warning "createApp requires a Host"
    `createApp` must run inside a compatible Host ([Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/), the [Polkadot App](/reference/apps/hosts/polkadot-app/), or [Polkadot Web](/reference/apps/hosts/polkadot-web/)). Called outside one, it throws `Host storage unavailable`. For local development and tests, use the SDK's fake Host; see [Testing Without a Host](#testing-without-a-host).

## The Package Family

Each capability is its own package. The umbrella re-exports most of them; a few (such as `statement-store`) are always installed on their own. Each capability package below has its own overview page in this section covering what it is, when to use it, its core concepts, and typical journeys. The **API reference** links point to the generated reference for the complete surface.

|                Package                 |                                            What it does                                            |                     API reference                     |
|:--------------------------------------:|:--------------------------------------------------------------------------------------------------:|:-----------------------------------------------------:|
|   [Chain Client](/apps/product-sdk/chain-client/) (`chain-client`)     | Typed, host-routed client for reading on-chain storage, constants, and account state across chains |    [API](https://paritytech.github.io/product-sdk/api/chain-client/)    |
|        [Signer](/apps/product-sdk/signer/) (`signer`)         |    Derives product-scoped accounts and requests signatures, routing every approval to the phone    |      [API](https://paritytech.github.io/product-sdk/api/signer/)      |
|     [Transactions](/apps/product-sdk/tx/) (`tx`)          |                     Builds, submits, and follows transactions through to finality                  |       [API](https://paritytech.github.io/product-sdk/api/tx/)       |
|  [Cloud Storage](/apps/product-sdk/cloud-storage/) (`cloud-storage`)   |     Uploads and retrieves content-addressed data by CID, backed by the Bulletin Chain              |   [API](https://paritytech.github.io/product-sdk/api/cloud-storage/)    |
| [Statement Store](/apps/product-sdk/statement-store/) (`statement-store`) |        Publish/subscribe client for signed, short-lived statements gossiped off-chain             |  [API](https://paritytech.github.io/product-sdk/api/statement-store/)   |
|   [Local Storage](/apps/product-sdk/local-storage/) (`local-storage`)   |             Per-Product, per-device key-value store backed by the Host                            |   [API](https://paritytech.github.io/product-sdk/api/local-storage/)    |
|      [Contracts](/apps/product-sdk/contracts/) (`contracts`)      |   Typed calls to `pallet-revive` (PolkaVM) contracts on Asset Hub, resolved from a `cdm.json`      |    [API](https://paritytech.github.io/product-sdk/api/contracts/)     |
|          [Keys](/apps/product-sdk/keys/) (`keys`)         |                Derives application and session keys from the user's accounts                        |       [API](https://paritytech.github.io/product-sdk/api/keys/)       |
|          [Host](/apps/product-sdk/host/) (`host`)         |         Detects the Host container and exposes its lower-level API surface directly                 |       [API](https://paritytech.github.io/product-sdk/api/host/)       |

### Packages Without a Page Yet

These ship in the SDK and are usable today, but do not have an overview page in this section. Read their API reference or package README until one lands:

- **[`individuality`](https://github.com/paritytech/product-sdk/tree/main/product-sdk/packages/individuality)**: Reads a person's personhood standing on the Individuality chain, from either a `.dot` username or an account, and reads which usernames an account holds. It has no generated API page yet, so read the package source. Also provides `withAsPerson`, which wraps a signer so a call dispatches under a person origin instead of an account origin. This is the package to reach for when gating a feature on verified-human status; see [Identity](/apps/concepts/identity/) for the concepts.
- **[`terminal`](https://paritytech.github.io/product-sdk/api/terminal/)**: QR-code login, attestation, and transaction signing for command-line tools, so a Node CLI can pair with the Polkadot App the way the `playground` CLI does. Requires Node 21 or later. Not for Products, which run inside a Host and use `signer` instead.
- **[`auth`](https://paritytech.github.io/product-sdk/api/auth/)**: The runtime-agnostic core beneath `terminal` — QR/mobile sign-in and session signing, with terminal rendering split into an `/ui` subpath so headless consumers do not pull it in.

### Supporting Packages

Lower-level primitives the capability packages build on. Each has its own generated API reference:

- **[`address`](https://paritytech.github.io/product-sdk/api/address/)**: Encodes, decodes, and converts SS58 and H160 addresses.
- **[`crypto`](https://paritytech.github.io/product-sdk/api/crypto/)**: Encryption, hashing, and encoding primitives.
- **[`utils`](https://paritytech.github.io/product-sdk/api/utils/)**: Byte encoding, 32-byte hashes (`blake2b256`, `sha256`, `keccak256`), planck token formatting, and typed balance queries.
- **[`logger`](https://paritytech.github.io/product-sdk/api/logger/)**: Structured, namespace-filtered logging.
- **[`errors`](https://paritytech.github.io/product-sdk/api/errors/)** and **[`result`](https://paritytech.github.io/product-sdk/api/result/)**: The shared `SdkError` marker and the generic `Result` type the whole SDK returns.
- **`descriptors`**: Typed chain metadata consumed by the chain client. Imported per chain (for example, `@parity/product-sdk-descriptors/paseo-asset-hub`).

!!! note "`result` breaks the package-name pattern"
    Every other package installs as `@parity/product-sdk-<name>`, but the result type ships as **`@parity/result`** — no `product-sdk-` prefix. Most Products never install it directly, since the capability packages re-export `Result`, `ok`, and `err`; if you do need it standalone, use the unprefixed name.

The full surface, every package, class, and method, is documented in the [Product SDK API reference](https://paritytech.github.io/product-sdk/).

## Capabilities That Live on the Host

A few things the platform offers are reached through the [`host`](/apps/product-sdk/host/) package rather than a dedicated capability package, so there is no focused API to learn yet:

- **Payments**: `getPaymentManager()` — request a payment, top up, and track status.
- **Chat**: `getChatManager()` — rooms, bots, and interactive action buttons.
- **Notifications**: `getNotificationManager()` — push notifications to the user's phone.
- **Navigation**: `navigateTo()` — deep links between Products.

These are Host getters that return `null` outside a container, and their surfaces are still settling. Treat them as lower-level than the rest of the SDK, and check the [`host` API reference](https://paritytech.github.io/product-sdk/api/host/) for the current shape before building on them.

## React Bindings

The umbrella exposes a React entry point at `@parity/product-sdk/react`. Wrap your app in `ProductSDKProvider`, then reach the SDK from any component through hooks:

- **`useProductSDK`**: The `App` instance and connection state.
- **`useWallet`**: The connected account and signing helpers.
- **`useLocalStorage`**: Reactive per-Product key-value storage.
- **`useChain`**: The host-routed chain client.

The [Shared Todo App tutorial](/apps/tutorials/shared-todo-app/) uses these bindings end to end.

## Testing Without a Host

Because `createApp` and the host-only methods require a Host, the SDK ships fakes for local development and automated tests. The `@parity/product-sdk/testing` subpath provides `createFakeApp` and per-capability fakes (`createFakeSignerProvider`, `createFakeHostLocalStorage`, and more), so you can exercise Product logic in a plain Node or browser test without Polkadot Desktop.

Individual packages also expose a dev path where it makes sense; for example, `SignerManager.connect('dev')` loads the standard Substrate dev accounts. See [Sign and Submit Transactions](/apps/build/sign-and-submit/#test-without-a-host).

## Requirements

- **Node.js**: version 20 or later.
- **Module format**: ESM only. The SDK does not ship CommonJS builds.
- **TypeScript**: version 5.0 or later, if you consume the types.
- **Runtime Host**: The umbrella package and host-only methods require a compatible Host at runtime. Use the SDK's testing fakes for local development.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Build Guides**

    ---

    Task-focused recipes, one per capability, that take you from an empty project to working Product code.

    [:octicons-arrow-right-24: Open Build Guides](/apps/build/)

-   <span class="badge external">External</span> **Product SDK API Reference**

    ---

    The complete SDK surface: installation, quickstart, testing, and per-package API docs for every class and method.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/)

-   <span class="badge learn">Learn</span> **App Development Reference**

    ---

    How the Product, SDK, Host, and on-chain infrastructure fit together.

    [:octicons-arrow-right-24: Reference](/reference/apps/)

</div>
