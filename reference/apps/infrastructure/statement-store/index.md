---
title: Statement Store Reference
description: Reference for the Statement Store — Polkadot's network-layer pub/sub primitive on the People Chain, with on-chain rules and off-chain payloads via gossip.
categories: Apps, Reference
---

# Statement Store

## Introduction

The Statement Store is Polkadot's publish/subscribe layer for short-lived, signed messages between Product users. A Product publishes a small statement; the People Chain validates it; the network gossips it out to anyone subscribed to a matching topic. Statements never enter the chain's block storage — they live briefly in nodes' local pools and decay after a short TTL.

The split is the point: **pallet rules on chain, payloads in gossip**. The chain enforces who can publish and how much; the gossip layer carries the data. That is what makes the Statement Store the right tool for _real-time signaling between users_ (chat messages, presence, multiplayer cursors, typing indicators, "now playing" status), and for anything else that has to propagate fast and does not need to be permanent.

For when to reach for this versus the [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/) or local storage, see the [Storage options for your Product](/apps/build/pub-sub-off-chain-data/) callout.

## How a Statement Reaches Subscribers

Three properties define the path from a publish call to a subscriber's callback firing:

- **Signed at the source**: Every submission carries an authentication proof (Sr25519 by default). The Host requests the proof through the App; the Product never handles keys.
- **Allowance-gated by the pallet**: The People Chain's `pallet-statement-store` enforces a per-account quota — `max_count` live statements and `max_size` total bytes. Submissions exceeding the quota are rejected at the pallet boundary, so spam does not reach subscribers. See [Allowance](/reference/apps/infrastructure/statement-store/allowance/).
- **Gossiped, not block-stored**: Once accepted into the node's statement pool, the submission propagates peer-to-peer through the People Chain network's gossip layer. Subscribers see it via their node's filtered statement subscription. See [Subscriptions](/reference/apps/infrastructure/statement-store/subscriptions/).

For the full statement lifecycle (validation, propagation, expiry, maintenance) see [Lifecycle](/reference/apps/infrastructure/statement-store/lifecycle/).

## Delivery Semantics

The Statement Store does not retry, acknowledge, or guarantee ordering — those are network-layer guarantees the gossip protocol does not provide. Delivery is best-effort. If your Product needs to know a message reached a peer, the peer publishes an acknowledgment statement; reliability is composed at the application layer, not at the protocol.

If the content needs to outlive the TTL, store it on the Bulletin Chain and publish a CID as the statement payload. The composition — Statement Store for the live signal, Bulletin Chain for content that has to be there later — is documented in the Polkadot App's [Chat reference](/reference/apps/hosts/polkadot-app/chat/).

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Lifecycle**

    ---

    How a statement progresses from submission through validation, gossip, TTL, and eviction — and what each step guarantees.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/lifecycle/)

- <span class="badge learn">Learn</span> **Subscriptions**

    ---

    How a subscriber registers a topic filter, what `topic2` adds, and the dedup behavior on the receiving side.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/subscriptions/)

- <span class="badge learn">Learn</span> **Channels**

    ---

    The last-write-wins primitive built on top of statements — useful for soft state like presence indicators where only the latest version matters.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/channels/)

- <span class="badge learn">Learn</span> **Allowance**

    ---

    The allowance model that gates submissions — `max_count`, `max_size`, and how a Product budgets traffic against an account's quota.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/statement-store/allowance/)

- <span class="badge guide">Guide</span> **Exchange Ephemeral Messages**

    ---

    The Product-side how-to: setting up the client, subscribing, publishing typed statements, using channels.

    [:octicons-arrow-right-24: Get Started](/apps/build/pub-sub-off-chain-data/)
</div>
