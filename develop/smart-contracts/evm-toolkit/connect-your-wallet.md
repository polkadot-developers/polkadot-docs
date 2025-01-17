---
title: Connect your Wallet
description: Learn to connect MetaMask to the Asset Hub blockchain. Set up your wallet, switch networks, and request test tokens for development.
---

# Connect your Wallet

## Connect to Asset Hub Using MetaMask

MetaMask is a popular wallet for interacting with EVM-compatible chains, allowing users to connect to test networks that support Ethereum-based smart contracts. This article provides guidance on setting up MetaMask, connecting to the contracts deployed on the EVM-compatible test network, the Westend Asset Hub, and requesting test tokens for development purposes.

It’s important to emphasize that MetaMask primarily facilitates interactions with smart contracts, giving you access to various functionalities available on the chain.

## Prerequisites

To get started with MetaMask, you need to install the [MetaMask extension](https://metamask.io/download/){target=\_blank} and add it to the browser. Once you install MetaMask, you can set up a new wallet and securely store your seed phrase. This phrase is crucial for recovery in case you lose access.

## Connect to the Asset Hub Westend TestNet

To connect to the Westend Asset Hub TestNet via MetaMask, you need to follow these steps:

1. Open the MetaMask extension and click on the network icon to switch to the Asset Hub Westend TestNet

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-1.webp)

2. Click on the **Add a custom network** button

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-2.webp)

3. Fill in the required fields with the following parameters and click the **Save** button

    === "Network Details"

        **Network name** - `Asset-Hub Westend TestNet`

        ---

        **Currency symbol** - `WND`

        ---
        
        **Chain ID** - ```420420421```

        ---
        
        **Block explorer URL** - ```https://assethub-westend.subscan.io```

        ---

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


    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-3.webp)

4. Click on the **Asset-Hub Westend TestNet** to switch the network

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-4.webp)


## Request Test Tokens

To start conducting transactions and interacting with smart contracts on the Asset Hub Westend TestNet, you'll need test WND tokens. Here's how to get them:

1. Navigate to the [Westend Asset Hub Faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}

2. Copy your MetaMask address linked to the Westend Asset Hub and paste it into the designated field

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-5.webp)

3. Click the **Get Some WND** button to request free test WND tokens. These tokens will be sent to your MetaMask wallet shortly

    ![](/images/develop/smart-contracts/evm-toolkit/connect-your-wallet/connect-your-wallet-6.webp)

## Conclusion

Congratulations! You have successfully connected to the Westend Asset Hub using MetaMask and acquired test tokens. This setup allows you to experiment with the network’s functionalities without using real ether or encountering financial risks. Remember to keep your MetaMask credentials secure and never share your wallet’s private key or seed phrase with anyone.