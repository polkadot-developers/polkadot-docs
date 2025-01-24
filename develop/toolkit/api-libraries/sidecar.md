---
title: Sidecar Rest API
description: Learn about Substrate API Sidecar, a REST service that provides endpoints for interacting with Polkadot SDK-based chains and simplifies blockchain interactions.
---

# Sidecar API

## Introduction

The [Sidecar Rest API](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} is a service that provides a REST interface for interacting with Polkadot SDK-based blockchains. With this API, developers can easily access a broad range of endpoints for nodes, accounts, transactions, parachains, and more.

Sidecar functions as a caching layer between your application and a Polkadot SDK-based node, offering standardized REST endpoints that simplify interactions without requiring complex, direct RPC calls. This approach is especially valuable for developers who prefer REST APIs or build applications in languages with limited WebSocket support.

Some of the key features of the Sidecar API include:

- **REST API interface** - provides a familiar REST API interface for interacting with Polkadot SDK-based chains
- **Standardized endpoints** - offers consistent endpoint formats across different chain implementations
- **Caching layer** - acts as a caching layer to improve performance and reduce direct node requests
- **Multiple chain support** - works with any Polkadot SDK-based chain, including Polkadot, Kusama, and custom chains

## Prerequisites

Sidecar API requires Node.js version 18.14 LTS or higher. Verify your Node.js version:

```bash
node --version
```

If you need to install or update Node.js, visit the [official Node.js website](https://nodejs.org/){target=\_blank} to download and install the latest LTS version.

## Installation

To install Substrate API Sidecar, use one of the following commands:

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

You can confirm the installation by running:

```bash
substrate-api-sidecar --version
```

For more information about the Sidecar API installation, see the [installation and usage](https://github.com/paritytech/substrate-api-sidecar?tab=readme-ov-file#npm-package-installation-and-usage){target=\_blank} section of the Sidecar API README.

## Usage

To use the Sidecar API, you have two options:

- **Local node** - run a node locally, which Sidecar will connect to by default, requiring no additional configuration. To start, run:
    ```
    substrate-api-sidecar
    ```
- **Remote node** - connect Sidecar to a remote node by specifying the RPC endpoint for that chain. For example, to gain access to the Polkadot Asset Hub associated endpoints:
    ```
    SAS_SUBSTRATE_URL=wss://polkadot-asset-hub-rpc.polkadot.io substrate-api-sidecar
    ```

    For more configuration details, see the [Configuration](https://github.com/paritytech/substrate-api-sidecar?tab=readme-ov-file#configuration){target=\_blank} section of the Sidecar API documentation.

Once the Sidecar API is running, you’ll see output similar to this:

--8<-- 'code/develop/toolkit/api-libraries/sidecar/terminal-output.md'

With Sidecar running, you can access the exposed endpoints via a browser, [`Postman`](https://www.postman.com/){target=\_blank}, [`curl`](https://curl.se/){target=\_blank}, or your preferred tool.

### Endpoints

Sidecar API provides a set of REST endpoints that allow you to query different aspects of the chain, including blocks, accounts, and transactions. Each endpoint offers specific insights into the chain’s state and activities.

For example, to retrieve the version of the node, use the `/node/version` endpoint:

```bash
--8<-- 'code/develop/toolkit/api-libraries/sidecar/get-node-version.md'
```

Alternatively, you can access `http://127.0.0.1:8080/node/version` directly in a browser since it’s a `GET` request.

In response, you’ll see output similar to this (assuming you’re connected to Polkadot Asset Hub):

--8<-- 'code/develop/toolkit/api-libraries/sidecar/asset-hub-node-version-response.md'

For a complete list of available endpoints and their documentation, visit the [Sidecar API list endpoints](https://paritytech.github.io/substrate-api-sidecar/dist/){target=\_blank}. You can learn about the endpoints and how to use them in your applications.

## Where to Go Next

To dive deeper, refer to the [official Sidecar documentation](https://github.com/paritytech/substrate-api-sidecar?tab=readme-ov-file#substrateapi-sidecar){target=\_blank}. This provides a comprehensive guide to the available configurations and advanced usage.
