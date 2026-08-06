---
title: Statement Store
description: Overview of the Product SDK statement-store package — publish and subscribe to signed, short-lived statements gossiped off-chain for real-time state between users.
categories: Apps
---

# Statement Store

## Introduction

[`@parity/product-sdk-statement-store`](https://paritytech.github.io/product-sdk/api/statement-store/) is a publish/subscribe client over the [Statement Store](/reference/apps/infrastructure/statement-store/): signed, short-lived messages gossiped between instances of your Product, off-chain and with no fee per message. On top of raw pub/sub it adds an optional last-write-wins channel abstraction for per-key shared state.

Reach for it when your Product needs real-time state between users: presence, typing indicators, multiplayer cursors, or announcing where the latest snapshot of shared content lives.

## When to Use It

- For ephemeral, signed, topic-routed messaging between app instances: presence, signaling, and transient state (`publish` / `subscribe`).
- For last-write-wins per-key state where the newest value for a key wins (`ChannelStore`).
- For tests without a Host or network, using the in-memory transport from the `/testing` subpath.
- Not for durable storage or large payloads: statements expire (default 30 seconds) and are capped at 512 bytes. Pair it with [Cloud Storage](/apps/product-sdk/cloud-storage/) when you need to keep the content.

## Core Concepts

- **`StatementStoreClient`**: The main class. Construct it with an `appName` (which becomes the primary topic), then `connect`, `publish`, and `subscribe`.
- **`publish` returns a `Result`, `subscribe` returns a handle**: Check `.ok` on the `publish` result; `subscribe` returns an `Unsubscribable` you call to stop listening.
- **Topics and channels**: A topic routes messages between instances of the same Product; a channel is a named key whose latest value wins. Both are hashed identifiers derived from the names you choose.
- **`ChannelStore`**: A last-write-wins map over the client. `write(name, value)` publishes a value, `read` and `readAll` return the current values, and `onChange` notifies you of updates.
- **Size and TTL limits**: Statements are capped at 512 bytes and carry a default 30-second TTL. `encodeData` throws if a payload exceeds the cap, so keep statements small and treat them as signaling, not storage.
- **Connection modes**: `host` mode signs through the Host's sponsored path; `local` mode signs locally with a supplied key, mainly for tests.

## Publish and Subscribe

Connect in host mode, subscribe to incoming statements, and publish one to a room topic:

```typescript
import { StatementStoreClient } from '@parity/product-sdk-statement-store';

const client = new StatementStoreClient({ appName: 'my-product' });
await client.connect({ mode: 'host' });

const subscription = client.subscribe((statement) => {
  console.log(statement.data);
});

const result = await client.publish(
  { type: 'presence', text: 'gm', timestamp: Date.now() },
  { topic2: 'lobby' },
);
if (!result.ok) console.error(result.error.message);
```

## Share Last-Write-Wins State

`ChannelStore` keeps one live value per channel and reconciles updates by timestamp, so every participant converges on the newest value:

```typescript
import {
  StatementStoreClient,
  ChannelStore,
} from '@parity/product-sdk-statement-store';

const client = new StatementStoreClient({ appName: 'my-product' });
await client.connect({ mode: 'host' });

const channels = new ChannelStore(client);
channels.onChange((name, value) => {
  console.log(name, value);
});

await channels.write('presence', { status: 'online', timestamp: Date.now() });
```

## Limitations

- Statements are hard-capped at 512 bytes; `encodeData` throws before submitting if you exceed it.
- The default TTL is 30 seconds. Data is ephemeral, so late joiners see nothing until the next message.
- The client is Host-only by default; `local` mode needs a signing key, or inject a custom transport for tests.
- `publish` and `ChannelStore.write` return a `Result`, but `subscribe` and `onChange` return handles; malformed received statements are dropped silently.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Publish and Subscribe to Off-Chain Data**

    ---

    The task-focused recipe: topics, channels, TTLs, and allowances, step by step.

    [:octicons-arrow-right-24: Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/)

-   <span class="badge guide">Guide</span> **Build a Shared Todo App**

    ---

    A full tutorial that composes the statement store with cloud storage and local persistence.

    [:octicons-arrow-right-24: Build a Shared Todo App](/apps/tutorials/shared-todo-app/)

-   <span class="badge external">External</span> **API Reference**

    ---

    The complete `statement-store` surface: `StatementStoreClient`, `ChannelStore`, and topics.

    [:octicons-arrow-right-24: Visit Site](https://paritytech.github.io/product-sdk/api/statement-store/)

</div>
