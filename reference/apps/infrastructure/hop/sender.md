---
title: HOP Sender Journey
description: The sender side of a HOP transfer — dispatching a multi-hop send, tracking it as it routes through intermediate chains, and observing the final outcome.
categories: Apps, Reference
---

# Sender Journey

## Introduction

This page documents the sender side of a HOP transfer: what a participant who initiates the send does, what they see as it routes, and how they observe whether it landed.

For the protocol mechanics underneath, see [How It Works](/reference/apps/infrastructure/hop/how-it-works/). For the recipient's view, see [Recipient Journey](/reference/apps/infrastructure/hop/recipient/).

!!! warning "Provisional"
    The exact sender-side dispatch extrinsics, the tracking surface (events emitted at each hop, subscribable status), and the finalization signal a sender observes are still being finalized. This page documents the conceptual flow; the per-call reference will be added once the surface stabilizes.

## The Flow at a Glance

From the sender's perspective:

1. **Build the hop sequence**: Either specify the full route (sender-specified routing) or specify only the destination and let routing chains determine the intermediate hops dynamically.
2. **Sign and dispatch**: A single signed transaction on the sender's chain initiates the send. The signing uses the standard mediated-signing flow — the user approves on the paired App per the usual model.
3. **Watch the hops progress**: Each hop emits an event on the chain it landed on; the sender's UI (or backend, if the sender is a service) can subscribe to those events to track progress.
4. **Observe finalization**: When the transfer lands on the destination chain, the destination emits a finalization event. The sender's flow can resolve at that point — typically by updating UI, posting a confirmation, or triggering the next step in a larger workflow.

## What Can Go Wrong

The two common failure modes a sender's UI should handle:

- **Mid-route rejection**: A hop fails verification on an intermediate or destination chain (the verifier rejects the proof, the receiving chain refuses for policy reasons, fees are insufficient). The funds typically remain reclaimable on the chain where the failure occurred; the sender's UI should make recovery visible.
- **Timeout / loss of tracking**: A hop succeeds but the sender's monitoring loses visibility (the sender's node was offline during the relevant events). The funds are still where the chain says they are; the sender's UI should recover by reading the destination's state directly rather than assuming the worst from missing events.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **How It Works**

    ---

    The protocol mechanics underneath the sender flow — single hops, multi-hop routing, the verifier model.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/how-it-works/)

- <span class="badge learn">Learn</span> **Recipient Journey**

    ---

    The receiving side of a HOP transfer.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/recipient/)

</div>
