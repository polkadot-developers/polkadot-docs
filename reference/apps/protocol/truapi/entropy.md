---
title: Entropy Method Group
description: TrUAPI method group for verifiable randomness sourced from the Host, suitable for use cases that need on-chain-grounded entropy in Products.
categories: Apps, Reference
---

# Entropy

## Introduction

The Entropy method group lets a Product obtain randomness sourced from the Host rather than from its own runtime. A Product uses this group instead of the browser's `crypto.getRandomValues` or a server-side CSPRNG when it needs verifiability. Host-provided entropy can be tied to on-chain commitments, such as block hashes, verifiable random function (VRF) outputs, or beacon values, giving a Product a randomness source that an external party can check against the chain.

This matters for use cases where the user or another party needs to trust that a random value was not chosen adversarially after the fact, such as lottery-style draws, fair-shuffle games, and randomized selection inside a `pallet-airdrop`-style flow.

## Conceptual Contract

The group exposes verifiable-randomness primitives:

- **Requesting a random value**: The Product receives an attached commitment to the chain state the value was derived from, so a verifier can reproduce or check the derivation.
- **Subscribing to a randomness beacon**: Protocols that need a fresh value per block or per epoch can subscribe to randomness updates.
- **Binding entropy to a context**: Two Products asking for randomness for different contexts cannot accidentally share an entropy value that should have been independent.

For uses where verifiability is not required, such as UI animations or retry jitter, use the browser's standard randomness API. The Entropy group is the right tool when randomness is part of a user-visible fairness contract.

!!! warning "Provisional"
    The exact set of host calls in this group, the supported randomness sources (block hash, VRF, beacon), the binding-context surface, and the verifier-side tooling for checking a value against the chain are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Chain Interaction**

    ---

    The method group most often paired with Entropy for reading the on-chain state the randomness commits to.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/chain-interaction/)

</div>
