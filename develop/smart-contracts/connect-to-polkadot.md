---
title: Connect to Polkadot
description: Explore how to connect to Polkadot Hub, configure your wallet, and obtain test tokens for developing and testing smart contracts.
---

# Connect to Polkadot

--8<-- 'text/smart-contracts/polkaVM-warning.md'

<div class="button-wrapper">
    <a href="#" class="md-button connectMetaMask" value="passetHub">Connect to Polkadot Hub TestNet</a>
</div>

For more information about how to connect to Polkadot Hub, please check the [Wallets for Polkadot Hub](/develop/smart-contracts/wallets/){target=\_blank} guide.

!!! warning "Account Mapping"
    If you are using a native Polkadot account (32-byte format) that was created with a Polkadot/Substrate keypair (Ed25519/Sr25519) rather than an Ethereum-compatible keypair (secp256k1), you'll need to map your account to enable Ethereum compatibility. See the [Account Mapping](/polkadot-protocol/smart-contract-basics/accounts#account-mapping-for-native-polkadot-accounts){target=\_blank} section for more details.

## Networks Details

Developers can leverage smart contracts across diverse networks, from TestNets to MainNet. This section outlines the network specifications and connection details for each environment.

=== "Polkadot Hub TestNet"

    Network name
    ```text
    Polkadot Hub TestNet
    ```

    ---

    Currency symbol
    ```text
    PAS
    ```

    ---
    
    Chain ID
    ```text
    420420422
    ```

    ---
    
    RPC URL
    ```text
    https://testnet-passet-hub-eth-rpc.polkadot.io
    ```

    ---
    
    Block explorer URL
    ```text
    https://blockscout-passet-hub.parity-testnet.parity.io/
    ```


## Test Tokens

You will need testnet tokens to perform transactions and engage with smart contracts on any chain. Here's how to obtain Paseo (PAS) tokens for testing purposes:

1. Navigate to the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank}. If the desired network is not already selected, choose it from the Network drop-down

2. Copy your address linked to the TestNet and paste it into the designated field

    ![](/images/develop/smart-contracts/connect-to-polkadot/connect-to-polkadot-1.webp)

3. Click the **Get Some PASs** button to request free test PAS tokens. These tokens will be sent to your wallet shortly

    ![](/images/develop/smart-contracts/connect-to-polkadot/connect-to-polkadot-2.webp)

Now that you have obtained PAS tokens in your wallet, you’re ready to deploy and interact with smart contracts on Polkadot Hub TestNet! These tokens will allow you to pay for gas fees when executing transactions, deploying contracts, and testing your dApp functionality in a secure testnet environment. 

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

