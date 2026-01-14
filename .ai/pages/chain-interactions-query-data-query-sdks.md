---
title: Query On-Chain State with SDKs
description: Learn how to query on-chain storage data on Polkadot Hub using PAPI, Polkadot.js, Dedot, Python Substrate Interface, and Subxt.
categories: Chain Interactions
url: https://docs.polkadot.com/chain-interactions/query-data/query-sdks/
---

# Query On-Chain State with SDKs

## Introduction

Polkadot SDK-based blockchains store data in a key-value database that external applications can query. This on-chain state includes account balances, asset information, governance proposals, and any other data the runtime manages.

This guide demonstrates how to query on-chain storage using five popular SDKs:

- **[Polkadot API (PAPI)](/reference/tools/papi/){target=\_blank}**: Modern TypeScript library with type-safe APIs
- **[Polkadot.js API](/reference/tools/polkadot-js-api/){target=\_blank}**: Comprehensive JavaScript library (maintenance mode)
- **[Dedot](/reference/tools/dedot/){target=\_blank}**: Lightweight TypeScript library optimized for performance
- **[Python Substrate Interface](/reference/tools/py-substrate-interface/){target=\_blank}**: Python library for Substrate chains
- **[Subxt](/reference/tools/subxt/){target=\_blank}**: Rust library with compile-time type safety

Select your preferred SDK below to see complete, runnable examples that query Polkadot Hub for account balances and asset information.

## Query On-Chain Data

=== "PAPI"

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

    Create a file named `query-balance.ts` and add the following code to it:

    ```typescript title="query-balance.ts"
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/node';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import { pah } from '@polkadot-api/descriptors';

    const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

    // Example address to query (Polkadot Hub address)
    const ADDRESS = 'INSERT_ADDRESS';

    async function main() {
      // Create the client connection
      const client = createClient(
        withPolkadotSdkCompat(getWsProvider(ASSET_HUB_RPC))
      );

      // Get the typed API for Polkadot Hub
      const api = client.getTypedApi(pah);

      console.log('Connected to Polkadot Hub');
      console.log(`Querying balance for: ${ADDRESS}\n`);

      // Query the System.Account storage
      const accountInfo = await api.query.System.Account.getValue(ADDRESS);

      // Extract balance information
      const { data, nonce } = accountInfo;
      const { free, reserved, frozen } = data;

      console.log('Account Information:');
      console.log(`  Nonce: ${nonce}`);
      console.log(`  Free Balance: ${free}`);
      console.log(`  Reserved: ${reserved}`);
      console.log(`  Frozen: ${frozen}`);

      // Disconnect the client
      client.destroy();
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-balance.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx query-balance.ts</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>  Nonce: 0</span>
        <span data-ty>  Free Balance: 0</span>
        <span data-ty>  Reserved: 0</span>
        <span data-ty>  Frozen: 0</span>
    </div>

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query-asset.ts` and add the following code to it:

    ```typescript title="query-asset.ts"
    import { createClient } from 'polkadot-api';
    import { getWsProvider } from 'polkadot-api/ws-provider/node';
    import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
    import { pah } from '@polkadot-api/descriptors';

    const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

    // USDT on Polkadot Hub
    const USDT_ASSET_ID = 1984;

    // Example address to query asset balance
    const ADDRESS = 'INSERT_ADDRESS';

    async function main() {
      // Create the client connection
      const client = createClient(
        withPolkadotSdkCompat(getWsProvider(ASSET_HUB_RPC))
      );

      // Get the typed API for Polkadot Hub
      const api = client.getTypedApi(pah);

      console.log('Connected to Polkadot Hub');
      console.log(`Querying asset ID: ${USDT_ASSET_ID}\n`);

      // Query asset metadata
      const assetMetadata = await api.query.Assets.Metadata.getValue(USDT_ASSET_ID);

      if (assetMetadata) {
        console.log('Asset Metadata:');
        console.log(`  Name: ${assetMetadata.name.asText()}`);
        console.log(`  Symbol: ${assetMetadata.symbol.asText()}`);
        console.log(`  Decimals: ${assetMetadata.decimals}`);
      }

      // Query asset details
      const assetDetails = await api.query.Assets.Asset.getValue(USDT_ASSET_ID);

      if (assetDetails) {
        console.log('\nAsset Details:');
        console.log(`  Owner: ${assetDetails.owner}`);
        console.log(`  Supply: ${assetDetails.supply}`);
        console.log(`  Accounts: ${assetDetails.accounts}`);
        console.log(`  Min Balance: ${assetDetails.min_balance}`);
        console.log(`  Status: ${assetDetails.status.type}`);
      }

      // Query account's asset balance
      console.log(`\nQuerying asset balance for: ${ADDRESS}`);
      const assetAccount = await api.query.Assets.Account.getValue(
        USDT_ASSET_ID,
        ADDRESS
      );

      if (assetAccount) {
        console.log('\nAsset Account:');
        console.log(`  Balance: ${assetAccount.balance}`);
        console.log(`  Status: ${assetAccount.status.type}`);
      } else {
        console.log('\nNo asset balance found for this account');
      }

      // Disconnect the client
      client.destroy();
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-asset.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx query-asset.ts</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying asset ID: 1984</span>
        <span data-ty></span>
        <span data-ty>Asset Metadata:</span>
        <span data-ty>  Name: Tether USD</span>
        <span data-ty>  Symbol: USDT</span>
        <span data-ty>  Decimals: 6</span>
        <span data-ty></span>
        <span data-ty>Asset Details:</span>
        <span data-ty>  Owner: 15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X</span>
        <span data-ty>  Supply: 77998622834581</span>
        <span data-ty>  Accounts: 13544</span>
        <span data-ty>  Min Balance: 10000</span>
        <span data-ty>  Status: Live</span>
        <span data-ty></span>
        <span data-ty>Querying asset balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>No asset balance found for this account</span>
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
        mkdir pjs-query-example && cd pjs-query-example && \
        npm init -y && npm pkg set type=module
        ```

    2. Install dependencies:

        ```bash
        npm install @polkadot/api
        ```

    **Query Account Balance**

    The following example queries the `System.Account` storage to retrieve an account's native token balance.

    Create a file named `query-balance.js` and add the following code to it:

    ```javascript title="query-balance.js"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

    // Example address to query (Polkadot Hub address)
    const ADDRESS = 'INSERT_ADDRESS';

    async function main() {
      // Create a WebSocket provider
      const wsProvider = new WsProvider(ASSET_HUB_RPC);

      // Initialize the API
      const api = await ApiPromise.create({ provider: wsProvider });

      console.log('Connected to Polkadot Hub');
      console.log(`Querying balance for: ${ADDRESS}\n`);

      // Query the system.account storage
      const accountInfo = await api.query.system.account(ADDRESS);

      // Extract balance information
      const { nonce, data } = accountInfo;
      const { free, reserved, frozen } = data;

      console.log('Account Information:');
      console.log(`  Nonce: ${nonce.toString()}`);
      console.log(`  Free Balance: ${free.toString()}`);
      console.log(`  Reserved: ${reserved.toString()}`);
      console.log(`  Frozen: ${frozen.toString()}`);

      // Disconnect from the node
      await api.disconnect();
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    node query-balance.js
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>node query-balance.js</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>  Nonce: 0</span>
        <span data-ty>  Free Balance: 0</span>
        <span data-ty>  Reserved: 0</span>
        <span data-ty>  Frozen: 0</span>
    </div>

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query-asset.js` and add the following code to it:

    ```javascript title="query-asset.js"
    import { ApiPromise, WsProvider } from '@polkadot/api';

    const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

    // USDT on Polkadot Hub
    const USDT_ASSET_ID = 1984;

    // Example address to query asset balance
    const ADDRESS = 'INSERT_ADDRESS';

    async function main() {
      // Create a WebSocket provider
      const wsProvider = new WsProvider(ASSET_HUB_RPC);

      // Initialize the API
      const api = await ApiPromise.create({ provider: wsProvider });

      console.log('Connected to Polkadot Hub');
      console.log(`Querying asset ID: ${USDT_ASSET_ID}\n`);

      // Query asset metadata
      const assetMetadata = await api.query.assets.metadata(USDT_ASSET_ID);

      console.log('Asset Metadata:');
      console.log(`  Name: ${assetMetadata.name.toUtf8()}`);
      console.log(`  Symbol: ${assetMetadata.symbol.toUtf8()}`);
      console.log(`  Decimals: ${assetMetadata.decimals.toString()}`);

      // Query asset details
      const assetDetails = await api.query.assets.asset(USDT_ASSET_ID);

      if (assetDetails.isSome) {
        const details = assetDetails.unwrap();
        console.log('\nAsset Details:');
        console.log(`  Owner: ${details.owner.toString()}`);
        console.log(`  Supply: ${details.supply.toString()}`);
        console.log(`  Accounts: ${details.accounts.toString()}`);
        console.log(`  Min Balance: ${details.minBalance.toString()}`);
        console.log(`  Status: ${details.status.type}`);
      }

      // Query account's asset balance
      console.log(`\nQuerying asset balance for: ${ADDRESS}`);
      const assetAccount = await api.query.assets.account(USDT_ASSET_ID, ADDRESS);

      if (assetAccount.isSome) {
        const account = assetAccount.unwrap();
        console.log('\nAsset Account:');
        console.log(`  Balance: ${account.balance.toString()}`);
        console.log(`  Status: ${account.status.type}`);
      } else {
        console.log('\nNo asset balance found for this account');
      }

      // Disconnect from the node
      await api.disconnect();
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.
    
    Run the script:

    ```bash
    node query-asset.js
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>node query-asset.js</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying asset ID: 1984</span>
        <span data-ty></span>
        <span data-ty>Asset Metadata:</span>
        <span data-ty>  Name: Tether USD</span>
        <span data-ty>  Symbol: USDT</span>
        <span data-ty>  Decimals: 6</span>
        <span data-ty></span>
        <span data-ty>Asset Details:</span>
        <span data-ty>  Owner: 15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X</span>
        <span data-ty>  Supply: 77998622834581</span>
        <span data-ty>  Accounts: 13544</span>
        <span data-ty>  Min Balance: 10000</span>
        <span data-ty>  Status: Live</span>
        <span data-ty></span>
        <span data-ty>Querying asset balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>No asset balance found for this account</span>
    </div>

=== "Dedot"

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

    Create a file named `query-balance.ts` and add the following code to it:

    ```typescript title="query-balance.ts"
    import { DedotClient, WsProvider } from 'dedot';
    import type { PolkadotAssetHubApi } from '@dedot/chaintypes';

    const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

    // Example address to query (Polkadot Hub address)
    const ADDRESS = 'INSERT_ADDRESS';

    async function main() {
      // Initialize provider and client with Asset Hub types
      const provider = new WsProvider(ASSET_HUB_RPC);
      const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

      console.log('Connected to Polkadot Hub');
      console.log(`Querying balance for: ${ADDRESS}\n`);

      // Query the system.account storage
      const accountInfo = await client.query.system.account(ADDRESS);

      // Extract balance information
      const { nonce, data } = accountInfo;
      const { free, reserved, frozen } = data;

      console.log('Account Information:');
      console.log(`  Nonce: ${nonce}`);
      console.log(`  Free Balance: ${free}`);
      console.log(`  Reserved: ${reserved}`);
      console.log(`  Frozen: ${frozen}`);

      // Disconnect the client
      await client.disconnect();
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-balance.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx query-balance.ts</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>  Nonce: 0</span>
        <span data-ty>  Free Balance: 0</span>
        <span data-ty>  Reserved: 0</span>
        <span data-ty>  Frozen: 0</span>
    </div>

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query-asset.ts` and add the following code to it:

    ```typescript title="query-asset.ts"
    import { DedotClient, WsProvider } from 'dedot';
    import { hexToString } from 'dedot/utils';
    import type { PolkadotAssetHubApi } from '@dedot/chaintypes';

    const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

    // USDT on Polkadot Hub
    const USDT_ASSET_ID = 1984;

    // Example address to query asset balance
    const ADDRESS = 'INSERT_ADDRESS';

    async function main() {
      // Initialize provider and client with Asset Hub types
      const provider = new WsProvider(ASSET_HUB_RPC);
      const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

      console.log('Connected to Polkadot Hub');
      console.log(`Querying asset ID: ${USDT_ASSET_ID}\n`);

      // Query asset metadata
      const assetMetadata = await client.query.assets.metadata(USDT_ASSET_ID);

      console.log('Asset Metadata:');
      console.log(`  Name: ${hexToString(assetMetadata.name)}`);
      console.log(`  Symbol: ${hexToString(assetMetadata.symbol)}`);
      console.log(`  Decimals: ${assetMetadata.decimals}`);

      // Query asset details
      const assetDetails = await client.query.assets.asset(USDT_ASSET_ID);

      if (assetDetails) {
        console.log('\nAsset Details:');
        console.log(`  Owner: ${assetDetails.owner.address()}`);
        console.log(`  Supply: ${assetDetails.supply}`);
        console.log(`  Accounts: ${assetDetails.accounts}`);
        console.log(`  Min Balance: ${assetDetails.minBalance}`);
        console.log(`  Status: ${JSON.stringify(assetDetails.status)}`);
      }

      // Query account's asset balance
      console.log(`\nQuerying asset balance for: ${ADDRESS}`);
      const assetAccount = await client.query.assets.account([
        USDT_ASSET_ID,
        ADDRESS,
      ]);

      if (assetAccount) {
        console.log('\nAsset Account:');
        console.log(`  Balance: ${assetAccount.balance}`);
        console.log(`  Status: ${JSON.stringify(assetAccount.status)}`);
      } else {
        console.log('\nNo asset balance found for this account');
      }

      // Disconnect the client
      await client.disconnect();
    }

    main().catch(console.error);

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    npx tsx query-asset.ts
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>npx tsx query-asset.ts</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying asset ID: 1984</span>
        <span data-ty></span>
        <span data-ty>Asset Metadata:</span>
        <span data-ty>  Name: Tether USD</span>
        <span data-ty>  Symbol: USDT</span>
        <span data-ty>  Decimals: 6</span>
        <span data-ty></span>
        <span data-ty>Asset Details:</span>
        <span data-ty>  Owner: 5Gy6UDPQNFG6vBLnwn3VyFSMAisgw1yP2kJuo2Gn8XhUD8V8</span>
        <span data-ty>  Supply: 77998622834581</span>
        <span data-ty>  Accounts: 13544</span>
        <span data-ty>  Min Balance: 10000</span>
        <span data-ty>  Status: "Live"</span>
        <span data-ty></span>
        <span data-ty>Querying asset balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>No asset balance found for this account</span>
    </div>

=== "Py Substrate Interface"

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

    Create a file named `query_balance.py` and add the following code to it:

    ```python title="query_balance.py"
    from substrateinterface import SubstrateInterface

    ASSET_HUB_RPC = "INSERT_WS_ENDPOINT"

    # Example address to query (Polkadot Hub address)
    ADDRESS = "INSERT_ADDRESS"


    def main():
        # Connect to Polkadot Hub
        substrate = SubstrateInterface(url=ASSET_HUB_RPC)

        print("Connected to Polkadot Hub")
        print(f"Querying balance for: {ADDRESS}\n")

        # Query the System.Account storage
        account_info = substrate.query(
            module="System",
            storage_function="Account",
            params=[ADDRESS],
        )

        # Extract balance information
        nonce = account_info.value["nonce"]
        data = account_info.value["data"]
        free = data["free"]
        reserved = data["reserved"]
        frozen = data["frozen"]

        print("Account Information:")
        print(f"  Nonce: {nonce}")
        print(f"  Free Balance: {free}")
        print(f"  Reserved: {reserved}")
        print(f"  Frozen: {frozen}")

        # Close connection
        substrate.close()


    if __name__ == "__main__":
        main()

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    python query_balance.py
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>python query_balance.py</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>Account Information:</span>
        <span data-ty>  Nonce: 0</span>
        <span data-ty>  Free Balance: 0</span>
        <span data-ty>  Reserved: 0</span>
        <span data-ty>  Frozen: 0</span>
    </div>

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file named `query_asset.py` and add the following code to it:

    ```python title="query_asset.py"
    from substrateinterface import SubstrateInterface

    ASSET_HUB_RPC = "INSERT_WS_ENDPOINT"

    # USDT on Polkadot Hub
    USDT_ASSET_ID = 1984

    # Example address to query asset balance
    ADDRESS = "INSERT_ADDRESS"


    def main():
        # Connect to Polkadot Hub
        substrate = SubstrateInterface(url=ASSET_HUB_RPC)

        print("Connected to Polkadot Hub")
        print(f"Querying asset ID: {USDT_ASSET_ID}\n")

        # Query asset metadata
        asset_metadata = substrate.query(
            module="Assets",
            storage_function="Metadata",
            params=[USDT_ASSET_ID],
        )

        if asset_metadata.value:
            metadata = asset_metadata.value
            print("Asset Metadata:")
            print(f"  Name: {metadata['name']}")
            print(f"  Symbol: {metadata['symbol']}")
            print(f"  Decimals: {metadata['decimals']}")

        # Query asset details
        asset_details = substrate.query(
            module="Assets",
            storage_function="Asset",
            params=[USDT_ASSET_ID],
        )

        if asset_details.value:
            details = asset_details.value
            print("\nAsset Details:")
            print(f"  Owner: {details['owner']}")
            print(f"  Supply: {details['supply']}")
            print(f"  Accounts: {details['accounts']}")
            print(f"  Min Balance: {details['min_balance']}")
            print(f"  Status: {details['status']}")

        # Query account's asset balance
        print(f"\nQuerying asset balance for: {ADDRESS}")
        asset_account = substrate.query(
            module="Assets",
            storage_function="Account",
            params=[USDT_ASSET_ID, ADDRESS],
        )

        if asset_account.value:
            account = asset_account.value
            print("\nAsset Account:")
            print(f"  Balance: {account['balance']}")
            print(f"  Status: {account['status']}")
        else:
            print("\nNo asset balance found for this account")

        # Close connection
        substrate.close()


    if __name__ == "__main__":
        main()

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    python query_asset.py
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>python query_asset.py</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying asset ID: 1984</span>
        <span data-ty></span>
        <span data-ty>Asset Metadata:</span>
        <span data-ty>  Name: Tether USD</span>
        <span data-ty>  Symbol: USDT</span>
        <span data-ty>  Decimals: 6</span>
        <span data-ty></span>
        <span data-ty>Asset Details:</span>
        <span data-ty>  Owner: 5Gy6UDPQNFG6vBLnwn3VyFSMAisgw1yP2kJuo2Gn8XhUD8V8</span>
        <span data-ty>  Supply: 77998622834581</span>
        <span data-ty>  Accounts: 13545</span>
        <span data-ty>  Min Balance: 10000</span>
        <span data-ty>  Status: Live</span>
        <span data-ty></span>
        <span data-ty>Querying asset balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>No asset balance found for this account</span>
    </div>

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
        cargo install subxt-cli@0.44.0
        ```

    3. Download the Polkadot Hub metadata:

        ```bash
        subxt metadata --url INSERT_WS_ENDPOINT -o asset_hub_metadata.scale
        ```

        !!! note
            Ensure to replace `INSERT_WS_ENDPOINT` with the proper WebSocket endpoint, such as `wss://polkadot-asset-hub-rpc.polkadot.io` for Polkadot Hub.

    4. Update `Cargo.toml` with the required dependencies:

        ```toml title="Cargo.toml"
        [package]
        name = "subxt-query-example"
        version = "0.1.0"
        edition = "2021"

        [[bin]]
        name = "query_balance"
        path = "src/bin/query_balance.rs"

        [[bin]]
        name = "query_asset"
        path = "src/bin/query_asset.rs"

        [dependencies]
        subxt = "0.44.0"
        tokio = { version = "1", features = ["rt", "macros"] }

        ```

    **Query Account Balance**

    The following example queries the `System.Account` storage to retrieve an account's native token balance.

    Create a file at `src/bin/query_balance.rs` and add the following code to it:

    ```rust title="src/bin/query_balance.rs"
    use std::str::FromStr;
    use subxt::utils::AccountId32;
    use subxt::{OnlineClient, PolkadotConfig};

    // Generate an interface from the node's metadata
    #[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
    pub mod asset_hub {}

    const ASSET_HUB_RPC: &str = "INSERT_WS_ENDPOINT";

    // Example address to query (Polkadot Hub address)
    const ADDRESS: &str = "INSERT_ADDRESS";

    #[tokio::main(flavor = "current_thread")]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
        // Initialize the Subxt client
        let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

        println!("Connected to Polkadot Hub");
        println!("Querying balance for: {}\n", ADDRESS);

        // Parse the address
        let account = AccountId32::from_str(ADDRESS)?;

        // Build storage query for System.Account
        let storage_query = asset_hub::storage().system().account(account);

        // Fetch the account information
        let account_info = api
            .storage()
            .at_latest()
            .await?
            .fetch(&storage_query)
            .await?;

        match account_info {
            Some(info) => {
                println!("Account Information:");
                println!("  Nonce: {}", info.nonce);
                println!("  Free Balance: {}", info.data.free);
                println!("  Reserved: {}", info.data.reserved);
                println!("  Frozen: {}", info.data.frozen);
            }
            None => {
                println!("Account not found");
            }
        }

        Ok(())
    }

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    cargo run --bin query_balance
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>cargo run --bin query_balance</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>Account not found</span>
    </div>

    !!! note
        Subxt's `fetch()` method returns `None` for accounts with zero balance that have no on-chain storage entry, resulting in "Account not found". Accounts with activity will display their balance information.

    **Query Asset Information**

    The following example queries the `Assets` pallet to retrieve metadata and balance information for USDT (asset ID 1984).

    Create a file at `src/bin/query_asset.rs` and add the following code to it:

    ```rust title="src/bin/query_asset.rs"
    use std::str::FromStr;
    use subxt::utils::AccountId32;
    use subxt::{OnlineClient, PolkadotConfig};

    // Generate an interface from the node's metadata
    #[subxt::subxt(runtime_metadata_path = "asset_hub_metadata.scale")]
    pub mod asset_hub {}

    const ASSET_HUB_RPC: &str = "INSERT_WS_ENDPOINT";

    // USDT on Polkadot Hub
    const USDT_ASSET_ID: u32 = 1984;

    // Example address to query asset balance
    const ADDRESS: &str = "INSERT_ADDRESS";

    #[tokio::main(flavor = "current_thread")]
    async fn main() -> Result<(), Box<dyn std::error::Error>> {
        // Initialize the Subxt client
        let api = OnlineClient::<PolkadotConfig>::from_url(ASSET_HUB_RPC).await?;

        println!("Connected to Polkadot Hub");
        println!("Querying asset ID: {}\n", USDT_ASSET_ID);

        // Query asset metadata
        let metadata_query = asset_hub::storage().assets().metadata(USDT_ASSET_ID);
        let metadata = api
            .storage()
            .at_latest()
            .await?
            .fetch(&metadata_query)
            .await?;

        if let Some(meta) = metadata {
            println!("Asset Metadata:");
            println!(
                "  Name: {}",
                String::from_utf8_lossy(&meta.name.0)
            );
            println!(
                "  Symbol: {}",
                String::from_utf8_lossy(&meta.symbol.0)
            );
            println!("  Decimals: {}", meta.decimals);
        }

        // Query asset details
        let asset_query = asset_hub::storage().assets().asset(USDT_ASSET_ID);
        let asset_details = api
            .storage()
            .at_latest()
            .await?
            .fetch(&asset_query)
            .await?;

        if let Some(details) = asset_details {
            println!("\nAsset Details:");
            println!("  Owner: {}", details.owner);
            println!("  Supply: {}", details.supply);
            println!("  Accounts: {}", details.accounts);
            println!("  Min Balance: {}", details.min_balance);
        }

        // Query account's asset balance
        let account = AccountId32::from_str(ADDRESS)?;
        println!("\nQuerying asset balance for: {}", ADDRESS);

        let account_query = asset_hub::storage()
            .assets()
            .account(USDT_ASSET_ID, account);
        let asset_account = api
            .storage()
            .at_latest()
            .await?
            .fetch(&account_query)
            .await?;

        match asset_account {
            Some(account) => {
                println!("\nAsset Account:");
                println!("  Balance: {}", account.balance);
            }
            None => {
                println!("\nNo asset balance found for this account");
            }
        }

        Ok(())
    }

    ```

    !!! note
        Ensure to replace `INSERT_WS_ENDPOINT` with a valid WebSocket endpoint (e.g., `wss://polkadot-asset-hub-rpc.polkadot.io`) and `INSERT_ADDRESS` with the account address you want to query.

    Run the script:

    ```bash
    cargo run --bin query_asset
    ```

    You should see output similar to:

    <div class="termynal" data-termynal>
        <span data-ty="input"><span class="file-path"></span>cargo run --bin query_asset</span>
        <span data-ty>Connected to Polkadot Hub</span>
        <span data-ty>Querying asset ID: 1984</span>
        <span data-ty></span>
        <span data-ty>Asset Metadata:</span>
        <span data-ty>  Name: Tether USD</span>
        <span data-ty>  Symbol: USDT</span>
        <span data-ty>  Decimals: 6</span>
        <span data-ty></span>
        <span data-ty>Asset Details:</span>
        <span data-ty>  Owner: 5Gy6UDPQNFG6vBLnwn3VyFSMAisgw1yP2kJuo2Gn8XhUD8V8</span>
        <span data-ty>  Supply: 77998622834581</span>
        <span data-ty>  Accounts: 13545</span>
        <span data-ty>  Min Balance: 10000</span>
        <span data-ty></span>
        <span data-ty>Querying asset balance for: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3</span>
        <span data-ty></span>
        <span data-ty>No asset balance found for this account</span>
    </div>

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge guide">Guide</span> **Runtime API Calls**

    ---

    Execute runtime APIs for specialized queries.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/runtime-api-calls/)

- <span class="badge guide">Guide</span> **Send Transactions**

    ---

    Learn how to construct and submit transactions.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/with-sdks/)

</div>
