---
title: Subxt Rust API
description: Subxt is a Rust library for type-safe interaction with Polkadot SDK blockchains, enabling transactions, state queries, runtime API access, and more.
---

# Subxt Rust API

## Introduction

Subxt is a Rust library designed to interact with Polkadot SDK-based blockchains. It provides a type-safe interface for submitting transactions, querying on-chain state, and performing other blockchain interactions. By leveraging Rust's strong type system, subxt ensures that your code is validated at compile time, reducing runtime errors and improving reliability.

## Prerequisites

Before using subxt, ensure you have the following requirements:

- Rust and Cargo installed on your system. You can install them using [Rustup](https://rustup.rs/){target=\_blank}
- A Rust project initialized. If you don't have one, create it with:
    ```bash
    cargo new my_project && cd my_project
    ```

## Installation

To use subxt in your project, you must install the necessary dependencies. Each plays a specific role in enabling interaction with the blockchain:

1. **Install the subxt CLI** - [`subxt-cli`](https://crates.io/crates/subxt-cli){target=\_blank} is a command-line tool that provides utilities for working with Polkadot SDK metadata. In the context of subxt, it is essential to download chain metadata, which is required to generate type-safe Rust interfaces for interacting with the blockchain. Install it using:

    ```bash
    cargo install subxt-cli
    ```

2. **Add core dependencies** - these dependencies are essential for interacting with the blockchain:

    - **[subxt](https://crates.io/crates/subxt){target=\_blank}** - the main library for communicating with Polkadot SDK nodes. It handles RPC requests, encoding/decoding, and type generation

        ```bash
        cargo add subxt
        ```

    - **[subxt-signer](https://crates.io/crates/subxt-signer){target=\_blank}** - provides cryptographic functionality for signing transactions. Without this, you can only read data but cannot submit transactions

        ```bash
        cargo add subxt-signer
        ```

    - **[tokio](https://crates.io/crates/tokio){target=\_blank}** - an asynchronous runtime for Rust. Since blockchain operations are async, Tokio enables the efficient handling of network requests. The `rt` feature enables Tokio's runtime, including the current-thread single-threaded scheduler, which is necessary for async execution. The `macros` feature provides procedural macros like `#[tokio::main]` to simplify runtime setup

        ```bash
        cargo add tokio --features rt,macros
        ```

    After adding the dependencies, your `Cargo.toml` should look like this:

    ```toml
    --8<-- 'code/develop/toolkit/api-libraries/subxt/Cargo.toml'
    ```

## Get Started

This guide will walk you through the fundamental operations of subxt, from setting up your environment to executing transactions and querying blockchain state.

### Download Chain Metadata

Before interacting with a blockchain, you need to retrieve its metadata. This metadata defines storage structures, extrinsics, and other runtime details. Use the `subxt-cli` tool to download the metadata, replacing `INSERT_NODE_URL` with the URL of the node you want to interact with:

```bash
subxt metadata --url INSERT_NODE_URL > polkadot_metadata.scale
```

### Generate Type-Safe Interfaces

Use the `#[subxt::subxt]` macro to generate a type-safe Rust interface from the downloaded metadata:

```rust
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:6:8'
```

Once subxt interfaces are generated, you can interact with your node in the following ways. You can use the links below to view the related subxt documentation:

- **[Transactions](https://docs.rs/subxt/latest/subxt/book/usage/transactions/index.html){target=\_blank}** - builds and submits transactions, monitors their inclusion in blocks, and retrieves associated events
- **[Storage](https://docs.rs/subxt/latest/subxt/book/usage/storage/index.html){target=\_blank}** - enables querying of node storage data
- **[Events](https://docs.rs/subxt/latest/subxt/book/usage/events/index.html){target=\_blank}** - retrieves events emitted from recent blocks
- **[Constants](https://docs.rs/subxt/latest/subxt/book/usage/constants/index.html){target=\_blank}** - accesses constant values stored in nodes that remain unchanged across a specific runtime version.
- **[Blocks](https://docs.rs/subxt/latest/subxt/book/usage/blocks/index.html){target=\_blank}** - loads recent blocks or subscribes to new/finalized blocks, allowing examination of extrinsics, events, and storage at those blocks
- **[Runtime APIs](https://docs.rs/subxt/latest/subxt/book/usage/runtime_apis/index.html){target=\_blank}** - makes calls into pallet runtime APIs to fetch data
- **[Custom values](https://docs.rs/subxt/latest/subxt/book/usage/custom_values/index.html){target=\_blank}** - accesses "custom values" contained within metadata
- **[Raw RPC calls](https://docs.rs/subxt/latest/subxt/book/usage/rpc/index.html){target=\_blank}** - facilitates raw RPC requests to compatible nodes

### Initialize the Subxt Client

To interact with a blockchain node using subxt, create an asynchronous main function and initialize the client. Replace `INSERT_NODE_URL` with the URL of your target node:

```rust
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs::17'
    // Your code here...
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:73:75'
```

### Read Chain Data

subxt provides multiple ways to access on-chain data:

- **Constants** - constants are predefined values in the runtime that remain unchanged unless modified by a runtime upgrade

    For example, to retrieve the existential deposit, use:
    
    ```rust
    --8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:18:24'
    ```

- **State** - state refers to the current chain data, which updates with each block

    To fetch account information, replace `INSERT_ADDRESS` with the address you want to fetch data from and use:

    ```rust
    --8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:26:42'
    ```

### Submit Transactions

To submit a transaction, you must construct an extrinsic, sign it with your private key, and send it to the blockchain. Replace `INSERT_DEST_ADDRESS` with the recipient's address, `INSERT_AMOUNT` with the amount to transfer, and `INSERT_SECRET_PHRASE` with the sender's mnemonic phrase:

```rust
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:44:72'
```

## Where to Go Next

Now that you've covered the basics dive into the official [subxt documentation](https://docs.rs/subxt/latest/subxt/book/index.html){target=\_blank} for comprehensive reference materials and advanced features.
