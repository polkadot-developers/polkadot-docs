---
title: How HOP Works
description: The HOP protocol's conceptual model — what a hop is, how multi-hop routing is constructed, and how the verifier model proves cross-chain correctness.
categories: Apps, Reference
---

# How It Works

## Introduction

A HOP transfer is built from a sequence of single-chain hops, each one taking the transfer one step closer to its destination. The protocol's job is to make a sequence of single-chain hops behave like a single coherent operation — atomic enough for the sender to reason about, with proofs that the intermediate state was correctly cleared as the transfer moved through.

This page documents the conceptual model: what a hop is, how multi-hop routing is constructed, and how the verifier model works at a high level.

!!! warning "Provisional"
    The exact wire format of a HOP message, the runtime extrinsics that initiate and consume hops, the verifier interface, and the per-chain integration surface are still being finalized. This page covers the conceptual model only; the protocol-level reference will be added once the surface stabilizes.

## What a Single Hop Is

A single hop moves a transfer from one chain to one adjacent chain. The hop carries:

- **The payload**: The asset and amount, or the message being moved.
- **A proof**: Evidence that the source chain has authorized the hop (typically a signed XCM-style message from the source chain's account holding the funds).
- **Routing information**: Where the hop should land next, plus any constraints or fees the next hop should respect.

The receiving chain on the other side of a hop validates the proof, accepts the payload, and either holds the funds locally (if it is the destination) or constructs the next hop forward.

## How Multi-Hop Routing Is Constructed

A multi-hop transfer is a chain of single hops — chain A → chain B → chain C, for example, where A is the sender's chain, C is the destination, and B is an intermediate routing chain.

The routing can be:

- **Sender-specified**: The sender constructs the full hop sequence at dispatch time and signs the whole thing.
- **Router-determined**: The sender specifies only the destination, and intermediate chains determine the next-hop routing dynamically.

In both modes, each hop carries enough proof for the receiving chain to validate the previous hop independently, so the chain doesn't need to trust the routing chain's word about what happened upstream.

## The Verifier Model

The verifier is the component that checks the cryptographic correctness of each incoming hop. It receives the payload, the proof, and the routing context, and produces either an "accept" or "reject" outcome. The chain's HOP integration calls into the verifier for every incoming hop; only accepted hops modify chain state.

The verifier abstracts the cryptography from the chain's HOP integration, so different verifier implementations can plug in without rewriting the per-chain integration code. The current `NoopVerifier` is a development stand-in that always accepts — useful for testing the protocol flow without the cryptographic overhead, but not suitable for production. A production verifier is forthcoming.

## What a Product Sees

A Product dispatching a HOP transfer through a higher-level surface (Coinage, or a future payment-routing primitive that uses HOP underneath) sees a single `signAndSubmit`-style call that resolves when the transfer completes — or fails — at the destination. The multi-hop machinery underneath is not directly exposed to the Product code; it is the chain's HOP integration that orchestrates the hops, and the Product's UI shows the result the destination reports back.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Sender Journey**

    ---

    What a participant sending a HOP transfer sees — dispatch, tracking, and finalization on the destination.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/sender/)

- <span class="badge learn">Learn</span> **Recipient Journey**

    ---

    What a participant receiving a HOP transfer sees on the destination chain.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/recipient/)

</div>
