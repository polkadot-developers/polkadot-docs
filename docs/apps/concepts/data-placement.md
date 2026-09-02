---
title: Where to Store Data
description: A decision guide for Polkadot Products — when to use contract storage, cloud storage, the statement store, or local storage, with the tradeoffs.
categories: Apps
---

# Where to Store Data

## Introduction

A Polkadot Product has four places to keep data, and choosing the wrong one is a common early mistake — most often, putting bulk data in a contract. Each option trades off cost, persistence, size, and who can read it. This page is a decision guide: match the data to the layer built for it.

## The Options at a Glance

|          Layer          |         Best for          |       Persistence        |       Size       |            Readable by            |
|-------------------------|---------------------------|--------------------------|------------------|-----------------------------------|
| Contract storage        | Enforced shared state and logic | Permanent           | Small, structured | Anyone, through contract methods  |
| Cloud storage (Bulletin) | Files and content blobs   | ~2 weeks, renewable      | Large            | Anyone with the CID               |
| Statement store         | Real-time signaling       | Seconds (ephemeral)      | Up to 512 bytes  | Subscribers to your Product       |
| Local storage           | Per-device state          | Until cleared            | Small            | Only this device                  |

## Contract Storage

Use a [smart contract](/apps/product-sdk/contracts/) when data is _logic that must be enforced for everyone_: ownership records, a leaderboard's rules, an escrow's state, a registry. Contract storage is permanent and its rules are trustless, but on-chain storage is expensive per byte and every write is a transaction.

Do not put bulk data in a contract — file contents, images, long text, or anything that grows. Store the bytes in cloud storage and keep only the CID (a short content hash) in the contract if the contract needs to reference them. This keeps the contract small and cheap while the heavy data lives in the layer built for it.

## Cloud Storage (Bulletin Chain)

Use [cloud storage](/apps/product-sdk/cloud-storage/) for content that outlives a session: profile photos, uploads, published posts, snapshots of app state. You upload bytes and get back a CID; anyone with the CID can fetch and verify the bytes.

The key tradeoff is **retention**. Stored data is kept for about two weeks by default and must be renewed to persist beyond that, and renewal needs a bookkeeping handle captured at write time. Plan for renewal from the start; see [Deploy Your App](/apps/deploy-your-app/#keep-your-app-available) for what to capture and the current limitation.

## Statement Store

Use the [statement store](/apps/product-sdk/statement-store/) for real-time state between users: presence, typing indicators, cursors, and announcing where a fresh snapshot lives. Statements are signed, capped at 512 bytes, and expire in seconds. They are signaling, not storage — pair them with cloud storage when the content needs to survive.

## Local Storage

Use [local storage](/apps/product-sdk/local-storage/) for state that belongs to one device: preferences, drafts, and cached values. It is private to the device and instant to read, but it is not shared, not durable across devices, and not a source of truth.

## A Common Pattern

Many Products combine layers rather than choosing one:

- The **statement store** announces that something changed (a small, live signal).
- **Cloud storage** holds the full content, addressed by CID.
- A **contract** or the announcement carries the CID so others know where to look.
- **Local storage** renders instantly from the device's last known state while the rest loads.

The [Shared Todo App tutorial](/apps/tutorials/shared-todo-app/) builds exactly this composition end to end.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Store Data on Chain**

    ---

    Upload to the Bulletin Chain and fetch by CID, with authorization and renewal.

    [:octicons-arrow-right-24: Store Data on Chain](/apps/build/store-data-on-chain/)

-   <span class="badge guide">Guide</span> **Add a Smart Contract to Your Product**

    ---

    Put enforced shared state in a contract, and keep bulk data out of it.

    [:octicons-arrow-right-24: Add a Smart Contract to Your Product](/apps/build/deploy-a-smart-contract/)

-   <span class="badge guide">Guide</span> **Build a Shared Todo App**

    ---

    A tutorial that composes all four layers into one Product.

    [:octicons-arrow-right-24: Build a Shared Todo App](/apps/tutorials/shared-todo-app/)

</div>
