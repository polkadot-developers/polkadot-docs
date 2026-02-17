---
title: Pay Transaction Fees with Different Tokens
description: Learn how to send a DOT transfer transaction while paying the fees using a different token on Polkadot Hub using multiple SDKs.
---

# Send a Transaction While Paying the Fee with a Different Token

## Introduction

Polkadot Hub allows users to pay transaction fees using alternative tokens instead of the native token. This tutorial demonstrates how to send a DOT transfer transaction while paying the fees using USDT on Polkadot Hub.

You can follow this tutorial using [Polkadot-API (PAPI)](/reference/tools/papi/){target=\_blank}, [Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}, or [Subxt](/reference/tools/subxt/){target=\_blank}. Select your preferred SDK in the code tabs below.

!!! warning "Polkadot.js API Maintenance Mode"
    The Polkadot.js API is no longer actively developed. New projects should use [Polkadot-API (PAPI)](/reference/tools/papi/){target=\_blank} or [Dedot](/reference/tools/dedot/){target=\_blank} as actively maintained alternatives.

## Prerequisites

Before starting, ensure you have the following installed:

- [Chopsticks](/reference/tools/chopsticks/){target=\_blank} — for forking Polkadot Hub locally
- Your preferred SDK:
    - [Polkadot-API (PAPI)](/reference/tools/papi/){target=\_blank} — TypeScript
    - [Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank} — JavaScript
    - [Subxt](/reference/tools/subxt/){target=\_blank} — Rust

## Local Polkadot Hub Setup

Fork the Polkadot Hub locally using [Chopsticks](/reference/tools/chopsticks/){target=\_blank}:

```bash
chopsticks -c polkadot-asset-hub
```

This command forks Polkadot Hub chain, making it available at `ws://localhost:8000`. When running `polkadot-asset-hub`, you use Polkadot Hub fork with the configuration specified in the [`polkadot-asset-hub.yml`](https://github.com/AcalaNetwork/chopsticks/blob/master/configs/polkadot-asset-hub.yml){target=\_blank} file. This configuration defines Alice's account with USDT assets. If you want to use a different chain, ensure the account you use has the necessary assets.

## Set Up Your Project

=== "PAPI"

    1. Create a new directory and initialize the project:

        ```bash
        mkdir fee-payment-tutorial && cd fee-payment-tutorial
        ```

    2. Initialize the project:

        ```bash
        npm init -y
        ```

    3. Install dev dependencies:

        ```bash
        npm install --save-dev @types/node@^22.12.0 ts-node@^10.9.2 typescript@^5.7.3
        ```

    4. Install dependencies:

        ```bash
        npm install --save @polkadot-labs/hdkd@{{dependencies.javascript_packages.hdkd.version}} @polkadot-labs/hdkd-helpers@{{dependencies.javascript_packages.hdkd_helpers.version}} polkadot-api@{{dependencies.javascript_packages.polkadot_api.version}}
        ```

    5. Create TypeScript configuration:

        ```bash
        npx tsc --init && npm pkg set type=module
        ```

    6. Generate Polkadot API types for Polkadot Hub:

        ```bash
        npx papi add assetHub -n polkadot_asset_hub
        ```

    7. Create a new file called `fee-payment-transaction.ts`:

        ```bash
        touch fee-payment-transaction.ts
        ```

=== "Polkadot.js"

    1. Create a new directory and initialize the project:

        ```bash
        mkdir fee-payment-tutorial && cd fee-payment-tutorial
        ```

    2. Initialize the project:

        ```bash
        npm init -y && npm pkg set type=module
        ```

    3. Install dependencies:

        ```bash
        npm install @polkadot/api@{{dependencies.javascript_packages.polkadot_js_api.version}}
        ```

    4. Create a new file called `fee-payment-transaction.js`:

        ```bash
        touch fee-payment-transaction.js
        ```

=== "Subxt"

    1. Create a new Rust project:

        ```bash
        cargo new subxt-fee-payment-example && cd subxt-fee-payment-example
        ```

    2. Install the Subxt CLI to download chain metadata:

        ```bash
        cargo install subxt-cli@{{ dependencies.crates.subxt_cli.version }}
        ```

    3. Download Polkadot Hub metadata from the local Chopsticks fork:

        ```bash
        mkdir metadata && \
        subxt metadata --url ws://localhost:8000 -o metadata/asset_hub.scale
        ```

        !!! note
            Ensure your Chopsticks fork is running at `ws://localhost:8000` before downloading the metadata.

    4. Update `Cargo.toml` with the required dependencies:

        ```toml title="Cargo.toml"
        --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/subxt/Cargo.toml"
        ```

    5. Create the source file:

        ```bash
        mkdir -p src/bin && touch src/bin/fee_payment_transaction.rs
        ```

## Implementation

In the following sections, you set up imports and constants, create a transaction signer, connect to Polkadot Hub, and send a DOT transfer transaction while paying fees in USDT.

### Import Dependencies and Define Constants

Set up the required imports and define the target address, transfer amount, and USDT asset ID for your transaction:

=== "PAPI"

    ```typescript title="fee-payment-transaction.ts"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/papi/fee-payment-transaction.ts:1:16"
    ```

=== "Polkadot.js"

    ```javascript title="fee-payment-transaction.js"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/pjs/fee-payment-transaction.js:1:7"
    ```

=== "Subxt"

    In Subxt, you first generate types from the chain metadata using the `#[subxt::subxt()]` macro. The `derive_for_type` attribute ensures the `Location` type implements the traits needed for encoding. You also define a custom `AssetHubConfig` where `type AssetId = Location`, which enables specifying an XCM location as the fee payment asset:

    ```rust title="src/bin/fee_payment_transaction.rs"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/subxt/src/bin/fee_payment_transaction.rs:1:40"
    ```

### Create a Signer and Connect

Create a signer using Alice's development account and connect to the local Polkadot Hub:

=== "PAPI"

    ```typescript title="fee-payment-transaction.ts"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/papi/fee-payment-transaction.ts:18:37"
    ```

=== "Polkadot.js"

    The `cryptoWaitReady()` call ensures the underlying WASM cryptographic libraries are initialized before creating the keyring:

    ```javascript title="fee-payment-transaction.js"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/pjs/fee-payment-transaction.js:9:20"
    ```

=== "Subxt"

    Notice that the `OnlineClient` is parameterized with `AssetHubConfig` instead of the default `PolkadotConfig`:

    ```rust title="src/bin/fee_payment_transaction.rs"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/subxt/src/bin/fee_payment_transaction.rs:42:50"
    ```

### Create the Transaction

Create a standard DOT transfer transaction that sends 3 DOT to Bob's address while keeping Alice's account alive:

=== "PAPI"

    ```typescript title="fee-payment-transaction.ts"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/papi/fee-payment-transaction.ts:39:42"
    ```

=== "Polkadot.js"

    ```javascript title="fee-payment-transaction.js"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/pjs/fee-payment-transaction.js:22:23"
    ```

=== "Subxt"

    ```rust title="src/bin/fee_payment_transaction.rs"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/subxt/src/bin/fee_payment_transaction.rs:52:56"
    ```

### Sign and Submit with Alternative Fee Payment

The key part of this tutorial is specifying an alternative asset for fee payment. The USDT asset is identified using the XCM location format, where `PalletInstance(50)` refers to the Assets pallet and `GeneralIndex(1984)` identifies the USDT asset on Polkadot Hub:

=== "PAPI"

    In PAPI, you specify the alternative asset through the `asset` parameter in the `signAndSubmit` options:

    ```typescript title="fee-payment-transaction.ts"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/papi/fee-payment-transaction.ts:44:69"
    ```

=== "Polkadot.js"

    In Polkadot.js, you define the asset as an XCM multi-location object and pass it as the `assetId` option to `signAndSend`:

    ```javascript title="fee-payment-transaction.js"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/pjs/fee-payment-transaction.js:25:83"
    ```

=== "Subxt"

    In Subxt, you use `DefaultExtrinsicParamsBuilder` with `tip_of(0, asset_location)` to specify the fee asset. The first argument is the tip amount (0), and the second is the XCM `Location`. Instead of calling `sign_and_submit_then_watch_default`, you pass the custom `tx_params` to `sign_and_submit_then_watch`:

    ```rust title="src/bin/fee_payment_transaction.rs"
    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/subxt/src/bin/fee_payment_transaction.rs:58:81"
    ```

### Full Code

=== "PAPI"

    ??? code "Complete Code"

        ```typescript title="fee-payment-transaction.ts"
        --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/papi/fee-payment-transaction.ts"
        ```

=== "Polkadot.js"

    ??? code "Complete Code"

        ```javascript title="fee-payment-transaction.js"
        --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/pjs/fee-payment-transaction.js"
        ```

=== "Subxt"

    ??? code "Complete Code"

        ```rust title="src/bin/fee_payment_transaction.rs"
        --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/subxt/src/bin/fee_payment_transaction.rs"
        ```

### Run the Script

=== "PAPI"

    ```bash
    npx ts-node fee-payment-transaction.ts
    ```

=== "Polkadot.js"

    ```bash
    node fee-payment-transaction.js
    ```

=== "Subxt"

    ```bash
    cargo run --bin fee_payment_transaction
    ```

### Expected Output

When you run the script successfully, you should see output similar to:

=== "PAPI"

    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/papi/fee-payment-transaction-output.html"

=== "Polkadot.js"

    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/pjs/fee-payment-transaction-js.html"

=== "Subxt"

    --8<-- "code/chain-interactions/send-transactions/pay-fees-with-different-tokens/subxt/fee-payment-transaction-rs.html"

The key events to look for are:

- **AssetTxPayment**: Confirms the fees were paid using the alternative asset
- **AssetConversion**: The alternative asset was swapped to cover native fees
- **Balances**: The transfer was executed and deposit and withdrawal events were emitted
- **System**: The transaction completed successfully

## Conclusion

Paying transaction fees with alternative tokens on Polkadot Hub provides significant flexibility for users and applications.

The key takeaway is understanding how to specify alternative assets using the XCM location format, which opens up possibilities for building applications that can operate entirely using specific token ecosystems while still leveraging the full power of the network.
