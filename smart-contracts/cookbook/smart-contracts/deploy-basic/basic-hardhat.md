---
title: Deploy a Basic Contract with Hardhat
description: Learn how to deploy a basic smart contract to Polkadot Hub using Hardhat, ideal for professional workflows that require comprehensive testing and debugging.
categories: Smart Contracts
---

# Deploy a Basic Contract with Hardhat

## Introduction

This guide demonstrates how to deploy a basic Solidity smart contract to Polkadot Hub TestNet using [Hardhat](https://hardhat.org/){target=\_blank}, which provides a comprehensive development environment with built-in testing, debugging, and deployment capabilities. It's ideal for professional development workflows and team projects.

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
npx hardhat@^2.27.0 init
```

## Configure Hardhat

Open `hardhat.config.ts` and update to add `polkadotTestnet` to the `networks` configuration as highlighted in the following example code:

```typescript title='hardhat.config.ts' hl_lines='19-23'
--8<-- 'code/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/hardhat.config.ts'
```

!!! tip
    Visit the Hardhat [Configuration variables](https://v2.hardhat.org/hardhat-runner/docs/guides/configuration-variables){target=\_blank} documentation to learn how to use Hardhat to handle your private keys securely.

## Create the Contract

Follow these steps to create your smart contract:

1. Delete the default contract file(s) in the `contracts` directory.

2. Create a new file named `Storage.sol` inside the `contracts` directory.

3. Add the following code to create the `Storage.sol` smart contract:

    ```solidity title="Storage.sol"
    --8<-- 'code/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/Storage.sol'
    ```

## Compile the Contract

Compile your `Storage.sol` contract using the following command:

```bash
npx hardhat compile
```

You will see a message in the terminal confirming the contract was successfully compiled, similar to the following:

--8<-- 'code/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/compile-output.html'

## Deploy the Contract

You are now ready to deploy the contract to your chosen network. This example demonstrates deployment to the Polkadot TestNet. Deploy the contract as follows:

1. Delete the default file(s) inside the `ignition/modules` directory.

2. Create a new file named `Storage.ts` inside the `ignition/modules` directory.

3. Open `ignition/modules/Storage.ts` and add the following code to create your deployment module:

    ```typescript title="ignition/modules/Storage.ts"
    --8<-- 'code/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/storage.ts'
    ```

4. Deploy your contract to Polkadot Hub TestNet using the following command:

    ```bash
    npx hardhat ignition deploy ignition/modules/Storage.ts --network polkadotTestnet 
    ```

5. Confirm the target deployment network name and chain ID when prompted:

    --8<-- 'code/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-hardhat/deploy-output.html'

Congratulations! You've now deployed a basic smart contract to Polkadot Hub TestNet using Hardhat. Consider the following resources to build upon your progress.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to the Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-hardhat/)

-   <span class="badge guide">Guide</span> __Deploy an NFT__

    ---

    Walk through deploying an NFT to the Polkadot Hub using Hardhat.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-hardhat/)

</div>