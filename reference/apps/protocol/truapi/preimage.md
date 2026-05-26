---
title: Preimage Method Group
description: TrUAPI method group for submitting off-chain content (preimages) that on-chain operations dereference by hash.
categories: Apps, Reference
---

# Preimage

## Introduction

The **Preimage** method group is the surface a Product uses to submit off-chain content that on-chain operations will dereference by hash. A typical use case is a governance proposal: the on-chain referendum points at a hash, the preimage is the bytes of the proposal call, and the bytes must be available when the referendum executes.

The Statement Store and the Preimage surfaces look superficially similar (submit bytes, get a hash, on-chain world references the hash), but they are not interchangeable — see the [Statement vs Preimage](/reference/apps/hosts/polkadot-desktop/preimage/#statement-vs-preimage){target=\_blank} decision table for which to use when.

## Conceptual Contract

The group covers:

- **Submitting a preimage** for an on-chain operation that will reference it. The Host signs the submission with the user's per-Product account (subject to the standard signing model — `ChainSubmit` permission and per-transaction approval on the paired App).
- **Hosting the bytes** so the referenced operation can dereference them when it executes. In practice the preimage layer often delegates to Bulletin Chain storage underneath; the Host handles the routing.
- **Lifecycle management** — preimages are durable until the referenced operation completes (or until explicitly cleaned up), unlike statements which expire on TTL.

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
