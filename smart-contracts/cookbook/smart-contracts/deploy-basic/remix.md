---
title: Deploy a Basic Contract with Remix IDE
description: Learn how to deploy a basic smart contract to Polkadot Hub using Remix IDE Ideal for rapid prototyping, learning, and visual development.
categories: Smart Contracts
---

# Deploy a Basic Contract with Remix IDE

This guide demonstrates how to deploy a basic Solidity smart contract to Polkadot Hub using [Remix IDE](https://remix.ethereum.org/){target=\_blank}, which offers a visual, browser-based environment perfect for rapid prototyping and learning. It requires no local installation and provides an intuitive interface for contract development.

## Prerequisites:

- Basic understanding of Solidity programming.
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}). See the [step-by-step instructions](/smart-contracts/faucet/#get-test-tokens){target=\_blank}.
- A wallet with a private key for signing transactions.

## Access Remix

Navigate to [Remix](https://remix.ethereum.org/){target=\_blank} in your web browser.

The interface will load with a default workspace containing sample contracts. In this interface, you can access a file explorer, edit your code, interact with various plugins for development, and use a terminal. By default, you will see the `contracts` folder with the `Storage.sol` file, which will be used as the example contract throughout this guide.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic/deploy-basic-01.webp)

## Compile

1. Navigate to the **Solidity Compiler** tab, which is the third icon in the left sidebar.
2. Click **Compile Storage.sol** or press `Ctrl+S`.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic/deploy-basic-02.webp)

Compilation errors and warnings appear in the terminal panel at the bottom of the screen.

## Deploy

1. Navigate to the **Deploy & Run Transactions** tab.
2. Click the **Environment** dropdown and select **Injected Provider - MetaMask** (ensure your MetaMask wallet is connected to Polkadot Hub TestNet).
3. Click **Deploy**.
4. Approve the transaction in your MetaMask wallet.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic/deploy-basic-03.webp)

Your deployed contract will appear in the **Deployed Contracts** section, ready for interaction.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Verify Your Contract__

    ---

    Now that you've deployed a basic contract, learn how to verify it with Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/verify-a-contract/)

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to the Polkadot Hub using Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/remix/)

-   <span class="badge guide">Guide</span> __Deploy an NFT__

    ---

    Walk through deploying a NFT to the Polkadot Hub using Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-nft/remix/)        

</div>