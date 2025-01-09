---
title: Ethers.js
description: Learn how to interact with the Asset Hub chain using Ethers.js, compiling and deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Ethers.js

## Introduction

[Ethers.js](https://docs.ethers.org/v6/){target=\_blank} is a lightweight library that enables interaction with Ethereum Virtual Machine (EVM)-compatible blockchains through JavaScript. This article demonstrates how to use Ethers.js to interact and deploy smart contracts to the Asset Hub.

## Set Up the Project

To start working with Ethers.js, begin by initializing your project:

```bash
npm init -y
```

## Install Dependencies

Next, install the Ethers.js library:

```bash
npm install ethers
```

## Set Up the Ethers.js Provider

To interact with the Asset Hub, you'll need to set up an Ethers.js provider. This provider connects to a blockchain node, allowing you to query blockchain data and interact with smart contracts. Here's how to configure it:

```js
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

The `revive` compiler transforms Solidity smart contracts into [`PolkaVM`](/develop/smart-contracts/evm/native-evm-contracts/#polkavm){target=\_blank} bytecode for deployment on Asset Hub. Through its Ethereum RPC interface, you can still use familiar tools like Ethers.js and MetaMask for contract interactions.

Install the [`@parity/revive`](https://www.npmjs.com/package/@parity/revive){target=\_blank} library:

```bash
npm install --save-dev @parity/revive 
```

This library will compile your Solidity code for deployment on Asset Hub.

### Example: Storage.sol

Here's a sample Solidity contract (`Storage.sol`) to be compiled and deployed to the Asset Hub. This contract's functionality stores a number and permits users to update it with a new value.

??? code "Storage.sol"

    ```solidity
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/Storage.sol'
    ```

To compile this contract, use the following script:

```js
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/compile.js'
```

Note that the script above is tailored to the `Storage.sol` contract. It can be adjusted for other contracts by changing the file name or modifying the ABI and bytecode paths accordingly.

After executing the script, the Solidity contract will be compiled into the required `polkavm` bytecode format. The ABI and bytecode will be saved into files with `.json` and `.polkavm` extensions, respectively. You can now proceed with deploying the contract to the Asset Hub network, as outlined in the next section.

## Contracts Deployment

To deploy your compiled contract to Asset Hub, you'll need a wallet with a private key to sign the deployment transaction. You can use [subkey](/polkadot-protocol/basics/accounts/#using-subkey){target=\_blank} to manage your address.

The deployment script can be broken down into key components:

1. First, set up the required imports and utilities:

    ```js
    --8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js:1:5'
    ```

2. Create a provider to connect to the Asset Hub network:

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

Ensure you replace the `INSERT_MNEMONIC`, `INSERT_CONTRACT_ADDRESS` and `INSERT_ADDRESS_TO_CHECK` placeholders with actual values. Also, the contract ABI file (`Storage.json`) should be correctly referenced.

## Conclusion

Now that you've learned the basics of setting up providers, compiling smart contracts to `polkavm` bytecode, deploying, and interacting with them through Ethers.js, you have a solid foundation to build more complex decentralized applications on the Asset Hub blockchain.