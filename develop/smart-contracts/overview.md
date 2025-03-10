---
title: Smart Contracts Overview
description: Learn about smart contract development capabilities on Asset Hub, Polkadot's system parachain, featuring PolkaVM and Ethereum compatibility.
---

# Smart Contracts on Asset Hub

## Introduction

Asset Hub, Polkadot's system parachain, enables smart contract deployment and execution through PolkaVM, a cutting-edge virtual machine designed specifically for the Polkadot ecosystem. This native integration allows developers to deploy smart contracts directly on Polkadot's system chain while maintaining _full compatibility with Ethereum development tools and workflows_.

## Smart Contract Development

The smart contract platform on Asset Hub combines _Polkadot's robust security and scalability_ with the extensive Ethereum development ecosystem. Developers can utilize familiar Ethereum libraries for contract interactions and leverage industry-standard development environments for writing and testing smart contracts.

Asset Hub provides _full Ethereum JSON-RPC API compatibility_, ensuring seamless integration with existing development tools and services. This compatibility enables developers to maintain their preferred workflows while building on Polkadot's native infrastructure.

## Technical Architecture

PolkaVM, the underlying virtual machine, utilizes a RISC-V-based register architecture _optimized for the Polkadot ecosystem_. This design choice offers several advantages:

- _Enhanced performance_ for smart contract execution
- _Improved gas efficiency_ for complex operations
- Native compatibility with Polkadot's runtime environment
- Optimized storage and state management

## Development Tools and Resources

Asset Hub supports a comprehensive suite of development tools familiar to Ethereum developers. The platform integrates with popular development frameworks, testing environments, and deployment tools. Key features include:

- Contract development in _Solidity or Rust_
- Support for standard Ethereum development libraries
- Integration with widely used development environments
- Access to blockchain explorers and indexing solutions
- Compatibility with contract monitoring and management tools

## Cross-Chain Capabilities

Smart contracts deployed on Asset Hub can leverage Polkadot's cross-consensus messaging (XCM) protocol to _seamlessly transfer tokens and call functions on other blockchain networks_ within the Polkadot ecosystem, all without complex bridging infrastructure or third-party solutions. For further references, check the [Interoperability](/develop/interoperability/index){target=\_blank} section.

## Use Cases

Asset Hub's smart contract platform is suitable for a wide range of applications:

- DeFi protocols leveraging _cross-chain capabilities_
- NFT platforms utilizing Polkadot's native token standards
- Governance systems integrated with Polkadot's democracy mechanisms
- Cross-chain bridges and asset management solutions

## Where to Go Next

Developers can use their _existing Ethereum development tools_ and connect to Asset Hub's RPC endpoints. The platform's Ethereum compatibility layer ensures a smooth transition for teams already building on EVM-compatible chains.

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