---
title: Product SDK
description: Overview of the Product SDK, the TypeScript SDK for building Polkadot Products, including createApp, the package family, and links to the full API reference.
categories: Apps
---

# Product SDK

## Introduction

The [Product SDK](https://github.com/paritytech/product-sdk) is the TypeScript SDK for building Polkadot Products. It gives your Product typed access to everything the platform provides: chain reads, transaction signing, decentralized storage, off-chain messaging, smart contracts, and identity, all routed through the Host your Product runs inside.

The SDK never dials an RPC endpoint itself. Every sensitive operation (signing, chain access, storage) goes through the Host, which selects the network, holds the user's keys, and prompts for approval on the user's phone. Your Product calls a typed method; the Host mediates the rest.

Fallible operations in the individual packages return a typed `Result` instead of throwing, so you check `.ok` before reading `.value`. That pattern runs through every capability package and is what each [Build guide](/apps/build/) teaches. The `createApp` facade below is thinner and does not follow it uniformly — see [What `createApp` Returns](#what-createapp-returns).

## Two Ways to Use the SDK

The SDK ships as one umbrella package that re-exports most capabilities, plus individual per-capability packages you can install on their own:

- **Umbrella package**: `npm install @parity/product-sdk`. One dependency that provides the `createApp` entry point and re-exports most capabilities through subpaths such as `@parity/product-sdk/cloud-storage`. Convenient when your Product uses several capabilities and bundle size is not a concern. A few packages, notably `statement-store`, are not re-exported and are always installed on their own.
- **Individual packages**: `npm install @parity/product-sdk-chain-client @parity/product-sdk-signer` (and so on). Install only what you use to keep your bundle smaller and your dependencies explicit.

The import specifiers differ between the two: the umbrella exposes subpaths like `@parity/product-sdk/cloud-storage`, while the standalone package is `@parity/product-sdk-cloud-storage`. Switching styles means updating your imports.

The umbrella's subpaths are a fixed set: `address`, `chain`, `cloud-storage`, `contracts`, `core`, `crypto`, `host`, `identity`, `individuality`, `local-storage`, `react`, `testing`, and `wallet`. Two of those names do not match their leaf package — `@parity/product-sdk/chain` re-exports `chain-client`, and `@parity/product-sdk/wallet` re-exports `signer`, kept under the older name for compatibility.

Note what is _not_ there: `tx`, `keys`, `statement-store`, `terminal`, and `auth` have no umbrella subpath and are not re-exported from the root, so install those from their own packages even when you are otherwise on the umbrella. The root entry point does re-export the most common handful directly — `createApp`, `SignerManager`, `createChainClient`, `createLocalKvStore`, `CloudStorageClient`, `isInsideContainer`, and the `Result` trio (`ok`, `err`, `isErrorOf`).

## A Minimal Product

`createApp` is the fastest way in. It wires the signer, local storage, chain client, and cloud storage behind one object — the signer is exposed as `app.wallet`, the facade's older name for it:

```typescript
import { createApp } from '@parity/product-sdk';

async function start() {
  const app = await createApp({
    name: 'my-product.dot', // also your dotNS identifier — see the warning below
    logLevel: 'info',
  });

  // wallet.connect() throws rather than returning a Result.
  try {
    const { accounts } = await app.wallet.connect();
    if (accounts.length === 0) {
      // Connected, but the Host could not derive an account for this name.
    } else {
      console.log('Connected accounts:', accounts);
    }
  } catch (cause) {
    // No Host, or the Host refused the connection.
  }

  // Per-Product storage, namespaced by `name`. No Result: a miss reads as null.
  await app.localStorage.set('lastVisit', new Date().toISOString());
  const lastVisit = await app.localStorage.get('lastVisit'); // string | null
  console.log('Last visit:', lastVisit);

  return app;
}
```

!!! warning "`name` is also your dotNS identifier"
    `createApp` passes `name` straight through as the signer's `dappName`, and the Host treats that as the product identifier it derives the user's account from, appending `.dot` to non-local names. If it is not a registered `.dot` name, the Host rejects the derivation and `wallet.connect()` resolves with _zero accounts_ instead of failing — so the only symptom is an empty list, with no error to catch. `name` also namespaces your local storage, so changing it later moves both the derived account and every stored key.

### What `createApp` Returns

An `App` exposing `wallet`, `localStorage`, `chain`, and `cloudStorage`, plus `getAppInfo`. The four do not share one error convention, so check which one you are calling before writing the guard:

|      Member      |                                  Convention                                   |
|------------------|-------------------------------------------------------------------------------|
| `wallet`         | **Throws.** `connect()` rethrows the signer's error as a plain `Error`, so the typed variant is lost — you cannot tell `HostUnavailableError` from a rejection. |
| `localStorage`   | **Neither.** `get` resolves to `string \| null`, `set` to `void`; a failed read is indistinguishable from a missing key. |
| `chain`          | **Throws.** `getClient` and `getRawClient` throw if the chain is not connected. |
| `cloudStorage`   | **Returns a `Result`.** `upload` and `fetch` resolve to `ok`/`err`, matching the rest of the SDK. Also `null` entirely when cloud storage is disabled via `cloudStorage: false`. |

If you want the `Result` convention throughout, use the individual packages instead: [`signer`](/apps/product-sdk/signer/) in place of `app.wallet`, [`chain-client`](/apps/product-sdk/chain-client/) in place of `app.chain`, and [`local-storage`](/apps/product-sdk/local-storage/) in place of `app.localStorage`. That is the path every [Build guide](/apps/build/) takes.

!!! warning "createApp requires a Host"
    `createApp` must run inside a compatible Host ([Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/), the [Polkadot App](/reference/apps/hosts/polkadot-app/), or [Polkadot Web](/reference/apps/hosts/polkadot-web/)). Called outside one, it throws `Host storage unavailable`. For local development and tests, use the SDK's fake Host; see [Testing Without a Host](#testing-without-a-host).

## The Package Family

Each capability is its own package. The umbrella re-exports most of them; a few (such as `statement-store`) are always installed on their own. Each capability package below has its own overview page in this section covering what it is, when to use it, its core concepts, and typical journeys. The API reference links point to the generated reference for the complete surface.

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
|  [Individuality](/apps/product-sdk/individuality/) (`individuality`) |     Reads personhood standing and usernames on the Individuality chain, and dispatches under a person origin    | [Source](https://github.com/paritytech/product-sdk/tree/main/product-sdk/packages/individuality) |
|          [Host](/apps/product-sdk/host/) (`host`)         |         Detects the Host container and exposes its lower-level API surface directly                 |       [API](https://paritytech.github.io/product-sdk/api/host/)       |

### Command-Line Packages

Two packages are for tools you run _next to_ a Product — a deploy script, a migration job, a CI step — rather than inside one. A Product runs in a Host that already owns pairing and signing, so it uses [Signer](/apps/product-sdk/signer/) instead. Both require Node 21 or later.

|                Package                 |                                What it does                                |                  API reference                   |
|:--------------------------------------:|:--------------------------------------------------------------------------:|:------------------------------------------------:|
|  [Terminal](/apps/product-sdk/terminal/) (`terminal`)  | QR-code pairing, session signing, and allowance signers for a Node CLI     | [API](https://paritytech.github.io/product-sdk/api/terminal/) |
|      [Auth](/apps/product-sdk/auth/) (`auth`)      | The runtime-agnostic login, logout, and allocation flow built on `terminal` |   [API](https://paritytech.github.io/product-sdk/api/auth/)   |

### Supporting Packages

Lower-level primitives the capability packages build on. Each has its own generated API reference:

- **[`address`](https://paritytech.github.io/product-sdk/api/address/)**: Encodes, decodes, and converts SS58 and H160 addresses.
- **[`crypto`](https://paritytech.github.io/product-sdk/api/crypto/)**: Encryption, hashing, and encoding primitives.
- **[`utils`](https://paritytech.github.io/product-sdk/api/utils/)**: Byte encoding, 32-byte hashes (`blake2b256`, `sha256`, `keccak256`), planck token formatting, and typed balance queries.
- **[`logger`](https://paritytech.github.io/product-sdk/api/logger/)**: Structured, namespace-filtered logging.
- **[`errors`](https://paritytech.github.io/product-sdk/api/errors/)** and **[`result`](https://paritytech.github.io/product-sdk/api/result/)**: The shared `SdkError` marker and the generic `Result` type the whole SDK returns.
- **`descriptors`**: Typed chain metadata consumed by the chain client. Imported per chain (for example, `@parity/product-sdk-descriptors/paseo-asset-hub`).

!!! note "`result` breaks the package-name pattern"
    Every other package installs as `@parity/product-sdk-<name>`, but the result type ships as `@parity/result`, with no `product-sdk-` prefix. Most Products never install it directly, since the capability packages re-export `Result`, `ok`, and `err`; if you do need it standalone, use the unprefixed name.

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

Because `createApp` and the host-only methods require a Host, the SDK ships fakes so _automated tests_ can exercise Product logic in plain Node or a browser test runner. These are a test tool, not a development environment: to _develop_ against a real Host, run your Product from `localhost` inside Polkadot Desktop, per [Set Up Your Project](/apps/build/#set-up-your-project).

`@parity/product-sdk/testing` exports `createFakeApp`, which returns a fake `App` you can use directly in a logic test or hand to `ProductSDKContext.Provider` for a React component test:

```typescript
import { createFakeApp } from '@parity/product-sdk/testing';

// Synchronous, unlike the real createApp, which returns a Promise.
const app = createFakeApp({ wallet: { accounts: [alice, bob], selected: alice } });

await app.wallet.connect();
```

It fakes `wallet`, `localStorage`, and `cloudStorage`. Each is overridable through the options, along with `name`.

!!! warning "There is no chain fake, and `app.chain` throws"
    `createFakeApp` leaves `chain` unconfigured, so `getClient` and `getRawClient` throw — deliberately, because the Host owns RPC selection and a fake would not exercise the real wiring. The SDK's own guidance is to put chain-reading logic behind an interface you control, unit-test against that, and cover the wiring in end-to-end tests. Pass a `chain` override to `createFakeApp` if you would rather supply your own double.

    This matters most for [Read On-Chain Data](/apps/build/read-chain-state/), the first Build recipe, which is entirely chain reads.

The subpath also re-exports the per-package fakes for [`signer`](/apps/product-sdk/signer/), [`local-storage`](/apps/product-sdk/local-storage/), [`contracts`](/apps/product-sdk/contracts/), and [`host`](/apps/product-sdk/host/) — `createFakeSignerProvider`, `createFakeHostLocalStorage`, and the rest — so one import covers them.

!!! note "Statement store fakes are imported separately"
    They are deliberately not re-exported here, for the same reason `statement-store` has no umbrella subpath: adding it would pull in a dependency the umbrella does not otherwise have, and could pin a different version than the one your Product installs. Import them from `@parity/product-sdk-statement-store/testing` instead.

Individual packages also expose a dev path where it makes sense; for example, `SignerManager.connect('dev')` loads the standard Substrate dev accounts. See [Sign and Submit Transactions](/apps/build/sign-and-submit/#test-without-a-host).

## Requirements

- **Node.js**: version 20 or later — **except [`terminal`](/apps/product-sdk/terminal/) and [`auth`](/apps/product-sdk/auth/), which need 21 or later.** Those two open a WebSocket through the global `WebSocket` that Node 21 was the first to expose; on Node 18 or 20 they fail at connect time with `WebSocket is not defined`, not at install time.
- **Module format**: ESM only. The SDK does not ship CommonJS builds.
- **TypeScript**: version 5.0 or later, if you consume the types.
- **Runtime Host**: The umbrella package and host-only methods require a compatible Host at runtime. Use the SDK's testing fakes in automated tests.

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
