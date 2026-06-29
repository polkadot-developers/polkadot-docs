---
title: Statement Lifecycle
description: How a Statement Store submission moves through validation, gossip propagation, TTL expiry, and eviction — and what each step guarantees.
categories: Apps, Reference
---

# Lifecycle

## Introduction

A Statement Store submission passes through five recognizable steps between a `publish` call and being dropped from the network. Knowing where in that lifecycle a given statement is helps you reason about delivery: some failure modes can only happen at one step, and some guarantees only exist between two of them.

## The Five Steps

1. **Submission**: The Product calls `publish` on its Statement Store client (or the equivalent TrUAPI call). The Host obtains an authentication proof from the paired App and forwards the request to the People Chain node's `statement_submit` JSON-RPC.

2. **Validation**: `pallet-statement-store` checks the submission against the per-account allowance (see [Allowance](/reference/apps/infrastructure/statement-store/allowance/)). If `max_count` or `max_size` would be exceeded, or the authentication proof is invalid, the submission is _rejected_ at this step and never reaches any subscriber. The publish call returns `false` (statement was rejected) rather than throwing.

3. **Acceptance into the pool**: A validated submission enters the local node's statement pool, the in-memory data structure that holds live statements. The publish call returns `true` at this point — the statement is now live on this node.

4. **Gossip propagation**: The node propagates accepted statements to peers that have registered a matching topic filter. Each peer's node decides whether the statement matches and forwards or drops accordingly. This is best-effort: peers may not be listening, may drop the statement under load, or may have already seen a duplicate.

5. **Expiry and eviction**: Each statement carries a TTL (default 30 seconds, configurable per submission up to the pallet-enforced cap). When the TTL elapses, the statement is evicted from each node's pool. After eviction, subscribers who join late will not see it — there is no "fetch by hash" recovery for an expired statement, and there is no chain block to look it up in.

## What Each Step Guarantees

A few load-bearing facts that fall out of the lifecycle:

- **Between submission and acceptance, the chain enforces validity**: A spam-flood attempt against your Product's topic does not reach subscribers because invalid or quota-exceeding submissions are rejected at step 2.
- **Between acceptance and expiry, propagation is best-effort**: A subscriber connected to the same node *will* see an accepted statement; a subscriber connected to a different node may or may not, depending on the gossip path.
- **After expiry there is no recovery**: If your Product needs the bytes to be retrievable later, the canonical pattern is to write them to the Bulletin Chain and publish the resulting CID as the statement payload. The statement carries the live signal; the Bulletin Chain holds the durable content.

## On-Chain Trigger (Forthcoming)

!!! warning "Forthcoming"
    On-chain-triggered statements — submissions originated by an OCW (off-chain worker) rather than a Product — are a forthcoming surface for runtime developers, not Product developers. The reference for this path will be added separately.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Allowance**

    ---

    The validation step's quota mechanism — what gets rejected at step 2 and why.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/allowance/)

- <span class="badge learn">Learn</span> **Subscriptions**

    ---

    How a subscriber attaches to the gossip stream at step 4 and the dedup behavior on the receiving side.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/subscriptions/)

</div>
