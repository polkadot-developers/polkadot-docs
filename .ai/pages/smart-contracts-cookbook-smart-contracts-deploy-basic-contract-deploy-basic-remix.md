---
title: Remix IDE
description: Learn how to deploy a basic smart contract to Polkadot Hub using Remix IDE Ideal for rapid prototyping, learning, and visual development.
categories: Smart Contracts
url: https://docs.polkadot.com/smart-contracts/cookbook/smart-contracts/deploy-basic-contract/deploy-basic-remix/
---

[Remix IDE](https://remix.live/){target=\_blank} offers a visual, browser-based environment perfect for rapid prototyping and learning. It requires no local installation and provides an intuitive interface for contract development.

**Prerequisites:**

- Basic understanding of Solidity programming.
- Test tokens for gas fees (available from the [Polkadot faucet](https://faucet.polkadot.io/){target=\_blank}).
- A wallet with a private key for signing transactions.

### Access Remix

Navigate to [https://remix.polkadot.io/](https://remix.polkadot.io/){target=\_blank} in your web browser.

The interface will load with a default workspace containing sample contracts. In this interface, you can access a file explorer, edit your code, interact with various plugins for development, and use a terminal. By default, you will see the `contracts` folder with the `Storage.sol` file:

![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic-pvm/deploy-basic-pvm-01.webp)

### Compile

1. To compile your contract:
    1. Navigate to the **Solidity Compiler** tab, which is the third icon in the left sidebar.
    2. Click **Compile Storage.sol** or press `Ctrl+S`.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic-pvm/deploy-basic-pvm-02.webp)

Compilation errors and warnings appear in the terminal panel at the bottom of the screen.

### Deploy

1. Navigate to the **Deploy & Run Transactions** tab.
2. Click the **Environment** dropdown and select **Injected Provider - MetaMask** (ensure your MetaMask wallet is connected to Polkadot Hub TestNet).
3. Click **Deploy**.
4. Approve the transaction in your MetaMask wallet.

    ![](/images/smart-contracts/cookbook/smart-contracts/deploy-basic/deploy-basic-pvm/deploy-basic-pvm-03.webp)

Your deployed contract will appear in the **Deployed Contracts** section, ready for interaction.

### Next Steps

- Deploy an ERC-20 token on Polkadot Hub, either using the [Deploy an ERC-20](/smart-contracts/cookbook/smart-contracts/deploy-erc20) guide or the [Deploy an ERC-20 to Polkadot Hub](/smart-contracts/cookbook/smart-contracts/deploy-erc20) guide.
- Deploy an NFT on Polkadot Hub, either using the [Deploy an NFT](/smart-contracts/cookbook/smart-contracts/deploy-nft) guide or the [Deploy an NFT to Polkadot Hub](/smart-contracts/cookbook/smart-contracts/deploy-nft) guide.
- Check out in details each [development environment](/smart-contracts/dev-environments/).
