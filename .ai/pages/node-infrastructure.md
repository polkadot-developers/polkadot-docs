---
title: Node Infrastructure
description: From running RPC endpoints to producing parachain blocks or validating the relay chain, this guide explains your options and how to begin.
categories: Infrastructure
url: https://docs.polkadot.com/node-infrastructure/
---

# Node Infrastructure Overview

## Introduction

The Polkadot network relies on various types of nodes to maintain security, provide data access, and produce blocks. This section covers everything you need to know about running infrastructure for the Polkadot ecosystem.

Whether you want to provide RPC endpoints for applications, produce blocks for a parachain, or secure the relay chain as a validator, this guide will help you understand your options and get started.

## Node Types

### RPC Nodes

RPC nodes provide API access to blockchain data without participating in consensus. They are essential infrastructure for:

- **Applications and dApps**: Query blockchain state and submit transactions.
- **Block explorers**: Index and display blockchain data.
- **Wallets**: Check balances and broadcast transactions.
- **Development**: Test and debug applications.

RPC nodes can be run for both the relay chain and parachains, with varying levels of data retention:

- **Pruned nodes**: Keep recent state and a limited number of finalized blocks. Suitable for most applications that only need the current state and recent history. More efficient in terms of storage and sync time.
- **Archive nodes**: Maintain complete historical state and all blocks since genesis. Required for block explorers, analytics platforms, or applications that need to query historical data at any point in time.

**Transaction Broadcasting**: RPC nodes play a crucial role in transaction submission and propagation. When a client submits a transaction via RPC methods like `author_submitExtrinsic`, the node validates the transaction format, adds it to its local transaction pool, and broadcasts it across the P2P network. Block producers (collators or validators) then pick up these transactions from their pools for inclusion in blocks. This makes RPC nodes the primary gateway for users and applications to interact with the blockchain.

### Collators

Collators are block producers for parachains. They perform critical functions:

- **Collect transactions**: Aggregate user transactions into blocks.
- **Produce blocks**: Create parachain block candidates.
- **Generate and package PoV**: Generate the Proof-of-Validity containing the state transition proof and necessary witness data for validation.
- **Submit to validators**: Send block candidates and PoVs to relay chain validators.

Unlike validators, collators do not provide security guarantees—that responsibility lies with the relay chain validators. However, collators are essential for parachain liveness and censorship resistance.

### Validators

Validators secure the Polkadot relay chain through [Nominated Proof of Stake (NPoS)](https://wiki.polkadot.network/docs/learn-staking){target=\_blank}. They:

- **Validate blocks**: Verify parachain blocks and relay chain transactions.
- **Participate in consensus**: Run [BABE](/reference/polkadot-hub/consensus-and-security/pos-consensus/#block-production-babe){target=\_blank} and [GRANDPA](/reference/polkadot-hub/consensus-and-security/pos-consensus/#finality-gadget-grandpa){target=\_blank} protocols.
- **Earn rewards**: Receive staking rewards for honest behavior.
- **Risk slashing**: Face penalties for misbehavior or downtime.

Running a validator requires significant technical expertise, reliable infrastructure, and a stake of DOT tokens.

## Next Steps

<div class="grid cards" markdown>

-   **Run RPC Nodes**

    ---

    Provide API access for applications, explorers, and wallets.

    [:octicons-arrow-right-24: Run a Node](/node-infrastructure/run-a-node/polkadot-hub-rpc/)

-   **Run a Collator**

    ---

    Produce blocks for system parachains or your own parachain.

    [:octicons-arrow-right-24: Run a Collator](/node-infrastructure/run-a-collator/)

-   **Run a Validator**

    ---

    Secure the relay chain and earn staking rewards.

    [:octicons-arrow-right-24: Run a Validator](/node-infrastructure/run-a-validator/requirements/)

</div>
