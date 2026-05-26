---
title: Chain Interaction Method Group
description: TrUAPI method group for reading chain state and subscribing to changes — the surface behind @polkadot-apps/chain-client and the typed PAPI API exposed per chain.
categories: Apps, Reference
---

# Chain Interaction

## Introduction

The **Chain Interaction** method group is the surface a Product uses to read on-chain state — account balances, storage items, runtime constants — and to subscribe to changes on those values. It is the foundation most Products build on: reading state is usually the first thing a Product does after lifecycle setup.

The Product SDK wraps this surface as [`@polkadot-apps/chain-client`](https://www.npmjs.com/package/@polkadot-apps/chain-client){target=\_blank}, which gives the Product a typed PAPI client per connected chain. The chain client carries one important convenience: the same code works whether the Product runs inside a Host (calls route through the Host's chain client) or outside one in development (the client falls back to a direct WebSocket connection).

## Conceptual Contract

The group exposes the chain-client surface a Product expects, with the Host handling the routing:

- **Connecting to one or more chains.** Two paths: a preset (`getChainAPI(env)`) returns a ready-to-use client for a known environment; a Bring Your Own Descriptors path (`createChainClient`) lets the Product compose any set of chains. Both paths produce the same client shape.
- **Reading storage** — every connected chain exposes a typed `.query` surface (storage items) and a `.constants` surface (runtime constants) via PAPI's typed descriptors.
- **Subscribing to changes** — the underlying PAPI client exposes `watchValue(address)` and similar primitives for live subscriptions. The Host mediates the connection but the subscription surface is the standard PAPI one.
- **Reading multiple chains in parallel** — independent connections per chain, so reads compose with `Promise.all`.
- **Dropping to the raw PAPI client** — `.raw` exposes the underlying `PolkadotClient` for advanced flows the typed surface does not cover (custom RPC methods, low-level submissions, raw storage subscriptions).

For the conceptual model and the Product-side how-to, see [Read Chain State](/apps/build/read-chain-state/){target=\_blank}.

!!! warning "Provisional"
    Subscription error semantics (reconnection, missed-events recovery), per-Host differences in how the underlying connection is routed, and the precise set of presets shipped with the SDK are still being finalized.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Read Chain State**

    ---

    The Product-side how-to: preset and BYOD connection paths, reading storage / constants / account state, multi-chain reads.

    [:octicons-arrow-right-24: Get Started](/apps/build/read-chain-state/){target=\_blank}

- <span class="badge learn">Learn</span> **Signing**

    ---

    The signing method group that complements chain reads — together they let a Product see state and react to it on-chain.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/signing/)

</div>
