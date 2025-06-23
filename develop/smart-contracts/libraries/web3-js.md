---
title: Web3.js
description: Learn how to interact with Polkadot Hub using Web3.js, deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Web3.js

!!! warning
    Web3.js has been [sunset](https://blog.chainsafe.io/web3-js-sunset/){target=\_blank}. You can find guides on using [Ethers.js](/develop/smart-contracts/libraries/ethers-js){target=\_blank} and [viem](/develop/smart-contracts/libraries/viem){target=\_blank} in the [Libraries](/develop/smart-contracts/libraries/){target=\_blank} section. 

## Introduction

Interacting with blockchains typically requires an interface between your application and the network. [Web3.js](https://web3js.readthedocs.io/){target=\_blank} offers this interface through a comprehensive collection of libraries, facilitating seamless interaction with the nodes using HTTP or WebSocket protocols. This guide illustrates how to utilize Web3.js specifically for interactions with Polkadot Hub.

This guide is intended for developers who are familiar with JavaScript and want to interact with the Polkadot Hub using Web3.js.

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js** - v22.13.1 or later, check the [Node.js installation guide](https://nodejs.org/en/download/current/){target=\_blank}
- **npm** - v6.13.4 or later (comes bundled with Node.js)
- **Solidity** - this guide uses Solidity `^0.8.9` for smart contract development

## Project Structure

This project organizes contracts, scripts, and compiled artifacts for easy development and deployment.

```text title="Web3.js Polkadot Hub"
web3js-project
├── contracts
│   ├── Storage.sol
├── scripts
│   ├── connectToProvider.js
│   ├── fetchLastBlock.js
│   ├── compile.js
│   ├── deploy.js
│   ├── updateStorage.js
├── abis
│   ├── Storage.json
├── artifacts
│   ├── Storage.polkavm
├── node_modules/
├── package.json
├── package-lock.json
└── README.md
```

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

This guide uses `web3` version `{{ dependencies.javascript_packages.web3_js.version }}`.

## Set Up the Web3 Provider

The provider configuration is the foundation of any Web3.js application. The following example establishes a connection to Polkadot Hub. To use the example script, replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the appropriate values. The provider connection script should look something like this:

```javascript title="scripts/connectToProvider.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/connectToProvider.js'
```

For example, for the Polkadot Hub TestNet, use these specific connection parameters:

```js
const PROVIDER_RPC = {
    rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
    chainId: 420420422,
    name: 'polkadot-hub-testnet'
};
```
With the Web3 provider set up, you can start querying the blockchain.

For instance, to fetch the latest block number of the chain, you can use the following code snippet:

???+ code "View complete script"

    ```javascript title="scripts/fetchLastBlock.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/fetchLastBlock.js'
    ```

## Compile Contracts

--8<-- 'text/smart-contracts/code-size.md'

Polkadot Hub requires contracts to be compiled to [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design/){target=\_blank} bytecode. This is achieved using the [`revive`](https://github.com/paritytech/revive){target=\_blank} compiler. Install the [`@parity/revive`](https://github.com/paritytech/js-revive){target=\_blank} library as a development dependency:

```bash
npm install --save-dev @parity/revive
```

This guide uses `@parity/revive` version `{{ dependencies.javascript_packages.revive.version }}`.

Here's a simple storage contract that you can use to follow the process:

```solidity title="contracts/Storage.sol"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/Storage.sol'
```

With that, you can now create a `compile.js` snippet that transforms your solidity code into PolkaVM bytecode:

```javascript title="scripts/compile.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/compile.js'
```

To compile your contract, simply run the following command:

```bash
node compile
```

After compilation, you'll have two key files: an ABI (`.json`) file, which provides a JSON interface describing the contract's functions and how to interact with it, and a bytecode (`.polkavm`) file, which contains the low-level machine code executable on PolkaVM that represents the compiled smart contract ready for blockchain deployment.

## Contract Deployment

To deploy your compiled contract to Polkadot Hub using Web3.js, you'll need an account with a private key to sign the deployment transaction. The deployment process is exactly the same as for any Ethereum-compatible chain, involving creating a contract instance, estimating gas, and sending a deployment transaction. Here's how to deploy the contract, ensure replacing the `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_NAME` with the appropriate values:

```javascript title="scripts/deploy.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/deploy.js'
```

For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

To deploy your contract, run the following command:

```bash
node deploy
```

## Interact with the Contract

Once deployed, you can interact with your contract using Web3.js methods. Here's how to set a number and read it back, ensure replacing `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_ADDRESS` with the appropriate values:

```javascript title="scripts/updateStorage.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/libraries/web3-js/updateStorage.js'
```

To execute the logic above, run:

```bash
node updateStorage
```

## Where to Go Next

Now that you’ve learned how to use Web3.js with Polkadot Hub, explore more advanced topics:

- Utilize Web3.js utilities – learn about additional [Web3.js](https://docs.web3js.org/){target=\_blank} features such as signing transactions, managing wallets, and subscribing to events
- Build full-stack dApps – [integrate Web3.js](https://docs.web3js.org/guides/dapps/intermediate-dapp){target=\_blank} with different libraries and frameworks to build decentralized web applications