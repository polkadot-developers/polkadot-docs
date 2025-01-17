---
title: Web3.js
description: Learn how to interact with the Asset Hub chain using Web3.js, deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Web3.js

## Introduction

Interacting with blockchains typically requires an interface between your application and the network itself. [Web3.js](https://web3js.readthedocs.io/) offers this interface through a comprehensive collection of libraries, facilitating seamless interaction with the nodes using HTTP, IPC, or WebSocket protocols. This guide illustrates how to utilize Web3.js specifically for interactions with the Asset Hub chain.

## Set Up the Project

To start working with Web3.js, begin by initializing your project:

```bash
npm init -y
```

## Install Dependencies

Next, install the Web3.js library:

```bash
npm install web3
```

## Set Up the Web3 Provider

The foundation of any Web3.js application is the provider configuration. This establishes your connection to the Asset Hub network:

```javascript
--8<-- 'code/develop/smart-contracts/evm-toolkit/dev-environments/web3-js/connectToProvider.js'
```

!!! note
    Replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the appropriate values. For example, For Westend Asset Hub testnet, use these specific connection parameters:

    ```js
    const PROVIDER_RPC = {
        rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
        chainId: 420420421,
        name: 'westend-asset-hub'
    };
    ```

With the Web3 provider set up, you can start querying the blockchain.

For instance, to fetch the latest block number of the chain, you can use the following code snippet:

???- "fetchLastBlockNumber.js"

    ```javascript
    --8<-- 'code/develop/smart-contracts/evm-toolkit/dev-environments/web3-js/fetchLastBlockNumber.js'
    ```

## Compile Contracts

Asset Hub requires contracts to be compiled to PolkaVM bytecode. This is achieved using the [`revive`](https://github.com/paritytech/revive){target=\_blank} compiler. Install the [`@parity/revive`](https://github.com/paritytech/js-revive){target=\_blank} library as a development dependency:

```bash
npm install --save-dev @parity/revive
```

Here’s a simple storage contract that you can use to follow the process:

```solidity
--8<-- 'code/develop/smart-contracts/evm-toolkit/dev-environments/web3-js/Storage.sol'
```

With that, you can now create a `compile.js` snippet that transform your solidity code into PolkaVM bytecode:

```javascript
--8<-- 'code/develop/smart-contracts/evm-toolkit/dev-environments/web3-js/compile.js'
```

After compilation, you'll have the `.json` ABI file and `.polkavm` bytecode file ready for deployment.

## Contract Deployment

To deploy your compiled contract to Asset Hub using Web3.js, you'll need an account with a private key to sign the deployment transaction. Here's how to deploy the contract:

```javascript
--8<-- 'code/develop/smart-contracts/evm-toolkit/dev-environments/web3-js/deploy.js'
```

## Interact with the Contract

Once deployed, you can interact with your contract using Web3.js methods. Here's how to set a number and read it back:

```javascript
--8<-- 'code/develop/smart-contracts/evm-toolkit/dev-environments/web3-js/interactContract.js'
```

## Conclusion

This guide demonstrates how to use Web3.js to interact with the Asset Hub chain, from setting up a provider to deploying and interacting with smart contracts. By leveraging tools like `@parity/revive` for PolkaVM bytecode compilation and Web3.js for blockchain interaction, developers can seamlessly build and manage dApps within the Asset Hub ecosystem. 