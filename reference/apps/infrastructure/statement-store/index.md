---
title: Statement Store Reference
description: Reference for the Statement Store — Polkadot's network-layer pub/sub primitive on the People Chain, with on-chain rules and off-chain payloads carried by gossip.
categories: Apps, Reference
---

# Statement Store

## Introduction

The **Statement Store** is a network-layer pub/sub primitive on Polkadot's People Chain. A Product publishes small, signed **statements**; the People Chain runtime validates them; the node propagates them over the network's gossip layer to peers that have subscribed to a matching topic filter. Statements **do not enter the chain's block storage** — they live in the node's local statement pool and decay after a short TTL.

The split is the point: **pallet rules on chain, payloads in gossip**. The chain commits the allowance and validation rules; the gossip layer carries the payloads. This is what makes the Statement Store the right tool for **real-time signaling between users of a Product** — chat messages, presence, multiplayer cursors, typing indicators, "now playing" status — anything that has to propagate fast and does not need to be permanent.

For when to reach for this versus the Bulletin Chain or local storage, see the [Storage options for your Product](/apps/build/exchange-ephemeral-messages/){target=\_blank} callout.

## How a Statement Reaches Subscribers

Three properties define the path from a publish call to a subscriber's callback firing:

- **Signed at the source.** Every submission carries an authentication proof (Sr25519 by default). The Host requests the proof through the App; the Product never handles keys.
- **Allowance-gated by the pallet.** The People Chain's `pallet-statement-store` enforces a per-account quota — `max_count` live statements and `max_size` total bytes. Submissions exceeding the quota are rejected at the pallet boundary, so spam doesn't reach subscribers. See [Allowance](/reference/apps/infrastructure/statement-store/allowance/).
- **Gossiped, not block-stored.** Once accepted into the node's statement pool, the submission propagates peer-to-peer through the People Chain network's gossip layer. Subscribers see it via their node's filtered statement subscription. See [Subscriptions](/reference/apps/infrastructure/statement-store/subscriptions/).

For the full statement lifecycle (validation, propagation, expiry, maintenance) see [Lifecycle](/reference/apps/infrastructure/statement-store/lifecycle/).

## Delivery Semantics

The Statement Store does not retry, acknowledge, or guarantee ordering — those are network-layer guarantees the gossip protocol does not provide. **Delivery is best-effort.** If your Product needs to know a message reached a peer, the peer publishes an acknowledgment statement; reliability is composed at the application layer, not at the protocol.

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

    [:octicons-arrow-right-24: Get Started](/apps/build/exchange-ephemeral-messages/){target=\_blank}

</div>
