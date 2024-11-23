---
title: Parachain Consensus
description: Understand how the blocks authored by parachain collators are secured by the relay chain validators and how the parachain transactions achieve finality.
--- 

# Parachain Consensus

## Introduction

Parachains are sovereign blockchains built using the Polkadot SDK. They operate independently yet rely on the relay chain for shared security and finality. At the heart of their functionality are collators, specialized nodes that gather, sequence, and maintain parachain transactions.

Collators play a pivotal role in Polkadot’s data sharding strategy, which delegates state management to parachains. This approach minimizes the load on relay chain validators, who focus on verifying the validity of parachain blocks rather than storing or tracking their states.

## The Role of Collators

Collators are responsible for sequencing end-user transactions into blocks and maintaining the current state of their respective parachains. Their role is akin to Ethereum’s sequencers but optimized for Polkadot's architecture.

Key responsibilities include:

- Transaction sequencing - organizing transactions into [Proof of Validity (PoV)](https://wiki.polkadot.network/docs/glossary#proof-of-validity){target=\_blank} blocks
- State management - maintaining parachain states without burdening the relay chain validators
- Consensus participation - sending PoV blocks to relay chain validators for approval
 
This delegation of tasks enables Polkadot's execution sharding model, where each parachain acts as a shard with its own state, enhancing scalability.

## Path of a Parachain Block

Polkadot achieves scalability through execution sharding, where each parachain is a shard with its own blockchain and state. Polkadot offers shared security to all of its parachains powered by [Nominated Proof of Staking (NPoS)](/polkadot-protocol/glossary/#nominated-proof-of-stake-npos){target=\_blank} on the relay chain. The parachain consensus is tightly coupled with the relay chain consensus, as parachains package their network transactions into Proof of Validity (PoV) blocks which are also referred to as parablocks and send them to a subset of relay chain validators. The parachain collators need not send their state transition function Wasm blob to the relay chain validators, as it is already available on the relay chain's state. The subset of validators who are assigned to check the validity of a specific parachain's PoV block download the respective parachain's Wasm and validate its PoV block to verify if all the transactions follow the rules stated in the state transition function.

The relay chain validators who are assigned for validating parachain blocks are referred to as paravalidators. Typically, it is a group of 5 validators who are randomly assigned to a parachain and are shuffled every minute. The paravalidators verify if the parablocks follow the state transition rules of the parachain and sign statements that can have a positive or negative outcome. With enough positive statements, the block is backed and included in the relay chain, but will have to go through an additional approval process. During the approval process if there are any disputes, additional validators are tasked with verifying the parablock and if the parablock includes invalid teansactions, the backers for that parablock are slashed.

It is important to understand that a relay chain block does not contain parablocks, but para-headers. Parachain blocks are within the parachain network. 

## Consensus and Validation

Parachain consensus operates in tandem with the relay chain, leveraging Nominated Proof of Stake (NPoS) for shared security. The process ensures parachain transactions achieve finality through the following steps:

- Packaging transactions - collators bundle transactions into PoV blocks (parablocks)
- Submission to validator - parablocks are submitted to a randomly selected subset of relay chain validators, known as paravalidators
- Validation of PoV Blocks - paravalidators use the parachain’s state transition function (already available on the relay chain) to verify transaction validity
- Backing and inclusion - if a sufficient number of positive validations are received, the parablock is backed and included via a para-header on the relay chain

During this process, disputes are handled through an additional approval mechanism. If a parablock contains invalid transactions, validators who backed it face slashing penalties, ensuring strong economic incentives for honest behavior.

Relay chain blocks include para-headers, not the full parablocks. The full parachain block remains within the parachain network. Validators are shuffled frequently, ensuring fairness and decentralization in the validation process.

## Where to Go Next

For more technical details, refer to the:

- [Parachain Wiki](https://wiki.polkadot.network/docs/learn-parachains){target=_blank} page
- [Polkadot SDK Implementation Guide](/develop/blockchains/get-started/){target=\_blank} section