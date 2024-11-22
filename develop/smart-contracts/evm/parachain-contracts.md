---
title: Parachain Contracts
description: TODO
---


# Parachain Contracts

## Introduction

One key factor underpinning Ethereum's growth is the ease of deploying to the EVM. The EVM, or Ethereum Virtual Machine, provides developers with a consistent and predictable execution environment for smart contracts. While the EVM is not perfect, its popularity and ease of deployment have far outweighed any shortcomings and resulted in the massive growth of EVM-compatible smart contract platforms. 

Also integral to the proliferation of EVM-based smart contract networks is smart contract portability. Developers can take their smart contracts that they've deployed to Ethereum, and in many cases, deploy them to other EVM-compatible networks with minimal changes. More than "Copy/Paste" deployments, this enables chains' interoperability. Building a cross-chain application is much easier when both chains offer similar EVM compatibility. 

## Why Adopt the EVM as a Polkadot Parachain?

In addition to the developer mindshare of the EVM, Polkadot parachains leveraging the EVM can benefit from the extensive tooling for Ethereum developers that's already been built and battle-tested. This includes wallets, block explorers, developer tools, and more. Beyond just tools, the EVM has had a long headstart regarding smart contract auditors and institutional/custodial asset management. Integrating EVM compatibility can unlock several of these tools by default or allow for relatively easy future integrations. 

## EVM + The Power of Polkadot

Polkadot enables parachains to supercharge the capabilities of their parachain beyond just the limitations of the EVM. To that end, many parachains have developed ways to tap into the powerful features offered by Polkadot, such as through precompiles or solidity interfaces that expose Substrate functionality to app developers and users. This guide will cover some of the unique features that each parachain offers. For more information about each parachain, visit the documentation site for the respective parachain.  

## EVM-Compatible Parachains 

### Astar

[Astar](https://astar.network/){target=_blank} emerged as a key smart contract platform on Polkadot, distinguished by its unique multiple virtual machine approach that supports both EVM and WebAssembly (Wasm) smart contracts. This dual VM support allows developers to choose their preferred programming environment while maintaining full Ethereum compatibility. Astar's innovative dApp staking mechanism revolutionized the way projects are funded on Polkadot by enabling token holders to stake tokens directly to their favorite dApps, creating a sustainable reward system for developers. The platform's [runtime](https://github.com/AstarNetwork/Astar){target=_blank} is built on Substrate using FRAME, incorporating crucial components from Polkadot-SDK alongside custom-built modules for handling its unique features.

Astar distinguishes itself through its strong focus on cross-chain development and Layer 2 solutions. The network has established itself as an innovation hub through initiatives like the zk-rollup development framework and integration with multiple Layer 2 scaling solutions. Astar leverages XCM for native Polkadot ecosystem interoperability while maintaining connections to external networks through various bridge protocols. The platform's Build2Earn program have attracted numerous developers to build on Polkadot. Through its support for both EVM and Wasm, along with advanced cross-chain capabilities, Astar serves as a crucial gateway for projects looking to leverage the unique advantages of both Ethereum and Polkadot ecosystems while maintaining seamless interoperability between them.

### Moonbeam

[Moonbeam](https://docs.moonbeam.network/){target=\_blank} was the first Polkadot parachain to launch with full Ethereum-compatibility. DApp Developers flocked to Moonbeam to deploy their dapps and gain access to the rapidly growing Polkadot user base following the launch of parachains in 2022. Since its launch, Moonbeam has helped drive significant DeFi activity in Polkadot. [Moonbeam's runtime](https://github.com/moonbeam-foundation/moonbeam){target=\_blank} is built using FRAME, Polkadot's framework for runtime development, and combines essential components from the Polkadot-SDK, Frontier, and custom pallets. The architecture integrates key Substrate offerings like balance management and transaction processing, while [Frontier's](https://github.com/polkadot-evm/frontier){target=\_blank} pallets enable EVM execution and Ethereum compatibility. Custom pallets handle Moonbeam-specific features such as parachain staking and block author verification. Moonbeam offers a variety of precompiles for dApp developers to access powerful Polkadot features via a Solidity interface, such as governance, randomness, transaction batching, and more. GLMR is the native token of the Moonbeam network and is used to pay for gas for transactions. However, there are a variety of gasless solutions available on Moonbeam to provide seamless experiences for users. 

Additionally, Moonbeam is a hub for interoperability and cross-chain connected contracts. Moonbeam has a variety of integrations with GMP (general message passing) providers, including [Wormhole](https://wormhole.com/){target=\_blank}, [LayerZero](https://layerzero.network/){target=\_blank}, [Axelar](https://www.axelar.network/){target=\_blank}, and more. These integrations make it easy for developers to build cross-chain contracts on Moonbeam, and they also play an integral role in connecting the entire Polkadot ecosystem with other blockchains. Innovations like Moonbeam Routed Liquidity, or MRL, enable users to bridge funds between chains like Ethereum and parachains like HydraDx. MRL benefits the entire Polkadot ecosystem. Through XCM (Cross-Consensus Messaging), other parachains can connect to Moonbeam and access its established bridge connections to Ethereum and other networks, eliminating the need for each parachain to build and maintain their own bridges.

### Acala

[Acala](https://acala.network/){target=\_blank} positioned itself as Polkadot's DeFi hub, introducing the [Acala EVM+](https://evmdocs.acala.network/){target=\_blank} - an enhanced version of the Ethereum Virtual Machine specifically optimized for DeFi operations. This customized EVM implementation enables seamless deployment of Ethereum-based DeFi protocols while offering advanced features like on-chain scheduling, pre-built DeFi primitives, and native multi-token support that aren't available in traditional EVMs. The platform's hybrid architecture combines EVM compatibility with native Substrate modules, allowing developers to leverage both ecosystems' strengths.

Through its native token ACA, Acala supports a comprehensive DeFi ecosystem including a decentralized stablecoin (aUSD), an automated market maker (DEX), a liquid staking derivative for DOT, and advanced yield-generating strategies. The platform's EVM+ innovations extend beyond standard Ethereum compatibility by enabling direct interaction between EVM smart contracts and Substrate pallets, facilitating advanced cross-chain DeFi operations through XCM, and providing built-in oracle integrations. These enhancements make it possible for DeFi protocols to achieve functionality that would be prohibitively expensive or technically infeasible on traditional EVM chains.

### Manta 

[Manta Network](https://manta.network/){target=_blank} stands out in the Polkadot ecosystem as a pioneering multi-modular platform focused on zero-knowledge (ZK) applications, with two distinct networks that are fully interoperable. Manta Atlantic is Manta's Polkadot parachain, while Manta Pacific is its EVM-compatible Layer 2 solution. Through its unique dual-network architecture, Manta brings advanced ZK capabilities to Polkadot while maintaining full EVM compatibility, enabling developers to deploy privacy-preserving smart contracts using familiar Solidity tooling. The platform's runtime architecture integrates specialized ZK circuits with traditional EVM functionality, supported by one of the largest trusted setups in cryptographic history with over 4,000 participants. 

Manta's implementation of [zkSBTs (Zero-Knowledge SoulBound Tokens)](https://docs.manta.network/docs/zkSBT/auto/About){target=_blank} introduces a groundbreaking approach to on-chain identity and credentials, allowing for private yet verifiable identity solutions. The platform extends these privacy features through its cross-chain infrastructure, enabling seamless interaction between its Layer 1 parachain (Manta Atlantic) and Layer 2 solution (Manta Pacific on Ethereum) while maintaining robust connections to the broader Polkadot ecosystem through XCM. This comprehensive approach to privacy-preserving computation, combined with EVM compatibility and cross-chain functionality, positions Manta as a crucial infrastructure provider for the next generation of privacy-focused decentralized applications in the Polkadot ecosystem.