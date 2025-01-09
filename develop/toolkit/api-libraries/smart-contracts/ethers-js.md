---
title: Ethers.js
description: Learn how to interact with the Asset Hub chain using Ethers.js, compiling and deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Ethers.js

## Introduction

The `revive` compiler is used to compile Solidity smart contracts to [`PolkaVM`](/develop/smart-contracts/evm/native-evm-contracts/#polkavm){target=\_blank} bytecode, which allows it to be uploaded to Asset Hub. An Ethereum RPC faciliates interaction with existing Ethereum tools, such as Ethers.js or Metamask

Ethers.js is a lightweight library that enables interaction with Ethereum Virtual Machine (EVM)-compatible blockchains through JavaScript. This article demonstrates how to use Ethers.js to interact and deploy smart contracts to the Asset Hub.

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

To deploy smart contracts to Asset Hub, you must compile your Solidity code into `polkavm` bytecode. Use the [`@parity/revive`](https://www.npmjs.com/package/@parity/revive){target=\_blank} library to perform this step.

Install the `@parity/revive` library:

```bash
npm install --save-dev @parity/revive 
```
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

!!!note
    The script above is tailored to the `Storage.sol` contract. It can be adjusted for other contracts by changing the file name or modifying the ABI and bytecode paths accordingly.

After executing the script, the Solidity contract will be compiled into the required `polkavm` bytecode format. The ABI and bytecode will be saved into files with `.json` and `.polkavm` extensions, respectively. You can now proceed with deploying the contract to the Asset Hub network, as outlined in the next section.

## Contracts Deployment

To deploy the compiled contract to the Asset Hub, you will need a wallet with a private key to sign the deployment transaction. You can use [subkey](/polkadot-protocol/basics/accounts/#using-subkey){target=\_blank} to manage your wallet.

Here's the script to deploy the contract:

```js
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/deploy.js'
```

!!! note
    Ensure to replace the `INSERT_MNEMONIC` placeholder with the proper value of your mnemonic.

After running the script above, the contract will be deployed to the Asset Hub network, and the contract address will be saved in a contract-address.json file within your project directory. This address can be used for further interactions with the contract, such as calling its methods or checking balances.

## Interact with the Contract

Once the contract is deployed, you can interact with it by calling its functions. For example, to set a number, read it and then modify that number by its double, you can use the following script:

```js
--8<-- 'code/develop/smart-contracts/evm-toolkit/ethers-js/checkStorage.js'
```

Ensure you replace the `INSERT_MNEMONIC`, `INSERT_CONTRACT_ADDRESS` and `INSERT_ADDRESS_TO_CHECK` placeholders with actual values. Also, the contract ABI file (`Storage.json`) should be correctly referenced.

## Conclusion

Now that you've learned the basics of setting up providers, compiling smart contracts to `polkavm` bytecode, deploying, and interacting with them through Ethers.js, you have a solid foundation to build more complex decentralized applications on the Asset Hub blockchain.