---
title: Query On-Chain State with SDKs
description: Learn how to query on-chain storage data using PAPI, Polkadot.js, Dedot, Python Substrate Interface, and Subxt.
categories: Chain Interactions
---

# Query On-Chain State with SDKs

## Introduction

Polkadot SDK-based blockchains store data in a key-value database that can be queried by external applications. This on-chain state includes account balances, asset information, governance proposals, and any other data the runtime manages.

This guide demonstrates how to query on-chain storage using five popular SDKs:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}** - Modern TypeScript library with type-safe APIs
- **[Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}** - Comprehensive JavaScript library (maintenance mode)
- **[Dedot](/reference/tools/dedot/){target=\_blank}** - Lightweight TypeScript library optimized for performance
- **[Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank}** - Python library for Substrate chains
- **[Subxt](/reference/tools/subxt/){target=\_blank}** - Rust library with compile-time type safety

Select your preferred SDK below to see complete, runnable examples that query Polkadot Hub for account balances and asset information.

## Query On-Chain Data

=== "PAPI"

    [Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank} is a modern, type-safe TypeScript library optimized for light-client functionality.

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir papi-query-example && cd papi-query-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install polkadot-api && \
        npm install --save-dev @types/node tsx typescript
        ```

    3. Generate types for Polkadot Hub:

        ```bash
        npx papi add pah -n polkadot_asset_hub
        ```

    **Query Account Balance**

    The following example queries the `System.Account` storage to retrieve an account's native token balance.

    Create a file named `query-balance.ts`:

    ```typescript title="query-balance.ts"
    --8<-- "code/chain-interactions/query-data/query-sdks/papi/query-balance.ts"
    ```

    Run the script:

    ```bash
    npx tsx query-balance.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/papi/query-balance-ts.html'

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query-asset.ts`:

    ```typescript title="query-asset.ts"
    --8<-- "code/chain-interactions/query-data/query-sdks/papi/query-asset.ts"
    ```

    Run the script:

    ```bash
    npx tsx query-asset.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/papi/query-asset-ts.html'

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
        mkdir pjs-query-example && cd pjs-query-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install @polkadot/api
        ```

    **Query Account Balance**

    The following example queries the `System.Account` storage to retrieve an account's native token balance.

    Create a file named `query-balance.js`:

    ```javascript title="query-balance.js"
    --8<-- "code/chain-interactions/query-data/query-sdks/pjs/query-balance.js"
    ```

    Run the script:

    ```bash
    node query-balance.js
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/pjs/query-balance-js.html'

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query-asset.js`:

    ```javascript title="query-asset.js"
    --8<-- "code/chain-interactions/query-data/query-sdks/pjs/query-asset.js"
    ```

    Run the script:

    ```bash
    node query-asset.js
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/pjs/query-asset-js.html'

=== "Dedot"

    [Dedot](/reference/tools/dedot/){target=\_blank} is a next-generation TypeScript client that's lightweight, tree-shakable, and maintains API compatibility with Polkadot.js.

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir dedot-query-example && cd dedot-query-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install dedot && \
        npm install --save-dev @dedot/chaintypes @types/node tsx typescript
        ```

    **Query Account Balance**

    The following example queries the `System.Account` storage to retrieve an account's native token balance.

    Create a file named `query-balance.ts`:

    ```typescript title="query-balance.ts"
    --8<-- "code/chain-interactions/query-data/query-sdks/dedot/query-balance.ts"
    ```

    Run the script:

    ```bash
    npx tsx query-balance.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/dedot/query-balance-ts.html'

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query-asset.ts`:

    ```typescript title="query-asset.ts"
    --8<-- "code/chain-interactions/query-data/query-sdks/dedot/query-asset.ts"
    ```

    Run the script:

    ```bash
    npx tsx query-asset.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/dedot/query-asset-ts.html'

=== "Python"

    [Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank} provides a Python library for interacting with Substrate-based chains.

    **Prerequisites**

    - [Python](https://www.python.org/){target=\_blank} 3.8 or higher
    - pip package manager

    **Environment Setup**

    1. Create a new project directory and set up a virtual environment:

        ```bash
        mkdir psi-query-example && cd psi-query-example && \
        python3 -m venv venv && source venv/bin/activate
        ```

    2. Install the substrate-interface package:

        ```bash
        pip install substrate-interface
        ```

    **Query Account Balance**

    The following example queries the `System.Account` storage to retrieve an account's native token balance.

    Create a file named `query_balance.py`:

    ```python title="query_balance.py"
    --8<-- "code/chain-interactions/query-data/query-sdks/psi/query_balance.py"
    ```

    Run the script:

    ```bash
    python query_balance.py
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/psi/query-balance-py.html'

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query_asset.py`:

    ```python title="query_asset.py"
    --8<-- "code/chain-interactions/query-data/query-sdks/psi/query_asset.py"
    ```

    Run the script:

    ```bash
    python query_asset.py
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/psi/query-asset-py.html'

=== "Subxt"

    [Subxt](/reference/tools/subxt/){target=\_blank} is a Rust library that provides compile-time type safety through code generation from chain metadata.

    **Prerequisites**

    - [Rust](https://rustup.rs/){target=\_blank} toolchain (latest stable)
    - Cargo package manager

    **Environment Setup**

    1. Create a new Rust project:

        ```bash
        cargo new subxt-query-example && cd subxt-query-example
        ```

    2. Install the Subxt CLI:

        ```bash
        cargo install subxt-cli@{{ dependencies.crates.subxt_cli.version }}
        ```

    3. Download the Polkadot Hub metadata:

        ```bash
        subxt metadata --url wss://polkadot-asset-hub-rpc.polkadot.io -o asset_hub_metadata.scale
        ```

    4. Update `Cargo.toml` with the required dependencies:

        ```toml title="Cargo.toml"
        --8<-- "code/chain-interactions/query-data/query-sdks/subxt/Cargo.toml"
        ```

    **Query Account Balance**

    The following example queries the `System.Account` storage to retrieve an account's native token balance.

    Create a file at `src/bin/query_balance.rs`:

    ```rust title="src/bin/query_balance.rs"
    --8<-- "code/chain-interactions/query-data/query-sdks/subxt/src/bin/query_balance.rs"
    ```

    Run the script:

    ```bash
    cargo run --bin query_balance
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/subxt/query-balance-rs.html'

    !!! note
        Subxt's `fetch()` method returns `None` for accounts with zero balance that have no on-chain storage entry, resulting in "Account not found". Accounts with activity will display their balance information.

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file at `src/bin/query_asset.rs`:

    ```rust title="src/bin/query_asset.rs"
    --8<-- "code/chain-interactions/query-data/query-sdks/subxt/src/bin/query_asset.rs"
    ```

    Run the script:

    ```bash
    cargo run --bin query_asset
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/query-sdks/subxt/query-asset-rs.html'

## Where to Go Next

Now that you understand how to query on-chain state, explore these related topics:

- **[Runtime API Calls](/chain-interactions/query-data/runtime-api-calls/)** - Execute runtime APIs for specialized queries
- **[Send Transactions](/chain-interactions/send-transactions/with-sdks/)** - Learn to construct and submit transactions
- **[SDK Reference Pages](/reference/tools/papi/)** - Detailed documentation for each SDK
