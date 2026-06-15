---
title: Read On-Chain Data
description: Connect a Polkadot Product to one or more chains and read storage, constants, and account state using the @parity/product-sdk-chain-client package.
categories: Apps
tutorial_badge: Beginner
---

# Read On-Chain Data

## Introduction

This guide covers the `@parity/product-sdk-chain-client` package, which gives your Product a typed, host-aware client for reading on-chain state (account balances, storage items, and runtime constants) from inside a Polkadot host container. The SDK ships two connection paths: a zero-config **Preset** path (`getChainAPI`) and a __Bring Your Own Descriptors (BYOD)__ path (`createChainClient`) for explicit descriptor control. Both produce the same client shape.

## Prerequisites

- A Polkadot Product project running locally (see [Set Up Your Project](/apps/build/#set-up-your-project)), with a TypeScript toolchain
- Node.js 20 or later with ESM support (`@parity/product-sdk-chain-client` is ESM only)
- Polkadot Desktop to run your Product inside a host container. See [Install Desktop and Pair](/apps/get-started/)

!!! note
    You do NOT need funded accounts to read chain state. Reads are unsigned and require only a running host container.

## Install the SDK

You have two installation options depending on your needs:

- **Umbrella package** (recommended starting point): install the full SDK in one command. Convenient when your Product uses several SDK features (chain client, signing, cloud storage, etc.) and bundle size is not a concern.

    ```bash
    npm install @parity/product-sdk
    ```

- **Individual packages**: install only what you use. Keeps your bundle smaller and makes dependencies explicit; switch to this later as a bundle-size optimization.

    ```bash
    npm install @parity/product-sdk-chain-client
    ```

All import paths shown in this guide work with both options.

If you plan to use the BYOD path, also install the descriptors package regardless of which option above you chose:

```bash
npm install @parity/product-sdk-descriptors
```

The descriptors package exposes typed `ChainDefinition` objects through subpath imports (for example, `@parity/product-sdk-descriptors/paseo-bulletin`). Each subpath corresponds to one chain.

## Connect Using a Preset

The Preset path is the fastest way to get a working client. `getChainAPI(env)` returns a client preconfigured with the descriptors and RPC endpoints for the requested environment.

```typescript
import { getChainAPI } from '@parity/product-sdk-chain-client';

const client = await getChainAPI('paseo');

const fee = await client.bulletin.query.TransactionStorage.ByteFee.getValue();
const blockNumber = await client.assetHub.query.System.Number.getValue();

client.destroy();
```

The returned client exposes one property per chain in the preset (`assetHub`, `bulletin`, `individuality`), each typed by the underlying [polkadot-api](https://papi.how) (PAPI) descriptor.

!!! warning "Not every environment is live"
    `getChainAPI` accepts the `Environment` values `polkadot`, `kusama`, `paseo`, `summit`, `local`, and `westend`. Only `paseo` and `summit` are wired up at the moment; calling an environment that is not yet live throws at runtime.

## Connect Using Custom Descriptors (BYOD)

When you need explicit control over which chains and descriptors your Product uses, use `createChainClient` and supply your own descriptors. This is called the **Bring Your Own Descriptors (BYOD)** path: you import the chain descriptor objects yourself instead of relying on the preset.

```typescript
import { createChainClient } from '@parity/product-sdk-chain-client';
import { paseo_asset_hub } from '@parity/product-sdk-descriptors/paseo-asset-hub';
import { paseo_bulletin } from '@parity/product-sdk-descriptors/paseo-bulletin';

const client = await createChainClient({
    chains: {
        assetHub: paseo_asset_hub,
        bulletin: paseo_bulletin,
    },
});

client.destroy();
```

The keys you choose in `chains` (`assetHub`, `bulletin`) become the property names on the returned client. Pick names that read naturally in your call sites; the rest of the SDK is fully typed against them. Connections are routed through the host at runtime, so you don't supply RPC endpoints yourself.

!!! tip "Using a different chain"
    To connect to a chain other than `paseo_bulletin`, find its descriptor in `@parity/product-sdk-descriptors`, then add it under a new key in `chains`. The client surface (`client.<yourKey>.query.*`) is automatically typed to match the descriptor you supplied.

## Read Storage and Constants

Once you have a client, every chain you connected exposes a typed PAPI surface under `.query`, `.constants`, and the rest of the PAPI shape. The pattern is:

```text
client.<chainName>.query.<Pallet>.<Item>.getValue(...args)
```

The following examples show common read operations. Each one maps directly to a pallet storage item and requires no transaction or signature.

??? code "Byte Fee"
    `TransactionStorage.ByteFee` returns the current cost per byte for on-chain storage on the Bulletin chain.

    ```typescript
    const fee = await client.bulletin.query.TransactionStorage.ByteFee.getValue();
    console.log(`${fee} planck/byte`);
    ```

??? code "Block Number"
    `System.Number` returns the current best block number for the chain.

    ```typescript
    const blockNumber = await client.assetHub.query.System.Number.getValue();
    ```

??? code "Account State"
    `System.Account` returns the full account record for an address, including nonce and balance buckets.

    ```typescript
    const address = '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY';

    const account = await client.assetHub.query.System.Account.getValue(address);
    const { nonce, data: { free, reserved, frozen } } = account;
    ```

## Read Multiple Chains in Parallel

Because each chain has its own connection internally, reads across chains are independent and can be issued in parallel with `Promise.all`.

```typescript
const [fee, blockNumber] = await Promise.all([
    client.bulletin.query.TransactionStorage.ByteFee.getValue(),
    client.assetHub.query.System.Number.getValue(),
]);
```

This is the recommended pattern whenever your Product needs to assemble a view from more than one storage item or chain.

## Access the Raw PAPI Client

For advanced flows that the typed surface does not cover, such as raw storage subscriptions, low-level block tracking, or building a `ContractRuntime` for pallet-revive, every chain on the client exposes the underlying `PolkadotClient` under `.raw`.

```typescript
// Subscribe to every new finalized block on the Bulletin chain
const subscription = client.raw.bulletin.finalizedBlock$.subscribe((block) => {
    console.log(`Finalized block #${block.number}: ${block.hash}`);
});

// Unsubscribe when done
subscription.unsubscribe();
```

Use the raw client only when you need to step outside the typed query/constants shape. Most reads should go through the typed surface above.

## Detect Whether You're Inside a Host

The SDK re-exports two helpers from `@parity/product-sdk-host` for detecting whether your Product is running inside a host container. Use these when behavior should branch, for example, showing a connection status indicator.

```typescript
import { isInsideContainer, isInsideContainerSync } from '@parity/product-sdk-chain-client';

const inContainer = await isInsideContainer();      // async, canonical
const inContainerSync = isInsideContainerSync();    // sync, for top-level guards
```

!!! note
    You generally do NOT need to branch on this. The client routes calls correctly when inside a host container; detection is for cases where your Product itself wants to adapt its UI or telemetry.

## Clean Up Connections

Each client owns one or more connections. Tear them down when your Product no longer needs them, typically on view unmount or process shutdown.

```typescript
import { destroyAll } from '@parity/product-sdk-chain-client';

// Close only the connections owned by this client
client.destroy();

// Global escape hatch: closes every connection the SDK has open
destroyAll();
```

Use `client.destroy()` for normal cleanup and reserve `destroyAll()` for full-process teardown.

## Limitations

- The `paseo` and `summit` environments are the only presets wired up today. Other `Environment` values throw at runtime.
- The package is ESM only; your Product's build pipeline must support ESM imports.
- Descriptors are imported by subpath (`@parity/product-sdk-descriptors/paseo-bulletin`), not from the package root. Bundlers that do not honor `exports` subpaths will fail to resolve them.
- The SDK runs exclusively inside a host container. There is no direct WebSocket fallback outside of one.
- Reactive subscriptions (watching a storage item over time) are not covered on this page. A dedicated page on subscriptions will follow.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Sign and Submit Transactions**

    ---

    Your Product can read the chain; next, let it act on the user's behalf, with every approval on their phone.

    [:octicons-arrow-right-24: Sign and Submit Transactions](/apps/build/sign-and-submit/)

-   <span class="badge external">External</span> **polkadot-api Docs**

    ---

    Reference for the typed PAPI surface that `@parity/product-sdk-chain-client` exposes per chain.

    [:octicons-arrow-right-24: Visit Site](https://papi.how)

-   <span class="badge external">External</span> **product-sdk API Reference**

    ---

    The full `product-sdk` surface beyond this recipe: every package, class, and method.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/){target=\_blank}

</div>
