---
title: Node Infrastructure
description: Overview of running nodes in the Polkadot ecosystem, including RPC nodes, collators, and validators.
categories: Infrastructure
url: https://docs.polkadot.com/node-infrastructure/overview/
---

# Node Infrastructure Overview

## Introduction

The Polkadot network relies on various types of nodes to maintain security, provide data access, and produce blocks. This section covers everything you need to know about running infrastructure for the Polkadot ecosystem.

Whether you want to provide RPC endpoints for applications, produce blocks for a parachain, or secure the relay chain as a validator, this guide will help you understand your options and get started.

## Node Types

### RPC Nodes

RPC nodes provide API access to blockchain data without participating in consensus. They are essential infrastructure for:

- **Applications and dApps**: Query blockchain state and submit transactions
- **Block explorers**: Index and display blockchain data
- **Wallets**: Check balances and broadcast transactions
- **Development**: Test and debug applications

RPC nodes can be run for both the relay chain and parachains, with varying levels of data retention (pruned vs archive).

### Collators

Collators are block producers for parachains. They perform critical functions:

- **Collect transactions**: Aggregate user transactions into blocks
- **Produce blocks**: Create parachain block candidates
- **Generate proofs**: Produce state transition proofs (Proof-of-Validity)
- **Submit to validators**: Send block candidates to relay chain validators

Unlike validators, collators do not provide security guarantees—that responsibility lies with relay chain validators. However, collators are essential for parachain liveness and censorship resistance.

### Validators

Validators secure the Polkadot relay chain through Nominated Proof of Stake (NPoS). They:

- **Validate blocks**: Verify parachain blocks and relay chain transactions
- **Participate in consensus**: Run BABE and GRANDPA protocols
- **Earn rewards**: Receive staking rewards for honest behavior
- **Risk slashing**: Face penalties for misbehavior or downtime

Running a validator requires significant technical expertise, reliable infrastructure, and a stake of DOT tokens.

## Next Steps

Choose your path based on your goals:

<div class="grid cards" markdown>

-   :material-api:{ .lg .middle } **Run RPC Nodes**

    ---

    Provide API access for applications, explorers, and wallets

    [:octicons-arrow-right-24: Run a Node](/node-infrastructure/run-a-node/parachain-rpc/)

-   :material-cube-outline:{ .lg .middle } **Run a Collator**

    ---

    Produce blocks for system parachains or your own parachain

    [:octicons-arrow-right-24: Run a Collator](/node-infrastructure/run-a-collator/collator/)

-   :material-shield-check:{ .lg .middle } **Run a Validator**

    ---

    Secure the relay chain and earn staking rewards

    [:octicons-arrow-right-24: Run a Validator](/node-infrastructure/run-a-validator/requirements/)

</div>
