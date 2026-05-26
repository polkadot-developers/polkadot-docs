---
title: pallet-score Reference
description: The PoP pallet for personhood-anchored reputation and scoring — per-alias scores that accumulate while staying unlinkable to user accounts.
categories: Apps, Reference
---

# `pallet-score`

## Introduction

**`pallet-score`** is the Proof of Personhood pallet for **personhood-anchored reputation and scoring**. It records per-alias scores that accumulate from on-chain activity, providing a primitive that a Product (or another pallet) can read to make decisions: "has this real person built up enough reputation in this context to be trusted with X?"

The pallet's storage is keyed by alias, so two scores belonging to the same user across different Products do not link to each other or to the user's account.

!!! warning "Provisional"
    The exact dispatch surface of `pallet-score` — what extrinsics adjust scores, what events cause automatic adjustments, the scoring rules, the storage shape — is still being finalized. This page documents the conceptual responsibilities; the per-extrinsic reference will be added once the surface confirms.

## What the Pallet Records

The conceptual storage is **(alias, context) → score**:

- A user's *alias* in a specific context — typically a Product's `.dot` domain — has a per-context score.
- The same user has different aliases in different contexts, so their scores in different contexts are stored under different keys and cannot be linked.
- Scores can be positive (reputation earned) or negative (penalties), depending on the rules the context defines.

The pallet does not impose a single scoring rule; it provides the storage and the alias-scoped key. Other pallets and Products configure how scores adjust.

## Read and Write Paths

Two paths interact with `pallet-score`:

- **Adjustment dispatch.** A call (typically under `under_alias`, but other patterns are possible) increments or decrements the score for the calling alias. Whether a Product can adjust scores directly, or whether adjustments are gated to specific privileged callers, depends on the context's configuration.
- **Read access.** Anyone can read scores from chain state. The score is associated with an alias, so a reader cannot trivially identify the underlying user — but the alias is, by design, observable to anyone who knows the context.

## Use Cases

Two common patterns:

- **Sybil-resistant reputation.** A reputation system that needs "real-person reputation" rather than "account reputation" reads from `pallet-score` to confirm the entity it is evaluating is a verified person and to retrieve their cumulative score.
- **Gating with thresholds.** A Product gates a premium feature on a score threshold ("you need at least N reputation in this context to do X"); the threshold check reads from the pallet and the Product's UI only unlocks the feature if it passes.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **pallet-people**

    ---

    The foundational pallet that issues the aliases this pallet keys on.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/pallet-people/)

- <span class="badge learn">Learn</span> **Ring-VRF and Aliases**

    ---

    The mechanism that makes the alias-scoping property work — why scores under different contexts cannot be linked.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/pop/ring-vrf-and-aliases/)

</div>
