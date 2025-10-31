---
title: Deploy an NFT to Polkadot Hub with Ethers.js
description: Learn how to deploy an ERC-721 NFT contract to Polkadot Hub using Ethers.js, giving you complete programmatic control over the deployment process.
tutorial_badge: Beginner
categories: Basics, Smart Contracts
tools: EVM Wallet, Ethers
---

# Deploy an NFT with Ethers.js

## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification.

This guide demonstrates how to deploy an [ERC-721](https://eips.ethereum.org/EIPS/eip-721){target=\_blank} NFT contract to [Polkadot Hub](/smart-contracts/overview/#smart-contract-development){target=\_blank}. You'll use [OpenZeppelin's battle-tested NFT implementation](https://github.com/OpenZeppelin/openzeppelin-contracts){target=\_blank} and [Ethers.js](https://docs.ethers.org/v6/){target=\_blank}, a lightweight approach for deploying contracts in pure JavaScript. This method is ideal if you want programmatic control over the deployment process or need to integrate contract deployment into existing applications.

## Prerequisites

- Basic understanding of Solidity programming and NFT standards.
- Node.js v22.13.1 or later.
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}). See the [step-by-step instructions](/smart-contracts/faucet/#get-test-tokens){target=\_blank}.
- A wallet with a private key for signing transactions.

## Set Up Your Project

First, initialize your project and install dependencies:

```bash
mkdir ethers-nft-deployment
cd ethers-nft-deployment
npm init -y
npm install ethers@6.15.0 solc@0.8.30 @openzeppelin/contracts@5.0.0
```

## Create Your Contract

Create an NFT contract in `contracts/MyNFT.sol`:

```solidity title="contracts/MyNFT.sol"
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyNFT is ERC721, Ownable {
    uint256 private _nextTokenId;

    constructor(address initialOwner)
        ERC721("MyToken", "MTK")
        Ownable(initialOwner)
    {}

    function safeMint(address to) public onlyOwner {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
    }
}
```

## Compile

Create a compilation script `compile.js`:

```javascript title="compile.js"
const fs = require('fs');
const path = require('path');
const solc = require('solc');

const contractPath = path.join(__dirname, 'contracts', 'MyNFT.sol');
const contractSource = fs.readFileSync(contractPath, 'utf8');

function findImports(importPath) {
  try {
    const nodePath = path.join(__dirname, 'node_modules', importPath);
    const contents = fs.readFileSync(nodePath, 'utf8');
    return { contents };
  } catch (error) {
    return { error: 'File not found' };
  }
}

const input = {
  language: 'Solidity',
  sources: {
    'MyNFT.sol': {
      content: contractSource
    }
  },
  settings: {
    outputSelection: {
      '*': {
        '*': ['abi', 'evm.bytecode']
      }
    },
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};

console.log('Compiling contract...');

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

if (output.errors) {
  output.errors.forEach(error => {
    console.error(error.formattedMessage);
  });
  
  const hasErrors = output.errors.some(error => error.severity === 'error');
  if (hasErrors) {
    process.exit(1);
  }
}

const contractName = 'MyNFT';
const contract = output.contracts['MyNFT.sol'][contractName];

if (!contract) {
  console.error('Contract not found in compilation output');
  process.exit(1);
}

const buildPath = path.join(__dirname, 'build');
if (!fs.existsSync(buildPath)) {
  fs.mkdirSync(buildPath);
}

const abiPath = path.join(buildPath, `${contractName}_abi.json`);
fs.writeFileSync(abiPath, JSON.stringify(contract.abi, null, 2));
console.log(`ABI saved to ${abiPath}`);

const bytecodePath = path.join(buildPath, `${contractName}_bytecode.txt`);
fs.writeFileSync(bytecodePath, contract.evm.bytecode.object);
console.log(`Bytecode saved to ${bytecodePath}`);

const artifactPath = path.join(buildPath, `${contractName}.json`);
const artifact = {
  contractName: contractName,
  abi: contract.abi,
  bytecode: '0x' + contract.evm.bytecode.object
};
fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2));
console.log(`Complete artifact saved to ${artifactPath}`);

console.log('\nCompilation successful!');
```

Run the compilation:

```bash
node compile.js
```

## Deploy

Create a deployment script `deploy.js`:

```javascript title="deploy.js"
const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

const providerConfig = {
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
  chainId: 420420422,
  name: 'polkadot-hub-testnet',
};

const mnemonic = 'INSERT_MNEMONIC';
const initialOwner = 'INSERT_OWNER_ADDRESS';

async function deployContract(contractName, mnemonic, initialOwner, providerConfig) {
  try {
    console.log(`\nStarting deployment of ${contractName}...`);
    
    const artifactPath = path.join(__dirname, 'build', `${contractName}.json`);
    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Contract artifact not found at ${artifactPath}. Please run compile.js first.`);
    }
    
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    
    console.log(`Connecting to ${providerConfig.name}...`);
    const provider = new ethers.JsonRpcProvider(providerConfig.rpc, {
      chainId: providerConfig.chainId,
      name: providerConfig.name
    });
    
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    const signer = wallet.connect(provider);
    
    console.log(`Deploying from address: ${signer.address}`);
    
    const balance = await provider.getBalance(signer.address);
    console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);
    
    if (balance === 0n) {
      throw new Error('Insufficient balance for deployment');
    }
    
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer);
    
    console.log(`\nDeploying contract with initialOwner: ${initialOwner}...`);
    const contract = await factory.deploy(initialOwner);
    
    console.log(`Waiting for deployment transaction: ${contract.target}...`);
    await contract.waitForDeployment();
    
    const contractAddress = await contract.getAddress();
    
    console.log(`\n${contractName} deployed successfully!`);
    console.log(`Contract address: ${contractAddress}`);
    console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);
    
    const deploymentInfo = {
      contractName: contractName,
      address: contractAddress,
      deployer: signer.address,
      initialOwner: initialOwner,
      network: providerConfig.name,
      chainId: providerConfig.chainId,
      transactionHash: contract.deploymentTransaction().hash,
      deployedAt: new Date().toISOString()
    };
    
    const deploymentPath = path.join(__dirname, 'build', `${contractName}_deployment.json`);
    fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
    console.log(`Deployment info saved to ${deploymentPath}`);
    
    return contract;
    
  } catch (error) {
    console.error(`\nDeployment failed: ${error.message}`);
    throw error;
  }
}

deployContract('MyNFT', mnemonic, initialOwner, providerConfig)
  .then(() => {
    console.log('\nDeployment completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nDeployment error:', error);
    process.exit(1);
  });

```

Replace the `INSERT_MNEMONIC` and `INSERT_OWNER_ADDRESS` placeholders with your actual mnemonic and desired owner address.

!!! warning
    Never embed private keys, mnemonic phrases, or security-sensitive credentials directly into your JavaScript, TypeScript, or any front-end/client-side files.

Execute the deployment:

```bash
node deploy.js
```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to the Polkadot Hub using Ethers.js.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/ethers/)

</div>
