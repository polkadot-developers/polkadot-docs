---
title: Wallets for Polkadot Hub
description: Comprehensive guide to connecting and managing wallets for Polkadot Hub, covering step-by-step instructions for interacting with the ecosystem.
---

# Wallets for Polkadot Hub

--8<-- 'text/smart-contracts/polkaVM-warning.md'

## Introduction

Connecting a compatible wallet is the first essential step for interacting with the Polkadot Hub ecosystem. This guide explores wallet options that support both Substrate and Ethereum compatible layers, enabling transactions and smart contract interactions. Whether you're a developer testing on Polkadot Hub or a user accessing the MainNet, understanding wallet configuration is crucial for accessing the full range of Polkadot Hub's capabilities.

## Connect Your Wallet

### MetaMask

[MetaMask](https://metamask.io/){target=\_blank} is a popular wallet for interacting with Ethereum-compatible chains. It allows users to connect to test networks that support Ethereum-based smart contracts. However, it's important to emphasize that MetaMask primarily facilitates interactions with smart contracts, giving users access to various chain functionalities. 

To get started with MetaMask, you need to install the [MetaMask extension](https://metamask.io/download/){target=\_blank} and add it to the browser. Once you install MetaMask, you can set up a new wallet and securely store your seed phrase. This phrase is crucial for recovery in case you lose access.

For example, to connect to the Polkadot Hub TestNet via MetaMask, you need to follow these steps:

1. Open the MetaMask extension and click on the network icon to switch to the Polkadot Hub TestNet

    ![](/images/develop/smart-contracts/wallets/wallets-1.webp){: .browser-extension}

2. Click on the **Add a custom network** button

    ![](/images/develop/smart-contracts/wallets/wallets-2.webp){: .browser-extension}

3. Complete the necessary fields, then click the **Save** button (refer to the [Networks](/develop/smart-contracts/connect-to-polkadot#networks-details) section for copy and paste parameters)

    ![](/images/develop/smart-contracts/wallets/wallets-3.webp){: .browser-extension}

4. Click on **Polkadot Hub TestNet** to switch the network

    ![](/images/develop/smart-contracts/wallets/wallets-4.webp){: .browser-extension}

The steps in the preceding section can be used to connect to any chain by modifying the network specification and endpoint parameters.

### Talisman

[Talisman](https://talisman.xyz/){target=\_blank} is a specialized wallet for the Polkadot ecosystem that supports both Substrate and EVM accounts, making it an excellent choice for Polkadot Hub interactions. Talisman offers a more integrated experience for Polkadot-based chains while still providing Ethereum compatibility.

To use Talisman with Polkadot Hub:

1. Install the [Talisman extension](https://talisman.xyz/download){target=\_blank} and set up your wallet by following the on-screen instructions

2. Once installed, click on the Talisman icon in your browser extensions and click on the **Settings* button:  

    ![](/images/develop/smart-contracts/wallets/wallets-5.webp){: .browser-extension}

3. Click the button **All settings**:

    ![](/images/develop/smart-contracts/wallets/wallets-6.webp){: .browser-extension}

4. Go to the **Networks & Tokens** section:

    ![](/images/develop/smart-contracts/wallets/wallets-7.webp)

5. Click the **Manage networks** button:

    ![](/images/develop/smart-contracts/wallets/wallets-8.webp)

6. Click the **+ Add network** button:

    ![](/images/develop/smart-contracts/wallets/wallets-9.webp)

7. Fill in the form with the required parameters and click the **Add network** button:

    ![](/images/develop/smart-contracts/wallets/wallets-10.webp)

8. After that, you can switch to the Polkadot Hub TestNet by clicking on the network icon and selecting **Polkadot Hub TestNet**:

    ![](/images/develop/smart-contracts/wallets/wallets-11.webp)

After selecting the network, Talisman will automatically configure the necessary RPC URL and chain ID for you. You can now use Talisman to interact with the Polkadot Hub TestNet.


## Conclusion

Choosing the right wallet for Polkadot Hub interactions depends on your specific requirements and familiarity with different interfaces. MetaMask provides a familiar entry point for developers with Ethereum experience, while Talisman offers deeper integration with Polkadot's unique features and native support for both EVM and Substrate accounts. By properly configuring your wallet connection, you gain access to the full spectrum of Polkadot Hub's capabilities.

!!!info
    Remember to always verify network parameters when connecting to ensure a secure and reliable connection to the Polkadot ecosystem.
