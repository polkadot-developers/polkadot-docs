---
title: Send Transactions with SDKs
description: Learn how to construct, sign, and submit transactions using PAPI, Polkadot.js, Dedot, Python Substrate Interface, and Subxt.
categories: Chain Interactions
---

# Send Transactions with SDKs

## Introduction

Sending transactions on Polkadot SDK-based blockchains involves constructing an extrinsic (transaction), signing it with your account's private key, and submitting it to the network. Each SDK provides different methods for transaction construction, signing, and submission.

This guide demonstrates how to send transactions using five popular SDKs:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}**: Modern TypeScript library with type-safe APIs
- **[Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}**: Comprehensive JavaScript library (maintenance mode)
- **[Dedot](/reference/tools/dedot/){target=\_blank}**: Lightweight TypeScript library optimized for performance
- **[Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank}**: Python library for Substrate chains
- **[Subxt](/reference/tools/subxt/){target=\_blank}**: Rust library with compile-time type safety

Select your preferred SDK below to see complete, runnable examples that send balance transfer transactions on Polkadot Hub.

## Prerequisites

- Access to a Polkadot-SDK-compatible wallet, with its mnemonic phrase or private key.
- A funded account on Polkadot Hub, with some testnet tokens. You can use the [Polkadot Faucet](https://faucet.polkadot.io/?parachain=1111){target=\_blank} to obtain test tokens.

## Send Transactions

!!! warning
    Never share your mnemonic phrase or private keys. The examples below use mnemonics for demonstration purposes only. In production, use secure key management solutions.

=== "PAPI"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir papi-send-tx-example && cd papi-send-tx-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install polkadot-api @polkadot/util-crypto @polkadot/keyring && \
        npm install --save-dev @types/node tsx typescript
        ```

    3. Generate types for Polkadot Hub TestNet:

        ```bash
        npx papi add polkadotTestNet -w wss://asset-hub-paseo.dotters.network
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send-transfer.ts` and add the following code to it:

    ```typescript title="send-transfer.ts"
    --8<-- "code/chain-interactions/send-transactions/with-sdks/papi/send-transfer.ts"
    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    npx tsx send-transfer.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/send-transactions/with-sdks/papi/send-transfer-ts.html'

=== "Polkadot.js"

    !!! warning "Maintenance Mode Only"
        The Polkadot.js API is no longer actively developed. New projects should use [PAPI](/reference/tools/papi/){target=\_blank} or [Dedot](/reference/tools/dedot/){target=\_blank} as actively maintained alternatives.

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir pjs-send-tx-example && cd pjs-send-tx-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install @polkadot/api @polkadot/keyring @polkadot/util-crypto
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send-transfer.js` and add the following code:

    ```javascript title="send-transfer.js"
    --8<-- "code/chain-interactions/send-transactions/with-sdks/pjs/send-transfer.js"
    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    node send-transfer.js
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/send-transactions/with-sdks/pjs/send-transfer-js.html'

=== "Dedot"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir dedot-send-tx-example && cd dedot-send-tx-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install dedot @polkadot/keyring @polkadot/util-crypto && \
        npm install --save-dev @dedot/chaintypes @types/node tsx typescript
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send-transfer.ts` and add the following code to it:

    ```typescript title="send-transfer.ts"
    --8<-- "code/chain-interactions/send-transactions/with-sdks/dedot/send-transfer.ts"
    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    npx tsx send-transfer.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/send-transactions/with-sdks/dedot/send-transfer-ts.html'

=== "Python Substrate Interface"

    **Prerequisites**

    - [Python](https://www.python.org/){target=\_blank} 3.8 or higher
    - pip package manager

    **Environment Setup**

    1. Create a new project directory and set up a virtual environment:

        ```bash
        mkdir psi-send-tx-example && cd psi-send-tx-example && \
        python3 -m venv venv && source venv/bin/activate
        ```

    2. Install the substrate-interface package:

        ```bash
        pip install substrate-interface
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file named `send_transfer.py` and add the following code to it:

    ```python title="send_transfer.py"
    --8<-- "code/chain-interactions/send-transactions/with-sdks/psi/send_transfer.py"
    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    python send_transfer.py
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/send-transactions/with-sdks/psi/send-transfer-py.html'

=== "Subxt"

    [Subxt](/reference/tools/subxt/){target=\_blank} is a Rust library that provides compile-time type safety through code generation from chain metadata.

    **Prerequisites**

    - [Rust](https://rustup.rs/){target=\_blank} toolchain (latest stable)
    - Cargo package manager

    **Environment Setup**

    1. Create a new Rust project:

        ```bash
        cargo new subxt-send-tx-example && cd subxt-send-tx-example
        ```

    2. Install the Subxt CLI:

        ```bash
        cargo install subxt-cli@{{ dependencies.crates.subxt_cli.version }}
        ```

    3. Download the Polkadot Hub metadata:

        ```bash
        subxt metadata --url INSERT_WS_ENDPOINT -o asset_hub_metadata.scale
        ```

    4. Update `Cargo.toml` with the required dependencies:

        ```toml title="Cargo.toml"
        --8<-- "code/chain-interactions/send-transactions/with-sdks/subxt/Cargo.toml"
        ```

    **Send Balance Transfer**

    The following example constructs, signs, and submits a balance transfer transaction.

    Create a file at `src/bin/send_transfer.rs` and add the following code to it:

    ```rust title="src/bin/send_transfer.rs"
    --8<-- "code/chain-interactions/send-transactions/with-sdks/subxt/src/bin/send_transfer.rs"
    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, `INSERT_SENDER_MNEMONIC` with your account's mnemonic phrase, and `INSERT_DEST_ADDRESS` with the recipient address. For this example, you can use Polkadot Hub (`wss://polkadot-asset-hub-rpc.polkadot.io`).

    Run the script:

    ```bash
    cargo run --bin send_transfer
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/send-transactions/with-sdks/subxt/send-transfer-rs.html'

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Query On-Chain State**

    ---

    Learn how to query storage and runtime data with the SDKs used in this guide.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/query-sdks/)

- <span class="badge guide">Guide</span> **Calculate Transaction Fees**

    ---

    Estimate fees before sending transactions

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/calculate-transaction-fees/)

</div>
