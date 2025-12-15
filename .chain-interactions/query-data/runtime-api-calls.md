---
title: Runtime API Calls
description: Learn how to call runtime APIs on Polkadot using PAPI, Polkadot.js, Dedot, Python Substrate Interface, and Subxt.
categories: Chain Interactions
---

# Runtime API Calls

## Introduction

Polkadot SDK runtime APIs provide direct access to the blockchain's WebAssembly (Wasm) runtime, enabling specialized queries and computations that go beyond simple storage reads. Unlike storage queries that fetch static data, runtime APIs execute logic within the runtime to compute results dynamically.

Common runtime APIs include:

- **AccountNonceApi** - retrieves the current transaction nonce for an account
- **Metadata** - queries available metadata versions and runtime information
- **TransactionPaymentApi** - estimates transaction fees before submission
- **NominationPoolsApi** - retrieves staking pool information and pending rewards
- **StakingApi** - accesses staking-related computations

This guide demonstrates how to call runtime APIs using five popular SDKs:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}** - modern TypeScript library with type-safe APIs
- **[Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}** - comprehensive JavaScript library (maintenance mode)
- **[Dedot](/reference/tools/dedot/){target=\_blank}** - lightweight TypeScript library optimized for performance
- **[Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank}** - Python library for Substrate chains
- **[Subxt](/reference/tools/subxt/){target=\_blank}** - Rust library with compile-time type safety

Select your preferred SDK below to see complete, runnable examples that query Polkadot Hub TestNet for account nonces and metadata information.

## Call Runtime APIs

=== "PAPI"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir papi-runtime-api-example && cd papi-runtime-api-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install polkadot-api && \
        npm install --save-dev @types/node tsx typescript
        ```

    3. Generate types for Polkadot Hub TestNet:

        ```bash
        npx papi add polkadotTestNet -w wss://asset-hub-paseo.dotters.network
        ```

    **Call Runtime APIs**

    The following example demonstrates calling several runtime APIs:

    - `AccountNonceApi.account_nonce` - gets the current nonce for an account
    - `Metadata.metadata_versions` - retrieves supported metadata versions

    Create a file named `runtime-apis.ts` and add the following code:

    ```typescript title="runtime-apis.ts"
    --8<-- "code/chain-interactions/query-data/runtime-api-calls/papi/runtime-apis.ts"
    ```

    Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx runtime-apis.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/runtime-api-calls/papi/runtime-apis-ts.html'

=== "Polkadot.js"

    !!! warning "Maintenance Mode Only"
        The Polkadot.js API is no longer actively developed. New projects should use [PAPI](/reference/tools/papi/){target=\_blank} or [Dedot](/reference/tools/dedot/){target=\_blank} as actively maintained alternatives.

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir pjs-runtime-api-example && cd pjs-runtime-api-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install @polkadot/api
        ```

    **Call Runtime APIs**

    The following example demonstrates calling several runtime APIs:

    - `accountNonceApi.accountNonce` - gets the current nonce for an account
    - `metadata.metadataVersions` - retrieves supported metadata versions

    Create a file named `runtime-apis.js` and add the following code:

    ```javascript title="runtime-apis.js"
    --8<-- "code/chain-interactions/query-data/runtime-api-calls/pjs/runtime-apis.js"
    ```

    Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    node runtime-apis.js
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/runtime-api-calls/pjs/runtime-apis-js.html'

=== "Dedot"

    **Prerequisites**

    - [Node.js](https://nodejs.org/){target=\_blank} v18 or higher
    - npm, pnpm, or yarn package manager

    **Environment Setup**

    1. Create and initialize a new project:

        ```bash
        mkdir dedot-runtime-api-example && cd dedot-runtime-api-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install dedot && \
        npm install --save-dev @dedot/chaintypes @types/node tsx typescript
        ```

    **Call Runtime APIs**

    The following example demonstrates calling several runtime APIs:

    - `accountNonceApi.accountNonce` - gets the current nonce for an account
    - `metadata.metadataVersions` - retrieves supported metadata versions

    Create a file named `runtime-apis.ts` and add the following code:

    ```typescript title="runtime-apis.ts"
    --8<-- "code/chain-interactions/query-data/runtime-api-calls/dedot/runtime-apis.ts"
    ```

    Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx runtime-apis.ts
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/runtime-api-calls/dedot/runtime-apis-ts.html'

=== "Py Substrate Interface"

    **Prerequisites**

    - [Python](https://www.python.org/){target=\_blank} 3.8 or higher
    - pip package manager

    **Environment Setup**

    1. Create a new project directory and set up a virtual environment:

        ```bash
        mkdir psi-runtime-api-example && cd psi-runtime-api-example && \
        python3 -m venv venv && source venv/bin/activate
        ```

    2. Install the substrate-interface package:

        ```bash
        pip install substrate-interface
        ```

    **Call Runtime APIs**

    The following example demonstrates calling several runtime APIs:

    - `AccountNonceApi.account_nonce` - gets the current nonce for an account
    - `Core.version` - retrieves runtime version information

    Create a file named `runtime_apis.py` and add the following code:

    ```python title="runtime_apis.py"
    --8<-- "code/chain-interactions/query-data/runtime-api-calls/psi/runtime_apis.py"
    ```

    Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    python runtime_apis.py
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/runtime-api-calls/psi/runtime-apis-py.html'

=== "Subxt"

    [Subxt](/reference/tools/subxt/){target=\_blank} is a Rust library that provides compile-time type safety through code generation from chain metadata.

    **Prerequisites**

    - [Rust](https://rustup.rs/){target=\_blank} toolchain (latest stable)
    - Cargo package manager

    **Environment Setup**

    1. Create a new Rust project:

        ```bash
        cargo new subxt-runtime-api-example && cd subxt-runtime-api-example
        ```

    2. Install the Subxt CLI:

        ```bash
        cargo install subxt-cli@{{ dependencies.crates.subxt_cli.version }}
        ```

    3. Download the Polkadot Hub TestNet metadata:

        ```bash
        subxt metadata --url INSERT_WS_ENDPOINT -o asset_hub_metadata.scale
        ```

        Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, such as `wss://asset-hub-paseo.dotters.network` for Polkadot Hub TestNet.

    4. Update `Cargo.toml` with the required dependencies:

        ```toml title="Cargo.toml"
        --8<-- "code/chain-interactions/query-data/runtime-api-calls/subxt/Cargo.toml"
        ```

    **Call Runtime APIs**

    The following example demonstrates calling several runtime APIs:

    - `AccountNonceApi.account_nonce` - gets the current nonce using the static interface
    - `Metadata.metadata_versions` - retrieves supported metadata versions using the dynamic interface

    Create a file at `src/bin/runtime_apis.rs` and add the following code:

    ```rust title="src/bin/runtime_apis.rs"
    --8<-- "code/chain-interactions/query-data/runtime-api-calls/subxt/src/bin/runtime_apis.rs"
    ```

    Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    cargo run --bin runtime_apis
    ```

    You should see output similar to:

    --8<-- 'code/chain-interactions/query-data/runtime-api-calls/subxt/runtime-apis-rs.html'

## Available Runtime APIs

The following runtime APIs are commonly available on Polkadot SDK-based chains:

| API | Description |
|-----|-------------|
| `AccountNonceApi` | Get current transaction nonce for an account |
| `TransactionPaymentApi` | Query transaction fees and weight information |
| `TransactionPaymentCallApi` | Estimate fees for a call without creating an extrinsic |
| `Metadata` | Query metadata versions and runtime metadata |
| `BlockBuilder` | Access block building functionality |
| `Core` | Core runtime version and execution |
| `TaggedTransactionQueue` | Validate transactions in the pool |
| `OffchainWorkerApi` | Offchain worker functionality |
| `SessionKeys` | Session key management |
| `GrandpaApi` | GRANDPA finality information |
| `BabeApi` | BABE consensus information |
| `NominationPoolsApi` | Nomination pools data and pending rewards |
| `StakingApi` | Staking-related computations |

!!! note
    Available runtime APIs vary by chain. Check your target chain's metadata to see which APIs are exposed.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Query On-Chain State**

    ---

    Learn how to query storage data from the blockchain.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/query-sdks/)

- <span class="badge guide">Guide</span> **Send Transactions**

    ---

    Learn how to construct and submit transactions.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/with-sdks/)

</div>
