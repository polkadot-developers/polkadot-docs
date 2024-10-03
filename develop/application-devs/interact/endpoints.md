---
title: Node Endpoints
description: List of node endpoints and examples of use. These endpoints can be used for development, RPC, or other purposes for which network access is required.
---

# Node Endpoints

## Introduction

One may utilize their own node when interacting with the [Polkadot network](https://polkadot.network/){target=\_blank} via [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} or other user interfaces and programmatic methods. Another option would be to connect to one of the several public endpoints provided by infrastructure and API service providers. For development convenience, [Parity Tech](https://www.parity.io/){target=\_blank} maintains archive nodes for Polkadot, Kusama, and their TestNets with public endpoints. These endpoints can be used with [Polkadot.js API](https://polkadot.js.org/docs/api){target=\_blank} to interact with their respective chains.

## Network Endpoints

Endpoints for all production and test networks are available on [Polkadot.js Apps](https://polkadot.js.org/apps/#/accounts){target=\_blank}, sourced from the [endpoints directory](https://github.com/polkadot-js/apps/tree/master/packages/apps-config/src/endpoints){target=\_blank} in the Polkadot.js repository. The community maintains endpoints for the Polkadot and Kusama relay chains, parachains, and the Paseo TestNet. Parity Technologies maintains endpoints for system parachains, as well as the Westend and Rococo test networks, listed below. Please note that [Paseo](https://github.com/paseo-network){target=\_blank} is maintained by the broader community.


=== "Polkadot"

    ``` text title="Asset Hub"
    wss://polkadot-asset-hub-rpc.polkadot.io
    ```

    ``` text title="Bridge Hub"
    wss://polkadot-bridge-hub-rpc.polkadot.io
    ```

    ``` text title="Collectives"
    wss://polkadot-collectives-rpc.polkadot.io
    ```
    ``` text title="People Chain"
    wss://polkadot-people-rpc.polkadot.io
    ```

=== "Kusama"

    ``` text title="Asset Hub"
    wss://kusama-asset-hub-rpc.polkadot.io
    ```
    ``` text title="Bridge Hub"
    wss://kusama-bridge-hub-rpc.polkadot.io
    ```
    ``` text title="Collectives"
    wss://kusama-collectives-rpc.polkadot.io
    ```
    ``` text title="People Chain"
    wss://kusama-people-rpc.polkadot.io
    ```
    ``` text title="Coretime Chain"
    wss://kusama-coretime-rpc.polkadot.io
    ```

=== "TestNet"

    ``` text title="Westend"
    wss://westend-rpc.polkadot.io
    ```
    ``` text title="Rococo"
    wss://rococo-rpc.polkadot.io
    ```
    ``` text title="Paseo"
    wss://paseo-rpc.dwellir.com
    ```

## Third Party Providers

There are a number of third-party providers of RPC infrastructure to the Polkadot and Kusama communities, commonly providing access to multiple networks and parachains in a single service. They provide additional services such as higher rate limits, potentially more reliable and scalable service, and additional metrics.

!!! note
    The list of third party RPC endpoints for Polkadot and Kusama is directly fetched from [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank}.

- [OnFinality](https://onfinality.io){target=\_blank}
- [Dwellir](https://dwellir.com){target=\_blank}
- [Radium Block](https://radiumblock.com/){target=\_blank}
- [1RPC](https://1rpc.io/){target=\_blank}
- [NOWNodes](https://nownodes.io/){target=\_blank}
- [All That Node](https://www.allthatnode.com/){target=\_blank}
- [SubQuery](https://subquery.network/rpc/list/){target=\_blank}
- [dRPC](https://drpc.org/){target=\_blank}
