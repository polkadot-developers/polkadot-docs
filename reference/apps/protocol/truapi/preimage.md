---
title: Preimage Method Group
description: TrUAPI method group for submitting off-chain content that on-chain operations dereference by hash, with preimage and Statement Store distinction.
categories: Apps, Reference
---

# Preimage

## Introduction

The Preimage method group lets a Product submit off-chain content that on-chain operations dereference by hash. A typical use case is a governance proposal, where the on-chain referendum points at a hash, the preimage is the bytes of the proposal call, and the bytes must be available when the referendum executes.

The Statement Store and Preimage surfaces look superficially similar because both submit bytes, return a hash, and let on-chain logic reference that hash. They are not interchangeable. See the [Statement vs Preimage](/reference/apps/hosts/polkadot-desktop/preimage/#statement-vs-preimage){target=\_blank} decision table for which to use when.

## Conceptual Contract

The group covers:

- **Submitting a preimage**: The Product submits bytes for an on-chain operation that will reference them. The Host signs the submission with the user's per-Product account, subject to the standard signing model, the `ChainSubmit` permission, and per-transaction approval on the paired App.
- **Hosting the bytes**: The preimage layer hosts the referenced bytes so the on-chain operation can dereference them when it executes. In practice, the Host often routes storage through Bulletin Chain.
- **Lifecycle management**: Preimages are durable until the referenced operation completes or until they are explicitly cleaned up, unlike statements, which expire after their time to live (TTL).

!!! warning "Provisional"
    The exact set of host calls in this group, supported preimage size limits, the relationship with Bulletin Chain storage, and any preimage-availability hooks for runtime introspection are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Preimage on Polkadot Desktop**

    ---

    The Host-side reference including the Statement-vs-Preimage decision table.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/preimage/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Product-side how-to for Bulletin Chain storage that the preimage surface often delegates to underneath.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/){target=\_blank}

</div>
