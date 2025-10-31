---
title: Deploy a Basic Contract with Ethers.js
description: Learn how to deploy a basic smart contract to Polkadot Hub using Ethers.js, best for lightweight, programmatic deployments and application integration.
categories: Smart Contracts
---

# Deploy a Basic Contract with Ethers.js

This guide demonstrates how to deploy a basic Solidity smart contract to Polkadot Hub using [Ethers.js](https://docs.ethers.org/v6/){target=\_blank}, which provides a lightweight approach for deploying contracts using pure JavaScript. This method is ideal for developers who want programmatic control over the deployment process or need to integrate contract deployment into existing applications.

## Prerequisites:

- Basic understanding of Solidity programming.
- [Node.js](https://nodejs.org/en/download){target=\_blank} v22.13.1 or later.
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}). See the [step-by-step instructions](/smart-contracts/faucet/#get-test-tokens){target=\_blank}.
- A wallet with a private key for signing transactions.

## Set Up Your Project

First, initialize your project and install dependencies:

```bash
mkdir ethers-deployment
cd ethers-deployment
npm init -y
npm install ethers@6.15.0 solc@0.8.30
```

## Create Your Contract

Create a simple storage contract in `contracts/Storage.sol`:

```solidity title="contracts/Storage.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Storage {
    uint256 private storedNumber;

    function store(uint256 num) public {
        storedNumber = num;
    }

    function retrieve() public view returns (uint256) {
        return storedNumber;
    }
}
```

## Compile

Create a compilation script `compile.js`:

```javascript title="compile.js"
const solc = require('solc');
const { readFileSync, writeFileSync } = require('fs');
const { basename, join } = require('path');

const compileContract = async (solidityFilePath, outputDir) => {
  try {
    // Read the Solidity file
    const source = readFileSync(solidityFilePath, 'utf8');

    // Construct the input object for the compiler
    const input = {
      language: 'Solidity',
      sources: {
        [basename(solidityFilePath)]: { content: source },
      },
      settings: {
        outputSelection: {
          '*': {
            '*': ['*'],
          },
        },
      },
    };

    console.log(`Compiling contract: ${basename(solidityFilePath)}...`);

    // Compile the contract
    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors) {
      output.errors.forEach(error => {
        console.error('Compilation error:', error.message);
      });
      return;
    }

    for (const contracts of Object.values(output.contracts)) {
      for (const [name, contract] of Object.entries(contracts)) {
        console.log(`Compiled contract: ${name}`);

        // Write the ABI
        const abiPath = join(outputDir, `${name}.json`);
        writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2));
        console.log(`ABI saved to ${abiPath}`);

        // Write the bytecode
        const bytecodePath = join(outputDir, `${name}.bin`);
        writeFileSync(bytecodePath, 
            Buffer.from(
                contract.evm.bytecode.object,
                'hex'
            ));
        console.log(`Bytecode saved to ${bytecodePath}`);
      }
    }
  } catch (error) {
    console.error('Error compiling contracts:', error);
  }
};

const solidityFilePath = join(__dirname, 'contracts/Storage.sol');
const outputDir = join(__dirname, 'contracts');

compileContract(solidityFilePath, outputDir);
```

Run the compilation:

```bash
node compile.js
```

## Deploy

Create a deployment script `deploy.js`:

```javascript title="deploy.js"
const { writeFileSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { ethers, JsonRpcProvider } = require('ethers');

const codegenDir = join(__dirname);

// Creates a provider with specified RPC URL and chain details
const createProvider = (rpcUrl, chainId, chainName) => {
  const provider = new JsonRpcProvider(rpcUrl, {
    chainId: chainId,
    name: chainName,
  });
  return provider;
};

// Reads and parses the ABI file for a given contract
const getAbi = (contractName) => {
  try {
    return JSON.parse(
      readFileSync(join(codegenDir, 'contracts', `${contractName}.json`), 'utf8'),
    );
  } catch (error) {
    console.error(
      `Could not find ABI for contract ${contractName}:`,
      error.message,
    );
    throw error;
  }
};

// Reads the compiled bytecode for a given contract
const getByteCode = (contractName) => {
  try {
    const bytecodePath = join(
      codegenDir,
      'contracts',
      `${contractName}.bin`,
    );
    return `0x${readFileSync(bytecodePath).toString('hex')}`;
  } catch (error) {
    console.error(
      `Could not find bytecode for contract ${contractName}:`,
      error.message,
    );
    throw error;
  }
};

const deployContract = async (contractName, mnemonic, providerConfig) => {
  console.log(`Deploying ${contractName}...`);

  try {
    // Step 1: Set up provider and wallet
    const provider = createProvider(
      providerConfig.rpc,
      providerConfig.chainId,
      providerConfig.name,
    );
    const walletMnemonic = ethers.Wallet.fromPhrase(mnemonic);
    const wallet = walletMnemonic.connect(provider);

    // Step 2: Create and deploy the contract
    const factory = new ethers.ContractFactory(
      getAbi(contractName),
      getByteCode(contractName),
      wallet,
    );
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    // Step 3: Save deployment information
    const address = await contract.getAddress();
    console.log(`Contract ${contractName} deployed at: ${address}`);

    const addressesFile = join(codegenDir, 'contract-address.json');
    const addresses = existsSync(addressesFile)
      ? JSON.parse(readFileSync(addressesFile, 'utf8'))
      : {};
    addresses[contractName] = address;
    writeFileSync(addressesFile, JSON.stringify(addresses, null, 2), 'utf8');
  } catch (error) {
    console.error(`Failed to deploy contract ${contractName}:`, error);
  }
};

const providerConfig = {
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
  chainId: 420420422,
  name: 'polkadot-hub-testnet',
};

const mnemonic = 'INSERT_MNEMONIC';

deployContract('Storage', mnemonic, providerConfig);
```

Replace the `INSERT_MNEMONIC` placeholder with your actual mnemonic.

!!! warning
    Never embed private keys, mnemonic phrases, or security-sensitive credentials directly into your JavaScript, TypeScript, or any front-end/client-side files.

Execute the deployment:

```bash
node deploy.js
```

After running this script, your contract will be deployed to Polkadot Hub, and its address will be saved in `contract-address.json` within your project directory. You can use this address for future contract interactions.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to the Polkadot Hub using Ethers.js.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/ethers/)

-   <span class="badge guide">Guide</span> __Deploy an NFT__

    ---

    Walk through deploying a NFT to the Polkadot Hub using Ethers.js.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/ethers/)
    
</div>