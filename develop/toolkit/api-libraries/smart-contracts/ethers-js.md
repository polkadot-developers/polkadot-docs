---
title: Ethers.js
description: Learn how to interact with the Asset Hub chain using Ethers.js, compiling and deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Ethers.js

## Introduction

[Ethers.js](https://docs.ethers.org/v6/){target=\_blank} is a lightweight library that enables interaction with Ethereum Virtual Machine (EVM)-compatible blockchains through JavaScript. Ethers is widely used as a toolkit to establish connections and read and write blockchain data. This article demonstrates using Ethers.js to interact and deploy smart contracts to Asset Hub.

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

To interact with the Asset Hub, you must set up an Ethers.js provider. This provider connects to a blockchain node, allowing you to query blockchain data and interact with smart contracts. Here's how to configure it:

```js title="provider.js"
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

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/fetchLastBlock.js'
    ```

## Compile Contracts

The `revive` compiler transforms Solidity smart contracts into [`PolkaVM`](/develop/smart-contracts/evm/native-evm-contracts/#polkavm){target=\_blank} bytecode for deployment on Asset Hub. Revive's Ethereum RPC interface allows you to use familiar tools like Ethers.js and MetaMask to interact with contracts.

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

```js
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/compile.js'
```

!!! note 
     The script above is tailored to the `Storage.sol` contract. It can be adjusted for other contracts by changing the file name or modifying the ABI and bytecode paths.

After executing the script, the Solidity contract will be compiled into the required `polkavm` bytecode format. The ABI and bytecode will be saved into files with `.json` and `.polkavm` extensions. You can now deploy the contract to the Asset Hub network, as outlined in the next section.

## Deploy the Compiled Contract

To deploy your compiled contract to Asset Hub, you'll need a wallet with a private key to sign the deployment transaction.

The deployment script can be broken down into key components:

1. First, set up the required imports and utilities:

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:1:5'
    ```

2. Create a provider to connect to Asset Hub network:

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:6:14'
    ```
 
3. Set up functions to read contract artifacts:

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:16:42'
    ```

4. Create the main deployment function:

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:44:79'
    ```

5. Configure and execute the deployment:

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:81:89'
    ```

    !!! note
        Ensure to replace the `INSERT_MNEMONIC` placeholder with your actual mnemonic.

Here's the complete deployment script combining all the components above:

??? code "deploy.js"

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js'
    ```

After running this script, your contract will be deployed to Asset Hub, and its address will be saved in `contract-address.json` within your project directory. You can use this address for future contract interactions.

## Interact with the Contract

Once the contract is deployed, you can interact with it by calling its functions. For example, to set a number, read it and then modify that number by its double, you can use the following script:

```js
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/checkStorage.js'
```

Ensure you replace the `INSERT_MNEMONIC`, `INSERT_CONTRACT_ADDRESS`, and `INSERT_ADDRESS_TO_CHECK` placeholders with actual values. Also, ensure the contract ABI file (`Storage.json`) is correctly referenced.

## Conclusion

Now that you've learned the basics of setting up providers, compiling smart contracts to `polkavm` bytecode, deploying, and interacting with them through Ethers.js, you have a solid foundation to build more complex decentralized applications on the Asset Hub blockchain.