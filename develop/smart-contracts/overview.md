---
title: Smart Contracts Overview
description: Learn about smart contract development capabilities in the Polkadot ecosystem, either by leveraging the Asset Hub parachain or other alternatives.
---

# Smart Contracts on Polkadot

## Introduction

Polkadot offers developers multiple approaches to building and deploying smart contracts within its ecosystem. As a multi-chain network designed for interoperability, Polkadot provides various environments optimized for different developer preferences and application requirements. From native smart contract support on Asset Hub to specialized parachain environments, developers can choose the platform that best suits their technical needs while benefiting from Polkadot's shared security model and cross-chain messaging capabilities.

Whether you're looking for Ethereum compatibility through EVM-based parachains like Moonbeam, Astar, and Acala, or prefer WebAssembly-based development with ink!, the Polkadot ecosystem accommodates diverse developer.

These guides explores the diverse smart contract options available in the Polkadot ecosystem, helping developers understand the unique advantages of each approach and make informed decisions about where to deploy their decentralized applications.

## Native Smart Contracts

### Introduction

Asset Hub, Polkadot's system parachain, enables smart contract deployment and execution through PolkaVM, a cutting-edge virtual machine designed specifically for the Polkadot ecosystem. This native integration allows developers to deploy smart contracts directly on Polkadot's system chain while maintaining compatibility with Ethereum development tools and workflows.

### Smart Contract Development

The smart contract platform on Asset Hub combines Polkadot's robust security and scalability with the extensive Ethereum development ecosystem. Developers can utilize familiar Ethereum libraries for contract interactions and leverage industry-standard development environments for writing and testing smart contracts.

Asset Hub provides full Ethereum JSON-RPC API compatibility, ensuring seamless integration with existing development tools and services. This compatibility enables developers to maintain their preferred workflows while building on Polkadot's native infrastructure.

### Technical Architecture

PolkaVM, the underlying virtual machine, utilizes a RISC-V-based register architecture optimized for the Polkadot ecosystem. This design choice offers several advantages:

- Enhanced performance for smart contract execution
- Improved gas efficiency for complex operations
- Native compatibility with Polkadot's runtime environment
- Optimized storage and state management

### Development Tools and Resources

Asset Hub supports a comprehensive suite of development tools familiar to Ethereum developers. The platform integrates with popular development frameworks, testing environments, and deployment tools. Key features include:

- Contract development in Solidity or Rust
- Support for standard Ethereum development libraries
- Integration with widely used development environments
- Access to blockchain explorers and indexing solutions
- Compatibility with contract monitoring and management tools

### Cross-Chain Capabilities

Smart contracts deployed on Asset Hub can leverage the [cross-consensus messaging (XCM) protocol](/develop/interoperability/intro-to-xcm/){target=\_blank} to interact with other parachains in the Polkadot ecosystem. This native interoperability enables developers to build truly cross-chain applications, accessing functionality and assets across the entire Polkadot network.

### Use Cases

Asset Hub's smart contract platform is suitable for a wide range of applications:

- DeFi protocols leveraging cross-chain capabilities
- NFT platforms utilizing Polkadot's native token standards
- Governance systems integrated with Polkadot's democracy mechanisms
- Cross-chain bridges and asset management solutions

## Other Smart Contract Environments

While Asset Hub provides native smart contract support through PolkaVM, Polkadot's ecosystem offers several alternatives for smart contract development. These include EVM-compatible parachains like Moonbeam, Astar, and Acala that support Ethereum tooling and development workflows, as well as WebAssembly-based environments using ink!. Each environment offers unique advantages depending on your development preferences and application requirements.

### Parachain Contracts

Polkadot's ecosystem includes several parachains that offer EVM compatibility, allowing developers to leverage Ethereum's extensive tooling and developer community while benefiting from Polkadot's security and interoperability features.

EVM compatibility provides significant advantages:

- Access to Ethereum's large developer ecosystem and mindshare
- Smart contract portability across chains
- Extensive tooling including wallets, explorers, and development frameworks
- Established security auditors and institutional asset management systems

Some of the EVM-compatible parachains are:

- [**Moonbeam**](https://moonbeam.network/){target=\_blank} - Moonbeam was the first parachain to bring full Ethereum-compatibility to Polkadot. Its runtime is built using FRAME and combines components from the Polkadot-SDK, Frontier, and custom pallets. Moonbeam serves as an interoperability hub with connections to multiple external chains through various general message passing (GMP) providers like Wormhole, LayerZero, and Axelar.

- [**Astar**](https://astar.network/){target=\_blank} - Astar distinguishes itself with a unique multiple virtual machine approach supporting both EVM and WebAssembly (Wasm) smart contracts. This dual VM support allows developers to choose their preferred programming environment while maintaining full Ethereum compatibility. Astar has established itself as an innovation hub through initiatives like zk-rollup development and integration with Layer 2 scaling solutions.

- [**Acala**](https://acala.network/){taget=\_blank} - this parachian positions itself as Polkadot's DeFi hub with its Acala EVM+, an enhanced version of the EVM optimized for DeFi operations. This customized implementation enables seamless deployment of Ethereum-based DeFi protocols while offering advanced features like on-chain scheduling, pre-built DeFi primitives, and native multi-token support that aren't available in traditional EVMs.

All these parachains support familiar Ethereum development tools:

- Hardhat, Remix, Foundry
- Thirdweb
- OpenZeppelin contracts
- Solidity as the primary language

### Wasm (ink!)

The [`pallet_contracts`](https://docs.rs/pallet-contracts/latest/pallet_contracts/index.html#contracts-pallet){target=\_blank} is a specialized pallet within the Polkadot SDK that enables smart contract functionality through a WebAssembly (Wasm) execution environment. For developing smart contracts for this pallet, [ink!](https://use.ink/){target=\_blank} emerges as the primary and recommended language.

ink! is an embedded domain-specific language (eDSL) designed to develop Wasm smart contracts using the Rust programming language. Rather than creating a new language, ink! is just standard Rust in a well-defined "contract format" with specialized `#[ink(…)]` attribute macros. These macros tell ink! what the different parts of your Rust smart contract represent and allow it to create Polkadot SDK-compatible Wasm bytecode.

Key benefits include:

- Strong memory safety guarantees from Rust
- Advanced type system
- Comprehensive development tooling
- High execution speed through Wasm compilation
- Platform independence and enhanced security through sandboxed execution

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