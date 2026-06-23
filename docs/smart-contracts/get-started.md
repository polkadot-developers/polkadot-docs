---
title: Get Started with Smart Contracts
description: Practical examples for building and deploying smart contracts on Polkadot Hub, from connecting and tooling to deployment, integrations, and precompiles.
categories: Basics, Smart Contracts
---

# Get Started with Smart Contracts

This resource provides quick-starts for building smart contracts on Polkadot Hub. Use the tables below to jump directly to the tools and workflows you need.

## Quick Starts

Use these curated links to get connected, get funded, and deploy your first contract.

|                     Quick Start                     |         Tools         |                           Description                           |
|-----------------------------------------------------|-----------------------|-----------------------------------------------------------------|
|  [Connect to Polkadot](/smart-contracts/connect/)   | Polkadot.js, MetaMask | Add the network, configure RPC, verify activity in the explorer |
|     [Get Test Tokens](/smart-contracts/faucet/)     |           -           |    Request test funds to deploy and interact with contracts     |
| [Explore Transactions](/smart-contracts/explorers/) | BlockScout, Routescan, Subscan | Inspect transactions, logs, token transfers, and contract state |

## Build and Test Locally

Set up local environments and CI-friendly workflows to iterate quickly and validate changes before deploying.

<!-- INDEX TABLE START
dir: dev-environments
flat: true
overrides:
  remix.md:
    title: Use Remix for Development
  hardhat.md:
    title: Use Hardhat for Development
  foundry.md:
    title: Use Foundry for Development
extra_rows:
  - title: '[OpenZeppelin Contracts Wizard for Polkadot](https://wizard.openzeppelin.com/polkadot){target=\_blank}'
    tools: OpenZeppelin
    description: Generate ERC-20, ERC-721, and other OpenZeppelin-standard contracts for Polkadot Hub without writing code
  - title: '[Rust for PVM](/smart-contracts/for-eth-devs/dual-vm-stack/#alternative-pvm-backend)'
    tools: "LLMs, coding agents"
    description: Write PVM smart contracts natively in Rust; use AI assistants while native tooling matures
-->
<!-- INDEX TABLE END -->

## Ethereum Tool Differences on Polkadot EVM

Tools like **Foundry** and **Hardhat** are built for standard Ethereum nodes. Polkadot EVM networks (such as Polkadot Hub) use the same [Ethereum JSON-RPC](https://ethereum.org/developers/docs/apis/json-rpc/){target=\_blank} interface, but run on a different execution environment (Substrate with REVM or PVM). As a result:

- **Local tests** (e.g., `forge test`, Hardhat's default network) run in the tool's own EVM, not Polkadot's—so behavior can differ from the real chain.
- **Time and snapshot helpers** (e.g., `evm_increaseTime`, `loadFixture`) are often not supported on Polkadot nodes.
- **Gas reports** from these tools may not match what you see on-chain.

**Recommendation:** To check chain-specific behavior, run your contracts against a [local dev node](/smart-contracts/dev-environments/local-dev-node/) or a TestNet. For more details, see [EVM vs PVM](/smart-contracts/for-eth-devs/evm-vs-pvm/) and [Contract Deployment](/smart-contracts/for-eth-devs/contract-deployment/).

## Ethereum Developer Resources

Bridge your Ethereum knowledge with Polkadot Hub specifics: account mapping, fees, JSON-RPC, and deployment.

<!-- INDEX TABLE START
dir: for-eth-devs
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

## Cookbook: Hands-on Tutorials

Follow step-by-step guides that walk through common tasks and complete dApp examples.

|                                            Tutorial                                            |        Tools        |                Description                |
|------------------------------------------------------------------------------------------------|---------------------|-------------------------------------------|
| [Deploy a Basic Contract](/smart-contracts/cookbook/smart-contracts/deploy-basic/basic-remix/) |        Remix        |      Minimal deployment walkthrough       |
|    [Deploy an ERC-20](/smart-contracts/cookbook/smart-contracts/deploy-erc20/erc20-remix/)     | Remix, OpenZeppelin | Create, deploy, and mint a fungible token |
|   [Deploy an NFT (ERC-721)](/smart-contracts/cookbook/smart-contracts/deploy-nft/nft-remix/)   | Remix, OpenZeppelin |    Build and deploy an NFT collection     |
|                 [Uniswap V2](/smart-contracts/cookbook/eth-dapps/uniswap-v2/)                  |       Hardhat       | Full dApp project: compile, test, deploy  |
|               [Zero‑to‑Hero dApp](/smart-contracts/cookbook/dapps/zero-to-hero/)               |      Multiple       |  End‑to‑end dApp patterns and practices   |

## Libraries

Choose the client libraries that fit your stack for connecting wallets and calling contracts.

<!-- INDEX TABLE START
dir: libraries
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

## Integrations

Integrate essential services like wallets, indexers, and oracles to round out your dApp.

<!-- INDEX TABLE START
dir: integrations
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

## Precompiles

Discover precompiled system contracts available on the Hub and how to use them.

<!-- INDEX TABLE START
dir: precompiles
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

From here, follow the quick starts to get connected, iterate locally with your preferred tools, and use the guides, libraries, integrations, and precompiles as you grow into production‑ready dApps. If you get stuck, [open an issue](https://github.com/polkadot-developers/polkadot-docs/issues/new?template=docs-issue.yml){target=\_blank} or reach out in the community channels.
