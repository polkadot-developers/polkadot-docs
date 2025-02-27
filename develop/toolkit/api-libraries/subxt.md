---
title: Subxt
description: TODO
---

# Subxt

## Introduction

Subxt is a Rust library designed for interacting with Polkadot SDK-based blockchains. It provides a type-safe interface for submitting transactions, querying on-chain state, and performing other blockchain interactions. By leveraging Rust’s strong type system, Subxt ensures that your code is validated at compile time, reducing runtime errors and improving reliability.

## Prerequisites

Before using Subxt, ensure you have the following installed:

- Rust and Cargo installed on your system. You can install them using [Rustup](https://rustup.rs/){target=\_blank}
- A Rust project initialized. If you don’t have one, create it with:
    ```bash
    cargo new my_project && cd my_project
    ```

## Installation

To use subxt in your project, you need to install the necessary dependencies. Each plays a specific role in enabling interaction with the blockchain:

### Install subxt-cli

[`subxt-cli`](https://crates.io/crates/subxt-cli){target=\_blank} is a command-line tool that provides utilities for working with Polkadot SDK metadata. In the context of subxt, it is essential for downloading chain metadata, which is required to generate type-safe Rust interfaces for interacting with the blockchain. Install it using:

```bash
cargo install subxt-cli
```

### Add Core Dependencies

These dependencies are essential for interacting with the blockchain:

- **[subxt](https://crates.io/crates/subxt){target=\_blank}** - the main library for communicating with Polkadot SDK nodes. It handles RPC requests, encoding/decoding, and type generation

    ```bash
    cargo add subxt
    ```

- **[subxt-signer](https://crates.io/crates/subxt-signer){target=\_blank}** - provides cryptographic functionality for signing transactions. Without this, you can only read data but cannot submit transactions

    ```bash
    cargo add subxt-signer
    ```

- **[tokio](https://crates.io/crates/tokio){target=\_blank}** - an asynchronous runtime for Rust. Since blockchain operations are async, Tokio enables efficient handling of network requests

    ```bash
    cargo add tokio --features rt,macros
    ```

After adding the dependencies, your `Cargo.toml` should look like this:

```toml
--8<-- 'code/develop/toolkit/api-libraries/subxt/Cargo.toml'
```

## Get Started

This guide will walk you through the basic operations using subxt.

### Downloading Chain Metadata

Before interacting with a blockchain, you need to retrieve its metadata. This metadata defines storage structures, extrinsics, and other runtime details. Use the `subxt-cli` tool to download the metadata, replacing `INSERT_NODE_URL` with the URL of the node you want to interact with:

```bash
subxt metadata --url INSERT_NODE_URL > polkadot_metadata.scale
```

### Generating Type-Safe Interfaces

Use the `#[subxt::subxt]` macro to generate a type-safe Rust interface from the downloaded metadata:

```rust
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:6:8'
```

Once subxt interfaces are generated, you can interact with your node in the following ways:

- **Transactions** - builds and submits transactions, monitors their inclusion in blocks, and retrieves associated events
- **Storage** - enables querying of node storage data
- **Events** - retrieves events emitted from recent blocks
- **Constants** - accesses constant values stored in nodes that remain unchanged across a specific runtime version.
- **Blocks** - loads recent blocks or subscribes to new/finalized blocks, allowing examination of extrinsics, events, and storage at those blocks
- **Runtime APIs** - makes calls into pallet runtime APIs to fetch data
- **Custom values** - accesses "custom values" contained within metadata
- **Raw RPC calls** - facilitates raw RPC requests to compatible nodes

### Initializing the Subxt client

To interact with a blockchain node using Subxt, create an asynchronous main function and initialize the client. Replace `INSERT_NODE_URL` with the URL of your target node:

```rust
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs::17'
    // Your code here...
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:73:75'
```

### Reading Chain Data

Subxt provides multiple ways to access on-chain data:

- Constants - constants are predefined values in the runtime that remain unchanged unless modified by a runtime upgrade

    For example, to retrieve the existential deposit, use:
    
    ```rust
    --8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:18:24'
    ```

- State - state refers to the current chain data, which updates with each block

    To fetch account information, use:

    ```rust
    --8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:26:42'
    ```

### Submitting Transasctions

To submit a transaction, you need to construct an extrinsic, sign it with your private key, and send it to the blockchain.

For example, to transfer funds to another account:

```rust
--8<-- 'code/develop/toolkit/api-libraries/subxt/subxt.rs:44:72'
```

## Where to Go Next

Now that you've covered the basics, dive into the official [Subxt documentation](https://docs.rs/subxt/latest/subxt/book/index.html){target=\_blank} for comprehensive reference materials and advanced features.