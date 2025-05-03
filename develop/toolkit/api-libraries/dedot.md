---
title: Dedot
description: Dedot is a next-generation JavaScript client for Polkadot and Polkadot SDK-based blockchains, offering lightweight, tree-shakable APIs with strong TypeScript support.
---

# Dedot

## Introduction

[Dedot](https://github.com/dedotdev/dedot){target=\_blank} is a next-generation JavaScript client for Polkadot and Polkadot SDK-based blockchains. Designed to elevate the dapp development experience, Dedot is built and optimized to be lightweight and tree-shakable, offering precise Types & APIs suggestions for individual Polkadot SDK-based blockchains and [ink! Smart Contracts](https://use.ink/).

### Key Features

-	**Lightweight and Tree-Shakable** – No more bn.js or WebAssembly blobs, optimized for dapps bundle size.

-	**Fully Typed API** – Comprehensive TypeScript support for seamless on-chain interaction and ink! Smart Contract integration.

-	**Multi-Version JSON-RPC Support** – Compatible with both [legacy](https://github.com/w3f/PSPs/blob/master/PSPs/drafts/psp-6.md) and [new](https://paritytech.github.io/json-rpc-interface-spec/introduction.html) JSON-RPC APIs for broad ecosystem interoperability.

-	**Light Client Supports** – Designed to work with light clients such as [Smoldot](https://github.com/smol-dot/smoldot).

-	**Native TypeScript for Scale Codec** – Implements Scale codec parsing directly in TypeScript without relying on custom wrappers.

-	**Wallet Integration** – Works out-of-the-box with [@polkadot/extension-based](https://github.com/polkadot-js/extension?tab=readme-ov-file#api-interface) wallets

-	**Familiar API Design** – Similar API style with Polkadot.js for easy & fast migration.

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

To enable auto-completion/IntelliSense for individual chains, install the `@dedot/chaintypes` package as a development dependency:

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

To start connect & interact with networks, Dedot provides two client options depending on your needs:

- **[DedotClient](https://docs.dedot.dev/clients-and-providers/clients#dedotclient)**: Interacts with chains via the [new JSON-RPC APIs](https://paritytech.github.io/json-rpc-interface-spec/introduction.html)
- **[LegacyClient](https://docs.dedot.dev/clients-and-providers/clients#legacyclient)**: Interacts with chains via the [legacy JSON-RPC APIs](https://github.com/w3f/PSPs/blob/master/PSPs/drafts/psp-6.md)

Let's connect to Polkadot network using `DedotClient`:

=== "WebSocket"

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

We recommend specifying the `ChainApi` interface (e.g: `PolkadotApi` in the example above) of the chain that you want to interact with. This enable Types & APIs suggestion/autocompletion for that particular chain (via IntelliSense). If you don't specify a `ChainApi` interface, a default `SubstrateApi` interface will be used.

```typescript
import { DedotClient, WsProvider } from 'dedot';
import type { PolkadotApi, KusamaApi } from '@dedot/chaintypes';

const polkadotClient = await DedotClient.new<PolkadotApi>(new WsProvider('wss://rpc.polkadot.io'));
const kusamaClient = await DedotClient.new<KusamaApi>(new WsProvider('wss://kusama-rpc.polkadot.io'));
const genericClient = await DedotClient.new(new WsProvider('ws://localhost:9944'));
```

If you don't find the ChainApi for the network that you're working with in [the list](https://github.com/dedotdev/chaintypes?tab=readme-ov-file#supported-networks), you can generate the ChainApi (Types & APIs) for it using the built-in [dedot cli](https://docs.dedot.dev/cli).

```bash
# Generate ChainApi interface for Polkadot network via rpc endpoint: wss://rpc.polkadot.io
npx dedot chaintypes -w wss://rpc.polkadot.io
```

Or open a pull request to add your favorite network to the [`@dedot/chaintypes`](https://github.com/dedotdev/chaintypes) repo.

### Reading On-Chain Data

Dedot provides several ways to read data from the chain:

- **Access runtime constants**:

```typescript
const ss58Prefix = client.consts.system.ss58Prefix;
console.log('Polkadot ss58Prefix:', ss58Prefix);
```

- **Storage queries**:

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

- **Call Runtime APIs**:

```typescript
const metadata = await client.call.metadata.metadataAtVersion(15);
console.log('Metadata V15', metadata)
```

- **Watching on-chain events**:
  
```typescript
const unsub = await client.events.system.NewAccount.watch((events) => {
  console.log('New Account Created', events)
})
```

### Sign & Sending Transactions

Sign the transaction using `IKeyringPair` from Keyring ([`@polkadot/keyring`](https://polkadot.js.org/docs/keyring/start/sign-verify)) and send the transaction.

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

You can also use `Signer` from wallet extensions:

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

For more detailed information about Dedot, check the [official documentation](https://dedot.dev/){target=\_blank}.
