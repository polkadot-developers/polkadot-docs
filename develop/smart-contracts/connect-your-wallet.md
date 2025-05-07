---
title: Connect Your Wallet to Polkadot
description: Learn to connect MetaMask to Polkadot Hub. Set up your wallet, switch networks, and request test tokens for development.
---

# Connect Your Wallet

## Connect to Polkadot Hub Using MetaMask

MetaMask is a popular wallet for interacting with Ethereum-compatible chains. It allows users to connect to test networks that support Ethereum-based smart contracts. This article guides setting up MetaMask, connecting to the contracts deployed on the Ethereum-compatible test network, Westend Hub, and requesting test tokens for development purposes.

It's important to emphasize that MetaMask primarily facilitates interactions with smart contracts, giving you access to various chain functionalities.

## Prerequisites

To get started with MetaMask, you need to install the [MetaMask extension](https://metamask.io/download/){target=\_blank} and add it to the browser. Once you install MetaMask, you can set up a new wallet and securely store your seed phrase. This phrase is crucial for recovery in case you lose access.

## Connect to the Westend Hub TestNet

To connect to the Westend Hub TestNet via MetaMask, you need to follow these steps:

1. Open the MetaMask extension and click on the network icon to switch to the Westend Hub TestNet

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-1.webp){: .browser-extension}

2. Click on the **Add a custom network** button

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-2.webp){: .browser-extension}

3. Fill in the required fields with the following parameters and click the **Save** button

    === "Network Details"

        **Network name** - `Asset-Hub Westend TestNet`

        ---

        **Currency symbol** - `WND`

        ---
        
        **Chain ID** - ```420420421```

        ---
        
        **Block explorer URL** - ```https://assethub-westend.subscan.io```

    === "RPC Endpoints"
        Dwellir
        ```
        wss://westend-asset-hub-eth-rpc.polkadot.io
        ```
        ---
        Dwellir Tunisia
        ```
        wss://westmint-rpc.polkadot.io
        ```
        ---
        IBP1
        ```
        wss://rpc.ibp.network/asset-hub-westend
        ```
        ---
        IBP2
        ```
        wss://asset-hub-westend.dotters.network
        ```
        ---
        Parity
        ```
        wss://westend-asset-hub-rpc.polkadot.io
        ```


    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-3.webp){: .browser-extension}

4. Click on **Asset-Hub Westend TestNet** to switch the network

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-4.webp){: .browser-extension}


## Request Test Tokens

To start conducting transactions and interacting with smart contracts on the Westend Hub TestNet, you'll need WND test tokens. Here's how to get them:

1. Navigate to the [Westend Hub Faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}

2. Copy your MetaMask address linked to Westend Hub and paste it into the designated field

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-5.webp)

3. Click the **Get Some WND** button to request free test WND tokens. These tokens will be sent to your MetaMask wallet shortly

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-6.webp)

Congratulations! You have successfully connected to Westend Hub using MetaMask and acquired test tokens. This setup allows you to experiment with the network's functionalities without using real ether or encountering financial risks. Remember to keep your MetaMask credentials secure and never share your wallet's private key or seed phrase with anyone.