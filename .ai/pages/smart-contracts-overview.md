---
title: Smart Contracts Overview
description: Learn about smart contract development on Polkadot Hub with full Ethereum compatibility, Solidity support, and seamless cross-chain capabilities.
categories: Basics, Smart Contracts
url: https://docs.polkadot.com/smart-contracts/overview/
---

# Smart Contracts on Polkadot Hub

## Introduction

Polkadot Hub is a production-ready Solidity smart contract platform that brings full Ethereum compatibility to the Polkadot ecosystem. Deploy your existing Ethereum contracts without modifications, use familiar tools like Hardhat and Remix, and gain access to Polkadot's cross-chain capabilities.

## Why Build on Polkadot Hub

### Full Ethereum Compatibility

Polkadot Hub runs the REVM (Rust Ethereum Virtual Machine) backend, providing complete EVM compatibility. Your Solidity contracts work exactly as they do on Ethereum:

- **Zero modifications required**: Deploy existing Ethereum contracts directly without any code changes.
- **Complete JSON-RPC API support**: Use MetaMask, Hardhat, Remix, Foundry, and all standard Ethereum tooling.
- **Standard libraries**: Integrate Ethers.js, Web3.js, Viem, Wagmi, and Web3.py without changes.
- **Solidity development**: Write contracts in Solidity using the same patterns and best practices you already know.
- **Familiar workflows**: Maintain your existing deployment, testing, and monitoring processes.

### Cross-Chain Capabilities

Smart contracts on Polkadot Hub can interact with any service in the Polkadot ecosystem through [XCM](/smart-contracts/precompiles/xcm/){target=\_blank}, enabling:

- Token transfers across parachains
- Remote execution on other chains
- Cross-chain composability without bridges or intermediaries

### Native Polkadot Integration

Access Polkadot-native functionality directly from your Solidity contracts via [precompiles](/smart-contracts/precompiles/){target=\_blank}, including asset management, staking operations, and cross-chain messaging.

!!! note
    Polkadot Hub also supports PVM (Polkadot Virtual Machine) as an alternative execution backend for advanced use cases.

## Other Smart Contract Environments

Beyond Polkadot Hub, the ecosystem offers EVM-compatible parachains that provide access to Ethereum's extensive developer ecosystem with established tooling like Hardhat, Remix, Foundry, and OpenZeppelin:

- **Moonbeam**: The first full Ethereum-compatible parachain, serving as an interoperability hub.
- **Astar**: Features dual VM support for both EVM and WebAssembly contracts.
- **Acala**: DeFi-focused with enhanced Acala EVM+ offering advanced DeFi primitives.

## Next Steps

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Get Started__

    ---

    Quick-start guides for connecting, deploying, and building your first smart contract.

    [:octicons-arrow-right-24: Get Started](/smart-contracts/get-started/)

-   <span class="badge guide">Guide</span> __Cookbook__

    ---

    Step-by-step tutorials for deploying contracts, tokens, NFTs, and full dApps.

    [:octicons-arrow-right-24: View Tutorials](/smart-contracts/cookbook/)

-   <span class="badge guide">Guide</span> __Ethereum Developers__

    ---

    Understand key differences in accounts, fees, gas model, and deployment on Polkadot Hub.

    [:octicons-arrow-right-24: Learn More](/smart-contracts/for-eth-devs/accounts/)

-   <span class="badge guide">Guide</span> __Precompiles__

    ---

    Discover advanced functionalities including XCM for cross-chain interactions.

    [:octicons-arrow-right-24: Explore Precompiles](/smart-contracts/precompiles/)

</div>
