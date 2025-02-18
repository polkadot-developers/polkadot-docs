---
title: Web3.js
description: Learn how to interact with the Asset Hub chain using Web3.js, deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Web3.js

## Introduction

Interacting with blockchains typically requires an interface between your application and the network. [Web3.js](https://web3js.readthedocs.io/){target=\_blank} offers this interface through a comprehensive collection of libraries, facilitating seamless interaction with the nodes using HTTP or WebSocket protocols. This guide illustrates how to utilize Web3.js specifically for interactions with the Asset Hub chain.

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

The provider configuration is the foundation of any Web3.js application. The following example establishes a connection to the Asset Hub network. To use the example script, replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the appropriate values. For example, for the Westend Asset Hub testnet, use these specific connection parameters:

```js
const PROVIDER_RPC = {
    rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
    chainId: 420420421,
    name: 'westend-asset-hub'
};
```

The provider connection script should look something like this:

```javascript title="connectToProvider.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/connectToProvider.js'
```
With the Web3 provider set up, you can start querying the blockchain.

For instance, to fetch the latest block number of the chain, you can use the following code snippet:

???+ code "Complete script"

    ```javascript title="fetchLastBlock.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/fetchLastBlock.js'
    ```

## Compile Contracts

Asset Hub requires contracts to be compiled to [PolkaVM](/polkadot-protocol/smart-contracts-basics/polkavm-design){target=\_blank} bytecode. This is achieved using the [`revive`](https://github.com/paritytech/revive){target=\_blank} compiler. Install the [`@parity/revive`](https://github.com/paritytech/js-revive){target=\_blank} library as a development dependency:

```bash
npm install --save-dev @parity/revive
```

Here's a simple storage contract that you can use to follow the process:

```solidity title="Storage.sol"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/Storage.sol'
```

With that, you can now create a `compile.js` snippet that transforms your solidity code into PolkaVM bytecode:

```javascript title="compile.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/compile.js'
```

After compilation, you'll have two key files: an ABI (`.json`) file, which provides a JSON interface describing the contract's functions and how to interact with it, and a bytecode (`.polkavm`) file, which contains the low-level machine code executable on PolkaVM that represents the compiled smart contract ready for blockchain deployment.

## Contract Deployment

To deploy your compiled contract to Asset Hub using Web3.js, you'll need an account with a private key to sign the deployment transaction. The deployment process is exactly the same as for any EVM-compatible chain, involving creating a contract instance, estimating gas, and sending a deployment transaction. Here's how to deploy the contract, ensure replacing the `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_NAME` with the appropriate values:

```javascript title="deploy.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/deploy.js'
```
## Interact with the Contract

Once deployed, you can interact with your contract using Web3.js methods. Here's how to set a number and read it back, ensure replacing `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_ADDRESS` with the appropriate values:

```javascript title="updateStorage.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/updateStorage.js'
```

## Where to Go Next

Now that you’ve learned how to use Web3.js with Asset Hub, explore more advanced topics:

- Utilize Web3.js utilities – learn about additional [Web3.js](https://docs.web3js.org/){target=\_blank} features such as signing transactions, managing wallets, and subscribing to events
- Build full-stack dApps – [integrate Web3.js](https://docs.web3js.org/guides/dapps/intermediate-dapp){target=\_blank} with different libraries and frameworks to build decentralized web applications