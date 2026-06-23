---
title: Statement Store via Polkadot Desktop's Host API
description: Reference for how Polkadot Desktop mediates Statement Store access, including proof routing, account context, and Bulletin Chain composition pattern.
categories: Apps, Reference
---

# Statement Store via the Host API

## Introduction

The Statement Store is a network-layer pub/sub primitive on Polkadot's People Chain for short-lived, gossiped, signed statements. Products do not talk to a Statement Store node directly; they go through Polkadot Desktop's Host API, which adds the things a Product on its own cannot do safely, including producing an authentication proof on the user's behalf, attaching the right account context, and applying the per-Product topic scope.

This page documents what Desktop adds when it mediates Statement Store traffic for a Product. The Statement Store itself (the pallet, the gossip layer, the lifecycle and validation rules) is documented separately in the [Statement Store infrastructure reference](/reference/apps/infrastructure/statement-store/). The Product-side how-to is the [Publish and Subscribe to Off-Chain Data](/apps/build/pub-sub-off-chain-data/) guide.

## What Desktop Adds

A Product that calls `client.publish(...)` through the Product SDK is really doing this through Desktop:

- **Proof routing**: Every Statement Store submission carries an authentication proof. The Product does not produce the proof itself. It requests one through the Host API, and Desktop forwards the request to the paired App, which signs and returns the proof. Desktop then submits the statement to the People Chain node on the Product's behalf with the proof attached.
- **Account context**: The statement is signed by the user's per-Product account: a sub-account derived from the user's identity and scoped to the Product's `.dot` domain. The Product never has to know the account address up front. Desktop resolves the right account and uses it for the submission.
- **Per-Product topic scope**: The Product SDK tags every submission with `blake2b(appName)` as its primary topic; subscribers from other Products on the same network see only their own traffic. The scope is set up at the Host API boundary so a misconfigured Product cannot accidentally publish into another Product's topic.

## What Desktop Does Not Do

A few responsibilities sit with the Product, not with Desktop:

- **Product topic settings**: The Host attaches the per-Product primary topic, but secondary `topic2`, channels (last-write-wins state), and per-statement TTL come from the Product's call.
- **Delivery semantics**: Statement Store delivery is best-effort gossip. There is no retry, no acknowledgement, and no ordering guarantee at the network layer. If your Product needs an acknowledgement, the recipient publishes one back. Reliability is composed at the application layer; Desktop does not add a queue or retry pipeline behind the scenes.

## Composition with the Bulletin Chain

The Statement Store is the right layer for ephemeral signaling. When content needs to outlive the statement TTL, the canonical pattern is to store it on the Bulletin Chain and publish the resulting CID as the statement payload. This composition powers the App's [Chat](/reference/apps/hosts/polkadot-app/chat/) feature and many other Product patterns:

- **Statement Store** carries the live signal (presence, "new message arrived", typing indicators).
- **Bulletin Chain** stores the durable content readers fetch later by hash.

Both layers are reached through Desktop's Host API and the same per-Product account context applies across them.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Exchange Ephemeral Messages**

    ---

    The Product-side how-to: setting up the Statement Store client, subscribing, publishing typed statements, and using channels for last-write-wins state.

    [:octicons-arrow-right-24: Get Started](/apps/build/pub-sub-off-chain-data/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Bulletin Chain layer that composes with the Statement Store: write the durable content, publish the CID as a statement.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/)

</div>
