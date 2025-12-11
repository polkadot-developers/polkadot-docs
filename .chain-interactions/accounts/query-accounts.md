---
title: Query Account Information with SDKs
description: Learn how to query account information using five popular SDKs: Polkadot API (PAPI), Polkadot.js API, Dedot, Python Substrate Interface, and Subxt.
categories: Basics, Polkadot Protocol
---

# Query Account Information with SDKs

## Introduction

Querying account information is a fundamental operation when interacting with Polkadot SDK-based blockchains. Account queries allow you to retrieve balances, nonces, account data, and other state information stored on-chain. Each SDK provides different methods for accessing this data efficiently.

This guide demonstrates how to query account information using five popular SDKs:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}** - Modern TypeScript library with type-safe APIs
- **[Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}** - Comprehensive JavaScript library (maintenance mode)
- **[Dedot](/reference/tools/dedot/){target=\_blank}** - Lightweight TypeScript library optimized for performance
- **[Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank}** - Python library for Substrate chains
- **[Subxt](/reference/tools/subxt/){target=\_blank}** - Rust library with compile-time type safety

Select your preferred SDK below to see complete, runnable examples that query account information on Polkadot Hub.

!!! note
    Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint and `INSERT_ACCOUNT_ADDRESS` with the account address you want to query. For this example, you can use Polkadot Hub (`wss://asset-hub-paseo.dotters.network`).

## Prerequisites

- Access to a Polkadot SDK-compatible blockchain endpoint (WebSocket URL)
- An account address to query (can be any valid SS58 address)

## Query Account Information

=== "PAPI"

    [Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank} is a modern, type-safe TypeScript library optimized for light-client functionality.

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

    Create a file named `query-account.ts`:

    ```typescript title="query-account.ts"
    --8<-- "code/chain-interactions/accounts/query-account/papi-query-account.ts"
    ```

    Run the script:

    ```bash
    npx tsx query-account.ts
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/papi-query-account-output.html"


=== "Polkadot.js"

    !!! warning "Maintenance Mode Only"
        The Polkadot.js API is no longer actively developed. New projects should use [PAPI](/reference/tools/papi/){target=\_blank} or [Dedot](/reference/tools/dedot/){target=\_blank} as actively maintained alternatives.

    [Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank} is a comprehensive JavaScript library with extensive ecosystem support.

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

    Create a file named `query-account.js`:

    ```javascript title="query-account.js"
    --8<-- "code/chain-interactions/accounts/query-account/polkadot-js-query-account.js"
    ```

    Run the script:

    ```bash
    node query-account.js
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/polkadot-js-query-account-output.html"

=== "Dedot"

    [Dedot](/reference/tools/dedot/){target=\_blank} is a next-generation TypeScript client that's lightweight, tree-shakable, and maintains API compatibility with Polkadot.js.

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

    Create a file named `query-account.ts`:

    ```typescript title="query-account.ts"
    --8<-- "code/chain-interactions/accounts/query-account/dedot-query-account.ts"
    ```

    Run the script:

    ```bash
    npx tsx query-account.ts
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/dedot-query-account-output.html"

=== "Python"

    [Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank} provides a Python library for interacting with Substrate-based chains.

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

    Create a file named `query_account.py`:

    ```python title="query_account.py"
    --8<-- "code/chain-interactions/accounts/query-account/psi_query_account.py"
    ```

    Run the script:

    ```bash
    python query_account.py
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/psi-query-account-output.html"

=== "Subxt"

    [Subxt](/reference/tools/subxt/){target=\_blank} is a Rust library that provides compile-time type safety through code generation from chain metadata.

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

    Create a file at `src/bin/query_account.rs`:

    ```rust title="src/bin/query_account.rs"
    --8<-- "code/chain-interactions/accounts/query-account/subxt-query-account.rs"
    ```

    Run the script:

    ```bash
    cargo run --bin query_account
    ```

    You should see output similar to:

    --8<-- "code/chain-interactions/accounts/query-account/subxt-query-account-output.html"

## Understanding Account Data

When querying account information, you'll receive several key fields:

- **Nonce** - the number of transactions sent from this account, used to prevent replay attacks
- **Consumers** - the number of modules depending on this account's existence
- **Providers** - the number of modules providing for this account's existence
- **Sufficients** - the number of modules that allow this account to exist on its own
- **Free Balance** - the transferable balance available for transactions
- **Reserved Balance** - balance that is locked for specific purposes (staking, governance, etc.)
- **Frozen Balance** - balance that cannot be used for transfers but may be used for other operations

The total balance is the sum of free and reserved balances.

## Where to Go Next

Now that you understand how to query account information, explore these related topics:

- **[Send Transactions with SDKs](/chain-interactions/send-transactions/with-sdks/)** - Learn to construct and submit transactions
- **[Query On-Chain State](/chain-interactions/query-data/query-sdks/)** - Explore other types of storage queries
- **[Calculate Transaction Fees](/chain-interactions/send-transactions/calculate-transaction-fees/)** - Estimate fees before sending transactions
- **[SDK Reference Pages](/reference/tools/)** - Detailed documentation for each SDK