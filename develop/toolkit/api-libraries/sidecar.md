---
title: Sidecar Rest API
description: Learn about Substrate API Sidecar, a REST service that provides endpoints for interacting with Polkadot SDK-based chains and simplifies blockchain interactions.
---

# Sidecar API

## Introduction

The [Sidecar Rest API](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} service offers a REST API for interacting with Polkadot SDK-based chains. This REST service provides a wide range of endpoints, allowing you to interact with nodes, accounts, transactions, parachains, and various other components of the chain.

It acts as a caching layer between your application and a Substrate node, providing standardized REST endpoints that abstract away the complexity of direct RPC calls. This makes it particularly useful for developers who prefer working with REST APIs or are building applications in languages that don't have robust WebSocket support.

Some of the key features of the Sidecar API include:

- **REST API Interface** - provides a familiar REST API interface for interacting with Polkadot SDK-based chains
- **Standardized Endpoints** - offers consistent endpoint formats across different chain implementations
- **Caching Layer** - acts as a caching layer to improve performance and reduce direct node requests
- **Multiple Chain Support** - works with any Polkadot SDK-based chain, including Polkadot, Kusama, and custom chains

## Installation

To install Substrate API Sidecar, you can use the following command:

=== "npm"

    ```bash
    npm install -g @substrate/api-sidecar
    ```

=== "pnpm"

    ```bash
    pnpm install -g @substrate/api-sidecar
    ```

=== "yarn"

    ```bash
    yarn global add @substrate/api-sidecar
    ```

!!! note
    Substrate API Sidecar requires Node.js version 18.14 LTS or higher. Ensure you have Node.js installed on your system.

    ```bash
    node --version
    ```

    If you need to install or update Node.js, visit the [official Node.js website](https://nodejs.org/){target=\_blank} to download and install the latest LTS version.

You can check the installation was successful by running:

```bash
substrate-api-sidecar --version
```

## Usage

To use Sidecar API you have two alternatives:

- Run a node locally on your machine, by default Sidecar API assumes that this is happening so it doesn't need any additional config parameter. In this case, you need to execute the following command:
    ```
    substrate-api-sidecar
    ```
- Get access to the provided REST services by the API, to obtain information about a production node. In this case, you need to specify the rpc endpoint of that chain. For example, to access to Polkadot Asset Hub, you can run:

    ```
    SAS_SUBSTRATE_URL=wss://polkadot-asset-hub-rpc.polkadot.io substrate-api-sidecar
    ```

    !!! note
        You can read more about the Sidecar API settings on the [Configuration](https://github.com/paritytech/substrate-api-sidecar?tab=readme-ov-file#configuration){target=\_blank} section of the official documentation.

Once you have Sidecar API running on your terminal, you will see the following output:

<div id="termynal" data-termynal>
    <span data-ty='input'><span class='file-path'></span>SAS_SUBSTRATE_URL=wss://polkadot-asset-hub-rpc.polkadot.io substrate-api-sidecar</span>
    <br>
    <span data-ty>SAS:</span>
    <span data-ty>📦 LOG:</span>
    <span data-ty>   ✅ LEVEL: "info"</span>
    <span data-ty>   ✅ JSON: false</span>
    <span data-ty>   ✅ FILTER_RPC: false</span>
    <span data-ty>   ✅ STRIP_ANSI: false</span>
    <span data-ty>   ✅ WRITE: false</span>
    <span data-ty>   ✅ WRITE_PATH: "/opt/homebrew/lib/node_modules/@substrate/api-sidecar/build/src/logs"</span>
    <span data-ty>   ✅ WRITE_MAX_FILE_SIZE: 5242880</span>
    <span data-ty>   ✅ WRITE_MAX_FILES: 5</span>
    <span data-ty>📦 SUBSTRATE:</span>
    <span data-ty>   ✅ URL: "wss://polkadot-asset-hub-rpc.polkadot.io"</span>
    <span data-ty>   ✅ TYPES_BUNDLE: undefined</span>
    <span data-ty>   ✅ TYPES_CHAIN: undefined</span>
    <span data-ty>   ✅ TYPES_SPEC: undefined</span>
    <span data-ty>   ✅ TYPES: undefined</span>
    <span data-ty>   ✅ CACHE_CAPACITY: undefined</span>
    <span data-ty>📦 EXPRESS:</span>
    <span data-ty>   ✅ BIND_HOST: "127.0.0.1"</span>
    <span data-ty>   ✅ PORT: 8080</span>
    <span data-ty>   ✅ KEEP_ALIVE_TIMEOUT: 5000</span>
    <span data-ty>📦 METRICS:</span>
    <span data-ty>   ✅ ENABLED: false</span>
    <span data-ty>   ✅ PROM_HOST: "127.0.0.1"</span>
    <span data-ty>   ✅ PROM_PORT: 9100</span>
    <span data-ty>   ✅ LOKI_HOST: "127.0.0.1"</span>
    <span data-ty>   ✅ LOKI_PORT: 3100</span>
    <span data-ty>   ✅ INCLUDE_QUERYPARAMS: false</span>
    <br>
    <span data-ty>2024-11-06 08:06:01 info: Version: 19.3.0</span>
    <span data-ty>2024-11-06 08:06:02 warn: API/INIT: RPC methods not decorated: chainHead_v1_body, chainHead_v1_call, chainHead_v1_continue, chainHead_v1_follow, chainHead_v1_header, chainHead_v1_stopOperation, chainHead_v1_storage, chainHead_v1_unfollow, chainHead_v1_unpin, chainSpec_v1_chainName, chainSpec_v1_genesisHash, chainSpec_v1_properties, transactionWatch_v1_submitAndWatch, transactionWatch_v1_unwatch, transaction_v1_broadcast, transaction_v1_stop</span>
    <span data-ty>2024-11-06 08:06:02 info: Connected to chain Polkadot Asset Hub on the statemint client at wss://polkadot-asset-hub-rpc.polkadot.io</span>
    <span data-ty>2024-11-06 08:06:02 info: Listening on http://127.0.0.1:8080/</span>
    <span data-ty>2024-11-06 08:06:02 info: Check the root endpoint (http://127.0.0.1:8080/) to see the available endpoints for the current node</span>
</div>

As you can see in the output above, the Sidecar API is running and listing to incoming REST request on `http://127.0.0.1:8080/`, now you can get access to the exposed endpoints via a browser, Postman, curl, or the tool of your choice. 

### Endpoints

The Sidecar API exposes a set of REST endpoints that allow you to query different aspects of the chain, such as blocks, accounts, transactions, and more. Each endpoint is designed to provide specific information about the chain's state and operations.

For example, you can get the node version of the running chain by using the `/node/version/` endpoint:

```bash
curl -X 'GET' \
  'http://127.0.0.1:8080/node/version' \
  -H 'accept: application/json'
```
!!! note
    You can also open the `http://127.0.0.1:8080/node/version` url on your browser to get the same results since this is a `GET` request.

And you will see the following output (in case you are running your sidecar api to against the Polkadot Asset Hub RPC endpoint):

<div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>curl -X 'GET' 'http://127.0.0.1:8080/node/version' -H 'accept: application/json'</span>
    <br>
    <span data-ty>{</span>
    <span data-ty>    "clientVersion": "1.16.1-835e0767fe8",</span>
    <span data-ty>    "clientImplName": "statemint",</span>
    <span data-ty>    "chain": "Polkadot Asset Hub"</span>
    <span data-ty>}</span>
</div>

For a complete list of the available endpoints and their detailed documentation, you can visit the official [Sidecar API documentation](https://paritytech.github.io/substrate-api-sidecar/dist/){target=\_blank}. That page, will help you to know which are the endpoints that are exposed by Sidecar API and also to build simple queries against them.

## Next Steps

To learn further about Sidecar API, you can refer to the [official documentation](https://github.com/paritytech/substrate-api-sidecar?tab=readme-ov-file#substrateapi-sidecar){target=\_blank}.