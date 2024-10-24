---
title: Randomness
description: TODO
---

# Randomness

Randomness is crucial in **Proof of Stake** blockchains to ensure a fair and unpredictable distribution of validator duties. 

However, computers are inherently deterministic, meaning the same input always produces the same output. What we typically refer to as "random" numbers on a computer are actually pseudo-random. 

These numbers rely on an initial "seed", which can come from external sources like [atmospheric noise](https://www.random.org/randomness/){target=\_blank}, [heart rates](https://mdpi.altmetric.com/details/47574324){target=\_blank}, or even [lava lamps](https://en.wikipedia.org/wiki/Lavarand){target=\_blank}. While this may seem random, given the same "seed", the same sequence of numbers will always be generated.

In a global blockchain network, relying on real-world entropy for randomness isn’t feasible because these inputs vary by time and location. If nodes use different inputs, blockchains can fork. Hence, real-world randomness isn't suitable for use as a seed in blockchain systems.

Currently, two primary methods for generating randomness in blockchains are used: `RANDAO` and `VRF` (Verifiable Random Function). Polkadot adopts the `VRF` approach for its randomness.

## VRF

A **Verifiable Random Function (VRF)** is a cryptographic function that generates a random number along with a proof that ensures the number was produced by the submitter. This proof allows anyone to verify the validity of the random number.

Polkadot's VRF is similar to the one used in [**Ouroboros Praos**](https://eprint.iacr.org/2017/573.pdf){target=\_blank}, which secures randomness for block production in systems like [BABE](link to BABE page) (Polkadot’s block production mechanism). 

The key difference is that Polkadot's VRF doesn’t rely on a central clock—avoiding the issue of whose clock to trust. Instead, it uses its own past results and slot numbers to simulate time and determine future outcomes.

**Here's how VRF works:**

Slots on Polkadot are discrete units of time, each lasting six seconds, and can potentially hold a block. Multiple slots form an epoch, with 2400 slots making up one four-hour epoch.

In each slot, validators execute a **"die roll"** using a **Verifiable Random Function (VRF)**. The VRF uses three inputs:

1. A "secret key", unique to each validator, used for the die roll.
2. An epoch randomness value, derived from the hash of VRF outputs from blocks two epochs ago (N-2), so past randomness influences the current epoch (N).
3. The current slot number.

This process helps maintain fair randomness across the network.

Here is a graphical representation

![](/images/polkadot-protocol/basics/blocks-transactions-fees/randomness/slots-epochs.webp)

The `VRF` produces two outputs: a `RESULT` (the random number) and a `PROOF` (verifying that the number was generated correctly).

The `RESULT` is checked by validator against a threshold set by the protocol. If it's below the threshold, the validator becomes a candidate for block production in that slot. 

The validator then attempts to create a block, submitting it along with the `PROOF` and `RESULT`.

Because validators roll independently, it's possible that no block candidates appear in some slots if all roll numbers above the threshold. 

!!!note
    How we resolve this issue and make sure that Polkadot block times remain near constant-time can be checked on [PoS Consensus]() page.

## RANDAO

An alternative on-chain randomness method is Ethereum's `RANDAO`, where validators perform thousands of hashes on a seed, publishing the final hash during a round. The collective input from all validators forms the random number, and as long as one honest validator participates, the randomness is secure.

To enhance security, `RANDAO` can be optionally combined with a **Verifiable Delay Function (VDF)**, ensuring that the randomness can't be predicted or manipulated during computation.

!!!note
    More information about `RANDAO` can be found in the [ETH documentation](https://eth2book.info/capella/part2/building_blocks/randomness/){target=\_blank}

## VDFs

**Verifiable Delay Functions (VDFs)** are time-bound computations that, even on parallel computers, take a set amount of time to complete. 

They produce a unique result that can be quickly verified publicly. When combined with `RANDAO`, feeding `RANDAO`'s output into a `VDF` introduces a delay that nullifies an attacker's chance to influence the randomness.

However, `VDF` likely require specialized ASIC devices to run, separate from standard nodes. 

!!!warning 
    While only one is needed to secure the system and they will be open-source and inexpensive, running them involves significant costs without any direct incentives, adding friction for blockchain users.

## Additional Resources

- [Polkadot's research on blockchain randomness and sortition](https://research.web3.foundation/Polkadot/protocols/block-production){target=\_blank} - Contains reasoning for choices made along with proofs
- [Discussion on Randomness used in Polkadot](https://github.com/use-ink/ink/issues/57){target=\_blank} - W3F researchers discuss the randomness in Polkadot and when it is usable and under which assumptions.