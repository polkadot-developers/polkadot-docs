---
title: Deploy Basic Contract with Remix IDE
description: Learn how to deploy a basic smart contract to Polkadot Hub using Remix IDE Ideal for rapid prototyping, learning, and visual development.
categories: Smart Contracts
---

# Deploy Basic Contract with Remix IDE

## Introduction

This guide demonstrates how to deploy a basic Solidity smart contract to Polkadot Hub using [Remix IDE](https://remix.ethereum.org/){target=\_blank}, which offers a visual, browser-based environment perfect for rapid prototyping and learning. It requires no local installation and provides an intuitive interface for contract development.

## Prerequisites

Before you begin, ensure you have the following:

- A basic understanding of [Solidity](https://www.soliditylang.org/){target=\_blank} programming.
- Test tokens for gas fees, available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}. See [Get Test Tokens](/smart-contracts/faucet/#get-test-tokens){target=\_blank} for a guide to using the faucet.
- A wallet with a private key for signing transactions.

## Access Remix

Navigate to [Remix](https://remix.ethereum.org/){target=\_blank} in your web browser.

The interface will load with a default workspace containing sample contracts. In this interface, you can access a file explorer, edit your code, interact with various plugins for development, and use a terminal. By default, you will see the `contracts` folder with the `Storage.sol` file, which will be used as the example contract throughout this guide.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic/deploy-basic-01.webp)

## Compile the Contract

Ensure your contract is open in the Remix IDE Editor, and use the follow steps to compile:

1. Select the **Solidity Compiler** plugin from the left panel.
2. Select the **Compile MyToken.sol** button.
3. The **Solidity Compiler** icon will display a green checkmark once the contract compiles successfully. 

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic/deploy-basic-02.webp)

If any issues arise during Compilation, errors and warnings will appear in the terminal panel at the bottom of the screen.

## Deploy the Contract

Follow these steps to deploy the contract using Remix: 

1. Navigate to the **Deploy & Run Transactions** tab.
2. Select the **Environment** dropdown and select **Injected Provider - MetaMask** (ensure your MetaMask wallet is connected to Polkadot Hub TestNet).
3. Select **Deploy**.
4. Approve the transaction in your MetaMask wallet.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic/deploy-basic-03.webp)

Once successfully deployed, your contract will appear in the **Deployed Contracts** section, ready for interaction.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Verify Your Contract__

    ---

    Now that you've deployed a basic contract, learn how to verify it with Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/verify-a-contract/)

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to the Polkadot Hub using Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix/)

-   <span class="badge guide">Guide</span> __Deploy an NFT__

    ---

    Walk through deploying a NFT to the Polkadot Hub using Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-remix/)        

</div>