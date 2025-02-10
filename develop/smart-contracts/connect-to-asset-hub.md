---
title: Connect to Asset Hub
description: Explore how to connect to different Asset Hub networks, configure your wallet, and obtain test tokens for developing and testing smart contracts.
---

# Connect to Asset Hub

## Networks

Developers can leverage Asset Hub across diverse networks, from TestNets to MainNet. This section outlines the network specifications and connection details for each environment.

### Specifications

=== "Westend Asset Hub"

    Network name
    ```
    Asset-Hub Westend TestNet
    ```

    ---

    Currency symbol
    ```
    WND
    ```

    ---
    
    Chain ID
    ```
    420420421
    ```

    ---
    
    Block explorer URL
    ```
    https://assethub-westend.subscan.io
    ```

### Endpoints

=== "Westend Asset Hub"
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

## Connect your Wallet

### Metamask

MetaMask is a popular wallet for interacting with EVM-compatible chains. It allows users to connect to test networks that support Ethereum-based smart contracts. However, it's important to emphasize that MetaMask primarily facilitates interactions with smart contracts, giving users access to various chain functionalities.

To get started with MetaMask, you need to install the [MetaMask extension](https://metamask.io/download/){target=\_blank} and add it to the browser. Once you install MetaMask, you can set up a new wallet and securely store your seed phrase. This phrase is crucial for recovery in case you lose access.

For example, to connect to the Westend Asset Hub TestNet via MetaMask, you need to follow these steps:

1. Open the MetaMask extension and click on the network icon to switch to the Asset Hub Westend TestNet

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-1.webp){: .browser-extension}

2. Click on the **Add a custom network** button

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-2.webp){: .browser-extension}

3. Complete the necessary fields using the parameters in the [Specifications](#specifications) section, then click the **Save** button (refer to the [Networks](#networks) section for copy and paste parameters)

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-3.webp){: .browser-extension}

4. Click on **Asset-Hub Westend TestNet** to switch the network

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-4.webp){: .browser-extension}

The steps in the preceding section can be used to connect to any Asset Hub chain by modifying the network specification and endpoint parameters.

## Test Tokens

You will need testnet tokens to perform transactions and engage with smart contracts on any Asset Hub chain. Here's how to obtain Westend Asset Hub (WND) tokens for testing purposes:

1. Navigate to the [Polkadot Faucet](https://faucet.polkadot.io){target=\_blank}

2. Copy your MetaMask address linked to Westend Asset Hub and paste it into the designated field

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-5.webp)

3. Click the **Get Some WND** button to request free test WND tokens. These tokens will be sent to your MetaMask wallet shortly

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-6.webp)