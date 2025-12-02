---
title: Create an Account
description: Step-by-step guide to creating Polkadot accounts using different programming languages and libraries, including JavaScript, Python, and Rust examples.
categories: Basics, Accounts, Developer Tools
---

# Create an Account

## Introduction

Creating accounts is a fundamental operation when building applications on Polkadot and its parachains. Accounts serve as the basis for identity, asset ownership, and transaction signing. Understanding how to generate and manage accounts programmatically enables you to build wallets, automate operations, and create seamless user experiences.

This tutorial will guide you through creating accounts using different programming languages and libraries.

## Prerequisites

Before starting, make sure you have:

- Basic understanding of public-key cryptography concepts
- Development environment set up for your chosen language
- Familiarity with the programming language you'll be using

!!! note
    Polkadot accounts are based on the SR25519 signature scheme by default, though ED25519 and ECDSA are also supported. Each account consists of a public key (address) and a private key (seed/mnemonic). Keep your private keys secure and never share them.

## JavaScript/TypeScript

Create a new project directory and initialize it:

```bash
mkdir account-creator
cd account-creator
npm init -y && npm pkg set type=module
```

Install the required packages:

```bash
npm install @polkadot/util-crypto @polkadot/keyring
npm install --save-dev typescript tsx
```

Create a file named `create-account.ts`:

```typescript title="create-account.ts"
--8<-- 'code/chain-interactions/accounts/create-account/create-account.ts'
```

Key aspects of the code:

- **Mnemonic generation**: Uses `mnemonicGenerate()` to create a 12-word BIP39 mnemonic phrase for human-readable key backup
- **Keyring**: The `Keyring` class manages accounts with specified signature scheme and address format
- **SS58 format**: Setting `ss58Format: 0` configures addresses for the Polkadot relay chain

Execute the script using `tsx`:

```bash
npx tsx create-account.ts
```

You should see output similar to:

--8<-- 'code/chain-interactions/accounts/create-account/create-account-ts.html'

## Python

Python developers can use the `substrate-interface` library to create and manage Polkadot accounts.

Create a new project directory and set up a virtual environment:

```bash
mkdir account-creator-python
cd account-creator-python
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install the required package:

```bash
pip install substrate-interface
```

Create a file named `create_account.py`:

```python title="create_account.py"
--8<-- 'code/chain-interactions/accounts/create-account/create_account.py'
```

Key aspects of the code:

- **Mnemonic generation**: The `generate_mnemonic()` function creates a BIP39-compatible phrase
- **Keypair creation**: `Keypair.create_from_mnemonic()` derives keys from the mnemonic

Execute the script:

```bash
python create_account.py
```

You should see output similar to:

--8<-- 'code/chain-interactions/accounts/create-account/create-account-py.html'

## Rust

Rust provides low-level access to Substrate primitives for account creation through the `sp-core` and `sp-keyring` crates.

Create a new Rust project:

```bash
cargo new account-creator-rust
cd account-creator-rust
```

Add dependencies to your `Cargo.toml`:

```toml title="Cargo.toml"
[package]
name = "account-creator-rust"
version = "0.1.0"
edition = "2021"

[dependencies]
sp-core = "28.0"
sp-runtime = "31.0"
```

Create your account generation code in `src/main.rs`:

```rust title="src/main.rs"
--8<-- 'code/chain-interactions/accounts/create-account/create-account.rs'
```

Key aspects of the code:

- **Keypair generation**: [`sr25519::Pair::generate_with_phrase()`](https://docs.rs/sp-core/latest/sp_core/crypto/trait.Pair.html#method.generate_with_phrase){target=\_blank} creates a new key pair with mnemonic
- **Public key extraction**: The [`public()`](https://docs.rs/sp-core/latest/sp_core/crypto/trait.Pair.html#tymethod.public){target=\_blank} method retrieves the public key from the pair
- **SS58 encoding**: Uses Polkadot's address format for the human-readable address

Build and run the project:

```bash
cargo run
```

You should see output similar to:

--8<-- 'code/chain-interactions/accounts/create-account/create-account-rs.html'

## Where to Go Next

Now that you can create accounts programmatically, explore related guides to fund accounts and send transactions.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Send Transactions with SDKs__

    ---

    Learn how to send signed transactions using your newly created accounts with Polkadot-API and Polkadot.js API libraries.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/with-sdks/)

-   <span class="badge guide">Guide</span> __Calculate Transaction Fees__

    ---

    Learn how to estimate transaction fees before sending transactions from your accounts.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/calculate-transaction-fees/)

-   <span class="badge guide">Guide</span> __Query Chain Data__

    ---

    Explore different methods for querying blockchain data including account balances and other chain state.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/query-sdks/)

</div>