---
title: Deploy ERC-721 NFT Using Remix
description: Learn how to deploy an ERC-721 NFT contract to Polkadot Hub using Remix, a browser-based IDE for quick prototyping and learning.
tutorial_badge: Beginner
categories: Basics, Smart Contracts
tools: Remix, EVM Wallet, OpenZeppelin
---

# Deploy an NFT with Remix

## Introduction

Non-Fungible Tokens (NFTs) represent unique digital assets commonly used for digital art, collectibles, gaming, and identity verification.

This guide demonstrates how to deploy an [ERC-721](https://eips.ethereum.org/EIPS/eip-721){target=\_blank} NFT contract to [Polkadot Hub](/smart-contracts/overview/#smart-contract-development){target=\_blank}. You'll use [OpenZeppelin's battle-tested NFT implementation](https://github.com/OpenZeppelin/openzeppelin-contracts){target=\_blank} and [Remix](https://remix.ethereum.org/){target=\_blank}, a visual, browser-based environment perfect for rapid prototyping and learning. It requires no local installation and provides an intuitive interface for contract development.

## Prerequisites

- Basic understanding of Solidity programming and NFT standards.
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}). See the [step-by-step instructions](/smart-contracts/faucet/#get-test-tokens){target=\_blank}
- A wallet with a private key for signing transactions.

## Access Remix

Navigate to [Remix](https://remix.ethereum.org/){target=\_blank} in your web browser.

The interface will load with a default workspace containing sample contracts. In this interface, you can access a file explorer, edit your code, interact with various development plugins, and use a terminal.

## Create Your Contract

1. Create a new file `contracts/MyNFT.sol`.
2. Now, paste the following ERC-721 contract code into `MyNFT.sol`:

    ```solidity title="contracts/MyNFT.sol"
    --8<-- 'code/smart-contracts/cookbook/smart-contracts/deploy-erc721-nft/nft-remix/MyNFT.sol'
    ```

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-remix/remix-01.webp)

## Compile the Contract

1. Navigate to the **Solidity Compiler** tab (third icon in the left sidebar).
2. Click **Compile MyNFT.sol** or press `Ctrl+S`.

![](/images/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-remix/remix-02.webp)

Compilation errors and warnings appear in the terminal panel at the bottom of the screen.

## Deploy the Contract

1. Navigate to the **Deploy & Run Transactions** tab.
2. Click the **Environment** dropdown, select **Browser Extension**, and click on **Injected Provider - MetaMask**.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-remix/remix-03.webp)

3. In the deploy section, enter the initial owner address in the constructor parameter field.
4. Click **Deploy**.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-remix/remix-04.webp)

5. Approve the transaction in your MetaMask wallet.

Your deployed contract will appear in the **Deployed Contracts** section, ready for interaction.

Congratulations! You've successfully deployed an ERC-721 NFT contract to the Polkadot Hub TestNet using Remix IDE. Consider the following resources to build upon your progress.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Verify Your Contract__

    ---

    Now that you've deployed an NFT contract, learn how to verify it with Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/dev-environments/remix/verify-a-contract/)

-   <span class="badge guide">Guide</span> __Deploy an ERC-20__

    ---

    Walk through deploying a fully-functional ERC-20 to the Polkadot Hub using Remix.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/cookbook/smart-contracts/deploy-erc20/remix/)

</div>
