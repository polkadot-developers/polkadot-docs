---
title: Add Smart Contract Functionality
description: Add smart contract capabilities to your Polkadot SDK-based blockchain. Explore EVM and Wasm integration for enhanced chain functionality.
---

# Add Smart Contract Functionality

## Introduction

When building your custom blockchain with the Polkadot SDK, you have the flexibility to add smart contract capabilities through specialized pallets. These pallets allow blockchain users to deploy and execute smart contracts, enhancing your chain's functionality and programmability.

Polkadot SDK-based blockchains support two distinct smart contract execution environments: [EVM (Ethereum Virtual Machine)](#evm-smart-contracts) and [Wasm (WebAssembly)](#wasm-smart-contracts). Each environment allows developers to deploy and execute different types of smart contracts, providing flexibility in choosing the most suitable solution for their needs.

## EVM Smart Contracts

To enable Ethereum-compatible smart contracts in your blockchain, you'll need to integrate [Frontier](https://github.com/polkadot-evm/frontier){target=\_blank}, the Ethereum compatibility layer for Polkadot SDK-based chains. This requires adding two essential pallets to your runtime:

- [**`pallet-evm`**](https://github.com/polkadot-evm/frontier/tree/master/frame/evm){target=\_blank} - provides the EVM execution environment
- [**`pallet-ethereum`**](https://github.com/polkadot-evm/frontier/tree/master/frame/ethereum){target=\_blank} - handles Ethereum-formatted transactions and RPC capabilities

For step-by-step guidance on adding these pallets to your runtime, refer to [Add a Pallet to the Runtime](/develop/parachains/customize-parachain/add-existing-pallets/){target=\_blank}.

For a real-world example of how these pallets are implemented in production, you can check Moonbeam's implementation of [`pallet-evm`](https://github.com/moonbeam-foundation/moonbeam/blob/9e2ddbc9ae8bf65f11701e7ccde50075e5fe2790/runtime/moonbeam/src/lib.rs#L532){target=\_blank} and [`pallet-ethereum`](https://github.com/moonbeam-foundation/moonbeam/blob/9e2ddbc9ae8bf65f11701e7ccde50075e5fe2790/runtime/moonbeam/src/lib.rs#L698){target=\_blank}.

## Wasm Smart Contracts

To support Wasm-based smart contracts, you'll need to integrate:

- [**`pallet-contracts`**](https://docs.rs/pallet-contracts/latest/pallet_contracts/index.html#contracts-pallet){target=\_blank} - provides the Wasm smart contract execution environment

This pallet enables the deployment and execution of Wasm-based smart contracts on your blockchain. For detailed instructions on adding this pallet to your runtime, see [Add a Pallet to the Runtime](/develop/parachains/customize-parachain/add-existing-pallets/){target=\_blank}.

For a real-world example of how this pallet is implemented in production, you can check Astar's implementation of [`pallet-contracts`](https://github.com/AstarNetwork/Astar/blob/b6f7a408d31377130c3713ed52941a06b5436402/runtime/astar/src/lib.rs#L693){target=\_blank}.

## Where to Go Next

Now that you understand how to enable smart contract functionality in your blockchain, you might want to:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Smart Contracts Overview__

    ---

    Learn how developers can build smart contracts on Polkadot by leveraging either Wasm/ink! or EVM contracts across many parachains.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/overview/)

-   <span class="badge guide">Guide</span> __Wasm (ink!) Contracts__

    ---

    Learn to build Wasm smart contracts with ink!, a Rust-based eDSL. Explore installation, contract structure, and key features.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/wasm-ink/)
    
-   <span class="badge guide">Guide</span> __EVM Contracts__

    ---

    Learn how Polkadot parachains such as Moonbeam, Astar, Acala, and Manta leverage the Ethereum Virtual Machine (EVM) and integrate it into their parachains.

    [:octicons-arrow-right-24: Reference](/develop/smart-contracts/evm/)

</div>