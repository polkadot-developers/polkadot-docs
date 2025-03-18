---
title: Deploy Contracts to Asset Hub with Ethers.js
description: Learn how to interact with the Asset Hub chain using Ethers.js, from compiling and deploying Solidity contracts to interacting with deployed smart contracts.
---

# Ethers.js

## Introduction

[Ethers.js](https://docs.ethers.org/v6/){target=\_blank} is a lightweight library that enables interaction with Ethereum Virtual Machine (EVM)-compatible blockchains through JavaScript. Ethers is widely used as a toolkit to establish connections and read and write blockchain data. This article demonstrates using Ethers.js to interact and deploy smart contracts to Asset Hub.

This guide is intended for developers who are familiar with JavaScript and want to interact with the Polkadot Asset Hub using Ethers.js.

## Set Up the Project

To start working with Ethers.js, create a new folder and initialize your project by running the following commands in your terminal:

```bash
mkdir ethers-project
cd ethers-project
npm init -y
```

## Install Dependencies

Next, run the following command to install the Ethers.js library:

```bash
npm install ethers
```

## Set Up the Ethers.js Provider

A provider is an abstraction of a connection to the Ethereum network, allowing you to query blockchain data and send transactions. It serves as a bridge between your application and the blockchain.

To interact with the Asset Hub, you must set up an Ethers.js provider. This provider connects to a blockchain node, allowing you to query blockchain data and interact with smart contracts. In the root of your project, create a file named `connectToProvider.js` and add the following code:

```js title="connectToProvider.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/connectToProvider.js'
```

!!! note
    Replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the appropriate values. For example, to connect to Westend Asset Hub's Ethereum RPC instance, you can use the following parameters:

    ```js
    const PROVIDER_RPC = {
        rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
        chainId: 420420421,
        name: 'westend-asset-hub'
    };
    ```

With the [`Provider`](https://docs.ethers.org/v6/api/providers/#Provider){target=\_blank} set up, you can start querying the blockchain. For instance, to fetch the latest block number:

??? code "Fetch Last Block code"

    ```js title="fetchLastBlock.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/fetchLastBlock.js'
    ```

## Compile Contracts

The `revive` compiler transforms Solidity smart contracts into [`PolkaVM`](/develop/smart-contracts/native-evm-contracts/#polkavm){target=\_blank} bytecode for deployment on Asset Hub. Revive's Ethereum RPC interface allows you to use familiar tools like Ethers.js and MetaMask to interact with contracts.

### Install the Revive Library

The [`@parity/revive`](https://www.npmjs.com/package/@parity/revive){target=\_blank} library will compile your Solidity code for deployment on Asset Hub. Run the following command in your terminal to install the library:

```bash
npm install --save-dev @parity/revive 
```

### Sample `Storage.sol` Smart Contract

This example demonstrates compiling a `Storage.sol` Solidity contract for deployment to Asset Hub. The contract's functionality stores a number and permits users to update it with a new value.

```solidity title="storage.sol"
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/Storage.sol'
```

### Compile the Smart Contract

To compile this contract, use the following script:

```js title="compile.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/compile.js'
```

!!! note 
     The script above is tailored to the `Storage.sol` contract. It can be adjusted for other contracts by changing the file name or modifying the ABI and bytecode paths.

The ABI (Application Binary Interface) is a JSON representation of your contract's functions, events, and their parameters. It serves as the interface between your JavaScript code and the deployed smart contract, allowing your application to know how to format function calls and interpret returned data.

After executing the script, the Solidity contract will be compiled into the required `polkavm` bytecode format. The ABI and bytecode will be saved into files with `.json` and `.polkavm` extensions, respectively. You can now proceed with deploying the contract to the Asset Hub network, as outlined in the next section.

## Deploy the Compiled Contract

To deploy your compiled contract to Asset Hub, you'll need a wallet with a private key to sign the deployment transaction.

You can create a `deploy.js` script in the root of your project to achieve this. The deployment script can be divided into key components:

1. First, set up the required imports and utilities:

    ```js title="deploy.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:1:5'
    ```

2. Create a provider to connect to the Asset Hub network:

    ```js title="deploy.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:6:14'
    ```
 
3. Set up functions to read contract artifacts:

    ```js title="deploy.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:16:44'
    ```

4. Create the main deployment function:

    ```js title="deploy.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:46:81'
    ```

5. Configure and execute the deployment:

    ```js title="deploy.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:83:92'
    ```

    !!! note
        A mnemonic (seed phrase) is a series of words that can generate multiple private keys and their corresponding addresses. It's used here to derive the wallet that will sign and pay for the deployment transaction. Always keep your mnemonic secure and never share it publicly.

        Ensure to replace the `INSERT_MNEMONIC` placeholder with your actual mnemonic.

Here's the complete deployment script combining all the components above:

??? code "deploy.js"

    ```js title="deploy.js"
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js'
    ```

After running this script, your contract will be deployed to Asset Hub, and its address will be saved in `contract-address.json` within your project directory. You can use this address for future contract interactions.

## Interact with the Contract

Once the contract is deployed, you can interact with it by calling its functions. For example, to set a number, read it and then modify that number by its double, you can create a file named `checkStorage.js` in the root of your project and add the following code:

```js title="checkStorage.js"
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/checkStorage.js'
```

Ensure you replace the `INSERT_MNEMONIC`, `INSERT_CONTRACT_ADDRESS`, and `INSERT_ADDRESS_TO_CHECK` placeholders with actual values. Also, ensure the contract ABI file (`Storage.json`) is correctly referenced.

## Where to Go Next

Now that you have the foundational knowledge to use Ethers.js with Asset Hub, you can:

- **Dive into Ethers.js utilities** - discover additional Ethers.js features, such as wallet management, signing messages, etc
- **Implement batch transactions** - use Ethers.js to execute batch transactions for efficient multi-step contract interactions
- **Build scalable applications** - combine Ethers.js with frameworks like [`Next.js`](https://nextjs.org/docs){target=\_blank} or [`Node.js`](https://nodejs.org/en){target=\_blank} to create full-stack decentralized applications (dApps)
