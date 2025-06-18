---
title: Bridge Hub
description: Learn about the Bridge Hub system parachain, a parachain that facilitates the interactions from Polkadot to the rest of Web3.
---

# Bridge Hub

## Introduction

The Bridge Hub system parachain plays a crucial role in facilitating trustless interactions between Polkadot, Kusama, Ethereum, and other blockchain ecosystems. By implementing on-chain light clients and supporting protocols like BEEFY and GRANDPA, Bridge Hub ensures seamless message transmission and state verification across chains. It also provides essential [pallets](/polkadot-protocol/glossary/#pallet){target=\_blank} for sending and receiving messages, making it a cornerstone of Polkadot’s interoperability framework. With built-in support for XCM (Cross-Consensus Messaging), Bridge Hub enables secure, efficient communication between diverse blockchain networks.

This guide covers the architecture, components, and deployment of the Bridge Hub system. You'll explore its trustless bridging mechanisms, key pallets for various blockchains, and specific implementations like Snowbridge and the Polkadot <> Kusama bridge. By the end, you'll understand how Bridge Hub enhances connectivity within the Polkadot ecosystem and beyond.

## Trustless Bridging

Bridge Hub provides a mode of trustless bridging through its implementation of on-chain light clients and trustless relayers. Trustless bridges are essentially two one-way bridges, where each chain has a method of verifying the state of the other in a trustless manner through consensus proofs. In this context, "trustless" refers to the lack of need to trust a human when interacting with various system components. Trustless systems are based instead on trusting mathematics, cryptography, and code. The target chain and source chain both provide ways of verifying one another's state and actions (such as a transfer) based on the consensus and finality of both chains rather than an external mechanism controlled by a third party.

[BEEFY (Bridge Efficiency Enabling Finality Yielder)](https://wiki.polkadot.network/docs/learn-consensus#bridging-beefy){target=\_blank} is instrumental in this solution. It provides a more efficient way to verify the consensus on the relay chain. It allows the participants in a network to verify finality proofs, meaning a remote chain like Ethereum can verify the state of Polkadot at a given block height. 

For example, the Ethereum and Polkadot bridging solution that [Snowbridge](https://docs.snowbridge.network/){target=\_blank} implements involves two light clients: one which verifies the state of Polkadot and the other which verifies the state of Ethereum. The light client for Polkadot is implemented in the runtime as a pallet, whereas the light client for Ethereum is implemented as a smart contract on the beacon chain.

## Bridging Components

In any given Bridge Hub implementation (Kusama, Polkadot, or other relay chains), there are a few primary pallets that are utilized:

- [**Pallet Bridge GRANDPA**](https://paritytech.github.io/polkadot-sdk/master/pallet_bridge_grandpa/index.html){target=\_blank} - an on-chain GRANDPA light client for Substrate based chains
- [**Pallet Bridge Parachains**](https://paritytech.github.io/polkadot-sdk/master/pallet_bridge_parachains/index.html){target=\_blank} - a finality module for parachains
- [**Pallet Bridge Messages**](https://paritytech.github.io/polkadot-sdk/master/pallet_bridge_messages/index.html){target=\_blank} - a pallet which allows sending, receiving, and tracking of inbound and outbound messages 
- [**Pallet XCM Bridge**](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm_bridge_hub/index.html){target=\_blank} - a pallet which, with the Bridge Messages pallet, adds XCM support to bridge pallets

### Ethereum-Specific Support

Bridge Hub also has a set of components and pallets that support a bridge between Polkadot and Ethereum through [Snowbridge](https://github.com/Snowfork/snowbridge){target=\_blank}.

To view the complete list of which pallets are included in Bridge Hub, visit the Subscan [Runtime Modules](https://bridgehub-polkadot.subscan.io/runtime){target=\_blank} page. Alternatively, the source code for those pallets can be found in the Polkadot SDK [Snowbridge Pallets](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/bridges/snowbridge/pallets){target=\_blank} repository.

## Deployed Bridges

- [**Snowbridge**](https://wiki.polkadot.network/docs/learn-snowbridge){target=\_blank} - a general-purpose, trustless bridge between Polkadot and Ethereum
- [**Hyperbridge**](https://wiki.polkadot.network/docs/learn-hyperbridge){target=\_blank} - a cross-chain solution built as an interoperability coprocessor, providing state-proof-based interoperability across all blockchains
- [**Polkadot <> Kusama Bridge**](https://wiki.polkadot.network/docs/learn-dot-ksm-bridge){target=\_blank} - a bridge that utilizes relayers to bridge the Polkadot and Kusama relay chains trustlessly

## Where to Go Next

- Go over the Bridge Hub README in the Polkadot SDK [Bridge-hub Parachains](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/parachains/runtimes/bridge-hubs/README.md){target=\_blank} repository
- Take a deeper dive into bridging architecture in the Polkadot SDK [High-Level Bridge](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/bridges/docs/high-level-overview.md){target=\_blank} documentation
- Read more about BEEFY and Bridging in the Polkadot Wiki: [Bridging: BEEFY](https://wiki.polkadot.network/docs/learn-consensus#bridging-beefy){target=\_blank}
