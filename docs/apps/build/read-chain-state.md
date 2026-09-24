---
title: Read On-Chain Data
description: Connect a Polkadot Product to one or more chains and read storage, constants, and account state using the @parity/product-sdk-chain-client package.
categories: Apps
page_badges:
  tutorial_badge: Beginner
---

# Read On-Chain Data

## Introduction

This guide covers the `@parity/product-sdk-chain-client` package, which gives your Product a typed, host-aware client for reading on-chain state (account balances, storage items, and runtime constants) from inside a Polkadot host container. The SDK ships two connection paths: a zero-config Preset path (`getChainAPI`) and a Bring Your Own Descriptors (BYOD) path (`createChainClient`) for explicit descriptor control. Both produce the same client shape.

## Prerequisites

Before starting, ensure you have:

- A Polkadot Product project running locally (see [Set Up Your Project](/apps/build/#set-up-your-project)) with a TypeScript toolchain
- Node.js 20 or later with ESM support (`@parity/product-sdk-chain-client` is ESM only)
- [Polkadot Desktop](/reference/apps/hosts/polkadot-desktop/) to run your Product inside a host container (see [Install Desktop and Pair](/apps/get-started/))

!!! note
    You do not need funded accounts to read chain state. Reads are unsigned and require only a running host container.

## Install the SDK

--8<-- 'text/apps/install-packages.md'

- **Umbrella package**: The whole SDK in one dependency.

    ```bash
    npm install @parity/product-sdk
    ```

- **Individual package**: Only the chain client.

    ```bash
    npm install @parity/product-sdk-chain-client
    ```

The import specifiers differ between the two. The snippets in this guide use the standalone specifier `@parity/product-sdk-chain-client`; on the umbrella, the same exports come from the `@parity/product-sdk/chain` subpath, which keeps the older name. `createChainClient` is also re-exported from the umbrella root, but `getChainAPI` and `destroyAll` are not.

If you plan to use the BYOD path, also install the descriptors package regardless of which option above you chose:

```bash
npm install @parity/product-sdk-descriptors
```

The descriptors package exposes typed `ChainDefinition` objects through subpath imports (for example, `@parity/product-sdk-descriptors/paseo-bulletin`). Each subpath corresponds to one chain.

## Connect to a Chain

The SDK provides two connection paths. The Preset path (`getChainAPI`) is the fastest way to get a working client — it comes preconfigured with the descriptors for supported environments. Use the BYOD path (`createChainClient`) when you need explicit control over which chains and descriptors your Product uses. Neither path takes RPC endpoints: the Host resolves the connection from each descriptor's genesis hash.

### Connect Using a Preset

`getChainAPI()` returns a client preconfigured with the descriptors for the environment the Host is on. Host discovery runs first on every call: the SDK reads the Host's chains and matches the asset hub's genesis hash against its bundled descriptors, so the no-argument call is the one that lets the Host select the network.

```typescript
import { getChainAPI } from '@parity/product-sdk-chain-client';

// No argument: the Host selects the network, matched by genesis hash.
// Pass one — getChainAPI('paseo') — to fail loudly if the Host is elsewhere.
const client = await getChainAPI();

const fee = await client.bulletin.query.TransactionStorage.ByteFee.getValue();
const blockNumber = await client.assetHub.query.System.Number.getValue();

client.destroy();
```

The argument is optional, and it acts as an assertion rather than a request. When the Host reports an environment that disagrees with the one you named, the call throws `EnvironmentMismatchError` instead of connecting to the environment you asked for. Pass one to pin your Product to a single environment, or when the Host reports no usable network and discovery has nothing to match against.

The returned client exposes one property per chain in the preset (`assetHub`, `bulletin`, `individuality`), each typed by the underlying [polkadot-api](https://papi.how) (PAPI) descriptor.

!!! warning "Not every environment is live"
    The `Environment` union is `polkadot`, `kusama`, `paseo`, `previewnet`, and `devnet`. Anything else is a compile error. Of those five, `paseo`, `previewnet`, and `devnet` have all three chains live; `polkadot` and `kusama` are reserved, and `getChainAPI` throws `Chain API for "<env>" is not yet available` for both.

### Connect Using Custom Descriptors (BYOD)

Use `createChainClient` to supply your own descriptors, importing the chain descriptor objects you need directly instead of relying on a preset. `ChainClientConfig` accepts a single field, `chains`.

```typescript
import { createChainClient } from '@parity/product-sdk-chain-client';
import {
  paseo_asset_hub,
} from '@parity/product-sdk-descriptors/paseo-asset-hub';
import {
  paseo_bulletin,
} from '@parity/product-sdk-descriptors/paseo-bulletin';

const client = await createChainClient({
  chains: {
    assetHub: paseo_asset_hub,
    bulletin: paseo_bulletin,
  },
});

client.destroy();
```

The keys you choose in `chains` (`assetHub`, `bulletin`) become the property names on the returned client. Pick names that read naturally in your call sites; the rest of the SDK is fully typed against them. Connections are routed through the Host at runtime, so there is no endpoint field to set.

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
    const {
      nonce,
      data: { free, reserved, frozen },
    } = account;
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

## Detect Whether You Are Inside a Host

The SDK re-exports two helpers from `@parity/product-sdk-host` for detecting whether your Product is running inside a host container. Use these when behavior should branch, for example, showing a connection status indicator.

```typescript
import {
  isInsideContainer,
  isInsideContainerSync,
} from '@parity/product-sdk-chain-client';

const inContainer = await isInsideContainer(); // async, canonical
const inContainerSync = isInsideContainerSync(); // sync, for top-level guards
```

!!! note
    You generally do not need to branch on this. The client routes calls correctly when inside a host container; detection is for cases where your Product itself wants to adapt its UI or telemetry.

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

- The `paseo`, `previewnet`, and `devnet` environments are the presets with all three chains live. `polkadot` and `kusama` are reserved and throw at runtime.
- The package is ESM only; your Product's build pipeline must support ESM imports.
- Descriptors are imported by subpath (`@parity/product-sdk-descriptors/paseo-bulletin`), not from the package root. Bundlers that do not honor `exports` subpaths will fail to resolve them.
- Host-routed reads require a host container; there is no direct-WebSocket fallback, so outside a Host the client [throws](/apps/troubleshooting/#connecting-to-a-chain-throws-outside-a-host). For out-of-Host development, use the SDK's testing fakes.
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

-   <span class="badge external">External</span> **Product SDK API Reference**

    ---

    The full `product-sdk` surface beyond this recipe: every package, class, and method.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/)

</div>
