---
title: HOP Recipient Journey
description: The receiving side of a HOP transfer — observing the incoming hop on the destination chain, validating the proof, and settling the resulting state.
categories: Apps, Reference
---

# Recipient Journey

## Introduction

This page documents the recipient side of a HOP transfer: what a participant or chain receiving the final hop sees, how the destination chain validates the incoming proof, and what settles when the validation passes.

For the protocol mechanics underneath, see [How It Works](/reference/apps/infrastructure/hop/how-it-works/). For the sender's view, see [Sender Journey](/reference/apps/infrastructure/hop/sender/).

!!! warning "Provisional"
    The exact recipient-side event surface (what events the destination emits when a HOP transfer lands, the subscription primitive for those events, the state-change semantics), and any accept-or-decline mechanics on the recipient's side are still being finalized. This page documents the conceptual flow; the per-event reference will be added once the surface stabilizes.

## The Flow at a Glance

From the recipient's perspective:

1. **An incoming hop lands**: The destination chain receives the final hop with its payload and proof.
2. **The verifier validates**: The chain's HOP integration calls the configured verifier; only an accepted proof proceeds to settlement.
3. **State settles**: The destination chain applies the payload's effect — crediting the recipient's account for an asset transfer, recording the message for a message-passing flow, or whatever the payload prescribed.
4. **The destination emits a finalization event**: The event is what tells the sender (and the recipient's UI, if any) that the transfer completed.

Importantly, the recipient does _not_ typically have to explicitly accept the transfer — settlement happens automatically when the verifier accepts. Where two-sided acceptance is needed (a Coinage-style flow where the recipient can decline), that semantics is layered on top of HOP by the higher-level pallet, not built into HOP itself.

## What the Recipient's Product Sees

If the recipient is a user of a Polkadot Product, the Product subscribes to the relevant chain state on the destination chain. When the HOP transfer settles:

- The user's balance (or other state) updates as the destination chain's storage changes.
- The Product UI surfaces the change to the user — typically as an arrived transfer or an updated state value.

For asynchronous receive flows, the Product builds against the destination chain's chain-client surface — see [Read Chain State](/apps/build/read-chain-state/) for the pattern.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **How It Works**

    ---

    The protocol mechanics — single hops, multi-hop routing, the verifier model that gates settlement.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/how-it-works/)

- <span class="badge guide">Guide</span> **Read Chain State**

    ---

    The Product-side how-to for subscribing to chain state — the surface a recipient's Product uses to observe HOP-driven state changes.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/)
</div>
