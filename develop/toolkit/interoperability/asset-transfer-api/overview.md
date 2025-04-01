---
title: Asset Transfer API
description: Asset Transfer API is a library that simplifies the transfer of assets for Polkadot SDK-based chains. It provides methods for cross-chain and local transfers.
---

# Asset Transfer API

## Introduction

[Asset Transfer API](https://github.com/paritytech/asset-transfer-api){target=\_blank}, a tool developed and maintained by [Parity](https://www.parity.io/){target=\_blank}, is a specialized library designed to streamline asset transfers for Polkadot SDK-based blockchains. This API provides a simplified set of methods for users to:

- Execute asset transfers to other parachains or locally within the same chain
- Facilitate transactions involving system parachains like Asset Hub (Polkadot and Kusama)

Using this API, developers can manage asset transfers more efficiently, reducing the complexity of cross-chain transactions and enabling smoother operations within the ecosystem.

For additional support and information, please reach out through [GitHub Issues](https://github.com/paritytech/asset-transfer-api/issues){target=\_blank}.

## Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/en/){target=\_blank} (recommended version 21 or greater)
- Package manager - [npm](https://www.npmjs.com/){target=\_blank} should be installed with Node.js by default. Alternatively, you can use other package managers like [Yarn](https://yarnpkg.com/){target=\_blank}

This documentation covers version `{{dependencies.javascript_packages.asset_transfer_api.version}}` of Asset Transfer API. 

## Install Asset Transfer API

To use `asset-transfer-api`, you need a TypeScript project. If you don't have one, you can create a new one:

1. Create a new directory for your project:

    ```bash
    mkdir my-asset-transfer-project \
    && cd my-asset-transfer-project
    ```

2. Initialize a new TypeScript project:

    ```bash
    npm init -y \
    && npm install typescript ts-node @types/node --save-dev \
    && npx tsc --init
    ```

Once you have a project set up, you can install the `asset-transfer-api` package. Run the following command to install the package:

```bash
npm install @substrate/asset-transfer-api@{{dependencies.javascript_packages.asset_transfer_api.version}}
```

## Set Up Asset Transfer API

To initialize the Asset Transfer API, you need three key components:

- A Polkadot.js API instance
- The `specName` of the chain
- The XCM version to use

### Using Helper Function from Library

Leverage the `constructApiPromise` helper function provided by the library for the simplest setup process. It not only constructs a Polkadot.js `ApiPromise` but also automatically retrieves the chain's `specName` and fetches a safe XCM version. By using this function, developers can significantly reduce boilerplate code and potential configuration errors, making the initial setup both quicker and more robust.

```ts
--8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/overview/setup.ts'
```

!!!warning
    The code example is enclosed in an async main function to provide the necessary asynchronous context. However, you can use the code directly if you're already working within an async environment. The key is to ensure you're in an async context when working with these asynchronous operations, regardless of your specific setup.

## Asset Transfer API Reference

For detailed information on the Asset Transfer API, including available methods, data types, and functionalities, refer to the [Asset Transfer API Reference](/develop/toolkit/interoperability/asset-transfer-api/reference){target=\_blank} section. This resource provides in-depth explanations and technical specifications to help you integrate and utilize the API effectively.

## Examples

### Relay to System Parachain Transfer

This example demonstrates how to initiate a cross-chain token transfer from a relay chain to a system parachain. Specifically, 1 WND will be transferred from a Westend (relay chain) account to a Westmint (system parachain) account.

```ts
--8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/overview/relayToSystem.ts'
```

After running the script, you'll see the following output in the terminal, which shows the call data for the cross-chain transfer and its decoded extrinsic details:

--8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/overview/relayToSystem.md'

### Local Parachain Transfer

The following example demonstrates a local GLMR transfer within Moonbeam, using the `balances` pallet. It transfers 1 GLMR token from one account to another account, where both the sender and recipient accounts are located on the same parachain.

```ts
--8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/overview/localParachainTx.ts'
```

Upon executing this script, the terminal will display the following output, illustrating the encoded extrinsic for the cross-chain message and its corresponding decoded format:

--8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/overview/localParachainTx.md'

### Parachain to Parachain Transfer

This example demonstrates creating a cross-chain asset transfer between two parachains. It shows how to send vMOVR and vBNC from a Moonriver account to a Bifrost Kusama account using the safe XCM version. It connects to Moonriver, initializes the API, and uses the `createTransferTransaction` method to prepare a transaction.

```ts
--8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/overview/paraToPara.ts'
```

After running this script, you'll see the following output in your terminal. This output presents the encoded extrinsic for the cross-chain message, along with its decoded format, providing a clear view of the transaction details.

--8<-- 'code/develop/toolkit/interoperability/asset-transfer-api/overview/paraToPara.md'