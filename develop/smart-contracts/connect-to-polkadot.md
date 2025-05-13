---
title: Connect to Polkadot
description: Explore how to connect to Polkadot Hub, configure your wallet, and obtain test tokens for developing and testing smart contracts.
---

# Connect to Polkadot

<div class="button-wrapper">
    <a href="#" class="md-button connectMetaMask" value="westendAssetHub">Connect to Westend Hub</a>
</div>

## Networks Details

Developers can leverage smart contracts across diverse networks, from TestNets to MainNet. This section outlines the network specifications and connection details for each environment.

=== "Westend Hub"

    Network name
    ```text
    Westend Asset Hub
    ```

    ---

    Currency symbol
    ```text
    WND
    ```

    ---
    
    Chain ID
    ```text
    420420421
    ```

    ---
    
    RPC URL
    ```text
    https://westend-asset-hub-rpc.polkadot.io
    ```

    ---
    
    Block explorer URL
    ```text
    https://assethub-westend.subscan.io
    ```

## Connect Your Wallet

### MetaMask

[MetaMask](https://metamask.io/){target=\_blank} is a popular wallet for interacting with Ethereum-compatible chains. It allows users to connect to test networks that support Ethereum-based smart contracts. However, it's important to emphasize that MetaMask primarily facilitates interactions with smart contracts, giving users access to various chain functionalities. 

To get started with MetaMask, you need to install the [MetaMask extension](https://metamask.io/download/){target=\_blank} and add it to the browser. Once you install MetaMask, you can set up a new wallet and securely store your seed phrase. This phrase is crucial for recovery in case you lose access.

For example, to connect to the Westend Hub TestNet via MetaMask, you need to follow these steps:

1. Open the MetaMask extension and click on the network icon to switch to the Westend Hub TestNet

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-1.webp){: .browser-extension}

2. Click on the **Add a custom network** button

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-2.webp){: .browser-extension}

3. Complete the necessary fields using the parameters in the [Specifications](#specifications) section, then click the **Save** button (refer to the [Networks](#networks) section for copy and paste parameters)

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-3.webp){: .browser-extension}

4. Click on **Asset-Hub Westend TestNet** to switch the network

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-4.webp){: .browser-extension}

The steps in the preceding section can be used to connect to any chain by modifying the network specification and endpoint parameters.

### Talisman

[Talisman](https://talisman.xyz/){target=\_blank} is a specialized wallet for the Polkadot ecosystem that supports both Substrate and EVM accounts, making it an excellent choice for Polkadot Hub interactions. Talisman offers a more integrated experience for Polkadot-based chains while still providing Ethereum compatibility.

To use Talisman with Polkadot Hub:

1. Install the [Talisman extension](https://talisman.xyz/download){target=\_blank} and set up your wallet by following the on-screen instructions
2. Once installed, click on the Talisman icon in your browser extensions and select Networks dropdown:  

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-7.webp){: .browser-extension}

3. Search for **Westend Asset Hub** in the list of networks and select it (ensure that the checkbox **Enable Testnets** is enabled to view the available testnets):

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-8.webp){: .browser-extension}

After selecting the network, Talisman will automatically configure the necessary RPC URL and chain ID for you. You can now use Talisman to interact with Westend Asset Hub.

## Test Tokens

You will need testnet tokens to perform transactions and engage with smart contracts on any chain. Here's how to obtain Westend (WND) tokens for testing purposes:

1. Navigate to the [Polkadot Faucet](https://faucet.polkadot.io){target=\_blank}. If the desired network is not already selected, choose it from the Network drop-down

2. Copy your MetaMask address linked to Westend and paste it into the designated field

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-5.webp)

3. Click the **Get Some WND** button to request free test WND tokens. These tokens will be sent to your MetaMask wallet shortly

    ![](/images/develop/smart-contracts/connect-to-asset-hub/connect-to-asset-hub-6.webp)

Now that you have obtained WND tokens in your MetaMask wallet, you’re ready to deploy and interact with smart contracts on Westend Hub! These tokens will allow you to pay for gas fees when executing transactions, deploying contracts, and testing your dApp functionality in a secure testnet environment. 

## Where to Go Next

For your next steps, explore the various smart contract guides demonstrating how to use and integrate different tools and development environments into your workflow.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Deploy your first contract with Remix__

    ---

    Explore the smart contract development and deployment process on Polkadot Hub using the Remix IDE.

    [:octicons-arrow-right-24: Build with Remix IDE](/develop/smart-contracts/dev-environments/remix/)

-   <span class="badge guide">Guide</span> __Interact with the blockchain with viem__

    ---

    Use viem for interacting with Ethereum-compatible chains, to deploy and interact with smart contracts on Polkadot Hub.

    [:octicons-arrow-right-24: Build with viem](/develop/smart-contracts/libraries/viem/)

</div>

