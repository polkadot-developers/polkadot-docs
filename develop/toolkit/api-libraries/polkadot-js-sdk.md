---
title: Polkadot.js SDK
description: Interact with Polkadot SDK-based chains easily using the Polkadot.js SDK. Query chain data, submit transactions, and more via JavaScript.
---

# Polkadot.js SDK

## Introduction

The Polkadot.js SDK lets you interact with Polkadot and Polkadot-SDK based chains using JavaScript. You can query nodes, read chain state, and submit transactions through a dynamic, auto-generated API interface.

### Dynamic API Generation

Unlike traditional static APIs, the Polkadot.js API generates its interfaces automatically when connecting to a node. Here's what happens when you connect:

1. The API connects to your node
2. It retrieves the chain's metadata
3. Based on this metadata, it creates specific endpoints in the format: `api.<type>.<module>.<section>`

### Available API Categories

You can access three main categories of chain interactions:

1. **Constants** (`api.consts`)
    - Access runtime constants directly
    - Example: `api.consts.balances.existentialDeposit`
    - Returns values immediately without function calls

2.  **Queries** (`api.query`)
    - Read chain state
    - Example: `api.query.system.account(accountId)`

3. **Transactions** (`api.tx`)
    - Submit extrinsics (transactions)
    - Example: `api.tx.balances.transfer(accountId, value)`

The available methods and interfaces will automatically reflect what's possible on your connected chain.

## Installation

To add the Polkadot.js SDK to your JavaScript project:

```bash
yarn add @polkadot/api
```

This command installs the latest stable release, which supports any Polkadot-SDK based chain

## Get Started

### Creating an API Instance

To interact with a Polkadot SDK-based chain, you first need to establish a connection through an API instance. The API provides methods for querying chain state, sending transactions, and subscribing to updates.

To create an API connection:

```js
import { ApiPromise, WsProvider } from '@polkadot/api';

// Create a WebSocket provider
const wsProvider = new WsProvider('wss://rpc.polkadot.io');

// Initialize the API
const api = await ApiPromise.create({ provider: wsProvider });

// Verify connection by getting the chain's genesis hash
console.log('Genesis Hash:', api.genesisHash.toHex());
```

!!!note
    All `await` operations must be wrapped in an async function or block since the API uses promises for asynchronous operations.

### Reading Chain Data

The API provides several ways to read data from the chain. You can access:

- Constants - values that are fixed in the runtime and don't change without a runtime upgrade

    ```js
    // Get the minimum balance required for a new account
    const minBalance = api.consts.balances.existentialDeposit.toNumber();
    console.log('Minimum Balance:', minBalance);
    ```

- State - current chain state that updates with each block

    ```js
    // Example address
    const ADDRESS = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE';

    // Get current timestamp
    const timestamp = await api.query.timestamp.now();

    // Get account information
    const { nonce, data: balance } = await api.query.system.account(ADDRESS);

    console.log(`
    Timestamp: ${timestamp}
    Free Balance: ${balance.free}
    Nonce: ${nonce}
    `);
    ```

### Sending Transactions

To send a transaction, you need a funded account with a keypair. Here's how to make a transfer:

Transactions (also called extrinsics) modify the chain state. Before sending a transaction, you need:

- A funded account with sufficient balance to pay transaction fees
- The account's keypair for signing

To make a transfer:

```js
// Assuming you have an `alice` keypair from the Keyring
const RECIPIENT = 'RECIPIENT_ADDRESS';
const AMOUNT = 12345; // Amount in smallest unit (e.g., Planck for DOT)

// Sign and send a transfer
const txHash = await api.tx.balances
  .transfer(RECIPIENT, AMOUNT)
  .signAndSend(alice);

console.log('Transaction Hash:', txHash);
```

!!!note
    The `alice` keypair in the example comes from a Keyring object. See the [Keyring documentation](https://polkadot.js.org/docs/keyring){target=\_blank} for details on managing keypairs.

## Next Steps

For more detailed information about the Polkadot.js SDK, check the [official documentation](https://polkadot.js.org/docs/){target=\_blank}.