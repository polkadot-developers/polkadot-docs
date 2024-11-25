---
title: Smart Contracts
description: Learn about smart contract development in Polkadot using ink! for Wasm contracts and EVM support for Solidity contracts on Asset Hub and parachains.
hide: 
    - feedback
template: index-page.html
---

# Smart Contracts

Polkadot offers developers flexibility in building smart contracts, supporting both Wasm-based contracts using ink! (written in Rust) and Solidity contracts executed by the EVM (Ethereum Virtual Machine).

This section guides you through the tools, resources, and guides to help you build and deploy smart contracts using either Wasm/ink! or EVM-based parachains, depending on your language and environment preference.

## Choosing the Right Smart Contract Language and Execution Environment

For developers building smart contracts in the Polkadot ecosystem, the choice between parachains supporting ink! (for Wasm contracts) and EVM-compatible parachains (for Solidity contracts) depends on the preferred development environment and language. By selecting the right parachain, developers can leverage Polkadot's scalability and interoperability while utilizing the contract framework that best suits their needs.

Here are some key options to consider:

- **Wasm (!ink)** - contracts are written in Rust and compiled to Wasm. The advantage of Wasm is that it allows for more flexibility, speed, and potentially lower execution costs compared to EVM, especially in the context of Polkadot’s multi-chain architecture
- **EVM (Solidity)** - contracts are written in Solidity and executed by the Ethereum Virtual Machine (EVM). The EVM is widely standardized across various blockchains, including Polkadot parachains like Astar, Moonbeam, and Acala. This compatibility allows contracts to be deployed across multiple networks with minimal modifications, benefiting from a well-established, broad development ecosystem

Throughout the pages in this section, you'll find resources and guides to help you get started with developing smart contracts in both environments.

## In This Section

:::INSERT_IN_THIS_SECTION:::

<!-- ## Additional Resource

- [Revive Solidity compiler for PolkaVM repository](https://github.com/paritytech/revive){target=\_blank}
- [RPC endpoints for Polkadot ecosystem networks](/develop/networks/){target=\_blank} -->