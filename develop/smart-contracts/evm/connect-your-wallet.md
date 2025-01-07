---
title: Connect your Wallet
description: Learn to connect MetaMask to the Westend Asset Hub testnet. Set up your wallet, switch networks, and request test WND tokens for development.
---

# Connect your Wallet

## Connect to Asset Hub Using MetaMask

Metamask allows users to connect to the Asset Hub to explore and interact with the chain. This article will guide you step by step on how to set up an EVM-compatible wallet, connect to the Westend Asset Hub, and request test tokens for development testing.

## Prerequisites

To get started with MetaMask, you need to install the [MetaMask extension](https://metamask.io/download/){target=\_blank} and add it to the browser. Once you install MetaMask, you can set up a new wallet and securely store your seed phrase. This phrase is crucial for recovery in case you lose access.

## Connect to the Asset Hub Westend Testnet

To connect to the Westend Asset Hub testnet via Metamask, you need to follow these steps:

1. Open the MetaMask extension and click in the network icon to switch to the Asset Hub Westend Testnet

    ![](/images/develop/smart-contracts/metamask/metamask-connection-1.webp)

2. Click on the **Add a custom network** button

    ![](/images/develop/smart-contracts/metamask/metamask-connection-2.webp)

3. Fill in the required fields with the following parameters and click the **Save** button

    | **Attribute**         | **Value**                                                    |
    |------------------------|-------------------------------------------------------------|
    | **Network name**       | <pre>```Asset-Hub Westend Testnet```</pre>                  |
    | **Default RPC URL**    | <pre>```https://westend-asset-hub-eth-rpc.polkadot.io```</pre> |
    | **Chain ID**           | <pre>```420420421```</pre>                                  |
    | **Currency symbol**    | <pre>```WND```</pre>                                        |
    | **Block explorer URL** | <pre>```https://assethub-westend.subscan.io```       </pre> |

    ![](/images/develop/smart-contracts/metamask/metamask-connection-3.webp)

4. Click on the **Asset-Hub Westend Testnet** to switch the network

    ![](/images/develop/smart-contracts/metamask/metamask-connection-4.webp)


## Request Test Tokens

To start conducting transactions and interacting with smart contracts on the Westend testnet, you'll need test WND tokens. Here's how to get them:

1. Navigate to the [Westend Faucet](https://faucet.polkadot.io/westend?parachain=1000){target=\_blank}

2. Copy your MetaMask address linked to the Westend Asset Hub and paste it into the designated field on the Faucet page

    ![](/images/develop/smart-contracts/metamask/metamask-connection-5.webp)

3. Click **Get Some WND** button to request free test WND tokens. These tokens will be sent to your MetaMask wallet shortly.

    ![](/images/develop/smart-contracts/metamask/metamask-connection-6.webp)

## Conclusion

Congratulations! You have successfully connected to the Westend Asset Hub using MetaMask and acquired test tokens. This setup allows you to experiment with the network’s functionalities without using real ether or encountering financial risks. Remember to keep your MetaMask credentials secure and never share your wallet’s private key or seed phrase with anyone.