---
title: Statement Store Subscriptions
description: How a subscriber registers a topic filter against the People Chain node — primary topic, optional secondary topic, dedup behavior, and unsubscription.
categories: Apps, Reference
---

# Subscriptions

## Introduction

A Product subscribes to the Statement Store by registering a topic filter with a People Chain node. The node forwards only the statements matching that filter to the Product's callback; everything else on the gossip stream is dropped before it reaches the Product. The filter is the Product's lever — pick it correctly and the Product sees exactly the traffic it wants.

The Product SDK wraps this as `client.subscribe<T>(callback, options?)` in `@parity/product-sdk-statement-store`. Underneath, it calls the node's `statement_subscribeStatement` JSON-RPC with the appropriate filter, decodes payloads into the typed `T`, and dedupes by content hash before invoking the callback.

## How Topics Filter

Two topics shape every subscription:

- **The primary topic**: The Product's identity on the gossip layer. The SDK derives it as `blake2b(appName)` and tags every submission your Product publishes with that primary topic. Subscribers from _other_ Products on the same network see only their own traffic, and your subscribers see only yours — the node filters traffic from other Products at the boundary before it reaches your callback.
- **The optional `topic2`**: Scopes a subscription further within your Product's primary topic. Pass it as a room id, a document id, or any other secondary key. The SDK hashes it with Blake2b-256 and adds it to the filter; only statements that match both topics are forwarded.

A Product subscribing without `topic2` sees every statement published anywhere in your Product. With `topic2`, it sees only the slice that matches the secondary key. Both shapes are routinely useful — global Product chat needs the full stream; a specific room needs the scoped one.

## What the Callback Receives

The subscription delivers each matching statement to your callback decoded into your typed `T` and deduped by channel and content hash. The dedup means:

- A statement that propagates to the Product's node via multiple gossip paths fires the callback only once.
- A statement replaced on the same channel by a newer one (see [Channels](/reference/apps/infrastructure/statement-store/channels/)) fires the callback for the newer value only.

## Subscription Lifecycle

`client.subscribe` returns an `Unsubscribable` whose `unsubscribe()` method tears down the JSON-RPC subscription on the node and stops the callback from receiving further events. Tear subscriptions down when the Product no longer needs them — typically on view unmount or process shutdown — so the node doesn't hold open a filter your Product has stopped reading.

## Initial-State Behavior

Some `subscribe` implementations return the current statement pool matching the filter (a backfill of statements that haven't expired yet) plus an ongoing stream of new matches; some return only the ongoing stream. The Product SDK's default returns the current pool plus the ongoing stream, so a subscriber that joins late still sees recently published statements that haven't aged out.

!!! warning "Provisional"
    The exact backfill behavior, the per-node pool size limits visible to subscribers, and the reconnection / missed-events semantics when a Product's node loses gossip connectivity are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Channels**

    ---

    The last-write-wins primitive built on the same gossip layer — `topic2` filters by scope; channels filter by replacement semantics.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/channels/)

- <span class="badge learn">Learn</span> **Lifecycle**

    ---

    Where in the lifecycle a subscription attaches (step 4: gossip propagation) and what the dedup behavior protects against.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/lifecycle/)

</div>
