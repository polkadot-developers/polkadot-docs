---
title: Chat Method Group
description: TrUAPI method group for in-App chat, including room and bot registration, typed message publishing, and custom message rendering by subscription.
categories: Apps, Reference
---

# Chat

## Introduction

The Chat method group lets a Product participate in the Polkadot App's chat surface by registering as a bot in a room, publishing typed messages, and rendering custom message types that the App displays inline. The underlying transport composes the Statement Store for signaling with the Bulletin Chain for content that has to outlive the gossip time to live (TTL). The Chat group exposes a higher-level surface on top of that pattern.

For the conceptual model of how Chat composes the two layers, see the [Chat in the Polkadot App](/reference/apps/hosts/polkadot-app/chat/){target=\_blank} reference. This page documents the TrUAPI surface that powers it.

## Conceptual Contract

Methods in this group fall into three families:

- **Room and bot registration**: A Product registers as a bot inside a room and creates simple group chats via `host_chat_create_simple_group`, introduced in `v0.2`. The registration call is gated by the standard Permissions surface.
- **Publishing typed messages**: The Host accepts `Text`, `RichText`, `Actions`, `File`, `Reaction`, and `Custom` message types. It handles encoding, attaches the per-Product account context, and dispatches to the Statement Store and Bulletin Chain underneath.
- **Custom-message rendering (reverse subscription)**: `product_chat_custom_message_render_subscribe` lets the App ask the Product to render its own `Custom` message types in place. The Host opens a subscription against the Product, and the Product responds with rendered output for each message it owns.

Messages a Product submits before bot registration completes are queued automatically. The Product does not need to track registration state.

!!! warning "Provisional"
    Lifecycle semantics around room membership, the precise shape of typed-message payloads, and the rendering-subscription contract are still being finalized. The capabilities above are stable; per-method signatures will be added as the surface confirms.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Chat in the Polkadot App**

    ---

    The conceptual reference for how Chat composes Statement Store and Bulletin Chain, and what each message type is for.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/chat/)

</div>
