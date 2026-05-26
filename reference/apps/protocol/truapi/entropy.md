---
title: Entropy Method Group
description: TrUAPI method group for verifiable randomness sourced from the Host, suitable for use cases that need on-chain-grounded entropy.
categories: Apps, Reference
---

# Entropy

## Introduction

The **Entropy** method group is the surface a Product uses to obtain randomness sourced from the Host rather than from its own runtime. The reason a Product would reach for this group instead of the browser's `crypto.getRandomValues` or a server-side CSPRNG is **verifiability**: entropy from the Host can be tied to on-chain commitments (block hashes, VRF outputs, beacon values), giving a Product a randomness source that an external party can later check against the chain.

This matters for use cases where the user (or another party) needs to trust that a random value wasn't chosen adversarially after the fact — lottery-style draws, fair-shuffle games, randomized selection inside a `pallet-airdrop`-style flow, and anywhere "we promise we didn't cheat" is part of the product contract.

## Conceptual Contract

The group exposes verifiable-randomness primitives:

- **Requesting a random value** with an attached commitment to the chain state it was derived from, so a verifier can reproduce or check the derivation.
- **Subscribing to a randomness beacon** for protocols that need a fresh value per block or per epoch.
- **Binding entropy to a context** so two Products asking for "randomness for X" cannot accidentally share an entropy value that should have been independent.

For uses where verifiability is not required — UI animations, jitter on retries, anything where browser entropy is fine — use the browser's standard randomness API. The Entropy group is the right tool when randomness is part of a user-visible fairness contract.

!!! warning "Provisional"
    The exact set of host calls in this group, the supported randomness sources (block hash, VRF, beacon), the binding-context surface, and the verifier-side tooling for checking a value against the chain are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Chain Interaction**

    ---

    The method group most often paired with Entropy — reading the on-chain state the randomness commits to.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/chain-interaction/)

</div>
