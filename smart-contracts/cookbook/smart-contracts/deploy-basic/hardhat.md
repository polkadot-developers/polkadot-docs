---
title: Deploy a Basic Contract with Hardhat
description: Learn how to deploy a basic smart contract to Polkadot Hub using Hardhat, Perfect for professional workflows requiring comprehensive testing and debugging.
categories: Smart Contracts
---

# Deploy a Basic Contract with

This guide demonstrates how to deploy a basic Solidity smart contract to Polkadot Hub using [Hardhat](https://hardhat.org/){target=\_blank}, which provides a comprehensive development environment with built-in testing, debugging, and deployment capabilities. It's ideal for professional development workflows and team projects.

## Prerequisites:

- Basic understanding of Solidity programming.
- [Node.js](https://nodejs.org/en/download){target=\_blank} v22.13.1 or later.
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}). See the [step-by-step instructions](/smart-contracts/faucet/#get-test-tokens){target=\_blank}.
- A wallet with a private key for signing transactions.

## Set Up Your Project

Initialize your Hardhat project:

```bash
mkdir hardhat-deployment
cd hardhat-deployment
npx hardhat --init
```

## Configure Hardhat

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

!!! tip
    Learn how to use Hardhat's [Config Variables](https://hardhat.org/docs/learn-more/configuration-variables){target=\_blank} to handle your private keys in a secure way.

## Create Your Contract

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

## Compile

```bash
npx hardhat build
```

## Set Up Deployment

Create a deployment module in `ignition/modules/Storage.ts`:

```typescript title="ignition/modules/Storage.ts"
import { buildModule } from '@nomicfoundation/hardhat-ignition/modules';

export default buildModule('StorageModule', (m) => {
    const storage = m.contract('Storage');
    return { storage };
});
```

## Deploy the Contract

Deploy to Polkadot Hub TestNet:

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