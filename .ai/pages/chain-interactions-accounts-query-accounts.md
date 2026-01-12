---
title: Query Account Information with SDKs
description: Learn how to query account information using five popular SDKs—Polkadot API (PAPI), Polkadot.js API, Dedot, Python Substrate Interface, and Subxt.
categories: Basics, Polkadot Protocol
url: https://docs.polkadot.com/chain-interactions/accounts/query-accounts/
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
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import { polkadotTestNet } from '@polkadot-api/descriptors';

    const POLKADOT_HUB_RPC = 'INSERT_WS_ENDPOINT';
    const ACCOUNT_ADDRESS = 'INSERT_ACCOUNT_ADDRESS';
    const PAS_UNITS = 10_000_000_000;

    async function main() {
      try {
        // Create the client connection
        const client = createClient(
          withPolkadotSdkCompat(getWsProvider(POLKADOT_HUB_RPC))
        );

        // Get the typed API
        const api = client.getTypedApi(polkadotTestNet);
        console.log('Connected to Polkadot Hub');

        console.log(`\nQuerying account: ${ACCOUNT_ADDRESS}\n`);

        // Query account information
        const accountInfo = await api.query.System.Account.getValue(
          ACCOUNT_ADDRESS
        );

        // Display account information
        console.log('Account Information:');
        console.log('===================');
        console.log(`Nonce: ${accountInfo.nonce}`);
        console.log(`Consumers: ${accountInfo.consumers}`);
        console.log(`Providers: ${accountInfo.providers}`);
        console.log(`Sufficients: ${accountInfo.sufficients}`);

        console.log('\nBalance Details:');
        console.log('================');
        console.log(
          `Free Balance: ${accountInfo.data.free} (${
            Number(accountInfo.data.free) / PAS_UNITS
          } PAS)`
        );
        console.log(
          `Reserved Balance: ${accountInfo.data.reserved} (${
            Number(accountInfo.data.reserved) / PAS_UNITS
          } PAS)`
        );
        console.log(
          `Frozen Balance: ${accountInfo.data.frozen} (${
            Number(accountInfo.data.frozen) / PAS_UNITS
          } PAS)`
        );

        const total =
          Number(accountInfo.data.free) + Number(accountInfo.data.reserved);
        console.log(`\nTotal Balance: ${total} (${total / PAS_UNITS} PAS)`);

        await client.destroy();
        console.log('\nDisconnected');
      } catch (error) {
        console.error('Error:', error);
        process.exit(1);
      }
    }

    main();

    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-account.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx query-account.ts</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty></span>
        <span data-ty>Querying account: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>===================</span>
        <span data-ty>Nonce: 15</span>
        <span data-ty>Consumers: 0</span>
        <span data-ty>Providers: 1</span>
        <span data-ty>Sufficients: 0</span>
        <span data-ty></span>
        <span data-ty>Balance Details:</span>
        <span data-ty>================</span>
        <span data-ty>Free Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty>Reserved Balance: 0 (0 PAS)</span>
        <span data-ty>Frozen Balance: 0 (0 PAS)</span>
        <span data-ty></span>
        <span data-ty>Total Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty></span>
        <span data-ty>Disconnected</span>
    </div>
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
    import { ApiPromise, WsProvider } from '@polkadot/api';

    const POLKADOT_HUB_RPC = 'INSERT_WS_ENDPOINT';
    const ACCOUNT_ADDRESS = 'INSERT_ACCOUNT_ADDRESS';
    const PAS_UNITS = 10_000_000_000;

    async function main() {
      // Create a WebSocket provider
      const wsProvider = new WsProvider(POLKADOT_HUB_RPC);

      // Initialize the API
      const api = await ApiPromise.create({ provider: wsProvider });
      console.log('Connected to Polkadot Hub');

      console.log(`\nQuerying account: ${ACCOUNT_ADDRESS}\n`);

      // Query account information
      const accountInfo = await api.query.system.account(ACCOUNT_ADDRESS);

      // Display account information
      console.log('Account Information:');
      console.log('===================');
      console.log(`Nonce: ${accountInfo.nonce.toString()}`);
      console.log(`Consumers: ${accountInfo.consumers.toString()}`);
      console.log(`Providers: ${accountInfo.providers.toString()}`);
      console.log(`Sufficients: ${accountInfo.sufficients.toString()}`);

      console.log('\nBalance Details:');
      console.log('================');
      console.log(
        `Free Balance: ${accountInfo.data.free.toString()} (${
          Number(accountInfo.data.free.toBigInt()) / PAS_UNITS
        } PAS)`
      );
      console.log(
        `Reserved Balance: ${accountInfo.data.reserved.toString()} (${
          Number(accountInfo.data.reserved.toBigInt()) / PAS_UNITS
        } PAS)`
      );
      console.log(
        `Frozen Balance: ${accountInfo.data.frozen.toString()} (${
          Number(accountInfo.data.frozen.toBigInt()) / PAS_UNITS
        } PAS)`
      );

      const total =
        Number(accountInfo.data.free.toBigInt()) +
        Number(accountInfo.data.reserved.toBigInt());
      console.log(`\nTotal Balance: ${total} (${total / PAS_UNITS} PAS)`);

      // Disconnect from the node
      await api.disconnect();
      console.log('\nDisconnected');
    }

    main().catch(console.error);

    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    node query-account.js
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>node query-account.js</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty></span>
        <span data-ty>Querying account: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>===================</span>
        <span data-ty>Nonce: 15</span>
        <span data-ty>Consumers: 0</span>
        <span data-ty>Providers: 1</span>
        <span data-ty>Sufficients: 0</span>
        <span data-ty></span>
        <span data-ty>Balance Details:</span>
        <span data-ty>================</span>
        <span data-ty>Free Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty>Reserved Balance: 0 (0 PAS)</span>
        <span data-ty>Frozen Balance: 0 (0 PAS)</span>
        <span data-ty></span>
        <span data-ty>Total Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty></span>
        <span data-ty>Disconnected</span>
    </div>
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
    import { DedotClient, WsProvider } from 'dedot';
    import type { PolkadotAssetHubApi } from '@dedot/chaintypes';

    const POLKADOT_HUB_RPC = 'INSERT_WS_ENDPOINT';
    const ACCOUNT_ADDRESS = 'INSERT_ACCOUNT_ADDRESS';
    const PAS_UNITS = 10_000_000_000;

    async function main() {
      // Initialize provider and client with Asset Hub types
      const provider = new WsProvider(POLKADOT_HUB_RPC);
      const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

      console.log('Connected to Polkadot Hub');

      console.log(`\nQuerying account: ${ACCOUNT_ADDRESS}\n`);

      // Query account information
      const accountInfo = await client.query.system.account(ACCOUNT_ADDRESS);

      // Display account information
      console.log('Account Information:');
      console.log('===================');
      console.log(`Nonce: ${accountInfo.nonce}`);
      console.log(`Consumers: ${accountInfo.consumers}`);
      console.log(`Providers: ${accountInfo.providers}`);
      console.log(`Sufficients: ${accountInfo.sufficients}`);

      console.log('\nBalance Details:');
      console.log('================');
      console.log(
        `Free Balance: ${accountInfo.data.free} (${
          Number(accountInfo.data.free) / PAS_UNITS
        } PAS)`
      );
      console.log(
        `Reserved Balance: ${accountInfo.data.reserved} (${
          Number(accountInfo.data.reserved) / PAS_UNITS
        } PAS)`
      );
      console.log(
        `Frozen Balance: ${accountInfo.data.frozen} (${
          Number(accountInfo.data.frozen) / PAS_UNITS
        } PAS)`
      );

      const total =
        Number(accountInfo.data.free) + Number(accountInfo.data.reserved);
      console.log(`\nTotal Balance: ${total} (${total / PAS_UNITS} PAS)`);

      // Disconnect the client
      await client.disconnect();
      console.log('\nDisconnected from Polkadot Hub');
    }

    main().catch(console.error);

    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-account.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx query-account.ts</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty></span>
        <span data-ty>Querying account: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>===================</span>
        <span data-ty>Nonce: 15</span>
        <span data-ty>Consumers: 0</span>
        <span data-ty>Providers: 1</span>
        <span data-ty>Sufficients: 0</span>
        <span data-ty></span>
        <span data-ty>Balance Details:</span>
        <span data-ty>================</span>
        <span data-ty>Free Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty>Reserved Balance: 0 (0 PAS)</span>
        <span data-ty>Frozen Balance: 0 (0 PAS)</span>
        <span data-ty></span>
        <span data-ty>Total Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty></span>
        <span data-ty>Disconnected from Polkadot Hub</span>
    </div>
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
        from substrateinterface import SubstrateInterface

        POLKADOT_HUB_RPC = "INSERT_WS_ENDPOINT"
        ACCOUNT_ADDRESS = "INSERT_ACCOUNT_ADDRESS"
        PAS_UNITS = 10_000_000_000

        def main():
            # Connect to Polkadot Hub
            substrate = SubstrateInterface(url=POLKADOT_HUB_RPC)

            print("Connected to Polkadot Hub")

            print(f"\nQuerying account: {ACCOUNT_ADDRESS}\n")

            # Query account information
            account_info = substrate.query(
                module="System", storage_function="Account", params=[ACCOUNT_ADDRESS]
            )

            # Display account information
            print("Account Information:")
            print("===================")
            print(f"Nonce: {account_info.value['nonce']}")
            print(f"Consumers: {account_info.value['consumers']}")
            print(f"Providers: {account_info.value['providers']}")
            print(f"Sufficients: {account_info.value['sufficients']}")

            print("\nBalance Details:")
            print("================")
            free_balance = account_info.value["data"]["free"]
            reserved_balance = account_info.value["data"]["reserved"]
            frozen_balance = account_info.value["data"]["frozen"]

            print(f"Free Balance: {free_balance} ({free_balance / PAS_UNITS} PAS)")
            print(
                f"Reserved Balance: {reserved_balance} ({reserved_balance / PAS_UNITS} PAS)"
            )
            print(f"Frozen Balance: {frozen_balance} ({frozen_balance / PAS_UNITS} PAS)")

            total = free_balance + reserved_balance
            print(f"\nTotal Balance: {total} ({total / PAS_UNITS} PAS)")

            # Close connection
            substrate.close()
            print("\nDisconnected")


        if __name__ == "__main__":
            main()
    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    python query_account.py
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>python3 query_account.py</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty></span>
        <span data-ty>Querying account: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>===================</span>
        <span data-ty>Nonce: 15</span>
        <span data-ty>Consumers: 0</span>
        <span data-ty>Providers: 1</span>
        <span data-ty>Sufficients: 0</span>
        <span data-ty></span>
        <span data-ty>Balance Details:</span>
        <span data-ty>================</span>
        <span data-ty>Free Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty>Reserved Balance: 0 (0.0 PAS)</span>
        <span data-ty>Frozen Balance: 0 (0.0 PAS)</span>
        <span data-ty></span>
        <span data-ty>Total Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty></span>
        <span data-ty>Disconnected</span>
    </div>
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
    use std::str::FromStr;
    use subxt::utils::AccountId32;
    use subxt::{OnlineClient, PolkadotConfig};

    // Generate an interface from the node's metadata
    #[subxt::subxt(runtime_metadata_path = "polkadot_testnet_metadata.scale")]
    pub mod polkadot_testnet {}

    const POLKADOT_TESTNET_RPC: &str = "INSERT_WS_ENDPOINT";
    const ACCOUNT_ADDRESS: &str = "INSERT_ACCOUNT_ADDRESS";
    const PAS_UNITS: u128 = 10_000_000_000;

    #[tokio::main(flavor = "current_thread")]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
        // Initialize the Subxt client
        let api = OnlineClient::<PolkadotConfig>::from_url(POLKADOT_TESTNET_RPC).await?;

        println!("Connected to Polkadot Hub");

        // Convert the account address into an AccountId32
        let account = AccountId32::from_str(ACCOUNT_ADDRESS)?;

        println!("\nQuerying account: {}\n", account);

        // Query account information
        let storage_query = polkadot_testnet::storage().system().account(account);
        let account_info = api
            .storage()
            .at_latest()
            .await?
            .fetch(&storage_query)
            .await?;

        if let Some(info) = account_info {
            // Display account information
            println!("Account Information:");
            println!("===================");
            println!("Nonce: {}", info.nonce);
            println!("Consumers: {}", info.consumers);
            println!("Providers: {}", info.providers);
            println!("Sufficients: {}", info.sufficients);

            println!("\nBalance Details:");
            println!("================");
            println!(
                "Free Balance: {} ({} PAS)",
                info.data.free,
                info.data.free as f64 / PAS_UNITS as f64
            );
            println!(
                "Reserved Balance: {} ({} PAS)",
                info.data.reserved,
                info.data.reserved as f64 / PAS_UNITS as f64
            );
            println!(
                "Frozen Balance: {} ({} PAS)",
                info.data.frozen,
                info.data.frozen as f64 / PAS_UNITS as f64
            );

            let total = info.data.free + info.data.reserved;
            println!(
                "\nTotal Balance: {} ({} PAS)",
                total,
                total as f64 / PAS_UNITS as f64
            );
        } else {
            println!("Account not found or has no data");
        }

        println!("\nDisconnected");

        Ok(())
    }
    ```

    !!! note    
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://asset-hub-paseo.dotters.network`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    cargo run --bin query_account
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>cargo run --bin query_account</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty></span>
        <span data-ty>Querying account: 5GgbDVeKZwCmMHzn58iFSgSZDTojRMM52arXnuNXto28R7mg</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>===================</span>
        <span data-ty>Nonce: 15</span>
        <span data-ty>Consumers: 0</span>
        <span data-ty>Providers: 1</span>
        <span data-ty>Sufficients: 0</span>
        <span data-ty></span>
        <span data-ty>Balance Details:</span>
        <span data-ty>================</span>
        <span data-ty>Free Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty>Reserved Balance: 0 (0 PAS)</span>
        <span data-ty>Frozen Balance: 0 (0 PAS)</span>
        <span data-ty></span>
        <span data-ty>Total Balance: 59781317040 (5.978131704 PAS)</span>
        <span data-ty></span>
        <span data-ty>Disconnected</span>
    </div>
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
