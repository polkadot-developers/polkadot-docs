---
title: Consensus Protocols
description: Explore Polkadot’s consensus protocols for secure, scalable, and decentralized network operation, including NPoS, BABE, GRANDPA, and BEEFY.
---

# Consensus Protocols

In traditional Proof of Stake (PoS) systems, block production participation depends on token holdings rather than computational power. While PoS aims for equitable participation, many projects involve some centralized operation, limiting the number of validators with full participation rights. Polkadot addresses these challenges through its unique consensus mechanisms.

## Nominated Proof of Stake

Polkadot uses NPoS (Nominated Proof-of-Stake) as its mechanism for selecting the validator set. It is designed with the roles of [validators](https://wiki.polkadot.network/docs/learn-validator){target=\_blank} and [nominators](https://wiki.polkadot.network/docs/learn-nominator){target=\_blank} to maximize chain security.

- Validators - produce new blocks, validate parachain blocks, and guarantee finality
- Nominators - choose to back select validators with their stake

## Hybrid Consensus

Polkadot employs a hybrid consensus composed of a finality gadget ([GRANDPA](#finality-gadget-grandpa)) and a block production mechanism ([BABE](#block-production-babe)).

This approach combines the benefits of:

- Probabilistic finality (always producing new blocks)
- Provable finality (universal agreement on the canonical chain)

It also avoids the drawbacks of each mechanism, allowing for rapid block production and a separate finalization process.

## Block Production: BABE

BABE (Blind Assignment for Blockchain Extension) is the block production mechanism that runs between the validator nodes and determines the authors of new blocks. BABE is comparable as an algorithm to [Ouroboros Praos](https://eprint.iacr.org/2017/573.pdf){target=\_blank}, with some key differences in chain selection rule and slot time adjustments.

Key features of BABE include:

- Operates in sequential non-overlapping phases called epochs
- Each epoch is divided into a predefined number of slots (approximately 6 seconds each)
- Assigns block production slots to validators based on stake and randomness
- Uses the relay chain's [randomness cycle](https://wiki.polkadot.network/docs/learn-cryptography#randomness){target=\_blank}

At the beginning of each epoch, the BABE node needs to run the [Block-Production-Lottery algorithm](https://spec.polkadot.network/sect-block-production#algo-block-production-lottery){target=\_blank} to find out in which slots it should produce a block and gossip to the other block producers.

### Validator Participation

Validators participate in a lottery for every slot:

- The lottery informs whether they are the block producer candidate for that slot
- Multiple validators could be candidates for the same slot due to the randomized design
- Some slots may be empty, resulting in inconsistent block time

#### Multiple Validators per Slot

When multiple validators are block producer candidates in a given slot, all will produce a block and broadcast it to the network. At that point, it becomes a race to reach most of the network first. Depending on network topology and latency, both chains will continue to build in some capacity until finalization kicks in. The [Fork Choice](#fork-choice) rule determines which chain to follow.

#### No Validators in Slot

To handle potentially empty slots when no validators have rolled low enough in the randomness lottery to qualify for block production, a [secondary validator selection algorithm](https://spec.polkadot.network/sect-block-production#defn-babe-secondary-slots){target=\_blank} runs in the background. The validators selected through this predictable algorithm always produce blocks. These secondary blocks are ignored if the same slot has a primary block produced from a [VRF-selected](https://wiki.polkadot.network/docs/learn-cryptography#vrf){target=\_blank} validator. As a result, a slot can have either a primary or a secondary block, and no slots are ever skipped.

!!!note
    For more detailed information on BABE, including its cryptographic underpinnings and formal proofs, please refer to the [BABE paper](https://research.web3.foundation/Polkadot/protocols/block-production/Babe){target=\_blank}.

## Finality Gadget: GRANDPA

GRANDPA (GHOST-based Recursive ANcestor Deriving Prefix Agreement) is the finality gadget implemented for the Polkadot relay chain. It works in parallel to the BABE block production mechanism to provide provable finality.

Key features of GRANDPA include:

- Runs as an independent service parallel to block production
- Reaches agreements on chains rather than individual blocks
- Can finalize multiple blocks at once, greatly speeding up the finalization process
- Operates in a partially synchronous network model
- Can cope with up to 1/5 Byzantine nodes in an asynchronous setting

### Probabilistic vs. Provable Finality

A pure Nakamoto consensus blockchain that runs PoW is only able to achieve the notion of probabilistic finality and reach eventual consensus. Probabilistic finality means that under some assumptions about the network and participants, if we see a few blocks building on a given block, we can estimate the probability that it is final. Eventual consensus means that at some point in the future, all nodes will agree on the truthfulness of one set of data. This eventual consensus may take a long time, and will not be able to determine how long it will take ahead of time. However, finality gadgets such as GRANDPA (GHOST-based Recursive ANcestor Deriving Prefix Agreement) or Ethereum's Casper FFG (the Friendly Finality Gadget) are designed to give stronger and quicker guarantees on the finality of blocks - specifically, that they can never be reverted after some process of Byzantine agreements has taken place. The notion of irreversible consensus is known as provable finality.

!!!note
    For a comprehensive description of the protocol, including formal proofs and detailed algorithms, refer to the [GRANDPA paper](https://github.com/w3f/consensus/blob/master/pdf/grandpa.pdf){target=\_blank}.

## Fork Choice

The fork choice of the relay chain combines BABE and GRANDPA:

1. BABE must always build on the chain that GRANDPA has finalized
2. BABE provides probabilistic finality when there are forks after the finalized head by building on the chain with the most primary blocks

![](/images/polkadot-protocol/polkadot-operations/consensus-protocols/consensus-protocols-1.webp)

In the above image, the black blocks are finalized, and the yellow blocks are not. Blocks marked with a "1" are primary blocks; those marked with a "2" are secondary blocks. Even though the topmost chain is the longest chain on the latest finalized block, it does not qualify because it has fewer primaries at the time of evaluation than the one below it.

## Bridging: BEEFY

BEEFY (Bridge Efficiency Enabling Finality Yielder) is a secondary protocol to GRANDPA designed to support efficient bridging between relay chains (such as Polkadot and Kusama) and remote, segregated blockchains like Ethereum. BEEFY addresses the limitations of GRANDPA finality for bridges to chains that were not built with Polkadot's native interoperability in mind.

Key features of BEEFY include:

- Allows efficient verification of Polkadot finality proofs by external networks
- Utilizes Merkle Mountain Ranges (MMR) for efficient data storage and transmission
- Employs ECDSA signature schemes for improved efficiency on EVM-based chains
- Reduces the effort required on the light client side. They only need to check if the block has a super-majority of BEEFY votes by validators

!!!note
    For additional implementation details about BEEFY, check [Bridge design (BEEFY)](https://spec.polkadot.network/sect-finality#sect-grandpa-beefy){target=\_blank}.

## Resources

- [GRANDPA Rust implementation](https://github.com/paritytech/finality-grandpa){target=\_blank}
- [GRANDPA Pallet](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/grandpa/src/lib.rs){target=\_blank}
- [Block Production and Finalization in Polkadot](https://www.crowdcast.io/e/polkadot-block-production){target=\_blank} - An explanation of how BABE and GRANDPA work together to produce and finalize blocks on Kusama with Bill Laboon
- [Block Production and Finalization in Polkadot: Understanding the BABE and GRANDPA Protocols](https://www.youtube.com/watch?v=1CuTSluL7v4&t=4s){target=\_blank} - An academic talk by Bill Laboon, given at MIT Cryptoeconomic Systems 2020, describing Polkadot's hybrid consensus model in-depth