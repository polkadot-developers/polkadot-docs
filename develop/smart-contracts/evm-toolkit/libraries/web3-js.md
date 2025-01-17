---
title: Web3.js
description: Learn how to interact with the Asset Hub chain using Web3.js, deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Web3.js

## Introduction

[Web3.js](https://web3js.readthedocs.io/) is a collection of libraries that allow you to interact with local or remote ethereum nodes using HTTP, IPC or WebSocket. This guide demonstrates how to use Web3.js to interact with and deploy smart contracts to Asset Hub.

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

To interact with Asset Hub, you'll need to set up a Web3 provider. This provider connects to a blockchain node, allowing you to query blockchain data and interact with smart contracts. Here's how to configure it:

```js
const Web3 = require('web3');

const createProvider = (rpcUrl) => {
    const web3 = new Web3(rpcUrl);
    return web3;
};

const PROVIDER_RPC = {
    rpc: 'INSERT_RPC_URL',
    chainId: 'INSERT_CHAIN_ID',
    name: 'INSERT_CHAIN_NAME'
};

const web3 = createProvider(PROVIDER_RPC.rpc);
```

!!! note
    Replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the appropriate values. For example, to connect to Westend Asset Hub's instance, you can use the following parameters:

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

        ```js
        const { Web3 } = require('web3');

        const createProvider = (rpcUrl) => {
            const web3 = new Web3(rpcUrl);
            return web3;
        };

        const PROVIDER_RPC = {
            rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
            chainId: 420420421,
            name: 'westend-asset-hub'
        };

        const main = async () => {
            try {
                const web3 = createProvider(PROVIDER_RPC.rpc);
                const latestBlock = await web3.eth.getBlockNumber();
                console.log(`Node info: ${nodeInfo}`);
            } catch (error) {
                console.error('Error connecting to Asset Hub: ' + error.message);
            }
        };

        main();
        ```

## Compile Contracts

You need to use the [`revive`](https://github.com/paritytech/revive){target=\_blank} compiler to transform Solidity smart contracts into PolkaVM bytecode for deployment on Asset Hub. The compilation process remains the same. For that, you have to install the [`@parity/revive`](https://github.com/paritytech/js-revive){target=\_blank} library as a dev dependency:

```bash
npm install --save-dev @parity/revive
```

### Example: Storage.sol

Here's our sample Solidity contract that we'll compile and deploy. Create a `Storage.sol` file in the root of your project:

```solidity
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

With that, you can now create a `compile.js` snippet that transform your solidity code into PolkaVM bytecode:

```javascript
const { compile } = require('@parity/revive');
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

After compilation, you'll have the `.json` ABI file and `.polkavm` bytecode file ready for deployment.


## Contract Deployment

To deploy your compiled contract to Asset Hub using Web3.js, you'll need an account with a private key to sign the deployment transaction. Here's how to deploy the contract:

```javascript
const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// ... (provider setup and utility functions)

const deployContract = async (contractName, privateKey, providerConfig) => {
    console.log(`Deploying ${contractName}...`);

    try {
        // Setup web3 and account
        const web3 = createProvider(providerConfig.rpc);
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);

        // Create contract instance
        const Contract = new web3.eth.Contract(getAbi(contractName));
        
        // Deploy contract
        const contract = await Contract.deploy({
            data: getByteCode(contractName)
        }).send({
            from: account.address,
            gas: await Contract.deploy({
                data: getByteCode(contractName)
            }).estimateGas()
        });

        console.log(`Contract deployed at: ${contract.options.address}`);
        return contract;
    } catch (error) {
        console.error(`Failed to deploy contract:`, error);
        throw error;
    }
};
```

## Interact with the Contract

Once deployed, you can interact with your contract using Web3.js methods. Here's how to set a number and read it back:

```javascript
const interactWithContract = async (
    contractName,
    contractAddress,
    privateKey,
    providerConfig,
    numberToSet
) => {
    try {
        // Setup web3 and contract instance
        const web3 = createProvider(providerConfig);
        const account = web3.eth.accounts.privateKeyToAccount(privateKey);
        web3.eth.accounts.wallet.add(account);

        const contract = new web3.eth.Contract(
            loadContractAbi(contractName),
            contractAddress
        );

        // Set the number
        await contract.methods.setNumber(numberToSet).send({
            from: account.address,
            gas: await contract.methods.setNumber(numberToSet).estimateGas()
        });

        // Read the number back
        const storedNumber = await contract.methods.storedNumber().call();
        console.log(`Stored number: ${storedNumber}`);
    } catch (error) {
        console.error('Error:', error);
    }
};
```

## Conclusion

This guide demonstrates how to use Web3.js to interact with the Asset Hub chain, from setting up a provider to deploying and interacting with smart contracts. By leveraging tools like `@parity/revive` for PolkaVM bytecode compilation and Web3.js for blockchain interaction, developers can seamlessly build and manage dApps within the Asset Hub ecosystem. 

Whether you are querying blockchain data, deploying Solidity contracts, or executing smart contract functions, these tools provide the foundation for efficient and scalable decentralized applications. Explore further possibilities and integrate with the robust Polkadot ecosystem to unlock new levels of innovation.