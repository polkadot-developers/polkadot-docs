---
title: Get Started with Smart Contracts
description: Practical examples for building and deploying smart contracts on Polkadot Hub, from connecting and tooling to deployment, integrations, and precompiles.
categories: Basics, Smart Contracts
url: https://docs.polkadot.com/smart-contracts/get-started/
---

# Get Started

This resource provides quick-starts for building smart contracts on Polkadot Hub. Use the tables below to jump directly to the tools and workflows you need.

## Quick Starts

Kick off development fast with curated links for connecting, funding, exploring, and deploying your first contract.

|                                              Quick Start                                               |         Tools         |                           Description                           |
| :-------------------------------------------------------------------------------------------------: | :-------------------: | :-------------------------------------------------------------: |
|                  [Connect to Polkadot](/smart-contracts/connect/){target=\_blank}                   | Polkadot.js, MetaMask | Add the network, configure RPC, verify activity in the explorer |
|                    [Get Test Tokens](/smart-contracts/faucets/){target=\_blank}                     |        -        |    Request test funds to deploy and interact with contracts     |
|                 [Explore Transactions](/smart-contracts/explorers/){target=\_blank}                 |   Subscan   | Inspect transactions, logs, token transfers, and contract state |
|   [Deploy with Remix](/smart-contracts/dev-environments/remix/deploy-a-contract/){target=\_blank}   |         Remix         |        One‑click browser deployment to Polkadot Hub         |
| [Deploy with Foundry](/smart-contracts/dev-environments/foundry/deploy-a-contract/){target=\_blank} |        Foundry        |          Scripted deployments and testing from the CLI          |
| [Deploy with Hardhat](/smart-contracts/dev-environments/hardhat/deploy-a-contract/){target=\_blank} |        Hardhat        |          Project scaffolding, testing, and deployments          |

## Build and Test Locally

Set up local environments and CI-friendly workflows to iterate quickly and validate changes before deploying.

|                                                  Build and Test Locally                                                  |       Tools       |                     Description                      |
| :--------------------------------------------------------------------------------------------------------: | :---------------: | :--------------------------------------------------: |
|         [Run a Local Dev Node](/smart-contracts/dev-environments/local-dev-node/){target=\_blank}          | Polkadot SDK node |    Spin up a local node for iterative development    |
|         [Remix: Get Started](/smart-contracts/dev-environments/remix/get-started/){target=\_blank}         |       Remix       | Connect Remix to Polkadot Hub and configure accounts |
|   [Remix: Verify a Contract](/smart-contracts/dev-environments/remix/verify-a-contract/){target=\_blank}   |       Remix       |         Publish verified source on explorers         |
| [Foundry: Install and Config](/smart-contracts/dev-environments/foundry/install-and-config/){target=\_blank} |      Foundry      |       Install toolchain and configure networks       |
|   [Foundry: Compile and Test](/smart-contracts/dev-environments/foundry/compile-and-test/){target=\_blank}   |      Foundry      |         Write and run Solidity tests locally         |
| [Foundry: Verify a Contract](/smart-contracts/dev-environments/foundry/verify-a-contract/){target=\_blank} |      Foundry      |        Verify deployed bytecode and metadata         |
| [Hardhat: Install and Config](/smart-contracts/dev-environments/hardhat/install-and-config/){target=\_blank} |      Hardhat      |     Initialize a project and configure networks      |
|   [Hardhat: Compile and Test](/smart-contracts/dev-environments/hardhat/compile-and-test/){target=\_blank}   |      Hardhat      |         Unit test contracts and run scripts          |
| [Hardhat: Verify a Contract](/smart-contracts/dev-environments/hardhat/verify-a-contract/){target=\_blank} |      Hardhat      |           Verify deployments on explorers            |

## Ethereum Developer Resources

Bridge your Ethereum knowledge with Polkadot Hub specifics: account mapping, fees, JSON‑RPC, and deployment.

|                                                   Ethereum Developer Guides                                                   |                           Description                           |
| :-------------------------------------------------------------------------------------------------------: | :-------------------------------------------------------------: |
|                    [Accounts](/smart-contracts/for-eth-devs/accounts/){target=\_blank}                    | How 20‑byte Ethereum addresses map to 32‑byte Polkadot accounts |
| [Blocks, Transactions, and Fees](/smart-contracts/for-eth-devs/blocks-transactions-fees/){target=\_blank} |     Transaction types, fees, and multi‑dimensional metering     |
|                   [Gas Model](/smart-contracts/for-eth-devs/gas-model/){target=\_blank}                   |        Gas vs. weight, proof size, and storage deposits         |
|         [Contract Deployment](/smart-contracts/for-eth-devs/contract-deployment/){target=\_blank}         |     Deployment patterns and best practices on Polkadot Hub      |
|               [JSON‑RPC APIs](/smart-contracts/for-eth-devs/json-rpc-apis/){target=\_blank}               |        Supported Ethereum JSON‑RPC methods and examples         |
|                   [Migration](/smart-contracts/for-eth-devs/migration/){target=\_blank}                   |       Port existing apps and tooling to Polkadot Hub        |
|               [Dual VM Stack](/smart-contracts/for-eth-devs/dual-vm-stack/){target=\_blank}               |         Overview of EVM and native execution on the Hub         |

## Cookbook: Hands‑on Tutorials

Follow step‑by‑step guides that walk through common tasks and complete dApp examples.

|                                              Tutorial                                              |        Tools        |                Description                |
| :------------------------------------------------------------------------------------------------: | :-----------------: | :---------------------------------------: |
| [Deploy a Basic Contract](/smart-contracts/cookbook/smart-contracts/deploy-basic/){target=\_blank} |        Remix        |      Minimal deployment walkthrough       |
|    [Deploy an ERC‑20](/smart-contracts/cookbook/smart-contracts/deploy-erc20/){target=\_blank}     | Remix, OpenZeppelin | Create, deploy, and mint a fungible token |
|  [Deploy an NFT (ERC‑721)](/smart-contracts/cookbook/smart-contracts/deploy-nft/){target=\_blank}  | Remix, OpenZeppelin |    Build and deploy an NFT collection     |
|           [Uniswap V2](/smart-contracts/cookbook/eth-dapps/uniswap-v2/){target=\_blank}            |       Hardhat       | Full dApp project: compile, test, deploy  |
|         [Zero‑to‑Hero dApp](/smart-contracts/cookbook/dapps/zero-to-hero/){target=\_blank}         |      Multiple       |  End‑to‑end dApp patterns and practices   |

## Libraries

Choose the client libraries that fit your stack for connecting wallets and calling contracts.

|                              Library                               |                       Description                       |
| :----------------------------------------------------------------: | :-----------------------------------------------------: |
| [Ethers.js](/smart-contracts/libraries/ethers-js/){target=\_blank} | Connect, sign, and interact with contracts using Ethers |
|      [viem](/smart-contracts/libraries/viem/){target=\_blank}      |        Type‑safe EVM interactions and utilities         |
|     [Wagmi](/smart-contracts/libraries/wagmi/){target=\_blank}     |  React hooks for wallet connections and contract calls  |
|   [Web3.js](/smart-contracts/libraries/web3-js/){target=\_blank}   |             Web3 provider and contract APIs             |
|   [Web3.py](/smart-contracts/libraries/web3-py/){target=\_blank}   |  Python toolkit for on‑chain interactions and scripts   |

## Integrations

Integrate essential services like wallets, indexers, and oracles to round out your dApp.

|                             Integration                             |                Description                |
| :-----------------------------------------------------------------: | :---------------------------------------: |
|  [Wallets](/smart-contracts/integrations/wallets/){target=\_blank}  | Supported wallets and configuration notes |
| [Indexers](/smart-contracts/integrations/indexers/){target=\_blank} |      Index and query blockchain data      |
|  [Oracles](/smart-contracts/integrations/oracles/){target=\_blank}  |       Bring external data on‑chain        |

## Precompiles

Discover precompiled system contracts available on the Hub and how to use them.

|                                  Topic                                   |                     Description                     |
| :----------------------------------------------------------------------: | :-------------------------------------------------: |
| [Overview of Precompiles](/smart-contracts/precompiles/){target=\_blank} |      What precompiles are available on the Hub      |
|  [ETH Native](/smart-contracts/precompiles/eth-native/){target=\_blank}  |           EVM precompiles and interfaces            |
|     [Staking](/smart-contracts/precompiles/staking/){target=\_blank}     | Interact with staking functionality via precompiles |
|         [XCM](/smart-contracts/precompiles/xcm/){target=\_blank}         |     Cross‑chain messaging helpers for contracts     |

From here, follow the quick starts to get connected, iterate locally with your preferred tools, and use the guides, libraries, integrations, and precompiles as you grow into production‑ready dApps. If you get stuck, [open an issue](https://github.com/polkadot-developers/polkadot-docs/issues/new?template=docs-issue.yml){target=\_blank} or reach out in the community channels.
