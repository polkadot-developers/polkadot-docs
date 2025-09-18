---
title: Web3.js
description: Learn how to interact with Polkadot Hub using Web3.js, deploying Solidity contracts, and interacting with deployed smart contracts.
categories: Smart Contracts, Tooling
url: https://docs.polkadot.com/develop/smart-contracts/libraries/web3-js/
---

# Web3.js

!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

!!! warning
    Web3.js has been [sunset](https://blog.chainsafe.io/web3-js-sunset/){target=\_blank}. You can find guides on using [Ethers.js](/develop/smart-contracts/libraries/ethers-js){target=\_blank} and [viem](/develop/smart-contracts/libraries/viem){target=\_blank} in the [Libraries](/develop/smart-contracts/libraries/){target=\_blank} section. 

## Introduction

Interacting with blockchains typically requires an interface between your application and the network. [Web3.js](https://web3js.readthedocs.io/){target=\_blank} offers this interface through a comprehensive collection of libraries, facilitating seamless interaction with the nodes using HTTP or WebSocket protocols. This guide illustrates how to utilize Web3.js specifically for interactions with Polkadot Hub.

This guide is intended for developers who are familiar with JavaScript and want to interact with the Polkadot Hub using Web3.js.

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js**: v22.13.1 or later, check the [Node.js installation guide](https://nodejs.org/en/download/current/){target=\_blank}.
- **npm**: v6.13.4 or later (comes bundled with Node.js).
- **Solidity**: This guide uses Solidity `^0.8.9` for smart contract development.

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

This guide uses `web3` version `4.16.0`.

## Set Up the Web3 Provider

The provider configuration is the foundation of any Web3.js application. The following example establishes a connection to Polkadot Hub. To use the example script, replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the appropriate values. The provider connection script should look something like this:

```javascript title="scripts/connectToProvider.js"
const { Web3 } = require('web3');

const createProvider = (rpcUrl) => {
  const web3 = new Web3(rpcUrl);
  return web3;
};

const PROVIDER_RPC = {
  rpc: 'INSERT_RPC_URL',
  chainId: 'INSERT_CHAIN_ID',
  name: 'INSERT_CHAIN_NAME',
};

createProvider(PROVIDER_RPC.rpc);

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
    const { Web3 } = require('web3');

const createProvider = (rpcUrl) => {
  const web3 = new Web3(rpcUrl);
  return web3;
};

const PROVIDER_RPC = {
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
  chainId: 420420422,
  name: 'polkadot-hub-testnet',
};

const main = async () => {
  try {
    const web3 = createProvider(PROVIDER_RPC.rpc);
    const latestBlock = await web3.eth.getBlockNumber();
    console.log('Last block: ' + latestBlock);
  } catch (error) {
    console.error('Error connecting to Polkadot Hub TestNet: ' + error.message);
  }
};

main();

    ```

## Compile Contracts

!!! note "Contracts Code Blob Size Disclaimer"
    The maximum contract code blob size on Polkadot Hub networks is _100 kilobytes_, significantly larger than Ethereum’s EVM limit of 24 kilobytes.

    For detailed comparisons and migration guidelines, see the [EVM vs. PolkaVM](/polkadot-protocol/smart-contract-basics/evm-vs-polkavm/#current-memory-limits){target=\_blank} documentation page.


Polkadot Hub requires contracts to be compiled to [PolkaVM](/polkadot-protocol/smart-contract-basics/polkavm-design/){target=\_blank} bytecode. This is achieved using the [`revive`](https://github.com/paritytech/revive/tree/v0.2.0/js/resolc){target=\_blank} compiler. Install the [`@parity/resolc`](https://github.com/paritytech/revive){target=\_blank} library as a development dependency:

```bash
npm install --save-dev @parity/resolc
```

This guide uses `@parity/resolc` version `0.2.0`.

Here's a simple storage contract that you can use to follow the process:

```solidity title="contracts/Storage.sol"
//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Storage {
    // Public state variable to store a number
    uint256 public storedNumber;

    /**
    * Updates the stored number.
    *
    * The `public` modifier allows anyone to call this function.
    *
    * @param _newNumber - The new value to store.
    */
    function setNumber(uint256 _newNumber) public {
        storedNumber = _newNumber;
    }
}
```

With that, you can now create a `compile.js` snippet that transforms your solidity code into PolkaVM bytecode:

```javascript title="scripts/compile.js"
const { compile } = require('@parity/resolc');
const { readFileSync, writeFileSync } = require('fs');
const { basename, join } = require('path');

const compileContract = async (solidityFilePath, outputDir) => {
  try {
    // Read the Solidity file
    const source = readFileSync(solidityFilePath, 'utf8');

    // Construct the input object for the compiler
    const input = {
      [basename(solidityFilePath)]: { content: source },
    };

    console.log(`Compiling contract: ${basename(solidityFilePath)}...`);

    // Compile the contract
    const out = await compile(input);

    for (const contracts of Object.values(out.contracts)) {
      for (const [name, contract] of Object.entries(contracts)) {
        console.log(`Compiled contract: ${name}`);

        // Write the ABI
        const abiPath = join(outputDir, `${name}.json`);
        writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2));
        console.log(`ABI saved to ${abiPath}`);

        // Write the bytecode
        const bytecodePath = join(outputDir, `${name}.polkavm`);
        writeFileSync(
          bytecodePath,
          Buffer.from(contract.evm.bytecode.object, 'hex'),
        );
        console.log(`Bytecode saved to ${bytecodePath}`);
      }
    }
  } catch (error) {
    console.error('Error compiling contracts:', error);
  }
};

const solidityFilePath = './Storage.sol';
const outputDir = '.';

compileContract(solidityFilePath, outputDir);

```

To compile your contract, simply run the following command:

```bash
node compile
```

After compilation, you'll have two key files: an ABI (`.json`) file, which provides a JSON interface describing the contract's functions and how to interact with it, and a bytecode (`.polkavm`) file, which contains the low-level machine code executable on PolkaVM that represents the compiled smart contract ready for blockchain deployment.

## Contract Deployment

To deploy your compiled contract to Polkadot Hub using Web3.js, you'll need an account with a private key to sign the deployment transaction. The deployment process is exactly the same as for any Ethereum-compatible chain, involving creating a contract instance, estimating gas, and sending a deployment transaction. Here's how to deploy the contract, ensure replacing the `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_NAME` with the appropriate values:

```javascript title="scripts/deploy.js"
import { readFileSync } from 'fs';
import { Web3 } from 'web3';

const getAbi = (contractName) => {
  try {
    return JSON.parse(readFileSync(`${contractName}.json`), 'utf8');
  } catch (error) {
    console.error(
      `❌ Could not find ABI for contract ${contractName}:`,
      error.message
    );
    throw error;
  }
};

const getByteCode = (contractName) => {
  try {
    return `0x${readFileSync(`${contractName}.polkavm`).toString('hex')}`;
  } catch (error) {
    console.error(
      `❌ Could not find bytecode for contract ${contractName}:`,
      error.message
    );
    throw error;
  }
};

export const deploy = async (config) => {
  try {
    // Initialize Web3 with RPC URL
    const web3 = new Web3(config.rpcUrl);

    // Prepare account
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    // Load abi
    const abi = getAbi('Storage');

    // Create contract instance
    const contract = new web3.eth.Contract(abi);

    // Prepare deployment
    const deployTransaction = contract.deploy({
      data: getByteCode('Storage'),
      arguments: [], // Add constructor arguments if needed
    });

    // Estimate gas
    const gasEstimate = await deployTransaction.estimateGas({
      from: account.address,
    });

    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Send deployment transaction
    const deployedContract = await deployTransaction.send({
      from: account.address,
      gas: gasEstimate,
      gasPrice: gasPrice,
    });

    // Log and return contract details
    console.log(`Contract deployed at: ${deployedContract.options.address}`);
    return deployedContract;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
};

// Example usage
const deploymentConfig = {
  rpcUrl: 'INSERT_RPC_URL',
  privateKey: 'INSERT_PRIVATE_KEY',
  contractName: 'INSERT_CONTRACT_NAME',
};

deploy(deploymentConfig)
  .then((contract) => console.log('Deployment successful'))
  .catch((error) => console.error('Deployment error'));

```

For further details on private key exportation, refer to the article [How to export an account's private key](https://support.metamask.io/configure/accounts/how-to-export-an-accounts-private-key/){target=\_blank}.

To deploy your contract, run the following command:

```bash
node deploy
```

## Interact with the Contract

Once deployed, you can interact with your contract using Web3.js methods. Here's how to set a number and read it back, ensure replacing `INSERT_RPC_URL`, `INSERT_PRIVATE_KEY`, and `INSERT_CONTRACT_ADDRESS` with the appropriate values:

```javascript title="scripts/updateStorage.js"
import { readFileSync } from 'fs';
import { Web3 } from 'web3';

const getAbi = (contractName) => {
  try {
    return JSON.parse(readFileSync(`${contractName}.json`), 'utf8');
  } catch (error) {
    console.error(
      `❌ Could not find ABI for contract ${contractName}:`,
      error.message
    );
    throw error;
  }
};

const updateStorage = async (config) => {
  try {
    // Initialize Web3 with RPC URL
    const web3 = new Web3(config.rpcUrl);

    // Prepare account
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    // Load abi
    const abi = getAbi('Storage');

    // Create contract instance
    const contract = new web3.eth.Contract(abi, config.contractAddress);

    // Get initial value
    const initialValue = await contract.methods.storedNumber().call();
    console.log('Current stored value:', initialValue);

    // Prepare transaction
    const updateTransaction = contract.methods.setNumber(1);

    // Estimate gas
    const gasEstimate = await updateTransaction.estimateGas({
      from: account.address,
    });

    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Send update transaction
    const receipt = await updateTransaction.send({
      from: account.address,
      gas: gasEstimate,
      gasPrice: gasPrice,
    });

    // Log transaction details
    console.log(`Transaction hash: ${receipt.transactionHash}`);

    // Get updated value
    const newValue = await contract.methods.storedNumber().call();
    console.log('New stored value:', newValue);

    return receipt;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

// Example usage
const config = {
  rpcUrl: 'INSERT_RPC_URL',
  privateKey: 'INSERT_PRIVATE_KEY',
  contractAddress: 'INSERT_CONTRACT_ADDRESS',
};

updateStorage(config)
  .then((receipt) => console.log('Update successful'))
  .catch((error) => console.error('Update error'));

```

To execute the logic above, run:

```bash
node updateStorage
```

## Where to Go Next

Now that you’ve learned how to use Web3.js with Polkadot Hub, explore more advanced topics:

- **Utilize Web3.js utilities**: Learn about additional [Web3.js](https://docs.web3js.org/){target=\_blank} features such as signing transactions, managing wallets, and subscribing to events.
- **Build full-stack dApps**: [integrate Web3.js](https://docs.web3js.org/guides/dapps/intermediate-dapp){target=\_blank} with different libraries and frameworks to build decentralized web applications.
