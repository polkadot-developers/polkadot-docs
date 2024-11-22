---
title: Parachain Consensus
description: Understand how the blocks authored by parachain collators are secured by the relay chain validators and how the parachain transactions achieve finality
--- 

Parachains are sovereign blockchains built using the Polkadot SDK. Parachains have their own nodes, known as collators, which are responsible for collating, or sequencing end-user transactions. This is very simillar to the role of sequencers in Ethereum. 

Collators are also tasked with maintaining the current state of the parachain. This aspect is central to Polkadot’s data sharding strategy, where each parachain manages its own state. By doing so, the load on relay chain validators is significantly reduced, as they do not need to store or track the state of every parachain.
For a deep dive into Parachain's protocol, refer to the [Wiki](https://wiki.polkadot.network/docs/learn-parachains-protocol#parachain-protocol){target=\_blank} and for implementation details, refer to the [Polkadot parachain host implementer guide](https://paritytech.github.io/polkadot-sdk/book/protocol-overview.html){target=\_blank}.

## Path of a Parachain Block

Polkadot achieves scalability through execution sharding, where each parachain is a shard with its own blockchain and state. Polkadot offers shared security to all of its parachains powered by Nominated Proof of Staking (NPoS) on the relay chain. The parachain consensus is tightly coupled with the relay chain consensus, as parachains package their network transactions into Proof of Validity (PoV) blocks which are also referred to as parablocks and send them to a subset of relay chain validators. The parachain collators need not send their state transition function Wasm blob to the relay chain validators, as it is already available on the relay chain's state. The subset of validators who are assigned to check the validity of a specific parachain's PoV block download the respective parachain's Wasm and validate its PoV block to verify if all the transactions follow the rules stated in the state transition function.

The relay chain validators who are assigned for validating parachain blocks are referred to as paravalidators. Typically, it is a group of 5 validators who are randomly assigned to a parachain and are shuffled every minute. The paravalidators verify if the parablocks follow the state transition rules of the parachain and sign statements that can have a positive or negative outcome. With enough positive statements, the block is backed and included in the relay chain, but will have to go through an additional approval process. During the approval process if there are any disputes, additional validators are tasked with verifying the parablock and if the parablock includes invalid teansactions, the backers for that parablock are slashed.

It is important to understand that a relay chain block does not contain parablocks, but para-headers. Parachain blocks are within the parachain network. 
