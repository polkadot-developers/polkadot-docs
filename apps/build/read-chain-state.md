---
title: Read On-Chain Data
description: Connect a Polkadot Product to one or more chains and read storage, constants, and account state using the @parity/product-sdk-chain-client package.
categories: Apps
---

# Read On-Chain Data

## Introduction

This page is for developers building Polkadot Products that need to read on-chain state — account balances, storage items, runtime constants — from inside a Polkadot host container. It covers the `@parity/product-sdk-chain-client` package, which gives your Product a typed, host-aware client for any Polkadot SDK-based chain.

The code examples throughout this guide use the **Paseo Bulletin chain** and **Paseo Asset Hub**, both confirmed working with Polkadot Desktop v0.3.17 and `@parity/product-sdk` v0.8.0. The same patterns apply to any other chain — swap in the descriptor and RPC endpoint for the chain you need, and the client shape stays identical.

The SDK ships two connection paths. A zero-config **Preset** path (`getChainAPI`) returns a ready-to-use client for a known environment. A **Bring Your Own Descriptors (BYOD)** path (`createChainClient`) lets you import chain descriptors explicitly and compose any set of chains your Product needs. Both produce the same client shape, so the rest of your read code stays identical.

All connections are routed through the host. The SDK is designed to run exclusively inside a Polkadot host container (Polkadot Browser or Desktop). There is no direct WebSocket fallback — the `rpcs` field in `createChainClient` is kept for API compatibility but does not affect runtime behavior.

## Prerequisites

Before starting, ensure you have:

- A Polkadot Product project with a TypeScript toolchain
- Node.js with ESM support (`@parity/product-sdk-chain-client` is ESM only)
- Polkadot Desktop v0.3.17 or later to run your Product inside a host container. See [Install and Pair](/apps/set-up/install-and-pair/)

!!! note
    You do NOT need funded accounts to read chain state. Reads are unsigned and require only a running host container.

## Install the SDK

You have two installation options depending on your needs:

- **Individual packages** — install only what you use. Keeps your bundle smaller and makes dependencies explicit.

    ```bash
    npm install @parity/product-sdk-chain-client
    ```

- **Umbrella package** — install the full SDK in one command. Convenient when your Product uses several SDK features (chain client, signing, cloud storage, etc.) and bundle size is not a concern.

    ```bash
    npm install @parity/product-sdk
    ```

All import paths shown in this guide work with both options.

If you plan to use the BYOD path, also install the descriptors package regardless of which option above you chose:

```bash
npm install @parity/product-sdk-descriptors
```

The descriptors package exposes typed `ChainDefinition` objects through subpath imports (for example, `@parity/product-sdk-descriptors/paseo-bulletin`). Each subpath corresponds to one chain.

## Connect Using a Preset

The Preset path is the fastest way to get a working client. `getChainAPI(env)` returns a client preconfigured with the descriptors and RPC endpoints for the requested environment.

```ts
import { getChainAPI } from "@parity/product-sdk-chain-client";

const client = await getChainAPI("paseo");

const fee = await client.bulletin.query.TransactionStorage.ByteFee.getValue();
const blockNumber = await client.assetHub.query.System.Number.getValue();

client.destroy();
```

The returned client exposes one property per chain in the preset (`assetHub`, `bulletin`, `individuality`), each typed by the underlying [polkadot-api](https://papi.how){target=\_blank} (PAPI) descriptor.

!!! warning "Only `paseo` is live"
    `getChainAPI` accepts the `Environment` values `paseo`, `polkadot`, and `kusama`, but only `paseo` is wired up at the moment. Calling `getChainAPI('polkadot')` or `getChainAPI('kusama')` throws at runtime.

## Connect Using Custom Descriptors (BYOD)

When you need explicit control over which chains and descriptors your Product uses, use `createChainClient` and supply your own descriptors and RPC endpoints. This is called the **Bring Your Own Descriptors (BYOD)** path — you import the chain descriptor objects yourself instead of relying on the preset.

```ts
import { createChainClient } from "@parity/product-sdk-chain-client";
import { paseo_asset_hub } from "@parity/product-sdk-descriptors/paseo-asset-hub";
import { paseo_bulletin } from "@parity/product-sdk-descriptors/paseo-bulletin";

const client = await createChainClient({
    chains: {
        assetHub: paseo_asset_hub,
        bulletin: paseo_bulletin,
    },
    rpcs: {
        assetHub: ["wss://paseo-asset-hub-next-rpc.polkadot.io"],
        bulletin: ["wss://paseo-bulletin-next-rpc.polkadot.io"],
    },
});

client.destroy();
```

The keys you choose in `chains` (`assetHub`, `bulletin`) become the property names on the returned client. Pick names that read naturally in your call sites — the rest of the SDK is fully typed against them.

!!! note
    The `rpcs` field is required by the API but connections are routed through the host at runtime. The URLs are used as documentation and for tooling purposes.

!!! tip "Using a different chain"
    To connect to a chain other than `paseo_bulletin`, find its descriptor in `@parity/product-sdk-descriptors` and its WebSocket endpoint, then add both under the same key in `chains` and `rpcs`. The client surface (`client.<yourKey>.query.*`) is automatically typed to match the descriptor you supplied.

## Read Storage and Constants

Once you have a client, every chain you connected exposes a typed PAPI surface under `.query`, `.constants`, and the rest of the PAPI shape. The pattern is:

```text
client.<chainName>.query.<Pallet>.<Item>.getValue(...args)
```

The following examples show common read operations. Each one maps directly to a pallet storage item and requires no transaction or signature.

??? example "Byte Fee"
    `TransactionStorage.ByteFee` returns the current cost per byte for on-chain storage on the Bulletin chain.

    ```ts
    const fee = await client.bulletin.query.TransactionStorage.ByteFee.getValue();
    console.log(`${fee} planck/byte`);
    ```

??? example "Block Number"
    `System.Number` returns the current best block number for the chain.

    ```ts
    const blockNumber = await client.assetHub.query.System.Number.getValue();
    ```

??? example "Account State"
    `System.Account` returns the full account record for an address, including nonce and balance buckets.

    ```ts
    const address = "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY";

    const account = await client.assetHub.query.System.Account.getValue(address);
    const { nonce, data: { free, reserved, frozen } } = account;
    ```

## Read Multiple Chains in Parallel

Because each chain has its own connection under the hood, reads across chains are independent and can be issued in parallel with `Promise.all`.

```ts
const [fee, blockNumber] = await Promise.all([
    client.bulletin.query.TransactionStorage.ByteFee.getValue(),
    client.assetHub.query.System.Number.getValue(),
]);
```

This is the recommended pattern whenever your Product needs to assemble a view from more than one storage item or chain.

## Access the Raw PAPI Client

For advanced flows that the typed surface does not cover — raw storage subscriptions, low-level block tracking, or building a `ContractRuntime` for pallet-revive — every chain on the client exposes the underlying `PolkadotClient` under `.raw`.

```ts
// Subscribe to every new finalized block on the Bulletin chain
const subscription = client.raw.bulletin.finalizedBlock$.subscribe((block) => {
    console.log(`Finalized block #${block.number} — ${block.hash}`);
});

// Unsubscribe when done
subscription.unsubscribe();
```

Use the raw client only when you need to step outside the typed query/constants shape. Most reads should go through the typed surface above.

## Detect Whether You're Inside a Host

The SDK re-exports two helpers from `@parity/product-sdk-host` for detecting whether your Product is running inside a host container. Use these when behavior should branch — for example, showing a connection status indicator.

```ts
import { isInsideContainer, isInsideContainerSync } from "@parity/product-sdk-chain-client";

const inContainer = await isInsideContainer();      // async, canonical
const inContainerSync = isInsideContainerSync();    // sync, for top-level guards
```

!!! note
    You generally do NOT need to branch on this. The client routes calls correctly when inside a host container; detection is for cases where your Product itself wants to adapt its UI or telemetry.

## Clean Up Connections

Each client owns one or more connections. Tear them down when your Product no longer needs them — typically on view unmount or process shutdown.

```ts
import { destroyAll } from "@parity/product-sdk-chain-client";

// Close only the connections owned by this client
client.destroy();

// Global escape hatch — closes every connection the SDK has open
destroyAll();
```

Use `client.destroy()` for normal cleanup and reserve `destroyAll()` for full-process teardown.

## Limitations

- The `paseo` environment is the only preset wired up today. `polkadot` and `kusama` throw at runtime.
- The package is ESM only — your Product's build pipeline must support ESM imports.
- Descriptors are imported by subpath (`@parity/product-sdk-descriptors/paseo-bulletin`), not from the package root. Bundlers that do not honour `exports` subpaths will fail to resolve them.
- The SDK runs exclusively inside a host container. There is no direct WebSocket fallback outside of one.
- Reactive subscriptions (watching a storage item over time) are not covered on this page. A dedicated page on subscriptions will follow.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Accounts and Signing**

    ---

    Move from reading state to signing transactions with your paired account.

    [:octicons-arrow-right-24: Get Started](/apps/build/accounts-and-signing/)

-   <span class="badge guide">Guide</span> **Store Data On-Chain**

    ---

    Write to chain storage from your Product, including fee handling and confirmation.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/)

-   <span class="badge external">External</span> **polkadot-api Docs**

    ---

    Reference for the typed PAPI surface that `@parity/product-sdk-chain-client` exposes per chain.

    [:octicons-arrow-right-24: Visit Site](https://papi.how){target=\_blank}

</div>
