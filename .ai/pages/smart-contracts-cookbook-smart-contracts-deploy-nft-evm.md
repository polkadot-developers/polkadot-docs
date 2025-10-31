---
title: Deploy an NFT to Polkadot Hub (EVM)
description: Learn how to deploy an ERC-721 NFT contract to Polkadot Hub using standard EVM tools and toolchains.
categories: Smart Contracts
url: https://docs.polkadot.com/smart-contracts/cookbook/smart-contracts/deploy-nft-evm/
---

# Deploy an NFT (EVM)

## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification. Deploying NFT contracts to the [Polkadot Hub](/smart-contracts/overview/#smart-contract-development){target=\_blank} can be accomplished using standard EVM development tools and workflows.

This guide demonstrates how to deploy an [ERC-721](https://eips.ethereum.org/EIPS/eip-721){target=\_blank} NFT contract using four popular EVM approaches: JavaScript with Ethers.js, Remix IDE, Hardhat, and Foundry. The contract uses [OpenZeppelin's battle-tested NFT implementation](https://github.com/OpenZeppelin/openzeppelin-contracts){target=\_blank} to ensure security and standard compliance.

All these tools use standard Solidity compilation to generate EVM bytecode, making them compatible with Polkadot Hub's EVM environment. Whether you prefer working with lightweight JavaScript libraries, visual browser-based IDEs, comprehensive development frameworks, or fast command-line toolkits, this guide covers the deployment process for each approach.

**Prerequisites:**

- Basic understanding of Solidity programming and NFT standards
- Node.js v22.13.1 or later (for JavaScript/Hardhat approaches)
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank})
- A wallet with a private key for signing transactions

## JavaScript with Ethers.js

Ethers.js provides a lightweight approach for deploying contracts using pure JavaScript. This method is ideal for developers who want programmatic control over the deployment process or need to integrate contract deployment into existing applications.

### Setup

First, initialize your project and install dependencies:

```bash
mkdir ethers-nft-deployment
cd ethers-nft-deployment
npm init -y
npm install ethers@6.15.0 solc@0.8.30 @openzeppelin/contracts@5.0.0
```

### Create and Compile Your Contract

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

### Deploy the Contract

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

Execute the deployment:

```bash
node deploy.js
```

After running this script, your NFT contract will be deployed to Polkadot Hub, and its address will be saved in `contract-address.json` within your project directory. You can use this address for future contract interactions.

## Remix IDE

Remix IDE offers a visual, browser-based environment perfect for rapid prototyping and learning. It requires no local installation and provides an intuitive interface for contract development.

### Access Remix

Navigate to [https://remix.ethereum.org/](https://remix.ethereum.org/){target=\_blank} in your web browser.

The interface will load with a default workspace containing sample contracts. In this interface, you can access a file explorer, edit your code, interact with various plugins for development, and use a terminal.

### Create Your Contract

1. Create a new file `contracts/MyNFT.sol`
2. Paste the following code:

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

![](/images/smart-contracts/cookbook/smart-contracts/deploy-nft/deploy-nft-evm/deploy-nft-evm-1.webp)

### Compile

1. Navigate to the **Solidity Compiler** tab (third icon in the left sidebar)
2. Click **Compile MyNFT.sol** or press `Ctrl+S`

![](/images/smart-contracts/cookbook/smart-contracts/deploy-nft/deploy-nft-evm/deploy-nft-evm-2.webp)

Compilation errors and warnings appear in the terminal panel at the bottom of the screen.

### Deploy

1. Navigate to the **Deploy & Run Transactions** tab
2. Click the **Environment** dropdown and select **Customize this list**
3. Add a custom network with the following details:
   - **Network Name**: Polkadot Hub TestNet
   - **RPC URL**: `https://testnet-passet-hub-eth-rpc.polkadot.io`
   - **Chain ID**: `420420422`
   - **Currency Symbol**: `DOT`
4. Select **Injected Provider - MetaMask** (ensure your MetaMask wallet is connected to Polkadot Hub TestNet)
5. In the deploy section, enter the initial owner address in the constructor parameter field
6. Click **Deploy**

![](/images/smart-contracts/cookbook/smart-contracts/deploy-nft/deploy-nft-evm/deploy-nft-evm-3.webp)

7. Approve the transaction in your MetaMask wallet

Your deployed contract will appear in the **Deployed Contracts** section, ready for interaction.

## Hardhat

Hardhat provides a comprehensive development environment with built-in testing, debugging, and deployment capabilities. It's ideal for professional development workflows and team projects.

### Setup

Initialize your Hardhat project:

```bash
mkdir hardhat-nft-deployment
cd hardhat-nft-deployment
npx hardhat --init
```

Install OpenZeppelin contracts:

```bash
npm install @openzeppelin/contracts
```

### Configure Hardhat

Edit `hardhat.config.ts`:

```typescript title="hardhat.config.ts"
import type { HardhatUserConfig } from "hardhat/config";

import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable } from "hardhat/config";

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
    polkadotHubTestnet: {
      type: "http",
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      chainId: 420420422,
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
};

export default config;
```

### Create Your Contract

Create `contracts/MyNFT.sol`:

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

### Compile

```bash
npx hardhat compile
```

### Set Up Deployment

Create a deployment module in `ignition/modules/MyNFT.ts`:

```typescript title="ignition/modules/MyNFT.ts"
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('MyNFTModule', (m) => {
    const initialOwner = m.getParameter('initialOwner', 'INSERT_OWNER_ADDRESS');
    const myNFT = m.contract('MyNFT', [initialOwner]);
    return { myNFT };
});
```

Replace `INSERT_OWNER_ADDRESS` with your desired owner address.

### Deploy

Deploy to Polkadot Hub TestNet:

```bash
npx hardhat ignition deploy ignition/modules/MyNFT.ts --network polkadotHubTestnet
```

## Foundry

Foundry offers a fast, modular toolkit written in Rust. It's perfect for developers who prefer command-line interfaces and need high-performance compilation and deployment.

### Setup

Install Foundry:

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

Initialize your project:

```bash
forge init foundry-nft-deployment
cd foundry-nft-deployment
```

Install OpenZeppelin contracts:

```bash
forge install OpenZeppelin/openzeppelin-contracts
```

### Configure Foundry

Edit `foundry.toml`:

```toml title="foundry.toml"
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
remappings = ['@openzeppelin/contracts/=lib/openzeppelin-contracts/contracts/']

[rpc_endpoints]
polkadot_hub_testnet = "https://testnet-passet-hub-eth-rpc.polkadot.io"
```

### Create Your Contract

Create `src/MyNFT.sol`:

```solidity title="src/MyNFT.sol"
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

### Compile

```bash
forge build
```

Verify the compilation by inspecting the bytecode:

```bash
forge inspect MyNFT bytecode
```

### Deploy

Deploy to Polkadot Hub TestNet:

```bash
forge create MyNFT \
    --rpc-url polkadot_hub_testnet \
    --private-key YOUR_PRIVATE_KEY \
    --constructor-args YOUR_OWNER_ADDRESS \
    --broadcast
```

Replace `YOUR_PRIVATE_KEY` with your private key and `YOUR_OWNER_ADDRESS` with the address that will own the NFT contract.

## Conclusion

This guide has demonstrated four different approaches to deploying NFT contracts on Polkadot Hub using standard EVM tools. Each method offers distinct advantages:

- **Ethers.js**: Best for lightweight, programmatic deployments and application integration
- **Remix IDE**: Ideal for rapid prototyping, learning, and visual development
- **Hardhat**: Perfect for professional workflows requiring comprehensive testing and debugging
- **Foundry**: Excellent for developers who prefer fast, command-line driven development

All approaches use standard Solidity compilation with OpenZeppelin's ERC-721 implementation to generate EVM bytecode, ensuring your NFT contracts run on Polkadot Hub's EVM environment while maintaining compatibility with the broader Ethereum ecosystem.

### Next Steps

- Check out in details each [development environment](/smart-contracts/dev-environments/).
