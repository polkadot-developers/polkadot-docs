---
title: Deploy a Basic Contract to Polkadot Hub (EVM)
description: Learn how to deploy a basic smart contract to Polkadot Hub using standard EVM tools and toolchains.
categories: Smart Contracts
---

# Deploy a Basic Contract (EVM)

## Introduction

Deploying smart contracts to Polkadot Hub can be accomplished using standard EVM development tools and workflows. This guide demonstrates how to deploy a basic smart contract using four popular EVM approaches: JavaScript with Ethers.js, Remix IDE, Hardhat, and Foundry.

All these tools use standard Solidity compilation to generate EVM bytecode, making them compatible with Polkadot Hub's EVM environment. Whether you prefer working with lightweight JavaScript libraries, visual browser-based IDEs, comprehensive development frameworks, or fast command-line toolkits, this guide covers the deployment process for each approach.

**Prerequisites:**

- Basic understanding of Solidity programming
- Node.js v22.13.1 or later (for JavaScript/Hardhat approaches)
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/))
- A wallet with a private key for signing transactions

## JavaScript with Ethers.js

Ethers.js provides a lightweight approach for deploying contracts using pure JavaScript. This method is ideal for developers who want programmatic control over the deployment process or need to integrate contract deployment into existing applications.

### Setup

First, initialize your project and install dependencies:

```bash
mkdir ethers-deployment
cd ethers-deployment
npm init -y
npm install ethers solc
```

### Create and Compile Your Contract

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
        writeFileSync(bytecodePath, contract.evm.bytecode.object);
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

### Deploy the Contract - TODO [https://github.com/paritytech/contract-issues/issues/200]

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

Execute the deployment:

```bash
node deploy.js
```

After running this script, your contract will be deployed to Polkadot Hub, and its address will be saved in `contract-address.json` within your project directory. You can use this address for future contract interactions.

## Remix IDE

Remix IDE offers a visual, browser-based environment perfect for rapid prototyping and learning. It requires no local installation and provides an intuitive interface for contract development.

### Access Remix

Navigate to [https://remix.ethereum.org/](https://remix.ethereum.org/){target=_blank} in your web browser.

The interface will load with a default workspace containing sample contracts. In this interface, you can access a file explorer, edit your code, interact with various plugins for development, and use a terminal. By default, you will see the `contracts` folder with the `Storage.sol` file.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic-evm/deploy-basic-evm-01.webp)
images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic-pvm/deploy-basic-evm/deploy-basic-evm-01.webp
### Compile

1. To compile your contract:
    1. Navigate to the **Solidity Compiler** tab (third icon in the left sidebar).
    2. Click **Compile Storage.sol** or press `Ctrl+S`.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic-evm/deploy-basic-evm-02.webp)

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
5. Click **Deploy**
6. Approve the transaction in your MetaMask wallet

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic-evm/deploy-basic-evm-03.webp)

Your deployed contract will appear in the **Deployed Contracts** section, ready for interaction.

## Hardhat

Hardhat provides a comprehensive development environment with built-in testing, debugging, and deployment capabilities. It's ideal for professional development workflows and team projects.

### Setup

Initialize your Hardhat project:

```bash
mkdir hardhat-deployment
cd hardhat-deployment
npx hardhat --init
```

### Configure Hardhat

Edit `hardhat.config.js`:

```javascript title="hardhat.config.js" hl_lines="39-43"
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
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      chainId: 420420422,
      accounts: [configVariable("PRIVATE_KEY")],
    },
  },
};

export default config;

```

### Create Your Contract

Replace the default contract in `contracts/Storage.sol`:

```solidity
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

### Compile

```bash
npx hardhat build
```

### Set Up Deployment

Create a deployment module in `ignition/modules/Storage.js`:

```typescript title="ignition/modules/Storage.js"
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('StorageModule', (m) => {
    const storage = m.contract('Storage');
    return { storage };
});
```

### Deploy

Deploy to Polkadot Hub TestNet:

```bash
npx hardhat ignition deploy ignition/modules/Storage.ts --network polkadotHubTestnet 
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
forge init foundry-deployment
cd foundry-deployment
```

### Configure Foundry

Edit `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]

[rpc_endpoints]
polkadot_hub_testnet = "https://testnet-passet-hub-eth-rpc.polkadot.io"
```

### Create Your Contract

Replace the default contract in `src/Storage.sol`:

```solidity title="src/Storage.sol"
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

### Compile

```bash
forge build
```

Verify the compilation by inspecting the bytecode:

```bash
forge inspect Storage bytecode
```

### Deploy

Deploy to Polkadot Hub TestNet:

```bash
forge create Storage \
    --rpc-url polkadot_hub_testnet \
    --private-key YOUR_PRIVATE_KEY \
    --broadcast
```

## Conclusion

This guide has demonstrated four different approaches to deploying smart contracts on Polkadot Hub using standard EVM tools. Each method offers distinct advantages:

- **Ethers.js**: Best for lightweight, programmatic deployments and application integration
- **Remix IDE**: Ideal for rapid prototyping, learning, and visual development
- **Hardhat**: Perfect for professional workflows requiring comprehensive testing and debugging
- **Foundry**: Excellent for developers who prefer fast, command-line driven development

All approaches use standard Solidity compilation to generate EVM bytecode, ensuring your contracts run on Polkadot Hub's EVM environment. Choose the tool that best fits your workflow and project requirements.

### Next Steps

- Explore [interacting with deployed contracts](/develop/smart-contracts/evm-toolkit/ethers-js/#interact-with-the-contract)
- Learn about [testing smart contracts](/develop/smart-contracts/evm-toolkit/hardhat/#test-your-contract)
- Dive deeper into [Polkadot smart contracts](/develop/smart-contracts/)
- Check out [OpenZeppelin contracts](https://www.openzeppelin.com/solidity-contracts) for production-ready templates
