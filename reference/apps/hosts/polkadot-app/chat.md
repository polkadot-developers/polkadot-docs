---
title: Chat in the Polkadot App
description: Reference for the Polkadot App's Chat feature — room and bot registration, typed message system, custom rendering, and how Chat composes the Statement Store with the Bulletin Chain.
categories: Apps, Reference
---

# Chat

## Introduction

Chat is the **Polkadot App's in-App messaging surface**. It is also the canonical example of a composition that runs across two of Polkadot's infrastructure layers: the **Statement Store** carries the real-time signaling (who is online, who said what, when), and the **Bulletin Chain** stores the encrypted message content that has to outlive the gossip TTL.

A Product can participate in Chat in two ways:

- **As a bot.** Your Product registers as a bot in a chat room and publishes / receives typed messages on behalf of the user.
- **As a custom message renderer.** Your Product responds to a *reverse subscription* the App opens against it, providing custom UI for message types you define. The App calls `product_chat_custom_message_render_subscribe` and your Product returns rendered output for each message it owns.

!!! warning "Provisional"
    The internal architecture of Chat in the App (the local message queue, the bot registry, the proof-routing for outgoing statements) is still being finalized. Architecture diagrams and lifecycle specifics will be added once they are confirmed. The narrative below covers the developer-observable surface only.

## Room and Bot Registration

Two registration concepts gate participation:

- **Room registration** identifies a logical conversation. Rooms can be DM-style (two users), simple group chats, or feature-specific (a Product registers a room to deliver messages to its users).
- **Bot registration** identifies a Product participating in a room. A Product that wants to publish messages on the user's behalf registers as a bot inside the room.

A `host_chat_create_simple_group` host call (introduced in TrUAPI v0.2) creates a simple group chat from a Product. Full lifecycle specifics — invitation flow, membership semantics, leave behavior — are documented in the TrUAPI Chat method group once that reference lands.

## Message Types

Chat uses a typed message system. The canonical types are:

- **Text** — plain-text messages.
- **RichText** — formatted messages (links, mentions, basic formatting).
- **Actions** — actionable messages users can interact with directly in-App.
- **File** — file attachments backed by Bulletin Chain content addresses.
- **Reaction** — reactions attached to an existing message.
- **Custom** — Product-defined message types rendered by the originating Product via custom rendering.

## Custom Message Rendering

Custom rendering inverts the usual Host→Product call direction. When the App needs to display a custom message type your Product defined, it opens a subscription *against your Product* and asks it to render. The host call is `product_chat_custom_message_render_subscribe`. Your Product receives the message payload, produces UI output, and returns it for the App to display in the chat thread.

This is how Chat stays extensible without baking every possible message type into the App itself.

## Message Queueing

Messages a Product sends before it has registered as a bot in a room are **queued automatically**. The Product does not need to track registration state to avoid losing messages — submit on the user's behalf and the queue resolves once registration completes.

## Composition: Statement Store + Bulletin Chain

Chat is the model composition for Product developers building real-time-with-durable-content features. It pairs two infrastructure layers documented separately in this reference:

- **Statement Store** carries signaling — presence, typing indicators, message-arrival notifications, room-membership events. Statements are gossiped, allowance-gated, and short-lived. For mechanics see [Exchange Ephemeral Messages](/apps/build/exchange-ephemeral-messages/){target=\_blank}.
- **Bulletin Chain** stores the encrypted message content readers fetch by CID after they see the statement that points to it. See [Store Data on Chain](/apps/build/store-data-on-chain/){target=\_blank}.

The composition is general — many Products with chat-like or activity-feed semantics will use the same split: Statement Store for the live signal, Bulletin Chain for content that needs to survive longer than a session.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Exchange Ephemeral Messages**

    ---

    The Statement Store layer Chat sits on top of — useful when you need pub/sub semantics without the full Chat surface.

    [:octicons-arrow-right-24: Get Started](/apps/build/exchange-ephemeral-messages/){target=\_blank}

</div>
