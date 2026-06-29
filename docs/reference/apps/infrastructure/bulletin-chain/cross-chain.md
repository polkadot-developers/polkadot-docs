---
title: Cross-Chain Bulletin Storage via People Chain
description: How a Bulletin Chain storage call initiated from the People Chain — where a Product's Proof of Personhood identity lives — reaches the Bulletin Chain via XCM.
categories: Apps, Reference
---

# Cross-Chain Storage via People Chain

## Introduction

A Polkadot Product's identity, accounts, and PoP state all live on the People Chain. Storage capabilities live on the Bulletin Chain. When a Product needs to store something that should be attached to the user's identity — proof material tied to PoP, content the People Chain itself references, anything the People Chain side of a flow needs to commit to before the Bulletin Chain side completes — the natural origin for the storage call is the People Chain, not Bulletin directly.

The cross-chain path makes this work: a storage call dispatched on the People Chain crosses to the Bulletin Chain via XCM (Cross-Consensus Messaging) and lands the storage record there, with the People Chain identity carried through as the originating context.

## The Flow

!!! warning "Provisional"
    The exact XCM payload, the receiving pallet on Bulletin, and the response routing for cross-chain storage operations are still being finalized. This page documents the conceptual flow; the protocol-level message format and per-step diagram will be added once they are confirmed.

Conceptually, a cross-chain Bulletin write goes through these steps:

1. The Product dispatches a storage call on the People Chain rather than directly on Bulletin. The call carries the payload (or CID, for large payloads pre-uploaded) and any People-Chain-side context the Bulletin record should be associated with.
2. The People Chain wraps the call in an XCM message addressed to the Bulletin Chain. The message carries the originating account context so the Bulletin side can attribute the storage to the right authorization.
3. The Bulletin Chain receives the XCM message and enacts the storage extrinsic on behalf of the originating account, subject to that account's Bulletin authorization quota.
4. The result returns to the People Chain side of the flow, where the Product can observe the outcome through the standard PAPI subscription on the People Chain.

The CID the Bulletin Chain returns is the same CID a direct write would have produced — content addressing is content addressing, regardless of origin.

## When to Use the Cross-Chain Path

Most Products will not need this path. For a typical "store a profile photo, get a CID, embed in a `.dot` site" flow, writing directly to the Bulletin Chain is simpler. The cross-chain path becomes useful when:

- The storage is tied to a People Chain operation — for example, a governance proposal whose body is referenced from the People Chain side of a flow.
- The storage must be authorized against the People Chain identity in a way that a direct Bulletin write cannot easily attribute.
- The Product is already orchestrating a multi-chain operation and adding a Bulletin write to that operation keeps the flow on a single dispatch path.

For everyday Bulletin writes, see [Store Data on Chain](/apps/build/store-data-on-chain/).

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Authorization**

    ---

    Cross-chain writes still consume the originating account's Bulletin authorization quota — the same model as direct writes.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/bulletin-chain/authorization/)

- <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    The Product-side how-to for direct Bulletin writes, which is the right path for most use cases.

    [:octicons-arrow-right-24: Get Started](/apps/build/store-data-on-chain/)
</div>
