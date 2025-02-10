---
title: Smart Contracts Overview
description: Learn about smart contract development capabilities on Asset Hub, Polkadot's system parachain, featuring PolkaVM and Ethereum compatibility.
---

# Smart Contracts on Asset Hub

## Introduction

Asset Hub, Polkadot's system parachain, enables smart contract deployment and execution through PolkaVM, a cutting-edge virtual machine designed specifically for the Polkadot ecosystem. This native integration allows developers to deploy smart contracts directly on Polkadot's system chain while maintaining compatibility with Ethereum development tools and workflows.

## Smart Contract Development

The smart contract platform on Asset Hub combines Polkadot's robust security and scalability with the extensive Ethereum development ecosystem. Developers can utilize familiar Ethereum libraries for contract interactions and leverage industry-standard development environments for writing and testing smart contracts.

Asset Hub provides full Ethereum JSON-RPC API compatibility, ensuring seamless integration with existing development tools and services. This compatibility enables developers to maintain their preferred workflows while building on Polkadot's native infrastructure.

## Technical Architecture

PolkaVM, the underlying virtual machine, utilizes a RISC-V-based register architecture optimized for the Polkadot ecosystem. This design choice offers several advantages:

- Enhanced performance for smart contract execution
- Improved gas efficiency for complex operations
- Native compatibility with Polkadot's runtime environment
- Optimized storage and state management

## Development Tools and Resources

Asset Hub supports a comprehensive suite of development tools familiar to Ethereum developers. The platform integrates with popular development frameworks, testing environments, and deployment tools. Key features include:

- Contract development in Solidity or Rust
- Support for standard Ethereum development libraries
- Integration with widely used development environments
- Access to blockchain explorers and indexing solutions
- Compatibility with contract monitoring and management tools

## Cross-Chain Capabilities

Smart contracts deployed on Asset Hub can leverage the cross-consensus messaging (XCM) protocol to interact with other parachains in the Polkadot ecosystem. This native interoperability enables developers to build truly cross-chain applications, accessing functionality and assets across the entire Polkadot network.

## Use Cases

Asset Hub's smart contract platform is suitable for a wide range of applications:

- DeFi protocols leveraging cross-chain capabilities
- NFT platforms utilizing Polkadot's native token standards
- Governance systems integrated with Polkadot's democracy mechanisms
- Cross-chain bridges and asset management solutions

## Where to Go Next

Developers can use their existing Ethereum development tools and connect to Asset Hub's RPC endpoints. The platform's Ethereum compatibility layer ensures a smooth transition for teams already building on EVM-compatible chains.

Subsequent sections of this guide provide detailed information about specific development tools, advanced features, and best practices for building on Asset Hub.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Libraries__

    ---

    Explore essential libraries to optimize smart contract development and interaction.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/evm-toolkit/libraries/)

-   <span class="badge guide">Guide</span> __Dev Environments__

    ---

    Set up your development environment for seamless contract deployment and testing.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/evm-toolkit/dev-environments/)

-   <span class="badge guide">Guide</span> __Indexers__

    ---

    Leverage indexers to efficiently query on-chain data and improve dApp performance.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/evm-toolkit/indexers/)

</div>