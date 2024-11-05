---
title: Bridge Hub
description: Learn about the Bridge Hub system parachain, a parachain which facilitates the interactions from Polkadot to the rest of Web3.
---

## Introduction

The Bridge Hub system chain is responsible for providing the necessary functionality for the relay chain (and parachains) 
to enable trustless bridging with chains like Polkadot, Kusama, and Ethereum. It includes a set of [pallets](../../glossary.md#pallet) which facilitate sending and receiving of messages, verification of consensus and finality on Polkadot for external chains, and implementations of BEEFY, GRANDPA, and Ethereum light clients to follow and verify the state of both the relay and target chain. BridgeHub also provides XCM support for target and source chains, provided XCM is implemented on the target chain.

## Trustless Bridging

Bridge Hub provides a mode of trustless bridging through its implementation of on-chain light clients and trustless relayers. The target chain and source chain both provide ways of providing and verifying the state of one another, of which actions (such as a transfer) are based upon the consensus and finality of both chains rather than a third party service or organization.

BEEFY (Bridge Efficiency Enabling Finality Yielder) is instrumental in this solution, as it provides a more efficient way to verify the consensus on the relay chain. It allows the participants in a network to verify finality proofs, meaning a remote chain like Ethereum can verify the state of Polkadot at a given block height.

!!!info
    In this context, *trustless* refers to the lack of human trust needed when interacting with various components of a system, opting instead to trust the mathematics, cryptography and code.

Trustless bridges are generally two one-way bridges, where each chain has a method of verifying the state of the other in a trustless manner.

For example, the Ethereum and Polkadot bridging solution that [Snowbridge](https://docs.snowbridge.network/){target=_blank} implements involves two light clients: one which verifies the state of Polkadot, and the other which verifies the state of Ethereum. The light client for Polkadot is implemented in the runtime as a pallet, whereas the light client for Ethereum is implemented as a smart contract on the beacon chain.

## Bridging Components

In any given BridgeHub implementation (Kusama, Polkadot, or other relay chains), there are a few primary pallets which are utilized:

- [Pallet Bridge GRANDPA](https://paritytech.github.io/polkadot-sdk/master/pallet_bridge_grandpa/index.html){target=_blank}: An on-chain GRANDPA light client for Substrate based chains
- [Pallet Bridge Parachains](https://paritytech.github.io/polkadot-sdk/master/pallet_bridge_parachains/index.html){target=_blank}: A finality module for parachains
- [Pallet Bridge Messages](https://paritytech.github.io/polkadot-sdk/master/pallet_bridge_grandpa/index.html){target=_blank}: A pallet which allows sending, receiving, and tracking of inbound and outbound messages 
- [Pallet XCM Bridge](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm_bridge_hub/index.html){target=_blank}: A pallet which, with the Bridge Messages pallet, adds XCM support to bridge pallets

### Ethereum Specific Support

BridgeHub also has a set of component and pallets which support a Polkadot <-> Ethereum bridge through [Snowbridge](https://github.com/Snowfork/snowbridge){target=_blank}

## Deployed Bridges

- [Snowbridge](https://wiki.polkadot.network/docs/learn-snowbridge){target=_blank}: A general-purpose, trustless bridge between Polkadot and Ethereum
- [Hyperbridge](https://wiki.polkadot.network/docs/learn-hyperbridge){target=_blank}: A cross-chain solution built as an interoperability coprocessor, providing state-proof-based interoperability across all blockchains
- [Polkadot <> Kusama Bridge](https://wiki.polkadot.network/docs/learn-dot-ksm-bridge){target=_blank}: A bridge which utilizes relayers to trustlessly bridge the Polkadot and Kusama relay chains

## What's Next

- Go over the BridgeHub README in the Polkadot SDK repository: [Bridge-hub Parachains](https://github.com/paritytech/polkadot-sdk/blob/master/cumulus/parachains/runtimes/bridge-hubs/README.md){target=_blank}
- Take a deeper dive into bridging architecture in the Polkadot SDK: [High-Level Bridge Documentation](https://github.com/paritytech/polkadot-sdk/blob/master/bridges/docs/high-level-overview.md){target=_blank}
- Read more about BEEFY and Bridging in the Polkadot Wiki: [Bridging: BEEFY](https://wiki.polkadot.network/docs/learn-consensus#bridging-beefy){target=_blank}
