---
title: Connect to Kusama
description: Explore how to connect to Kusama Hub for developing and testing smart
  contracts in a live environment with real monetary value.
url: https://docs.polkadot.com/develop/smart-contracts/connect-to-kusama/
---

# Connect to Kusama

-!!! smartcontract "PolkaVM Preview Release"
    PolkaVM smart contracts with Ethereum compatibility are in **early-stage development and may be unstable or incomplete**.

<div class="button-wrapper">
    <a href="#" class="md-button connectMetaMask" value="kusamaHub">Connect to Kusama Hub</a>
</div>

For more information about how to connect to a Polkadot network, please check the [Wallets](/develop/smart-contracts/wallets/){target=\_blank} guide.

!!! info "Production Environment"
    Kusama Hub offers a live environment for deploying smart contracts. Please note that the most recent version of Polkadot's Ethereum-compatible stack is available on the TestNet; however, you can also deploy it to the Kusama Hub for production use.

!!! warning "Account Mapping"
    If you are using a native Polkadot account (32-byte format) that was created with a Polkadot/Substrate keypair (Ed25519/Sr25519) rather than an Ethereum-compatible keypair (secp256k1), you'll need to map your account to enable Ethereum compatibility. See the [Account Mapping](/polkadot-protocol/smart-contract-basics/accounts#account-mapping-for-native-polkadot-accounts){target=\_blank} section for more details.

## Networks Details

Developers can leverage smart contracts on Kusama Hub for live production deployments. This section outlines the network specifications and connection details.

=== "Kusama Hub"

    Network name

    ```text
    Kusama Hub
    ```

    ---
    
    Currency symbol
    
    ```text
    KSM
    ```
    
    ---
    
    Chain ID
    
    ```text
    420420418
    ```
    
    ---
    
    RPC URL
    
    ```text
    https://kusama-asset-hub-eth-rpc.polkadot.io
    ```
    ---
    
    Block explorer URL
    
    ```text
    https://blockscout-kusama-asset-hub.parity-chains-scw.parity.io/
    ```
    ---

## Important Deployment Considerations

While the compatibility with regular EVM codebases is still being maximized, some recommendations include:
    
- Leverage [Hardhat](/develop/smart-contracts/dev-environments/hardhat){target=\_blank} to compile, deploy, and interact with your contract.
- Use MetaMask to interact with your dApp (note that using MetaMask can sometimes lead to `Invalid transaction` errors. This is actively being worked on and will be fixed soon).
- Avoid Remix for deployment as MetaMask enforces a 48kb size limit when using the [Remix IDE](/develop/smart-contracts/dev-environments/remix){target=\_blank}, which is why Hardhat Polkadot is recommended for deployment.

Kusama Hub is a live environment. Ensure your contracts are thoroughly tested before deployment, as transactions on Kusama Hub involve real KSM tokens and **cannot be reversed**.

## Where to Go Next

For your next steps, explore the various smart contract guides demonstrating how to use and integrate different tools and development environments into your workflow.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Deploy your first contract with Hardhat**
    
    ---
    
    Explore the recommended smart contract development and deployment process on Kusama Hub using Hardhat.
    
    [:octicons-arrow-right-24: Build with HardHat](/develop/smart-contracts/dev-environments/hardhat/)

-   <span class="badge guide">Guide</span> **Interact with the blockchain using viem**
    
    ---
    
    Use viem for interacting with Ethereum-compatible chains to deploy and interact with smart contracts on Kusama Hub.
    
    [:octicons-arrow-right-24: Build with viem](/develop/smart-contracts/libraries/viem/)

</div>
