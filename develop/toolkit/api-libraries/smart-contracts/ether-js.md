---
title: Ethers.Js
description: Learn how to interact with the Asset Hub chain using Ethers.js, compiling and deploying Solidity contracts, and interacting with deployed smart contracts.
---

# Ethers.Js

## Introduction

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
const { JsonRpcProvider } = require('ethers');

const createProvider = (rpcUrl, chainId, chainName) => {
    const provider = new JsonRpcProvider(rpcUrl, {
        chainId: chainId,
        name: chainName,
    });
    
    return provider;
}

const PROVIDER_RPC = {
    rpc: 'INSERT_RPC_URL',
    chainId: 'INSERT_CHAIN_ID',
    name: 'INSERT_CHAIN_NAME',
};

createProvider(PROVIDER_RPC.rpc, PROVIDER_RPC.chainId, PROVIDER_RPC.name);
```

!!! note
    Replace `INSERT_RPC_URL`, `INSERT_CHAIN_ID`, and `INSERT_CHAIN_NAME` with the appropriate values. For example, to connect to Westend Asset Hub, you can use the following parameters:

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
    const { JsonRpcProvider } = require('ethers');

    const createProvider = (rpcUrl, chainId, chainName) => {
        const provider = new JsonRpcProvider(rpcUrl, {
            chainId: chainId,
            name: chainName,
        });
        
        return provider;
    }

    const PROVIDER_RPC = {
        rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
        chainId: 420420421,
        name: 'westend-asset-hub'
    };

    const main = async () => {
        try {
            const provider = createProvider(PROVIDER_RPC.rpc, PROVIDER_RPC.chainId, PROVIDER_RPC.name);
            const latestBlock = await provider.getBlockNumber();
            console.log(`Latest block: ${latestBlock}`);
        } catch (error) {
            console.error('Error connecting to Asset Hub: ' + error.message);
        }
    };

    main();
    ```

## Compile Contracts

To deploy smart contracts to Asset Hub, you need to compile them into `polkavm` bytecode. Use the [`@parity/revive`](https://www.npmjs.com/package/@parity/revive){target=\_blank} library, which compiles Solidity code for use on Substrate-based chains.

Install the `@parity/revive` library:

```bash
npm install --save-dev @parity/revive 
```
### Example: Storage.sol

Here's a sample Solidity contract (`Storage.sol`) to be compiled and deployed to Asset Hub. This contract's functionality stores a number and permits users to update it with a new value.

??? code "Storage.sol"

    ```solidity
    //SPDX-License-Identifier: MIT

    // Solidity files have to start with this pragma.
    // It will be used by the Solidity compiler to validate its version.
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

To compile this contract, use the following script:

```js
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
                    Buffer.from(contract.evm.bytecode.object, 'hex')
                );
                console.log(`Bytecode saved to ${bytecodePath}`);
            }
        }
    } catch (error) {
        console.error('Error compiling contracts:', error);
    }
}

const solidityFilePath = './Storage.sol';
const outputDir = '.';

compileContract(solidityFilePath, outputDir);
```

Note that the script above is tailored to the `Storage.sol` contract. It can be adjusted for other contracts by changing the file name or modifying the ABI and bytecode paths accordingly.

After executing the script, the Solidity contract will be compiled into the required `polkavm` bytecode format. The ABI and bytecode will be saved into files with `.json` and `.polkavm` extensions, respectively. You can now proceed with deploying the contract to the Asset Hub network, as outlined in the next section.

## Contracts Deployment

To deploy the compiled contract to the Asset Hub, you will need a wallet with a private key to sign the deployment transaction. You can use [subkey](/polkadot-protocol/basics/accounts/#using-subkey){target=\_blank} to manage your wallet.

Here's the script to deploy the contract:

```js
const { writeFileSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { ethers, JsonRpcProvider } = require('ethers');

const codegenDir = join(__dirname);

const createProvider = (rpcUrl, chainId, chainName) => {
    const provider = new JsonRpcProvider(rpcUrl, {
        chainId: chainId,
        name: chainName,
    });
    
    return provider;
}

const getAbi = (contractName) => {
    try {
        return JSON.parse(readFileSync(join(codegenDir, `${contractName}.json`), 'utf8'));
    } catch (error) {
        console.error(`Could not find ABI for contract ${contractName}:`, error.message);
        throw error;
    }
}

const getByteCode = (contractName) => {
    try {
        return `0x${readFileSync(join(codegenDir, `${contractName}.polkavm`)).toString('hex')}`;
    } catch (error) {
        console.error(`Could not find bytecode for contract ${contractName}:`, error.message);
        throw error;
    }
}

const deployContract = async (contractName, mnemonic, providerConfig) => {
    console.log(`Deploying ${contractName}...`);

    try {
        // Create a provider
        const provider = createProvider(providerConfig.rpc, providerConfig.chainId, providerConfig.name);

        // Derive the wallet from the mnemonic
        const walletMnemonic = ethers.Wallet.fromPhrase(mnemonic);
        const wallet = walletMnemonic.connect(provider);

        // Create the contract factory
        const factory = new ethers.ContractFactory(
            getAbi(contractName),
            getByteCode(contractName),
            wallet
        );

        // Deploy the contract
        const contract = await factory.deploy();
        await contract.waitForDeployment();

        const address = await contract.getAddress();
        console.log(`Contract ${contractName} deployed at: ${address}`);

        // Save the deployed address
        const addressesFile = join(codegenDir, 'contract-address.json');
        const addresses = existsSync(addressesFile)
            ? JSON.parse(readFileSync(addressesFile, 'utf8'))
            : {};
        addresses[contractName] = address;

        writeFileSync(addressesFile, JSON.stringify(addresses, null, 2), 'utf8');
    } catch (error) {
        console.error(`Failed to deploy contract ${contractName}:`, error);
    }
}

const providerConfig = {
    rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
    chainId: 420420421,
    name: 'westend-asset-hub'
};

const mnemonic = 'INSERT_MNEMONIC';

deployContract('Storage', mnemonic, providerConfig);
```

!!! note
    Ensure to replace the `INSERT_MNEMONIC` placeholder with the proper value of your mnemonic.

After running the script above, the contract will be deployed to the Asset Hub network, and the contract address will be saved in a contract-address.json file within your project directory. This address can be used for further interactions with the contract, such as calling its methods or checking balances.

## Interact with the Contract

Once the contract is deployed, you can interact with it by calling its functions. For example, to set a number, read it and then modify that number by its double, you can use the following script:

```js
const { ethers } = require('ethers');
const { readFileSync } = require('fs');
const { join } = require('path');

const createProvider = (providerConfig) => {
    return new ethers.JsonRpcProvider(providerConfig.rpc, {
        chainId: providerConfig.chainId,
        name: providerConfig.name,
    });
}

const createWallet = (mnemonic, provider) => {
    return ethers.Wallet.fromPhrase(mnemonic).connect(provider);
}

const loadContractAbi = (contractName, directory = __dirname) => {
    const contractPath = join(directory, `${contractName}.json`);
    const contractJson = JSON.parse(readFileSync(contractPath, 'utf8'));
    return contractJson.abi || contractJson; // Depending on JSON structure
}

const createContract = (contractAddress, abi, wallet) => {
    return new ethers.Contract(contractAddress, abi, wallet);
}

const interactWithStorageContract = async (contractName, contractAddress, mnemonic, providerConfig, numberToSet) => {
    try {
        console.log(`Setting new number in Storage contract: ${numberToSet}`);
        
        // Create provider and wallet
        const provider = createProvider(providerConfig);
        const wallet = createWallet(mnemonic, provider);

        // Load the contract ABI and create the contract instance
        const abi = loadContractAbi(contractName);
        const contract = createContract(contractAddress, abi, wallet);

        // Send a transaction to set the stored number
        const tx1 = await contract.setNumber(numberToSet);
        await tx1.wait(); // Wait for the transaction to be mined
        console.log(`Number successfully set to ${numberToSet}`);

        // Retrieve the updated number
        const storedNumber = await contract.storedNumber();
        console.log(`Retrieved stored number:`, storedNumber.toString());

        // Send a transaction to set the stored number
        const tx2 = await contract.setNumber(numberToSet*2);
        await tx2.wait(); // Wait for the transaction to be mined
        console.log(`Number successfully set to ${numberToSet*2}`);

        // Retrieve the updated number
        const updatedNumber = await contract.storedNumber();
        console.log(`Retrieved stored number:`, updatedNumber.toString());
    } catch (error) {
        console.error('Error interacting with Storage contract:', error.message);
    }
}

const providerConfig = {
    name: 'asset-hub-smart-contracts',
    rpc: 'https://westend-asset-hub-eth-rpc.polkadot.io',
    chainId: 420420421,
};

const mnemonic = 'INSERT_MNEMONIC';
const contractName = 'Storage';
const contractAddress = 'INSERT_CONTRACT_ADDRESS';
const checkAddress = 'INSERT_ADDRESS_TO_CHECK';
const newNumber = 42;

interactWithStorageContract(contractName, contractAddress, mnemonic, providerConfig, newNumber);
```

Ensure you replace the `INSERT_MNEMONIC`, `INSERT_CONTRACT_ADDRESS` and `INSERT_ADDRESS_TO_CHECK` placeholders with actual values. Also, the contract ABI file (`Storage.json`) should be correctly referenced.

## Conclusion

Now that you've learned the basics of setting up providers, compiling smart contracts to `polkavm` bytecode, deploying, and interacting with them through Ethers.js, you have a solid foundation to build more complex decentralized applications on the Asset Hub blockchain.