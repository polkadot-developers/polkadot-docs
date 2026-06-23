---
title: Chain Interactions Overview
description: Learn how to query data, send transactions, enable cross-chain communication, and manage accounts across the Polkadot ecosystem.
categories: Chain Interactions
---

# Chain Interactions

## Introduction

Chain interactions form the foundation of building applications on Polkadot. Whether you're querying on-chain data, executing transactions, enabling cross-chain communication, or managing accounts, understanding how to interact with Polkadot-based chains is essential for application developers.

This section provides comprehensive guidance on the various ways to interact with Polkadot chains, from basic queries to complex cross-chain operations. You'll learn how to:

- Query on-chain state and subscribe to blockchain events.
- Send transactions and manage their lifecycle.
- Enable interoperability between parachains through XCM.
- Manage tokens and perform token operations.
- Create and manage accounts programmatically.

Whether you're building a frontend application, a backend service, or integrating with the Polkadot ecosystem, these guides will equip you with the knowledge and tools to effectively interact with chains across the network.

## Core Interaction Patterns

### Query On-Chain Data

Accessing blockchain state is fundamental to building responsive applications. Polkadot offers several methods to query on-chain data, each suited for different use cases.

<!-- INDEX TABLE START
dir: query-data
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

### Send Transactions

Transactions are the primary mechanism for modifying blockchain state. Understanding transaction construction, signing, and submission is crucial for building interactive applications.

<!-- INDEX TABLE START
dir: send-transactions
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

### Send Cross-Chain Transactions

Polkadot enables native cross-chain capabilities through Cross-Consensus Messaging (XCM), allowing chains to securely communicate and transfer assets across the ecosystem.

<!-- INDEX TABLE START
dir: send-transactions/interoperability
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

### Manage Tokens

Polkadot Hub provides a unified platform for managing assets across the ecosystem. Understanding token operations is essential for DeFi applications and multi-chain asset management.

<!-- INDEX TABLE START
dir: token-operations
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

### Manage Accounts

Account management forms the basis of user identity and authentication in blockchain applications. Learn how to create, manage, and query accounts programmatically.

<!-- INDEX TABLE START
dir: accounts
flat: true
columns: [title, description]
-->
<!-- INDEX TABLE END -->

## Development Tools and SDKs

The Polkadot ecosystem offers a rich set of tools and libraries to facilitate chain interactions:

| Tool | Description |
|------|-------------|
| [Polkadot API (PAPI)](/reference/tools/papi/) | Modern, type-safe TypeScript library with full metadata support. |
| [Polkadot.js](/reference/tools/polkadot-js-api/) | Comprehensive JavaScript library with extensive ecosystem support. |
| [Dedot](/reference/tools/dedot/) | Lightweight TypeScript library optimized for performance. |
| [Python Substrate Interface](/reference/tools/py-substrate-interface/) | Polkadot Substrate Interface for streamlined development. |
| [Subxt](/reference/tools/subxt/) | Rust library for building robust substrate-based applications. |
| [Polkadot.js Apps](https://polkadot.js.org/apps/) | Web-based interface for exploring and interacting with chains. |

Each tool has its strengths, and choosing the right one depends on your project requirements, programming language preference, and specific use cases.
