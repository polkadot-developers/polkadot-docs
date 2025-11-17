---
title: Deploy a Contract with Hardhat
description: Learn how to deploy a basic smart contract to Polkadot Hub using Hardhat, Perfect for professional workflows requiring comprehensive testing and debugging.
categories: Smart Contracts
---

# Deploy Basic Contract with Hardhat

## Introduction

This guide demonstrates how to deploy a basic Solidity smart contract to Polkadot Hub using [Hardhat](https://hardhat.org/){target=\_blank}, which provides a comprehensive development environment with built-in testing, debugging, and deployment capabilities. It's ideal for professional development workflows and team projects.

## Prerequisites

Before you begin, ensure you have the following:

- A basic understanding of [Solidity](https://www.soliditylang.org/){target=\_blank} programming.
- [Node.js](https://nodejs.org/en/download){target=\_blank} v22.13.1 or later installed.
- Test tokens for gas fees, available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. See [Get Test Tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} for a guide to using the faucet.
- A wallet with a private key for signing transactions.

## Set Up Your Project

Use the following terminal commands to create a directory and initialize your Hardhat project inside of it:

```bash
mkdir hardhat-deployment
cd hardhat-deployment
npx hardhat --init
```

## Configure Hardhat

Open `hardhat.config.js` and update to add `polkadotHubTestnet` to the `networks` configuration as highlighted in the following example code:

```javascript title='hardhat.config.js' hl_lines='39-43'
import type { HardhatUserConfig } from 'hardhat/config';

import hardhatToolboxViemPlugin from '@nomicfoundation/hardhat-toolbox-viem';
import { configVariable } from 'hardhat/config';

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: '0.8.28',
      },
      production: {
        version: '0.8.28',
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
      type: 'edr-simulated',
      chainType: 'l1',
    },
    hardhatOp: {
      type: 'edr-simulated',
      chainType: 'op',
    },
    sepolia: {
      type: 'http',
      chainType: 'l1',
      url: configVariable('SEPOLIA_RPC_URL'),
      accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],
    },
    polkadotHubTestnet: {
      url: 'https://testnet-passet-hub-eth-rpc.polkadot.io',
      chainId: 420420422,
      accounts: [configVariable('PRIVATE_KEY')],
    },
  },
};

export default config;

```

!!! tip
    Learn how to use Hardhat's [Config Variables](https://hardhat.org/docs/learn-more/configuration-variables){target=\_blank} to handle your private keys in a secure way.

## Create the Contract

Follow these steps to create your smart contract:

1. Delete the default contract file(s) in the `contracts` directory.

2. Create a new file named `Storage.sol` inside the `contracts` directory.

3. Add the following code to create the `Storage.sol` smart contract:

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

## Compile the Contract

Compile your `Storage.sol` contract using the following command:

```bash
npx hardhat build
```

You will see a message in the terminal confirming the contract was successfully compiled similar to the following:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx hardhat build</span>
  <span data-ty>Downloading solc 0.8.28</span>
  <span data-ty>Downloading solc 0.8.28 (WASM build)</span>
  <span data-ty>Compiled 1 Solidity file with solc 0.8.28 (evm target: cancun)</span>
  <span data-ty="input"><span class="file-path"></span></span>
</div>

## Set Up Deployment

1. Delete the default file(s) inside the `ignition/modules` directory.

2. Create a new file named `Storage.ts` inside the `ignition/modules` directory.

3. Open `ignition/modules/Storage.ts` and add the following code to create your deployment module:

  ```typescript title="ignition/modules/Storage.ts"
  import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

  export default buildModule('StorageModule', (m) => {
    const storage = m.contract('Storage');
    return { storage };
  });
  ```

## Deploy the Contract

Deploy your contract to Polkadot Hub TestNet using the following command:

```bash
npx hardhat ignition deploy ignition/modules/Storage.ts --network polkadotHubTestnet 
```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Verify Your Contract__

    ---

    Now that you've deployed a basic contract, learn how to verify it with Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/hardhat/verify-a-contract/)

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to the Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/hardhat/)

-   <span class="badge guide">Guide</span> __Deploy an NFT__

    ---

    Walk through deploying a NFT to the Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/hardhat/)

</div>