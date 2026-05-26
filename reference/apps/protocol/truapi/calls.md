---
title: TrUAPI Calls Method Group
description: The lifecycle calls a Product uses to identify itself to its Host and the Host uses to introduce capabilities.
categories: Apps, Reference
---

# TrUAPI Calls

## Introduction

The **TrUAPI Calls** method group covers the *lifecycle* of the Host-Product relationship: the calls a Product uses to identify itself to its Host on load, and the calls the Host uses to introduce the rest of the TrUAPI surface that the Product is allowed to consume. Every other method group sits on top of this one — a Product cannot meaningfully invoke any capability before it has completed the lifecycle handshake.

For Product developers, this is mostly implicit. The [`@parity/product-sdk`](https://www.npmjs.com/package/@parity/product-sdk){target=\_blank} core handles the handshake in `createApp()` and exposes the resulting `App` object that the rest of the SDK relies on. For Host developers, this is the entry point that every Host implementation has to honor.

!!! warning "Provisional"
    The exact set of lifecycle calls in this group, their names, parameters, and the precise sequencing the Host enforces during Product load are still being finalized. The conceptual contract below is stable; per-call signatures will be added as the surface confirms.

## Conceptual Contract

Three things have to happen between a Product loading and that Product being able to use the rest of TrUAPI:

- **Product identifies itself.** The Product declares its identity (typically its `.dot` name) so the Host can scope sub-accounts, storage, and topic filters consistently.
- **Host advertises capabilities.** The Host responds with the TrUAPI version it implements and the set of method groups available. A Product can branch on what's there if it needs to support multiple Hosts with different capability sets.
- **Product completes setup-time configuration.** Anything the Product needs to set up once per session — the chain client, the storage handle, the signer — is configured against the Host context the lifecycle call returned.

After the lifecycle handshake completes, the Product is in steady state: every other call (signing, storage, chat, chain reads) goes through its own method group.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Permissions**

    ---

    The next layer after the lifecycle handshake: what capabilities the Host will let the Product actually invoke, based on declared and granted permissions.

    [:octicons-arrow-right-24: Reference](/reference/apps/protocol/truapi/permissions/)

</div>
