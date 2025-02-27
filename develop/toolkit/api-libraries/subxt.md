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
[package]
name = "my_project"
version = "0.1.0"
edition = "2021"

[dependencies]
subxt = "0.39.0"
subxt-signer = "0.39.0"
tokio = { version = "1.43.0", features = ["rt", "macros"] }
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
// Generate an interface that we can use from the node's metadata.
#[subxt::subxt(runtime_metadata_path = "./polkadot_metadata.scale")]
pub mod polkadot {}
```

### Initializing the Subxt client

To interact with a blockchain node using Subxt, create an asynchronous main function and initialize the client. Replace `INSERT_NODE_URL` with the URL of your target node:

```rust
use std::str::FromStr;
use subxt::utils::AccountId32;
use subxt::{OnlineClient, PolkadotConfig};
use subxt_signer::{bip39::Mnemonic,sr25519::Keypair};

#[tokio::main(flavor = "current_thread")]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Define the node URL.
    const NODE_URL: &str = "INSERT_NODE_URL";

    // Initialize the Subxt client for interacting with the blockchain.
    let api = OnlineClient::<PolkadotConfig>::from_url(NODE_URL).await?;

    // Your code here...

    Ok(())
}
```

### Reading Chain Data

Subxt provides multiple ways to access on-chain data:

- Constants - constants are predefined values in the runtime that remain unchanged unless modified by a runtime upgrade

    For example, to retrieve the existential deposit, use:
    ```rust
    // A query to obtain some contant:
    let constant_query = polkadot::constants().balances().existential_deposit();

    // Obtain the value:
    let value = api.constants().at(&constant_query)?;
    ```

- State - state refers to the current chain data, which updates with each block

    To fetch account information, use:
    ```rust
    // Define the target account address.
    const ADDRESS: &str = "INSERT_ADDRESS";
    let account = AccountId32::from_str(ADDRESS).unwrap();

    // Build a storage query to access account information.
    let storage_query = polkadot::storage().system().account(&account.into());

    // Fetch the latest state for the account.
    let result = api
        .storage()
        .at_latest()
        .await?
        .fetch(&storage_query)
        .await?
        .unwrap();

    println!("Account info: {:?}", result);
    ```

### Submitting Transasctions

To submit a transaction, you need to construct an extrinsic, sign it with your private key, and send it to the blockchain.

For example, to transfer funds to another account:

```rust
// Define the recipient address and transfer amount.
const DEST_ADDRESS: &str = "INSERT_DEST_ADDRESS";
const AMOUNT: u128 = INSERT_AMOUNT;

// Convert the recipient address into an `AccountId32`.
let dest = AccountId32::from_str(DEST_ADDRESS).unwrap();

// Build the balance transfer extrinsic.
let balance_transfer_tx = polkadot::tx()
    .balances()
    .transfer_allow_death(dest.into(), AMOUNT);

// Load the sender's keypair from a mnemonic phrase.
const SECRET_PHRASE: &str = "INSERT_SECRET_PHRASE";
let mnemonic = Mnemonic::parse(SECRET_PHRASE).unwrap();
let sender_keypair = Keypair::from_phrase(&mnemonic, None).unwrap();

// Sign and submit the extrinsic, then wait for it to be finalized.
let events = api
    .tx()
    .sign_and_submit_then_watch_default(&balance_transfer_tx, &sender_keypair)
    .await?
    .wait_for_finalized_success()
    .await?;

// Check for a successful transfer event.
if let Some(event) = events.find_first::<polkadot::balances::events::Transfer>()? {
    println!("Balance transfer successful: {:?}", event);
}
```

## Where to Go Next

Now that you've covered the basics, dive into the official [Subxt documentation](https://docs.rs/subxt/latest/subxt/book/index.html){target=\_blank} for comprehensive reference materials and advanced features.