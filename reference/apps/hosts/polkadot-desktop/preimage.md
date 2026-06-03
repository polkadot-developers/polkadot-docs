---
title: Preimage Submission via Polkadot Desktop
description: Reference for how Polkadot Desktop mediates preimage submission for Products, and the Statement vs Preimage distinction for off-chain content.
categories: Apps, Reference
---

# Preimage

## Introduction

A preimage is the original content of a hash that has been referenced on-chain. For example, a referendum points at the hash of a governance proposal, and the preimage is the proposal's bytes. The on-chain record holds only the hash; the preimage itself lives off-chain and must be made available for the referenced operation to execute. Polkadot Desktop exposes a preimage submission surface that Products can use through the Host API.

This page is the reference for that surface. The [Bulletin Chain reference](/reference/apps/infrastructure/bulletin-chain/){target=\_blank} documents the storage layer that preimage submission often interacts with.

## What the Preimage Surface Does

!!! warning "Provisional"
    The exact set of host calls Desktop exposes for preimage submission, the supported size limits, and the lifecycle hooks for preimage availability are still being finalized. This page documents the conceptual model; the current method-group frame is in the [Preimage TrUAPI reference](/reference/apps/protocol/truapi/preimage/){target=\_blank}.

Conceptually, the preimage surface lets a Product:

- **Submit a preimage**: Submit off-chain content for an on-chain operation that will reference it by hash. The Host signs the submission with the user's account, subject to the usual `ChainSubmit` permission and per-transaction approval on the paired App.
- **Provide hosting**: Host the preimage so it is reachable when the on-chain operation executes. In practice, this often means writing the bytes to the Bulletin Chain and recording the resulting CID, but the exact storage path is part of the surface still being finalized.

## Statement vs Preimage

Statements and preimages are off-chain content addressed by hash, and both surfaces look superficially similar: your Product submits some bytes, gets a hash back, and the on-chain world refers to that hash later. The two are not interchangeable, though, and choosing the wrong one is a real failure mode.

| Property               | Statement (Statement Store)                                                             | Preimage                                                                                                     |
| :--------------------: | :-------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------: |
| What it is for         | Real-time signaling between users: chat, presence, typing indicators, multiplayer state | Off-chain content that an on-chain operation must dereference: governance proposals, scheduled call payloads |
| Lifetime               | Short TTL (default 30 seconds, gossip-distributed)                                      | Lives until the referencing on-chain operation has completed (or until explicitly cleaned up)                |
| Availability guarantee | Best-effort gossip; can be missed entirely if no peer was listening on the topic        | Must be available for the referencing operation to execute; storage is durable                               |
| Validation gate        | Allowance-gated by `pallet-statement-store` (`max_count` and `max_size` per account)    | Gated by the same permission and signing requirements as any other on-chain submission                       |
| When to use            | Anything users observe in real time and accept losing if the network dropped it         | Anything an on-chain operation needs to read back later                                                      |

A useful rule of thumb: if your Product would still be correct after the bytes expire from network gossip, it is a statement. If the bytes need to be there in 30 minutes for a referendum to execute, it is a preimage.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Statement Store via Host API**

    ---

    The other half of the Statement-vs-Preimage decision: when your content belongs on the gossip-distributed signaling layer instead of as an on-chain-referenced preimage.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-desktop/statement-store/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Product-side how-to for Bulletin Chain storage, which the preimage surface often delegates to underneath.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/){target=\_blank}

</div>
