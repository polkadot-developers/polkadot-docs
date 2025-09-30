---
title: Get Started with Smart Contracts
description: Start building on the Polkadot Hub. This page orients you to explorers, faucets, Ethereum developer references, and hands-on cookbook tutorials.
categories: Smart Contracts, Basics
---

# Get Started

## Essential Resources

Get up and running quickly with these essential resources for connecting to the network, exploring transactions, and obtaining test tokens.

- **[Connect to Polkadot](/smart-contracts/connect/){target=\_blank}**: Learn about RPC endpoints, chain ID, and block explorer URLs to connect to the network.

- **[Block Explorers](/smart-contracts/explorers/){target=\_blank}**: Inspect transactions, addresses, contracts, and blocks. Use block explorers to track contract deployments, logs, and token transfers with detailed transaction history.

- **[Faucets](/smart-contracts/faucets/){target=\_blank}**: Request test tokens for deploying and interacting with contracts. Discover how to request test funds and understand common requirements and limits.

## For Ethereum Developers

If you're coming from Ethereum, these guides will help you understand how familiar concepts translate to the Polkadot Hub while leveraging your existing knowledge and tooling.

- **[Accounts](/smart-contracts/for-eth-devs/accounts/)**: Understand the relationship between 20‑byte Ethereum addresses and 32‑byte Polkadot accounts. Learn about address mapping, reversibility, and when mapping is required.

- **[Blocks, Transactions, and Fees](/develop/smart-contracts/for-eth-devs/blocks-transactions-fees/)**: Explore transaction types and the fee/gas model on Polkadot Hub. Understand Legacy, EIP‑1559, EIP‑2930, EIP‑4844 formats and multi‑dimensional metering.

- **[Gas Model](/develop/smart-contracts/for-eth-devs/gas-model/)**: Learn how gas relates to computation, proof size, and storage deposit. Understand resource dimensions and conversions to EVM units.

- **[Contract Deployment](/develop/smart-contracts/for-eth-devs/contract-deployment/)**: Master deployment patterns and tooling specific to the Polkadot Hub.

- **[JSON‑RPC APIs](/develop/smart-contracts/for-eth-devs/json-rpc-apis/)**: Reference supported Ethereum JSON‑RPC methods with practical examples. Some of the methods available are `eth_call`, `eth_sendRawTransaction`, tracing endpoints, and more.

- **[Migration](/develop/smart-contracts/for-eth-devs/migration/)**: Get practical guidance for porting existing apps and tooling to Polkadot Hub. Find migration tips for contracts and integrations.

## Learn the Platform

Dive deeper into the architecture and capabilities that make Polkadot Hub unique for smart contract development.

- **[Overview](/smart-contracts/overview/){target=\_blank}**: Understand the architecture and rationale behind the Polkadot Hub. Learn about the execution model, Ethereum compatibility, tooling ecosystem, and cross‑chain capabilities.

## Cookbook: Hands‑on Tutorials

Learn by building with step-by-step tutorials that take you from basic token contracts to complex dApps.

- **[Deploy an ERC‑20 to the Polkadot Hub](/smart-contracts/cookbook/smart-contracts/deploy-erc20/){target=\_blank}**: Create, compile, deploy, and mint a fungible token using Polkadot Remix and OpenZeppelin contracts.

- **[Deploy an NFT (ERC‑721) to the Polkadot Hub](/smart-contracts/cookbook/smart-contracts/deploy-nft/){target=\_blank}**: Build and deploy NFT contracts with minting capabilities using Polkadot Remix and OpenZeppelin standards.

- **[Deploy Uniswap V2](/smart-contracts/cookbook/eth-dapps/uniswap-v2/){target=\_blank}**: Set up a complete Hardhat project, compile and test locally, then deploy the full Uniswap V2 protocol to TestNet.

## Suggested Path

A suggested path to get started with smart contract development on the Polkadot Hub is:

1. Connect your wallet and get test tokens.
2. Get familiar with the block explorer.
3. Deploy ERC‑20 or NFT with Remix.
4. Dive into JSON‑RPC and advanced topics.
5. Build larger dApps (e.g., Uniswap V2) with Hardhat.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Connect to Polkadot__

    ---

    Add the network, fund your account, and verify activity in the explorer.

    [:octicons-arrow-right-24: Connect](/develop/smart-contracts/connect/)

-   <span class="badge guide">Guide</span> __Cookbook__

    ---

    Learn by doing with ERC‑20, NFT, and dApp deployment tutorials.

    [:octicons-arrow-right-24: Explore recipes](/develop/smart-contracts/cookbook/)

</div>