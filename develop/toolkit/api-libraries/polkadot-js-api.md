---
title: Polkadot.js API
description: Interact with Polkadot SDK-based chains easily using the Polkadot.js API. Query chain data, submit transactions, and more via JavaScript or Typescript.
---

# Polkadot.js API

## Introduction

The [Polkadot.js API](https://github.com/polkadot-js/api){target=\_blank} uses JavaScript/TypeScript to interact with Polkadot SDK-based chains. It allows you to query nodes, read chain state, and submit transactions through a dynamic, auto-generated API interface.

### Dynamic API Generation

Unlike traditional static APIs, the Polkadot.js API generates its interfaces automatically when connecting to a node. Here's what happens when you connect:

1. The API connects to your node
2. It retrieves the chain's metadata
3. Based on this metadata, it creates specific endpoints in this format: `api.<type>.<module>.<section>`

### Available API Categories

You can access three main categories of chain interactions:

- **[Runtime constants](https://polkadot.js.org/docs/api/start/api.consts){target=\_blank}** (`api.consts`)
    - Access runtime constants directly
    - Returns values immediately without function calls
    - Example - `api.consts.balances.existentialDeposit`

- **[State queries](https://polkadot.js.org/docs/api/start/api.query/){target=\_blank}** (`api.query`)
    - Read chain state
    - Example - `api.query.system.account(accountId)`

- **[Transactions](https://polkadot.js.org/docs/api/start/api.tx/){target=\_blank}** (`api.tx`)
    - Submit extrinsics (transactions)
    - Example - `api.tx.balances.transfer(accountId, value)`

The available methods and interfaces will automatically reflect what's possible on your connected chain.

## Installation

To add the Polkadot.js API to your project, use the following command to install the latest stable release which supports any Polkadot SDK-based chain:

=== "npm"
    ```bash
    npm i @polkadot/api
    ```

=== "pnpm"
    ```bash
    pnpm add @polkadot/api
    ```

=== "yarn"
    ```bash
    yarn add @polkadot/api
    ```

For more detailed information about installation, see the [Installation](https://polkadot.js.org/docs/api/start/install/){target=\_blank} section in the official Polkadot.js API documentation.

## Get Started

### Creating an API Instance

To interact with a Polkadot SDK-based chain, you must establish a connection through an API instance. The API provides methods for querying chain state, sending transactions, and subscribing to updates.

To create an API connection:

```js
--8<-- 'code/develop/toolkit/api-libraries/polkadot-js-sdk/api-instance.js'
```

!!!warning
    All `await` operations must be wrapped in an async function or block since the API uses promises for asynchronous operations.

### Reading Chain Data

The API provides several ways to read data from the chain. You can access:

- **Constants** - values that are fixed in the runtime and don't change without a runtime upgrade

    ```js
    --8<-- 'code/develop/toolkit/api-libraries/polkadot-js-sdk/read-constants.js'
    ```

- **State** - current chain state that updates with each block

    ```js
    --8<-- 'code/develop/toolkit/api-libraries/polkadot-js-sdk/read-state.js'
    ```

### Sending Transactions

Transactions (also called extrinsics) modify the chain state. Before sending a transaction, you need:

- A funded account with sufficient balance to pay transaction fees
- The account's keypair for signing

To make a transfer:

```js
--8<-- 'code/develop/toolkit/api-libraries/polkadot-js-sdk/send-txs.js'
```

The `alice` keypair in the example comes from a `Keyring` object. For more details about managing keypairs, see the [Keyring documentation](https://polkadot.js.org/docs/keyring){target=\_blank}.

## Where to Go Next

For more detailed information about the Polkadot.js API, check the [official documentation](https://polkadot.js.org/docs/){target=\_blank}.