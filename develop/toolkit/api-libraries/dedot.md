---
title: Dedot
description: Dedot is a next-gen JavaScript client for Polkadot and Polkadot SDK-based blockchains, offering lightweight, tree-shakable APIs with strong TypeScript support.
categories: Tooling, Dapps
---

# Dedot

## Introduction

[Dedot](https://github.com/dedotdev/dedot){target=\_blank} is a next-generation JavaScript client for Polkadot and Polkadot SDK-based blockchains. Designed to elevate the dApp development experience, Dedot is built and optimized to be lightweight and tree-shakable, offering precise types and APIs suggestions for individual Polkadot SDK-based blockchains and [ink! smart contracts](https://use.ink/){target=\_blank}.

### Key Features

- **Lightweight and tree-shakable** – no more bn.js or WebAssembly blobs, optimized for dapps bundle size

- **Fully typed API** – comprehensive TypeScript support for seamless on-chain interaction and ink! smart contract integration

- **Multi-version JSON-RPC support** – compatible with both [legacy](https://github.com/w3f/PSPs/blob/master/PSPs/drafts/psp-6.md){target=\_blank} and [new](https://paritytech.github.io/json-rpc-interface-spec/introduction.html){target=\_blank} JSON-RPC APIs for broad ecosystem interoperability

- **Light client support** – designed to work with light clients such as [Smoldot](https://github.com/smol-dot/smoldot){target=\_blank}

- **Native TypeScript for scale codec** – implements scale codec parsing directly in TypeScript without relying on custom wrappers

- **Wallet integration** – works out-of-the-box with [@polkadot/extension-based](https://github.com/polkadot-js/extension?tab=readme-ov-file#api-interface){target=\_blank} wallets

- **Familiar API design** – similar API style to Polkadot.js for easy and fast migration

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

To enable auto-completion/IntelliSense for individual chains, install the [`@dedot/chaintypes`](https://www.npmjs.com/package/@dedot/chaintypes){target=\_blank} package as a development dependency:

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

### Initialize a Client Instance

To connect to and interact with different networks, Dedot provides two client options depending on your needs:

- **[`DedotClient`](https://docs.dedot.dev/clients-and-providers/clients#dedotclient){target=\_blank}** - interacts with chains via the [new JSON-RPC APIs](https://paritytech.github.io/json-rpc-interface-spec/introduction.html){target=\_blank}
- **[`LegacyClient`](https://docs.dedot.dev/clients-and-providers/clients#legacyclient){target=\_blank}** - interacts with chains via the [legacy JSON-RPC APIs](https://github.com/w3f/PSPs/blob/master/PSPs/drafts/psp-6.md){target=\_blank}

Use the following snippets to connect to Polkadot using `DedotClient`:

=== "WebSocket"

    ```typescript
    --8<-- "code/develop/toolkit/api-libraries/dedot/client-initialization-via-ws.ts"
    ```

=== "Light Client (Smoldot)"

    ```typescript
    --8<-- "code/develop/toolkit/api-libraries/dedot/client-initialization-via-smoldot.ts"
    ```

If the node doesn't support new JSON-RPC APIs yet, you can connect to the network using the `LegacyClient`, which is built on top of the legacy JSON-RPC APIs.

```typescript
--8<-- "code/develop/toolkit/api-libraries/dedot/legacy-client-initialization.ts"
```

### Enable Type and API Suggestions

It is recommended to specify the `ChainApi` interface (e.g., `PolkadotApi` in the example in the previous section) of the chain you want to interact with. This enables type and API suggestions/autocompletion for that particular chain (via IntelliSense). If you don't specify a `ChainApi` interface, a default `SubstrateApi` interface will be used.

```typescript
--8<-- "code/develop/toolkit/api-libraries/dedot/pick-chainapi-interface.ts"
```

If you don't find the `ChainApi` for the network you're working with in [the list](https://github.com/dedotdev/chaintypes?tab=readme-ov-file#supported-networks){target=\_blank}, you can generate the `ChainApi` (types and APIs) using the built-in [`dedot` cli](https://docs.dedot.dev/cli){target=\_blank}.

```bash
# Generate ChainApi interface for Polkadot network via rpc endpoint: wss://rpc.polkadot.io
npx dedot chaintypes -w wss://rpc.polkadot.io
```

Or open a pull request to add your favorite network to the [`@dedot/chaintypes`](https://github.com/dedotdev/chaintypes){target=\_blank} repo.

### Read On-Chain Data

Dedot provides several ways to read data from the chain:

- **Access runtime constants** - use the syntax `client.consts.<pallet>.<constantName>` to inspect runtime constants (parameter types):

    ```typescript
    --8<-- "code/develop/toolkit/api-libraries/dedot/runtime-constants.ts"
    ```

- **Storage queries** - use the syntax `client.query.<pallet>.<storgeEntry>` to query on-chain storage:

    ```typescript
    --8<-- "code/develop/toolkit/api-libraries/dedot/storage-queries.ts"
    ```

- **Subscribe to storage changes**:

    ```typescript
    --8<-- "code/develop/toolkit/api-libraries/dedot/subscribe-storage-changes.ts"
    ```

- **Call Runtime APIs** - use the syntax `client.call.<runtimeApi>.<methodName>` to execute Runtime APIs:

    ```typescript
    --8<-- "code/develop/toolkit/api-libraries/dedot/call-runtime-apis.ts"
    ```

- **Watch on-chain events** - use the syntax `client.events.<pallet>.<eventName>` to access pallet events:
    
    ```typescript
    --8<-- "code/develop/toolkit/api-libraries/dedot/watch-on-chain-events.ts"
    ```

### Sign and Send Transactions

Sign the transaction using `IKeyringPair` from Keyring ([`@polkadot/keyring`](https://polkadot.js.org/docs/keyring/start/sign-verify/){target=\_blank}) and send the transaction.

```typescript
--8<-- "code/develop/toolkit/api-libraries/dedot/sign-and-send-tx-with-keyring.ts"
```

You can also use `Signer` from wallet extensions:

```typescript
--8<-- "code/develop/toolkit/api-libraries/dedot/sign-and-send-tx-with-extension-signer.ts"
```

## Where to Go Next

For more detailed information about Dedot, check the [official documentation](https://dedot.dev/){target=\_blank}.
