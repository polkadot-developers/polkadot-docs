---
title: Deploy an NFT to Polkadot Hub (EVM)
description: Learn how to deploy an ERC-721 NFT contract to Polkadot Hub using standard EVM tools and toolchains.
categories: Smart Contracts
---

# Deploy an NFT (EVM)

## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification. Deploying NFT contracts to the [Polkadot Hub](/smart-contracts/overview/#smart-contract-development){target=\_blank} can be accomplished using standard EVM development tools and workflows.

This guide demonstrates how to deploy an [ERC-721](https://eips.ethereum.org/EIPS/eip-721){target=\_blank} NFT contract using four popular EVM approaches: JavaScript with Ethers.js, Remix IDE, Hardhat, and Foundry. The contract uses [OpenZeppelin's battle-tested NFT implementation](https://github.com/OpenZeppelin/openzeppelin-contracts){target=\_blank} to ensure security and standard compliance.

All these tools use standard Solidity compilation to generate EVM bytecode, making them compatible with Polkadot Hub's EVM environment. Whether you prefer working with lightweight JavaScript libraries, visual browser-based IDEs, comprehensive development frameworks, or fast command-line toolkits, this guide covers the deployment process for each approach.

**Prerequisites:**

- Basic understanding of Solidity programming and NFT standards
- Node.js v22.13.1 or later (for JavaScript/Hardhat approaches)
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/))
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
const solc = require('solc');
const { readFileSync, writeFileSync } = require('fs');
const { basename, join } = require('path');

const compileContract = async (solidityFilePath, outputDir) => {
  try {
    // Read the Solidity file
    const source = readFileSync(solidityFilePath, 'utf8');

    // Prepare OpenZeppelin imports
    const openzeppelinPath = join(__dirname, 'node_modules', '@openzeppelin', 'contracts');
    
    // Function to find imports
    function findImports(path) {
      if (path.startsWith('@openzeppelin/contracts/')) {
        const contractPath = path.replace('@openzeppelin/contracts/', '');
        try {
          return {
            contents: readFileSync(join(openzeppelinPath, contractPath), 'utf8')
          };
        } catch (error) {
          return { error: 'File not found' };
        }
      }
      return { error: 'File not found' };
    }

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
    const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

    if (output.errors) {
      output.errors.forEach(error => {
        console.error('Compilation error:', error.message);
      });
      if (output.errors.some(error => error.severity === 'error')) {
        return;
      }
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
        writeFileSync(bytecodePath, contract.evm.bytecode.object);
        console.log(`Bytecode saved to ${bytecodePath}`);
      }
    }
  } catch (error) {
    console.error('Error compiling contracts:', error);
  }
};

const solidityFilePath = join(__dirname, 'contracts/MyNFT.sol');
const outputDir = join(__dirname, 'contracts');

compileContract(solidityFilePath, outputDir);
```

Run the compilation:

```bash
node compile.js
```

### Deploy the Contract

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

const deployContract = async (contractName, mnemonic, initialOwner, providerConfig) => {
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
    const contract = await factory.deploy(initialOwner);
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
const initialOwner = 'INSERT_OWNER_ADDRESS';

deployContract('MyNFT', mnemonic, initialOwner, providerConfig);
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

Navigate to [https://remix.ethereum.org/](https://remix.ethereum.org/){target=_blank} in your web browser.

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

### Compile

1. Navigate to the **Solidity Compiler** tab (third icon in the left sidebar)
2. Click **Compile MyNFT.sol** or press `Ctrl+S`

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
7. Approve the transaction in your MetaMask wallet

Your deployed contract will appear in the **Deployed Contracts** section, ready for interaction.

## Hardhat

Hardhat provides a comprehensive development environment with built-in testing, debugging, and deployment capabilities. It's ideal for professional development workflows and team projects.

### Setup

Initialize your Hardhat project:

```bash
mkdir hardhat-nft-deployment
cd hardhat-nft-deployment
npx hardhat init
```

Select **Create a TypeScript project** when prompted.

Install OpenZeppelin contracts:

```bash
npm install @openzeppelin/contracts
```

### Configure Hardhat

Edit `hardhat.config.ts`:

```typescript title="hardhat.config.ts"
import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { vars } from "hardhat/config";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    polkadotHubTestnet: {
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      chainId: 420420422,
      accounts: [vars.get("PRIVATE_KEY")],
    },
  },
};

export default config;
```

Set your private key:

```bash
npx hardhat vars set PRIVATE_KEY
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

- Deploy an ERC-20 token on Polkadot Hub using the [Deploy an ERC-20 (EVM)](/smart-contracts/cookbook/smart-contracts/deploy-erc20-evm) guide
- Deploy a basic contract using the [Deploy a Basic Contract (EVM)](/smart-contracts/cookbook/smart-contracts/deploy-basic-evm) guide
- Check out in details each [development environment](/smart-contracts/dev-environments/)