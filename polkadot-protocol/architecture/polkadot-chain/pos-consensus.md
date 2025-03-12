---
title: Proof of Stake Consensus
description: Explore Polkadot's consensus protocols for secure, scalable, and decentralized network operation, including NPoS, BABE, GRANDPA, and BEEFY.
---

# Proof of Stake Consensus

## Introduction

Polkadot's Proof of Stake consensus model leverages a unique hybrid approach by design to promote decentralized and secure network operations. In traditional Proof of Stake (PoS) systems, a node's ability to validate transactions is tied to its token holdings, which can lead to centralization risks and limited validator participation. Polkadot addresses these concerns through its [Nominated Proof of Stake (NPoS)](/polkadot-protocol/glossary/#nominated-proof-of-stake-npos){target=\_blank} model and a combination of advanced consensus mechanisms to ensure efficient block production and strong finality guarantees. This combination enables the Polkadot network to scale while maintaining security and decentralization.

## Nominated Proof of Stake

Polkadot uses Nominated Proof of Stake (NPoS) to select the validator set and secure the network. This model is designed to maximize decentralization and security by balancing the roles of [validators](https://wiki.polkadot.network/docs/learn-validator){target=\_blank} and [nominators](https://wiki.polkadot.network/docs/learn-nominator){target=\_blank}.

- **Validators** - play a key role in maintaining the network's integrity. They produce new blocks, validate parachain blocks, and ensure the finality of transactions across the relay chain
- **Nominators** - support the network by selecting validators to back with their stake. This mechanism allows users who don't want to run a validator node to still participate in securing the network and earn rewards based on the validators they support

In Polkadot's NPoS system, nominators can delegate their tokens to trusted validators, giving them voting power in selecting validators while spreading security responsibilities across the network.

## Hybrid Consensus

Polkadot employs a hybrid consensus model that combines two key protocols: a finality gadget called [GRANDPA](#finality-gadget-grandpa) and a block production mechanism known as [BABE](#block-production-babe). This hybrid approach enables the network to benefit from both rapid block production and provable finality, ensuring security and performance.

The hybrid consensus model has some key advantages:

- **Probabilistic finality** - with BABE constantly producing new blocks, Polkadot ensures that the network continues to make progress, even when a final decision has not yet been reached on which chain is the true canonical chain

- **Provable finality** - GRANDPA guarantees that once a block is finalized, it can never be reverted, ensuring that all network participants agree on the finalized chain

By using separate protocols for block production and finality, Polkadot can achieve rapid block creation and strong guarantees of finality while avoiding the typical trade-offs seen in traditional consensus mechanisms.

## Block Production - BABE

Blind Assignment for Blockchain Extension (BABE) is Polkadot's block production mechanism, working with GRANDPA to ensure blocks are produced consistently across the network. As validators participate in BABE, they are assigned block production slots through a randomness-based lottery system. This helps determine which validator is responsible for producing a block at a given time. BABE shares similarities with [Ouroboros Praos](https://eprint.iacr.org/2017/573.pdf){target=\_blank} but differs in key aspects like chain selection rules and slot timing.

Key features of BABE include:

- **Epochs and slots** - BABE operates in phases called epochs, each of which is divided into slots (around 6 seconds per slot). Validators are assigned slots at the beginning of each epoch based on stake and randomness

- **Randomized block production** - validators enter a lottery to determine which will produce a block in a specific slot. This randomness is sourced from the relay chain's [randomness cycle](/polkadot-protocol/basics/randomness/){target=\_blank}

- **Multiple block producers per slot** - in some cases, more than one validator might win the lottery for the same slot, resulting in multiple blocks being produced. These blocks are broadcasted, and the network's fork choice rule helps decide which chain to follow

- **Handling empty slots** - if no validators win the lottery for a slot, a secondary selection algorithm ensures that a block is still produced. Validators selected through this method always produce a block, ensuring no slots are skipped

BABE's combination of randomness and slot allocation creates a secure, decentralized system for consistent block production while also allowing for fork resolution when multiple validators produce blocks for the same slot.

### Validator Participation

In BABE, validators participate in a lottery for every slot to determine whether they are responsible for producing a block during that slot. This process's randomness ensures a decentralized and unpredictable block production mechanism.

There are two lottery outcomes for any given slot that initiate additional processes:

- **Multiple validators in a slot** - due to the randomness, multiple validators can be selected to produce a block for the same slot. When this happens, each validator produces a block and broadcasts it to the network resulting in a race condition. The network's topology and latency then determine which block reaches the majority of nodes first. BABE allows both chains to continue building until the finalization process resolves which one becomes canonical. The [Fork Choice](#fork-choice) rule is then used to decide which chain the network should follow

- **No validators in a slot** - on occasions when no validator is selected by the lottery, a [secondary validator selection algorithm](https://spec.polkadot.network/sect-block-production#defn-babe-secondary-slots){target=\_blank} steps in. This backup ensures that a block is still produced, preventing skipped slots. However, if the primary block produced by a verifiable random function [(VRF)-selected](/polkadot-protocol/basics/randomness/#vrf){target=\_blank} validator exists for that slot, the secondary block will be ignored. As a result, every slot will have either a primary or a secondary block

This design ensures continuous block production, even in cases of multiple competing validators or an absence of selected validators.

### Additional Resources

For further technical insights about BABE, including cryptographic details and formal proofs, see the [BABE paper](https://research.web3.foundation/Polkadot/protocols/block-production/Babe){target=\_blank} from Web3 Foundation.

For BABE technical definitions, constants, and formulas, see the [Block Production Lottery](https://spec.polkadot.network/sect-block-production#sect-block-production-lottery){target=\_blank} section of the Polkadot Protocol Specification.

## Finality Gadget - GRANDPA

GRANDPA (GHOST-based Recursive ANcestor Deriving Prefix Agreement) serves as the finality gadget for Polkadot's relay chain. Operating alongside the BABE block production mechanism, it ensures provable finality, giving participants confidence that blocks finalized by GRANDPA cannot be reverted.

Key features of GRANDPA include:

- **Independent finality service** – GRANDPA runs separately from the block production process, operating in parallel to ensure seamless finalization
- **Chain-based finalization** – instead of finalizing one block at a time, GRANDPA finalizes entire chains, speeding up the process significantly
- **Batch finalization** – can finalize multiple blocks in a single round, enhancing efficiency and minimizing delays in the network
- **Partial synchrony tolerance** – GRANDPA works effectively in a partially synchronous network environment, managing both asynchronous and synchronous conditions
- **Byzantine fault tolerance** – can handle up to 1/5 Byzantine (malicious) nodes, ensuring the system remains secure even when faced with adversarial behavior

??? note "What is GHOST?"
    [GHOST (Greedy Heaviest-Observed Subtree)](https://eprint.iacr.org/2018/104.pdf){target=\blank} is a consensus protocol used in blockchain networks to select the heaviest branch in a block tree. Unlike traditional longest-chain rules, GHOST can more efficiently handle high block production rates by considering the weight of subtrees rather than just the chain length.

### Probabilistic vs. Provable Finality

In traditional Proof of Work (PoW) blockchains, finality is probabilistic. As blocks are added to the chain, the probability that a block is final increases, but it can never be guaranteed. Eventual consensus means that all nodes will agree on a single version of the blockchain over time, but this process can be unpredictable and slow.

Conversely, GRANDPA provides provable finality, which means that once a block is finalized, it is irreversible. By using Byzantine fault-tolerant agreements, GRANDPA finalizes blocks more efficiently and securely than probabilistic mechanisms like Nakamoto consensus. Like Ethereum's Casper the Friendly Finality Gadget (FFG), GRANDPA ensures that finalized blocks cannot be reverted, offering stronger consensus guarantees.

### Additional Resources

For technical insights, including formal proofs and detailed algorithms, see the [GRANDPA paper](https://github.com/w3f/consensus/blob/master/pdf/grandpa.pdf){target=\_blank} from Web3 Foundation.

For a deeper look at the code behind GRANDPA, see the following GitHub repositories:

- [GRANDPA Rust implementation](https://github.com/paritytech/finality-grandpa){target=\_blank}
- [GRANDPA Pallet](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/substrate/frame/grandpa/src/lib.rs){target=\_blank}

## Fork Choice

The fork choice of the relay chain combines BABE and GRANDPA:

1. BABE must always build on the chain that GRANDPA has finalized
2. When there are forks after the finalized head, BABE builds on the chain with the most primary blocks to provide probabilistic finality 

![Fork choice diagram](/images/polkadot-protocol/architecture/polkadot-chain/pos-consensus/consensus-protocols-1.webp)

In the preceding diagram, finalized blocks are black, and non-finalized blocks are yellow. Primary blocks are labeled '1', and secondary blocks are labeled '2.' The topmost chain is the longest chain originating from the last finalized block, but it is not selected because it only has one primary block at the time of evaluation. In comparison, the one below it originates from the last finalized block and has three primary blocks.

### Additional Resources

To learn more about how BABE and GRANDPA work together to produce and finalize blocks on Kusama, see this [Block Production and Finalization in Polkadot](https://youtu.be/FiEAnVECa8c){target=\_blank} talk from Web3 Foundation's Bill Laboon. 

For an in-depth academic discussion about Polkadot's hybrid consensus model, see this [Block Production and Finalization in Polkadot: Understanding the BABE and GRANDPA Protocols](https://www.youtube.com/watch?v=1CuTSluL7v4&t=4s){target=\_blank} MIT Cryptoeconomic Systems 2020 talk by Web3 Foundation's Bill Laboon.

## Bridging - BEEFY

Bridge Efficiency Enabling Finality Yielder (BEEFY) is a specialized protocol that extends the finality guarantees provided by GRANDPA. It is specifically designed to facilitate efficient bridging between Polkadot relay chains (such as Polkadot and Kusama) and external blockchains like Ethereum. While GRANDPA is well-suited for finalizing blocks within Polkadot, it has limitations when bridging external chains that weren't built with Polkadot's interoperability features in mind. BEEFY addresses these limitations by ensuring other networks can efficiently verify finality proofs.

Key features of BEEFY include:

- **Efficient finality proof verification** - BEEFY enables external networks to easily verify Polkadot finality proofs, ensuring seamless communication between chains
- **Merkle Mountain Ranges (MMR)** - this data structure is used to efficiently store and transmit proofs between chains, optimizing data storage and reducing transmission overhead
- **ECDSA signature schemes** - BEEFY uses ECDSA signatures, which are widely supported on Ethereum and other EVM-based chains, making integration with these ecosystems smoother
- **Light client optimization** - BEEFY reduces the computational burden on light clients by allowing them to check for a super-majority of validator votes rather than needing to process all validator signatures, improving performance

### Additional Resources

For BEEFY technical definitions, constants, and formulas, see the [Bridge design (BEEFY)](https://spec.polkadot.network/sect-finality#sect-grandpa-beefy){target=\_blank} section of the Polkadot Protocol Specification.
 






