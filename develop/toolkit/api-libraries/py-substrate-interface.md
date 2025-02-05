---
title: Python Substrate Interface
description: Learn how to connect to Polkadot SDK-based nodes, query data, submit transactions, and manage blockchain interactions using the Python Substrate Interface.
---

# Python Substrate Interface

## Introduction

The [Python Substrate Interface](https://github.com/polkascan/py-substrate-interface){target=\_blank} is a powerful library that enables interaction with Polkadot SDK-based chains. It provides essential functionality for:

- Querying on-chain storage
- Composing and submitting extrinsics
- SCALE encoding/decoding
- Interacting with Substrate runtime metadata
- Managing blockchain interactions through convenient utility methods

## Installation

Install the library using `pip`:

```py
pip install substrate-interface
```

For more installation details, see the [Installation](https://polkascan.github.io/py-substrate-interface/getting-started/installation/){target=\_blank} section in the official Python Substrate Interface documentation.

## Get Started

This guide will walk you through the basic operations with the Python Substrate Interface: connecting to a node, reading chain state, and submitting transactions.

### Establishing Connection

The first step is to establish a connection to a Polkadot SDK-based node. You can connect to either a local or remote node:

```py
--8<-- 'code/develop/toolkit/api-libraries/py-substrate-interface/substrate_interface.py'
```

### Reading Chain State

You can query various on-chain storage items. To retrieve data, you need to specify three key pieces of information:

- **Pallet name** - module or pallet that contains the storage item you want to access
- **Storage item** - specific storage entry you want to query within the pallet
- **Required parameters** - any parameters needed to retrieve the desired data

Here's an example of how to check an account's balance and other details:

```py
--8<-- 'code/develop/toolkit/api-libraries/py-substrate-interface/read_state.py'
```

### Submitting Transactions

To modify the chain state, you need to submit transactions (extrinsics). Before proceeding, ensure you have:

- A funded account with sufficient balance to pay transaction fees
- Access to the account's keypair

Here's how to create and submit a balance transfer:

```py
--8<-- 'code/develop/toolkit/api-libraries/py-substrate-interface/send_tx.py'
```

The `keypair` object is essential for signing transactions. See the [Keypair](https://polkascan.github.io/py-substrate-interface/usage/keypair-creation-and-signing/){target=\_blank} documentation for more details.

## Where to Go Next

Now that you understand the basics, you can:

- Explore more complex queries and transactions
- Learn about batch transactions and utility functions
- Discover how to work with custom pallets and types

For comprehensive reference materials and advanced features, see the [Python Substrate Interface](https://polkascan.github.io/py-substrate-interface/){target=\_blank} documentation.