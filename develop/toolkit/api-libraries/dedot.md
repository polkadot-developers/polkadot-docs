---
title: Dedot
description: Dedot is a next-generation JavaScript client for Polkadot and Substrate-based blockchains, offering lightweight, tree-shakable APIs with strong TypeScript support.
---

# Dedot

## Introduction

[Dedot](https://github.com/dedotdev/dedot){target=\_blank} is a next-generation JavaScript client for Polkadot and Substrate-based blockchains. Designed to elevate the dapp development experience, Dedot is built and optimized to be lightweight and tree-shakable, offering precise Types & APIs suggestions for individual Substrate-based blockchains and ink! Smart Contracts.

### Key Features

- **Small bundle size and tree-shakable** - eliminates the need for `bn.js` or wasm blob, reducing application size
- **Fully-typed APIs** - provides strong TypeScript support for on-chain interactions and ink! smart contracts
- **Support for multiple JSON-RPC API versions** - built on top of both the new and legacy JSON-RPC APIs
- **Light client support** - compatible with light clients like smoldot
- **Native TypeScript type system** - uses native TypeScript for scale-codec instead of custom wrappers
- **Wallet compatibility** - works with `@polkadot/extension`-based wallets (SubWallet, Talisman, etc.)
- **Similar API style to Polkadot.js** - enables easy and fast migration from existing code

## Installation

To add Dedot to your project, use the following command:

=== "npm"
    ```bash
    npm i dedot
    ```

=== "pnpm"
    ```bash
    pnpm add dedot
    ```

=== "yarn"
    ```bash
    yarn add dedot
    ```

For TypeScript auto-completion and IntelliSense, install the chain types package as a development dependency:

=== "npm"
    ```bash
    npm i -D @dedot/chaintypes
    ```

=== "pnpm"
    ```bash
    pnpm add -D @dedot/chaintypes
    ```

=== "yarn"
    ```bash
    yarn add -D @dedot/chaintypes
    ```

## Get Started

### Initialize a client instance to connect to the networks

To start working with a Polkadot SDK-based chain, first create a new client to connect to the network. Dedot provides two client options depending on your needs:

- **DedotClient**: Interacts with chains via the [new JSON-RPC APIs](https://paritytech.github.io/json-rpc-interface-spec/introduction.html)
- **LegacyClient**: Interacts with chains via the [legacy JSON-RPC APIs](https://github.com/w3f/PSPs/blob/master/PSPs/drafts/psp-6.md)

=== "WebSocket Connection"

    ```typescript
    import { DedotClient, WsProvider } from 'dedot';
    import type { PolkadotApi } from '@dedot/chaintypes';
    
    // Initialize providers & clients
    const provider = new WsProvider('wss://rpc.polkadot.io');
    const client = await DedotClient.new<PolkadotApi>(provider);
    ```

=== "Light Client (Smoldot)"

    ```typescript
    import { DedotClient, SmoldotProvider } from 'dedot';
    import type { PolkadotApi } from '@dedot/chaintypes';
    import * as smoldot from 'smoldot';
    
    // import `polkadot` chain spec to connect to Polkadot
    import { polkadot } from '@substrate/connect-known-chains'
    
    // Start smoldot instance & initialize a chain
    const client = smoldot.start();
    const chain = await client.addChain({ chainSpec: polkadot });
    
    // Initialize providers & clients
    const provider = new SmoldotProvider(chain);
    const client = await DedotClient.new<PolkadotApi>(provider);
    ```

If the node doesn't support new JSON-RPC APIs yet, you can connect to the network using the `LegacyClient` which build on top of the legacy JSON-RPC APIs.

```typescript
import { LegacyClient, WsProvider } from 'dedot';
import type { PolkadotApi } from '@dedot/chaintypes';

const provider = new WsProvider('wss://rpc.polkadot.io');
const client = await LegacyClient.new<PolkadotApi>(provider);
```

### Pick `ChainApi` interface for the network you're working with

We recommend specifying the `ChainApi` interface (e.g: `PolkadotApi` in the example above) of the chain that you want to interact with. This enable Types & APIs suggestion/autocompletion for that particular chain (via IntelliSense). If you don't specify a `ChainApi` interface, the default `SubstrateApi` interface will be used.

```typescript
import { DedotClient, WsProvider } from 'dedot';
import type { PolkadotApi, KusamaApi } from '@dedot/chaintypes';

const polkadotClient = await DedotClient.new<PolkadotApi>(new WsProvider('wss://rpc.polkadot.io'));
const kusamaClient = await DedotClient.new<KusamaApi>(new WsProvider('wss://kusama-rpc.polkadot.io'));
const genericClient = await DedotClient.new(new WsProvider('ws://localhost:9944'));
```

If you don't find the ChainApi for the network that you're working with in [the list](https://github.com/dedotdev/chaintypes?tab=readme-ov-file#supported-networks), you generate the ChainApi (Types & APIs) for it using dedot cli.

```bash
# Generate ChainApi interface for Polkadot network via rpc endpoint: wss://rpc.polkadot.io
npx dedot chaintypes -w wss://rpc.polkadot.io
```

Or open a pull request to add your favorite Substrate-based network to the `@dedot/chaintypes` repo.

### Reading Chain Data

Dedot provides several ways to read data from the chain:

- **Constants** - access fixed values in the runtime:

    ```typescript
    const ss58Prefix = client.consts.system.ss58Prefix;
    console.log('Polkadot ss58Prefix:', ss58Prefix);
    ```

- **Storage queries** - retrieve current chain state:

    ```typescript
    const balance = await client.query.system.account(<address>);
    console.log('Balance:', balance.data.free);
    ```

- **Subscribe to storage changes**:

    ```typescript
    const unsub = await client.query.system.number((blockNumber) => {
      console.log(`Current block number: ${blockNumber}`);
    });
    ```

### Sending Transactions

To send a transaction, you need a funded account with sufficient balance:

```typescript
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

// Setup keyring
await cryptoWaitReady();
const keyring = new Keyring({ type: 'sr25519' });
const alice = keyring.addFromUri('//Alice');

// Send transaction
const unsub = await client.tx.balances
    .transferKeepAlive(<destAddress>, 2_000_000_000_000n)
    .signAndSend(alice, async ({ status }) => {
      console.log('Transaction status', status.type);
      if (status.type === 'BestChainBlockIncluded') {
        console.log(`Transaction is included in best block`);
      }

      if (status.type === 'Finalized') {
        console.log(`Transaction completed at block hash ${status.value.blockHash}`);
        await unsub();
      }
    });
```

You can also use Signer from wallet extensions:

```typescript
const injected = await window.injectedWeb3['polkadot-js'].enable('My dApp');
const account = (await injected.accounts.get())[0];
const signer = injected.signer;

const unsub = await client.tx.balances
    .transferKeepAlive(<destAddress>, 2_000_000_000_000n)
    .signAndSend(account.address, { signer }, async ({ status }) => {
      console.log('Transaction status', status.type);
      if (status.type === 'BestChainBlockIncluded') {
        console.log(`Transaction is included in best block`);
      }

      if (status.type === 'Finalized') {
        console.log(`Transaction completed at block hash ${status.value.blockHash}`);
        await unsub();
      }
    });
```

## Where to Go Next

For more detailed information about Dedot, check the [official documentation](https://docs.dedot.dev/){target=\_blank}.
