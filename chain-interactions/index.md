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

- **SDK integration**: Programmatically read blockchain state using:

    - [Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}
    - [Polkadot.js](/reference/tools/polkadot-js-api/){target=\_blank}
    - [Dedot](/reference/tools/dedot/){target=\_blank}
    - [PSI](https://github.com/paritytech/psi){target=\_blank}
    - [Subxt](/reference/tools/subxt/){target=\_blank}

- **REST API access**: Query chain data through standardized REST endpoints for simpler integration.

- **Runtime API calls**: Execute runtime APIs directly for specialized queries and operations.

Learn how to efficiently retrieve account balances, query storage, subscribe to events, and decode blockchain data in your applications.

### Send Transactions

Transactions are the primary mechanism for modifying blockchain state. Understanding transaction construction, signing, and submission is crucial for building interactive applications.

- **Transaction construction**: Build transactions using various SDKs with proper encoding and formatting.
- **Fee estimation**: Calculate transaction fees to ensure sufficient balance and optimize costs.
- **Multi-token fees**: Learn [how to pay transaction fees with different tokens](/chain-interactions/send-transactions/pay-fees-with-different-tokens/) on supported chains.

### Interoperability

Polkadot enables native cross-chain capabilities through Cross-Consensus Messaging (XCM), allowing chains to securely communicate and transfer assets across the ecosystem.

- **XCM fundamentals**: Understand how to construct and send XCM messages between parachains using [ParaSpell XCM SDK](/reference/tools/paraspell/){target=\_blank} and [Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}.
- **Asset transfers**: Transfer tokens and other assets between different chains seamlessly.
- **Cross-chain communication**: Enable your applications to interact with multiple parachains.
- **Bridge integration**: Connect to blockchains outside the Polkadot ecosystem using [Snowbridge](https://wiki.polkadot.com/learn/learn-snowbridge/){target=\_blank} and other bridge solutions.

Master the tools for estimating transfer costs, debugging XCM messages, and implementing robust cross-chain workflows.

### Token Operations

Polkadot Hub provides a unified platform for managing assets across the ecosystem. Understanding token operations is essential for DeFi applications and multi-chain asset management.

- **Asset registration**: Learn how local and foreign assets are registered on the network.
- **Asset Hub integration**: Interact with Polkadot's central asset management hub using [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}.
- **Cross-chain assets**: Handle assets that exist across multiple parachains.

### Accounts

Account management forms the basis of user identity and authentication in blockchain applications. Learn how to create, manage, and query accounts programmatically.

- **Account creation**: Generate accounts using various SDKs in Rust, Python, and JavaScript.
- **Account queries**: Retrieve account information including balances, nonces, and metadata.

## Development Tools and SDKs

The Polkadot ecosystem offers a rich set of tools and libraries to facilitate chain interactions:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}**: Modern, type-safe TypeScript library with full metadata support.
- **[Polkadot.js](/reference/tools/polkadot-js-api/){target=\_blank}**: Comprehensive JavaScript library with extensive ecosystem support.
- **[Dedot](/reference/tools/dedot/){target=\_blank}**: Lightweight TypeScript library optimized for performance.
- **[PSI](https://github.com/paritytech/psi){target=\_blank}**: Polkadot Substrate Interface for streamlined development.
- **[Subxt](/reference/tools/subxt/){target=\_blank}**: Rust library for building robust substrate-based applications.
- **[Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}**: Web-based interface for exploring and interacting with chains.

Each tool has its strengths, and choosing the right one depends on your project requirements, programming language preference, and specific use cases.

## Next Steps

Explore the sections below to dive deeper into specific chain interaction patterns:

- **[Query on-chain data](/chain-interactions/query-data/query-sdks/)**: Learn to read blockchain state efficiently.
- **[Send transactions](/chain-interactions/send-transactions/with-sdks/)**: Master transaction construction and submission.
- **[Interoperability](/chain-interactions/send-transactions/interoperability/transfer-assets-parachains/)**: Enable cross-chain communication with XCM.
- **[Token Operations](/chain-interactions/token-operations/register-local-asset/)**: Manage assets across the Polkadot ecosystem.
- **[Accounts](/chain-interactions/accounts/create-account/)**: Create and query accounts programmatically.

Each section provides practical examples, code snippets, and comprehensive guides to help you build production-ready applications on Polkadot.