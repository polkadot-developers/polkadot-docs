---
title: Query On-Chain State with Sidecar REST API
description: Learn how to query on-chain state on Polkadot using the Sidecar REST API with curl, including account balances, asset data, and block information.
categories: Chain Interactions
url: https://docs.polkadot.com/chain-interactions/query-data/query-rest/
---

# Query On-Chain State with Sidecar REST API

## Introduction

[Substrate API Sidecar](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} is a REST service that makes it easy to interact with Polkadot SDK-based blockchains. It provides a simple HTTP interface to query account balances, asset information, block data, and other on-chain state without requiring WebSocket connections or SDK integrations.

This guide demonstrates how to query on-chain storage using the Sidecar REST API with `curl` commands. You'll learn to retrieve account balances, asset metadata, and block information from Polkadot Hub.

## Prerequisites

- [curl](https://curl.se/){target=\_blank} or any HTTP client
- Access to a Sidecar instance (public or self-hosted)

## Running Sidecar Locally

For production applications or high-frequency queries, run your own Sidecar instance.

=== "Using npm"

    ```bash
    # Install globally
    npm install -g @substrate/api-sidecar

    # Run with default settings (connects to ws://127.0.0.1:9944)
    substrate-api-sidecar

    # Run with custom node URL
    SAS_SUBSTRATE_URL=wss://polkadot-asset-hub-rpc.polkadot.io substrate-api-sidecar
    ```
=== "Using Docker"

    ```bash
    docker run --rm -p 8080:8080 \
      -e SAS_SUBSTRATE_URL=wss://polkadot-asset-hub-rpc.polkadot.io \
      parity/substrate-api-sidecar
    ```

Once running, access your local instance at `http://localhost:8080`.

## Public Sidecar Endpoints

Parity provides public Sidecar instances for Polkadot ecosystem chains:

| Chain | Endpoint |
|-------|----------|
| Polkadot | `https://polkadot-public-sidecar.parity-chains.parity.io` |
| Kusama | `https://kusama-public-sidecar.parity-chains.parity.io` |
| Polkadot Hub | `https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io` |
| Kusama Hub | `https://kusama-asset-hub-public-sidecar.parity-chains.parity.io` |

For production applications, consider running your own Sidecar instance. See [Running Sidecar Locally](#running-sidecar-locally) for instructions.

## Query Account Balance

The `/accounts/{accountId}/balance-info` endpoint returns an account's native token balance, including free, reserved, and frozen amounts.

**Request**

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/balance-info"
```

**Response**

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/INSERT_ADDRESS/balance-info"</span>
  <pre>
{
  "at": {
    "hash": "0xb909e50be96fc0f939588c4a7730670f9ee53c67d95d516198530e5cfe189d6c",
    "height": "10646569"
  },
  "nonce": "0",
  "tokenSymbol": "DOT",
  "free": "10000000000",
  "reserved": "0",
  "frozen": "0",
  "transferable": "10000000000",
  "locks": []
}
</pre
  >
</div>

**Response fields**

| Field | Description |
|-------|-------------|
| `at.hash` | Block hash at which the query was executed |
| `at.height` | Block number at which the query was executed |
| `nonce` | Number of transactions sent from this account |
| `tokenSymbol` | Native token symbol of the chain |
| `free` | Balance available for transfers (in planck) |
| `reserved` | Balance locked for on-chain activities |
| `frozen` | Balance frozen and unavailable for transfers |
| `transferable` | Actual balance available to transfer |
| `locks` | Array of balance locks with their reasons |

**Query at a specific block**

You can query the balance at a specific block height or hash using the `at` query parameter:

```bash
# Query at block height
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/balance-info?at=10000000"

# Query at block hash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/balance-info?at=0x..."
```

## Query Asset Balances

The `/accounts/{accountId}/asset-balances` endpoint returns an account's balances for assets managed by the Assets pallet.

**Request all asset balances**

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/asset-balances"
```

**Request Specific Asset Balance**

To query a specific asset, provide the asset ID as a query parameter:

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/asset-balances?assets[]=<INSERT_ASSET_ID>"
```

??? example "Query USDT balance"

    USDT on Polkadot Hub has asset ID `1984`. To query a specific account's USDT balance:

    ```bash
    curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/asset-balances?assets[]=1984"
    ```

**Response**

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/INSERT_ADDRESS/asset-balances?assets[]=1984"</span>
  <pre>
{
  "at": {
    "hash": "0x826f74ae5f6fea33383075156231de5ca8e0ddb308b3f799c9bd64463ed8cb5b",
    "height": "10646570"
  },
  "assets": [
    {
      "assetId": "1984",
      "balance": "1000000",
      "isFrozen": false,
      "isSufficient": false
    }
  ]
}
</pre
  >
</div>

**Response fields**

| Field | Description |
|-------|-------------|
| `at.hash` | Block hash at which the query was executed |
| `at.height` | Block number at which the query was executed |
| `assetId` | Unique identifier for the asset |
| `balance` | Account's balance of this asset (in smallest unit) |
| `isFrozen` | Whether the account's asset balance is frozen |
| `isSufficient` | Whether this account's existence is being paid for by this asset balance (per-account flag, not the asset's global sufficiency setting) |

!!! note
    The `isSufficient` field in the asset balance response is a per-account flag. To check if an asset is configured as a sufficient asset (can pay for account existence), query the [Asset Details](#query-asset-details) endpoint and check the `isSufficient` field there.

**Query multiple assets**

You can query multiple assets in a single request:

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/asset-balances?assets[]=<INSERT_ASSET_ID_1>&assets[]=<INSERT_ASSET_ID_2>"
```

??? example "Query USDT and USDC balances"

    Query both USDT (asset ID `1984`) and USDC (asset ID `1337`) in a single request:

    ```bash
    curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/asset-balances?assets[]=1984&assets[]=1337"
    ```

## Query Asset Metadata

Use the pallet storage endpoint to query asset metadata like name, symbol, and decimals.

**Request**

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/pallets/assets/storage/Metadata?keys[]=1984"
```

**Response**

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/pallets/assets/storage/Metadata?keys[]=1984"</span>
  <pre>
{
  "at": {
    "hash": "0xaf0628855a206da5e95e564b58b9a0bfc490cc8de047a0521252b631be77fac7",
    "height": "10646571"
  },
  "pallet": "assets",
  "palletIndex": "50",
  "storageItem": "metadata",
  "keys": ["1984"],
  "value": {
    "deposit": "2008200000",
    "name": "0x54657468657220555344",
    "symbol": "0x55534474",
    "decimals": "6",
    "isFrozen": false
  }
}
</pre
  >
</div>

**Response fields**

| Field | Description |
|-------|-------------|
| `at.hash` | Block hash at which the query was executed |
| `at.height` | Block number at which the query was executed |
| `pallet` | Name of the pallet containing the storage item |
| `palletIndex` | Numeric index of the pallet in the runtime |
| `storageItem` | Name of the storage item being queried |
| `keys` | Array of keys used to query the storage map |
| `value.deposit` | Deposit held for storing this metadata |
| `value.name` | Asset name (hex-encoded string) |
| `value.symbol` | Asset symbol (hex-encoded string) |
| `value.decimals` | Number of decimal places for display |
| `value.isFrozen` | Whether the asset metadata is frozen |

The `name` and `symbol` fields are returned as hex-encoded strings. To decode them:

- `0x54657468657220555344` decodes to "Tether USD"
- `0x55534474` decodes to "USDt"

## Query Asset Details

Query the asset configuration including owner, supply, and account count:

**Request**

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/pallets/assets/storage/Asset?keys[]=1984"
```

**Response**

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/pallets/assets/storage/Asset?keys[]=1984"</span>
  <pre>
{
  "at": {
    "hash": "0xaf0628855a206da5e95e564b58b9a0bfc490cc8de047a0521252b631be77fac7",
    "height": "10646571"
  },
  "pallet": "assets",
  "palletIndex": "50",
  "storageItem": "asset",
  "keys": ["1984"],
  "value": {
    "owner": "15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X",
    "issuer": "15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X",
    "admin": "15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X",
    "freezer": "15uPcYeUE2XaMiMJuR6W7QGW2LsLdKXX7F3PxKG8gcizPh3X",
    "supply": "77998622834557",
    "deposit": "1000000000000",
    "minBalance": "10000",
    "isSufficient": true,
    "accounts": "13572",
    "sufficients": "13465",
    "approvals": "18",
    "status": "Live"
  }
}
</pre
  >
</div>

**Response fields**

| Field | Description |
|-------|-------------|
| `at.hash` | Block hash at which the query was executed |
| `at.height` | Block number at which the query was executed |
| `pallet` | Name of the pallet containing the storage item |
| `palletIndex` | Numeric index of the pallet in the runtime |
| `storageItem` | Name of the storage item being queried |
| `keys` | Array of keys used to query the storage map |
| `owner` | Account that owns the asset |
| `issuer` | Account authorized to mint new tokens |
| `admin` | Account with administrative privileges |
| `freezer` | Account that can freeze balances |
| `supply` | Total supply of the asset (in smallest unit) |
| `minBalance` | Minimum balance required to hold this asset |
| `isSufficient` | Whether this asset can pay for account existence (accounts holding only this asset don't need native tokens) |
| `accounts` | Number of accounts holding this asset |
| `sufficients` | Number of accounts whose existence is paid for by this asset |
| `status` | Asset status (Live, Frozen, or Destroying) |

## Query Foreign Asset Balances

For cross-chain assets (foreign assets), use the `/accounts/{accountId}/foreign-asset-balances` endpoint:

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/accounts/<INSERT_ADDRESS>/foreign-asset-balances"
```

## Query Block Information

The `/blocks/{blockId}` endpoint returns detailed block information including extrinsics and events.

**Request latest block**

```bash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/blocks/head"
```

**Request specific block**

```bash
# By block number
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/blocks/10000000"

# By block hash
curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/blocks/0x..."
```

**Response**

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>curl -s "https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/blocks/10646572"</span>
  <pre>
{
  "number": "10646572",
  "hash": "0x5abb54c72ffe3c342536f6e34a8558445ef23a460ae8a6fb366af6d9105c3950",
  "parentHash": "0xaf0628855a206da5e95e564b58b9a0bfc490cc8de047a0521252b631be77fac7",
  "stateRoot": "0x0be63683f15de9dff2d1553d4904ec3f446b244cfbf7aa69afa1b2faee824688",
  "extrinsicsRoot": "0xb4f58daf2791928cebcd1cdee3c51487127824dc0ba4e9b4b9b4be6af6c09b79",
  "authorId": "12owmS8Sobqxfx6KK9vk9e67FqnGpZdmxCFCRFptzZdsoujC",
  "logs": [
    {
      "type": "PreRuntime",
      "index": "6",
      "value": ["0x61757261", "0x35fdc30800000000"]
    }
  ],
  "onInitialize": {
    "events": []
  },
  "extrinsics": [
    {
      "method": {
        "pallet": "timestamp",
        "method": "set"
      },
      "signature": null,
      "nonce": null,
      "args": {
        "now": "1733237652000"
      },
      "tip": null,
      "hash": "0x...",
      "info": {},
      "era": {
        "immortalEra": "0x00"
      },
      "events": [],
      "success": true,
      "paysFee": false
    }
  ],
  "onFinalize": {
    "events": []
  },
  "finalized": true
}
</pre
  >
</div>

## API Reference

For a complete list of endpoints and parameters, see the [Sidecar API Documentation](https://paritytech.github.io/substrate-api-sidecar/docsv2/){target=\_blank}.

## Where to Go Next

Now that you understand how to query on-chain state with the REST API, explore these related topics:

<div class="grid cards" markdown>

-   __Query with SDKs__

    ---

    Use TypeScript, Python, or Rust SDKs for programmatic access.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/query-sdks/)

-   __Runtime API Calls__

    ---

    Learn how to execute Polkadot runtime APIs for specialized queries.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/query-data/runtime-api-calls/)

-   __Send Transactions__

    ---

    Learn to construct and submit transactions.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/with-sdks)        

</div>
