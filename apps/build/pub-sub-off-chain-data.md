---
title: Publish and Subscribe to Off-Chain Data
description: Publish and subscribe to off-chain data from a Polkadot Product using the Statement Store. Filter by topic, publish statements, and use channels.
categories: Apps
tutorial_badge: Intermediate
---

# Publish and Subscribe to Off-Chain Data

## Introduction

This guide covers the [Statement Store](/reference/apps/infrastructure/statement-store/), a pub/sub primitive on Polkadot's People Chain for real-time signaling between users of your Product. Statements are small, signed payloads that propagate peer-to-peer via the node's gossip layer without entering chain storage, making them the right tool for chat messages, presence indicators, multiplayer cursors, and typing indicators. Submissions are allowance-gated (no fees); reading is permissionless. The guide covers four steps: setting up the client, subscribing to incoming statements, publishing a typed statement, and using a channel for last-write-wins state.

!!! info "Storage options for your Product"
    The Statement Store is the right layer for short-lived signaling between users. When your data must outlive a session or stay on-device, reach for a different layer instead:

    - **Local KvStore**: Per-Product, per-device key-value. User preferences, drafts, cached values. Not synced across devices. See [Persist Data Locally](/apps/build/persist-data-locally/).
    - **Bulletin Chain**: Content-addressed, on-chain, retained ~2 weeks by default and renewable. Content readers fetch later by hash: profile photos, published articles, app bundles. See [Store Data on Chain](/apps/build/store-data-on-chain/).
    - **Statement Store** (this page): Gossip-distributed, short-lived (default 30s TTL), allowance-gated. Real-time signaling between users: chat messages, presence, typing indicators, multiplayer state.

The Statement Store and Bulletin Chain compose well: Polkadot App's Chat uses the Statement Store for signaling (who's online, session handshakes) and the Bulletin Chain for the encrypted message content. Many Products follow the same split: Statement Store for ephemeral state, Bulletin Chain for content that needs to survive longer than a session.

## Prerequisites

Before starting, ensure you have:

- Completed [Install Desktop and Pair](/apps/get-started/) so you have a paired Polkadot Desktop and a signer for product-scoped accounts
- A Statement Store allowance for your account; the People Chain's `pallet-statement-store` gates submissions on a per-account allowance (`max_count` live statements and `max_size` total bytes)
- A Polkadot Product project running locally (see [Set Up Your Project](/apps/build/#set-up-your-project) if you don't have one yet)

!!! warning "Provisional: obtaining an allowance"
    The process for obtaining a Statement Store allowance on TestNet is not yet documented. Ask in the developer community for the current access paths.

!!! note
    PAS funds are not required for the Statement Store itself; submissions don't pay transaction fees. The allowance is the gating mechanism; PAS is only relevant if your Product later interacts with chains that charge fees.

## Install the SDK

Install the SDKs at pinned versions so the snippets type-check predictably:

```bash
npm install @parity/product-sdk@0.8.0 @parity/product-sdk-statement-store@0.4.0
```

This guide installs the individual packages it uses. The umbrella `@parity/product-sdk` re-exports them too, so a single dependency works equally well. See [Umbrella or Individual Packages](/apps/build/#umbrella-or-individual-packages) for the tradeoff.

## Set Up Your Statement Store Client

Every snippet in this guide is **Product code**: modules placed inside the Product running at `localhost:3000` (per [Set Up Your Project](/apps/build/#set-up-your-project)), loaded by Polkadot Desktop. Signing requests route through the Host (Polkadot Desktop) to the user's paired Polkadot App on their phone, which holds the signing keys; your Product never derives, sees, or holds keys.

`StatementStoreClient` is the high-level client. It wraps the People Chain node's `statement_submit` and `statement_subscribeStatement` JSON-RPC methods, handles JSON encoding of your payload, requests authentication proofs from the Host, and deduplicates incoming statements. Connect it once at the top of your Product:

```typescript title="setup-statement-store.ts"
--8<-- "code/apps/build/pub-sub-off-chain-data/setup-statement-store.ts"
```

`new StatementStoreClient({ appName })` creates the client. The `appName` is hashed with Blake2b-256 and used as the statement's primary topic; every submission your Product makes carries that topic, and `client.subscribe()` filters on it at the node boundary, so other instances of _your_ Product see your statements while traffic from other Products on the network is dropped before it reaches your subscriber. `client.connect({ mode: 'host', accountId })` wires the client to the Host API transport and delegates proof creation to the Host; Polkadot Desktop routes the proof request to the user's paired Polkadot App, which signs and returns the proof. The `accountId` is a tuple of `[ss58Address, chainPrefix]`; `42` is the generic Substrate SS58 prefix.

!!! note "Delivery is best-effort"
    The Statement Store does not retry, acknowledge, or guarantee ordering; those are network-layer guarantees the gossip protocol doesn't provide. If your Product needs to know a statement reached a peer, the peer publishes an ack statement; reliability is composed at the application layer. If the content needs to outlive the TTL, store it on the Bulletin Chain and publish a CID as the statement payload.

    Polkadot App's Chat is exactly this composition: Statement Store for signaling, Bulletin Chain for the encrypted message content.

## Subscribe to Incoming Statements

`client.subscribe<T>(callback, options?)` registers a topic filter with the connected node. Internally, the SDK calls `statement_subscribeStatement` with a filter scoped to your Product's `appName` topic; the node returns the current statement pool matching that filter and streams any further submissions that match. The SDK decodes the JSON payload into your typed `T` and dedupes by channel and content hash before invoking your callback:

```typescript title="subscribe-statements.ts"
--8<-- "code/apps/build/pub-sub-off-chain-data/subscribe-statements.ts"
```

The optional `topic2` is hashed with Blake2b-256 and added to the filter; scope to a room id, a document id, or any other secondary key within your Product. The returned `Unsubscribable` exposes `unsubscribe()` to tear down the JSON-RPC subscription when you no longer need it.

!!! warning "A subscription receives every statement on its topic, regardless of payload shape"
    The filter matches on topics, not on your TypeScript type. A subscriber on a given `topic2` receives _all_ statements published to that topic, including channel writes (the next section) and any other payload type your Product publishes there. The SDK decodes each one as your declared `T`, so a statement with a different shape arrives with `undefined` fields rather than an error.

    If your Product publishes more than one kind of payload (for example, chat messages _and_ presence updates), either give each kind its own `topic2` (`room-42-chat` vs `room-42-presence`) or include a discriminator field in the payload and branch on it inside the callback. Reusing one `topic2` for distinct shapes will cross-deliver them.

## Publish a Typed Statement

`client.publish<T>(data, options?)` builds a `Statement`, JSON-encodes the payload, requests a proof through the Host (Polkadot Desktop forwards the request to the user's paired Polkadot App, which signs), and submits via the node's `statement_submit` JSON-RPC. Every instance of your Product subscribed to the matching topic will receive it as the gossip propagates:

```typescript title="publish-statement.ts"
--8<-- "code/apps/build/pub-sub-off-chain-data/publish-statement.ts"
```

`publish` returns `Promise<boolean>`: `true` when the node accepted the statement into its pool, `false` when it was rejected by `pallet-statement-store`'s validity check (typically allowance, size, or proof failure). It throws `StatementDataTooLargeError` if the JSON-encoded payload exceeds the per-statement size limit (512 bytes), and `StatementConnectionError` if the client is not connected.

Two limits worth designing around:

- **512-byte payload limit**: Measured after JSON encoding. For larger content, store it on the Bulletin Chain and publish the CID as a small statement.
- **30-second default TTL**: The pallet enforces a maximum retention window. The SDK defaults to 30 seconds, and you can shorten or lengthen per-statement via `ttlSeconds` up to that cap. After expiry, the node evicts the statement from its pool.

`PublishOptions` covers the common cases: `topic2` (secondary Blake2b-256 topic for room/doc scoping), `channel` (last-write-wins; see the next section), `ttlSeconds` (override the default), and `decryptionKey` (an opaque hint subscribers can match on to discover encrypted content).

## Use a Channel for Last-Write-Wins State

`pallet-statement-store` supports an optional `channel` field on every statement: when a new submission carries the same `channel` as an existing live statement from the same account, the pallet replaces the older one in the node's pool. The gossip layer then propagates the replacement, and every subscribed peer drops the old statement in favor of the new one. The SDK abstracts this with `ChannelStore<T>`; each channel name maps to a single live value:

```typescript title="channel-presence.ts"
--8<-- "code/apps/build/pub-sub-off-chain-data/channel-presence.ts"
```

`channels.write(name, value)` hashes the channel name with Blake2b-256 and publishes; `channels.read(name)` returns the latest value seen on that channel; `channels.readAll()` returns the full map; `channels.onChange(callback)` fires on every transition. `ChannelStore` stamps `timestamp` for you if the value omits it. Channel scope is per-account; the pallet's replacement rule only matches statements from the same signer, so one user cannot overwrite another user's channel.

`ChannelStore` is the right primitive for soft state where only the latest version matters: presence indicators, multiplayer cursors, "now playing" status. For append-only events such as chat messages, action logs, social-feed posts, keep using `client.publish` directly so each event lives independently until its TTL.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Persist Data Locally**

    ---

    Your Product can sync state between users; next, keep device-local data (preferences, drafts, caches) across sessions.

    [:octicons-arrow-right-24: Persist Data Locally](/apps/build/persist-data-locally/)

-   <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    For durable, content-addressed payloads, route through the Bulletin Chain. Pair with the Statement Store by publishing the CID as a Statement.

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

</div>
