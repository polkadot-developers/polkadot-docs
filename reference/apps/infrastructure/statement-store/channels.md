---
title: Statement Store Channels
description: The last-write-wins primitive on top of statements — a channel field causes the pallet to replace older entries from the same account on the same channel.
categories: Apps, Reference
---

# Channels

## Introduction

`pallet-statement-store` supports an optional channel field on every statement. When a new submission carries the same `channel` as an existing live statement from the same account, the pallet replaces the older one in the node's pool — and the replacement propagates to subscribed peers, who drop the old statement in favor of the new one.

The result is a last-write-wins primitive on top of the standard pub/sub: each channel name, scoped per-account, maps to a single live value at any moment.

The Product SDK abstracts this as `ChannelStore<T>` in `@parity/product-sdk-statement-store`. The underlying storage primitive is the same — every channel value is still a statement going through the same lifecycle — but the read surface looks like a key-value map keyed by channel name.

## When to Reach for Channels

Three patterns are the canonical fit:

- **Presence indicators**: _"Alice is online."_ Only the latest value matters; older states should be replaced as the user goes idle and active again.
- **Multiplayer cursors and other live UI state**: The user has moved their cursor to position N; the previous position is no longer relevant.
- **"Now playing" / live status**: Only the current track matters, not the history of what was playing earlier in the session.

For append-only events — chat messages, action logs, social-feed posts — channels are the wrong primitive. Each event needs to live independently; using a channel would erase the previous message every time the user sent a new one. For those use cases, keep using `client.publish` directly.

## Scope and Replacement Rules

Channels are scoped per-account. The pallet's replacement rule only matches statements from the same signer — one user cannot overwrite another user's channel value. Two users posting on the same channel name produce two independent live values, one per account.

The replacement is atomic from a subscriber's perspective: the older statement is evicted from the pool and the newer one inserted in the same step. A subscriber sees the new value; the old value, if it was in flight to the subscriber's node, is dropped before it reaches the application callback.

## The Channel-Store API

The SDK's `ChannelStore<T>` exposes the standard surface:

- **`channels.write(name, value)`**: Publish a new value on the named channel. The SDK hashes the channel name with Blake2b-256, attaches the per-account scoping, and submits as a statement.
- **`channels.read(name)`**: Return the latest value seen on that channel locally.
- **`channels.readAll()`**: Return the full map of `(channel name → latest value)` the local node has seen.
- **`channels.onChange(callback)`**: Fire on every transition (a new write replacing an older value).

`ChannelStore` automatically timestamps the value if your `T` omits a timestamp, so consumers can reason about ordering when needed.

!!! warning "Provisional"
    The maximum number of live channels per account, the interaction between channels and the per-account `max_count` allowance limit, and any cross-account aggregation primitives are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Subscriptions**

    ---

    The subscription surface that delivers channel transitions to subscribers, including the per-channel dedup behavior.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/subscriptions/)

- <span class="badge guide">Guide</span> **Exchange Ephemeral Messages**

    ---

    The Product-side how-to including the `ChannelStore` walkthrough.

    [:octicons-arrow-right-24: Get Started](/apps/build/exchange-ephemeral-messages/)
</div>
