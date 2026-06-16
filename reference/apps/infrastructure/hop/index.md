---
title: HOP Reference
description: Reference for HOP — Polkadot's cross-chain hop protocol that moves assets and messages between chains, with current maturity-state caveats clearly flagged.
categories: Apps, Reference
---

# HOP

## Introduction

HOP is Polkadot's cross-chain hop protocol — a mechanism for moving assets and messages between chains in the Polkadot ecosystem with more flexibility than a plain XCM transfer. The use case is *"hop a transfer through one or more intermediate chains to reach its destination,"* with HOP handling the per-hop routing, proofs, and cleanup of intermediate state.

For most Product developers, HOP is not something you will reach for in day-one flows. The standard payment patterns — `Balances.transfer_keep_alive` for merchant flows, [Coinage](/reference/apps/infrastructure/pop/pallet-coinage/) for personhood-aware payments — cover the common cases without needing HOP. HOP becomes relevant when a Product crosses chain boundaries in a way standard XCM does not cleanly handle.

!!! warning "Current state caveats"
    HOP is being actively built and three caveats apply to integrations against the current code:

    - **`NoopVerifier` is not production-ready**: The current verifier implementation is a development stand-in. Production-grade verification is forthcoming.
    - **The repository README is out of date**: Where the README and this reference disagree, this reference reflects the intended direction; the README will be updated separately.
    - **`pallet-hop-promotion` status is evolving**: The promotion pallet that pairs with HOP for certain flows is in flux; integrations should not depend on its current shape.

    These notes will be removed from this page as each item resolves.

## Where HOP Fits

Three places HOP shows up in a Product context:

- **As a building block under cross-chain payments**: Coinage and other payment flows can route through HOP underneath when the sender and recipient are on different chains. The Product surface (Coinage, `Balances.transfer_keep_alive`) is what a Product calls; HOP is the layer beneath that makes the cross-chain part work.
- **As a primitive for cross-chain messaging beyond payments**: Moving non-asset payloads (state references, capability handles) across chain boundaries in flows that need more flexibility than plain XCM.
- **As a target for node-operator and runtime-developer work**: Running a HOP-enabled node, integrating HOP into a new Substrate chain. These node-operator and SDK-integration paths are forthcoming separately.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **How It Works**

    ---

    The conceptual protocol — what a "hop" is, how multi-hop routing is constructed, and the verifier model.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/how-it-works/)

- <span class="badge learn">Learn</span> **Sender Journey**

    ---

    The sender side of a HOP transfer: building, dispatching, and tracking a multi-hop send.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/sender/)

- <span class="badge learn">Learn</span> **Recipient Journey**

    ---

    The recipient side: receiving a HOP transfer that landed on a chain via one or more hops.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/hop/recipient/)

</div>
