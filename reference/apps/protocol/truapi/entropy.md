---
title: Entropy Method Group
description: TrUAPI method group for deriving deterministic per-Product entropy from the user's root key, suitable for seeding Product-local key material.
categories: Apps, Reference
---

# Entropy

## Introduction

The Entropy method group lets a Product obtain a stable secret derived from the user's root key, scoped to that Product. A Product uses it to seed key material it needs to hold itself — an encryption key for local data, a deterministic identifier, a seed for a Product-side keypair — without ever touching the user's root entropy or asking the user to manage a separate secret.

The value is deterministic: it is derived from the user's root [BIP-39](https://github.com/bitcoin/bips/blob/master/bip-0039.mediawiki) entropy through a three-layer BLAKE2b-256 keyed-hashing scheme, so the same input always produces the same output. A Product that asks for the same derivation context tomorrow, or on another device the user has restored, gets the same 32 bytes back. This is what makes it useful for seeding: the Product can re-derive its key material instead of storing it.

!!! danger "Not a randomness source"
    Host-derived entropy is deterministic and pre-computable — it is key-derivation, not randomness. Do **not** use it for lottery draws, fair-shuffle games, randomized selection, or any flow where a value must be unpredictable to the parties involved. Anyone who can reproduce the derivation can predict the output. For unpredictable values, use the browser's `crypto.getRandomValues`; for randomness that an external party must be able to verify against the chain, use an on-chain VRF or beacon directly, not this group.

This is the same `entropy = randomness` confusion behind the RFC-7 bug, where a Host minted a random `rootAccountSecret` instead of deriving it. The point of this group is the opposite of randomness: reproducible derivation.

## Conceptual Contract

The group exposes a single derivation primitive:

- **Deriving entropy for a context**: The Product requests 32 bytes of entropy derived from the user's root entropy and bound to a derivation context. The same context always yields the same bytes; two different contexts yield independent values, so a Product cannot accidentally reuse one secret where it meant to use another.

There is no subscription, no per-block or per-epoch update, and no randomness beacon. The group is one `host_derive_entropy` request and its deterministic response.

!!! warning "Provisional"
    The exact derivation-context surface (how a Product names and scopes a derivation) and the SDK wrapper around `host_derive_entropy` are still being finalized. The deterministic-derivation contract described here matches the TrUAPI v0.2 spec and is stable.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Sandbox and Sub-Accounts**

    ---

    Why a Product is scoped to derived material rather than the user's root identity — the same derivation principle this group exposes for arbitrary secrets.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/sandbox/)

</div>
