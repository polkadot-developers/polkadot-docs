---
title: Query Account Information with SDKs
description: Learn how to query account information using five popular SDKs—Polkadot API (PAPI), Polkadot.js API, Dedot, Python Substrate Interface, and Subxt.
categories: Basics, Polkadot Protocol
---

# Query Account Information with SDKs

## Introduction

Querying account information is a fundamental operation when interacting with Polkadot SDK-based blockchains. Account queries allow you to retrieve balances, nonces, account data, and other state information stored on-chain. Each SDK provides different methods for accessing this data efficiently.

This guide demonstrates how to query account information using five popular SDKs:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}**: Modern TypeScript library with type-safe APIs
- **[Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}**: Comprehensive JavaScript library (maintenance mode)
- **[Dedot](/reference/tools/dedot/){target=\_blank}**: Lightweight TypeScript library optimized for performance
- **[Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank}**: Python library for Substrate chains
- **[Subxt](/reference/tools/subxt/){target=\_blank}**: Rust library with compile-time type safety

Select your preferred SDK below to see complete, runnable examples that query account information on Polkadot Hub.

## Prerequisites

- Access to a Polkadot SDK-compatible blockchain endpoint (WebSocket URL)
- An account address to query (can be any valid SS58 address)

## Query Account Information

=== "PAPI"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir papi-query-account-example && cd papi-query-account-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install polkadot-api && \
        npm install --save-dev @types/node tsx typescript
        ```

    3. Generate types for Polkadot Hub:

        ```bash
        npx papi add polkadotTestNet -w wss://asset-hub-paseo.dotters.network
        ```

    **Query Account Data**

    The following example queries account information including balance, nonce, and other account data.

    Create a file named `query-account.ts` and add the following code to it:

    ```typescript title="query-account.ts"
    --8<-- "code/chain-interactions/accounts/query-account/papi/query-account.ts"
    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-account.ts
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/papi/query-account-output.html"


=== "Polkadot.js"

    !!! warning "Maintenance Mode Only"
        The Polkadot.js API is no longer actively developed. New projects should use [PAPI](/reference/tools/papi/){target=\_blank} or [Dedot](/reference/tools/dedot/){target=\_blank} as actively maintained alternatives.

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir pjs-query-account-example && cd pjs-query-account-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install @polkadot/api
        ```

    **Query Account Data**

    The following example queries account information including balance, nonce, and other account data.

    Create a file named `query-account.js` and add the following code to it:

    ```javascript title="query-account.js"
    --8<-- "code/chain-interactions/accounts/query-account/pjs/query-account.js"
    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    node query-account.js
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/pjs/query-account-output.html"

=== "Dedot"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir dedot-query-account-example && cd dedot-query-account-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install dedot && \
        npm install --save-dev @dedot/chaintypes @types/node tsx typescript
        ```

    **Query Account Data**

    The following example queries account information including balance, nonce, and other account data.

    Create a file named `query-account.ts` and add the following code to it:

    ```typescript title="query-account.ts"
    --8<-- "code/chain-interactions/accounts/query-account/dedot/query-account.ts"
    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-account.ts
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/dedot/query-account-output.html"

=== "Python Substrate Interface"

    **Prerequisites**

    - [Python](https://www.python.org/){target=\_blank} 3.8 or higher
    - pip package manager

    **Environment Setup**

    1. Create a new project directory and set up a virtual environment:

        ```bash
        mkdir psi-query-account-example && cd psi-query-account-example && \
        python3 -m venv venv && source venv/bin/activate
        ```

    2. Install the substrate-interface package:

        ```bash
        pip install substrate-interface
        ```

    **Query Account Data**

    The following example queries account information including balance, nonce, and other account data.

    Create a file named `query_account.py` and add the following code to it:

    ```python title="query_account.py"
    --8<-- "code/chain-interactions/accounts/query-account/psi/query_account.py"
    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    python query_account.py
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/psi/query-account-output.html"

=== "Subxt"

    **Prerequisites**

    - [Rust](https://rustup.rs/){target=\_blank} toolchain (latest stable)
    - Cargo package manager

    **Environment Setup**

    1. Create a new Rust project:

        ```bash
        cargo new subxt-query-account-example && cd subxt-query-account-example
        ```

    2. Install the Subxt CLI:

        ```bash
        cargo install subxt-cli@0.35.3
        ```

    3. Download the Polkadot Hub metadata:

        ```bash
        subxt metadata --url INSERT_WS_ENDPOINT -o polkadot_testnet_metadata.scale
        ```

    4. Update `Cargo.toml` with the required dependencies:

        ```toml title="Cargo.toml"
        [package]
        name = "subxt-query-account-example"
        version = "0.1.0"
        edition = "2021"

        [[bin]]
        name = "query_account"
        path = "src/bin/query_account.rs"

        [dependencies]
        subxt = { version = "0.44.0" }
        tokio = { version = "1.36.0", features = ["macros", "rt"] }
        ```

    **Query Account Data**

    The following example queries account information including balance, nonce, and other account data.

    Create a file at `src/bin/query_account.rs` and add the following code to it:

    ```rust title="src/bin/query_account.rs"
    --8<-- "code/chain-interactions/accounts/query-account/subxt/query-account.rs"
    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    cargo run --bin query_account
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/subxt/query-account-output.html"

## Understanding Account Data

When querying account information, you'll receive several key fields:

- **Nonce**: The number of transactions sent from this account, used to prevent replay attacks.
- **Consumers**: The number of modules depending on this account's existence.
- **Providers**: The number of modules providing for this account's existence.
- **Sufficients**: The number of modules that allow this account to exist on its own.
- **Free Balance**: The transferable balance available for transactions.
- **Reserved Balance**: Balance that is locked for specific purposes (staking, governance, etc.).
- **Frozen Balance**: Balance that cannot be used for transfers but may be used for other operations.

The total balance is the sum of free and reserved balances.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Query On-Chain State**

    ---

    Explore other types of storage queries.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/query-sdks/)

- <span class="badge guide">Guide</span> **Send Transactions**

    ---

    Learn how to construct and submit transactions.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/with-sdks/)

</div>
