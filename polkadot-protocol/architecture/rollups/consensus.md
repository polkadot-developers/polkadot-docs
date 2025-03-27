---
title: Rollup Consensus
description: Understand how the blocks authored by rollup collators are secured by the relay chain validators and how the rollup transactions achieve finality.
--- 

# Rollup Consensus

## Introduction

Rollups are independent blockchains built with the Polkadot SDK, designed to leverage Polkadot’s relay chain for shared security and transaction finality. These specialized chains operate as part of Polkadot’s execution sharding model, where each rollup manages its own state and transactions while relying on the relay chain for validation and consensus.

At the core of rollup functionality are collators, specialized nodes that sequence transactions into blocks and maintain the rollup’s state. Collators optimize Polkadot’s architecture by offloading state management from the relay chain, allowing relay chain validators to focus solely on validating rollup blocks.

This guide explores how rollup consensus works, including the roles of collators and validators, and the steps involved in securing rollup blocks within Polkadot’s scalable and decentralized framework.

## The Role of Collators

Collators are responsible for sequencing end-user transactions into blocks and maintaining the current state of their respective rollups. Their role is akin to Ethereum’s sequencers but optimized for Polkadot's architecture.

Key responsibilities include:

- **Transaction sequencing** - organizing transactions into [Proof of Validity (PoV)](https://wiki.polkadot.network/docs/glossary#proof-of-validity){target=\_blank} blocks
- **State management** - maintaining rollup states without burdening the relay chain validators
- **Consensus participation** - sending PoV blocks to relay chain validators for approval

## Consensus and Validation

Rollup consensus operates in tandem with the relay chain, leveraging Nominated Proof of Stake (NPoS) for shared security. The process ensures rollup transactions achieve finality through the following steps:

1. **Packaging transactions** - collators bundle transactions into PoV blocks (parablocks)
2. **Submission to validator** - parablocks are submitted to a randomly selected subset of relay chain validators, known as paravalidators
3. **Validation of PoV Blocks** - paravalidators use the rollup’s state transition function (already available on the relay chain) to verify transaction validity
4. **Backing and inclusion** - if a sufficient number of positive validations are received, the parablock is backed and included via a para-header on the relay chain

The following sections describe the actions taking place during each stage of the process. 

### Path of a Rollup Block

Polkadot achieves scalability through execution sharding, where each rollup operates as an independent shard with its own blockchain and state. Shared security for all rollups is provided by the relay chain, powered by [Nominated Proof of Staking (NPoS)](/polkadot-protocol/glossary/#nominated-proof-of-stake-npos){target=\_blank}. This framework allows rollups to focus on transaction processing and state management, while the relay chain ensures validation and finality.

The journey rollup transactions follow to reach consensus and finality can be described as follows:

- **Collators and parablocks:**

    - Collators, specialized nodes on rollups, package network transactions into Proof of Validity (PoV) blocks, also called parablocks
    - These parablocks are sent to a subset of relay chain validators, known as paravalidators, for validation
    - The rollup's state transition function (Wasm blob) is not re-sent, as it is already stored on the relay chain

```mermaid
flowchart TB
    %% Subgraph: Rollup
    subgraph Rollup
        direction LR
        Txs[Network Transactions]
        Collator[Collator Node]
        ParaBlock[ParaBlock + PoV]
        Txs -->|Package Transactions| Collator
        Collator -->|Create| ParaBlock
    end

    subgraph Relay["Relay Chain"]
        ParaValidator
    end

    %% Main Flow
    Rollup -->|Submit To| Relay
```

- **Validation by paravalidators:**

    - Paravalidators are groups of approximately five relay chain validators, randomly assigned to rollups and shuffled every minute
    - Each paravalidator downloads the rollup's Wasm blob and validates the parablock by ensuring all transactions comply with the rollup’s state transition rules
    - Paravalidators sign positive or negative validation statements based on the block’s validity

- **Backing and approval:**

    - If a parablock receives sufficient positive validation statements, it is backed and included on the relay chain as a para-header
    - An additional approval process resolves disputes. If a parablock contains invalid transactions, additional validators are tasked with verification
    - Validators who back invalid parablocks are penalized through slashing, creating strong incentives for honest behavior

```mermaid
flowchart
    subgraph RelayChain["Relay Chain"]
        direction TB
        subgraph InitialValidation["Initial Validation"]
            direction LR
            PValidators[ParaValidators]
            Backing[Backing\nProcess]
            Header[Submit Para-header\non Relay Chain]
        end
        subgraph Secondary["Secondary Validation"]
            Approval[Approval\nProcess]
            Dispute[Dispute\nResolution]
            Slashing[Slashing\nMechanism]
        end
        
    end


    %% Validation Process
    PValidators -->|Download\nWasm\nValidate Block| Backing
    Backing -->|If Valid\nSignatures| Header
    InitialValidation -->|Additional\nVerification| Secondary
    
    %% Dispute Flow
    Approval -->|If Invalid\nDetected| Dispute
    Dispute -->|Penalize\nDishonest\nValidators| Slashing
```

It is important to understand that relay chain blocks do not store full rollup blocks (parablocks). Instead, they include para-headers, which serve as summaries of the backed parablocks. The complete parablock remains within the rollup network, maintaining its autonomy while relying on the relay chain for validation and finality.

## Where to Go Next

For more technical details, refer to the:

- [Parachain Wiki](https://wiki.polkadot.network/docs/learn-parachains){target=\_blank} page