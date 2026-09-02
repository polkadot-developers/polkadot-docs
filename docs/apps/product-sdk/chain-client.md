---
title: Chain Client
description: Overview of the Product SDK chain-client package — a typed, host-routed Polkadot API client for reading chain state and building extrinsics.
categories: Apps
---

# Chain Client

## Introduction

[`@parity/product-sdk-chain-client`](https://paritytech.github.io/product-sdk/api/chain-client/) is the connection layer of the Product SDK. It gives your Product a typed [PAPI](https://papi.how) client for reading state and building extrinsics across the Polkadot ecosystem chains a Product uses (Asset Hub, the Bulletin Chain, and Individuality), and it routes every connection through the Host rather than opening a WebSocket itself.

Because the Host owns the connection, your Product never picks an RPC endpoint or manages reconnection. You ask for a chain by name or by descriptor, and the client hands back a fully typed API.

## When to Use It

- Whenever your Product needs to read on-chain storage, constants, or account state, or to build a transaction to submit later.
- Use `getChainAPI` for the zero-config path: pass an environment name and get the preset chains back with no descriptor imports.
- Use `createChainClient` when you want to bring your own descriptors: a custom chain, a pre-release runtime, or only a subset of chains.
- Do not reach for it to submit or sign; pair it with [Signer](/apps/product-sdk/signer/) and [Transactions](/apps/product-sdk/tx/) for that. There is no direct-WebSocket fallback, so it requires a Host.

## Core Concepts

- **`getChainAPI(env)`**: The zero-config factory. Pass `'paseo'` (or `'devnet'`) and it lazy-loads the descriptors and returns a client with fixed `assetHub`, `bulletin`, and `individuality` keys.
- **`createChainClient(config)`**: The bring-your-own-descriptors factory. You pass a `chains` map of names to descriptors, and each becomes a typed API on the returned client.
- **`ChainClient`**: The returned object. Each configured key is a typed PAPI `TypedApi`; `.raw` exposes the underlying `PolkadotClient` per chain for advanced use; and `.destroy()` tears down the connections.
- **Connection caching**: Clients are cached by a genesis-hash fingerprint of their chain set. Two calls with the same descriptors share one instance, so you do not accumulate duplicate connections.
- **Graceful degradation**: A chain the Host cannot serve does not break the whole client. The supported chains stay usable, and any access to the unsupported one throws a `ChainNotSupportedError` instead of hanging.

## Read Chain State With a Preset

The fastest path is `getChainAPI`. Connect to Paseo and read an account and a constant, then release the connection:

```typescript
import { getChainAPI } from '@parity/product-sdk-chain-client';

const client = await getChainAPI('paseo');

const account = await client.assetHub.query.System.Account.getValue(address);
const byteFee = await client.bulletin.query.TransactionStorage.ByteFee.getValue();

client.destroy();
```

## Bring Your Own Descriptor

When you need a specific chain or a smaller client, pass descriptors directly. `isConnected` is a synchronous, side-effect-free check:

```typescript
import {
  createChainClient,
  isConnected,
} from '@parity/product-sdk-chain-client';
import { paseo_asset_hub } from '@parity/product-sdk-descriptors/paseo-asset-hub';

const client = await createChainClient({ chains: { assetHub: paseo_asset_hub } });

const blockNumber = await client.assetHub.query.System.Number.getValue();
console.log(isConnected(paseo_asset_hub)); // true

client.destroy();
```

## Limitations

- The client is Host-only; it throws if no Host provider is available and there is no standalone fallback.
- The `polkadot` and `kusama` environments are not live yet and throw when requested; use `paseo` or `devnet`.
- Descriptors are per-environment. A `paseo` descriptor and a `devnet` descriptor have different genesis hashes and are not interchangeable.
- Call `.destroy()` (or `destroyAll()`) to release cached connections when a client is no longer needed.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Read On-Chain Data**

    ---

    The task-focused recipe: set up the client and read balances and storage step by step.

    [:octicons-arrow-right-24: Read On-Chain Data](/apps/build/read-chain-state/)

-   <span class="badge learn">Learn</span> **Signer**

    ---

    Get an account and a signer to pair with the client when you need to submit, not just read.

    [:octicons-arrow-right-24: Signer](/apps/product-sdk/signer/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `chain-client` surface: `getChainAPI`, `createChainClient`, and every type.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/chain-client/)

</div>
