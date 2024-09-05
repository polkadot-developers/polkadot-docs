---
title: Node Endpoints
description: List of node endpoints and examples of use. These endpoints can be used for development, RPC, or other purposes for which network access is required.
---

Ideally, one may run their own node when interacting with the
[Polkadot network](https://polkadot.network/) via [Polkadot.Js Apps](https://polkadot.js.org/apps/)
or other UIs and programmatic methods. Another option would be to connect to one of the several
public endpoints provided by infrastructure and API service providers. For development convenience,
[Parity Tech](https://www.parity.io/) maintains archive nodes for Polkadot, Kusama, and their test
networks with public endpoints. These endpoints can be used with
[Polkadot.Js API](https://polkadot.js.org/docs/api) to interact with their respective chains. The
tables below list these endpoints.

### Network Endpoints

Endpoints for all production and test networks are listed on the
[Polkadot-JS UI](https://polkadot.js.org/apps/#/accounts) which are accessed from
[here](https://github.com/polkadot-js/apps/tree/master/packages/apps-config/src/endpoints).
Endpoints for Polkadot Relay Chain and Kusama Relay Chain, parachains, and Paseo test network are
maintained by the community. System Chains as well as Westend and Rococo test network endpoints
maintained by Parity Technologies are listed below (with the exception of [Paseo](https://github.com/paseo-network), which is maintained by the wider community):


=== "Polkadot"
    | Network      | WSS Endpoint                               |
    | ------------ | ------------------------------------------ |
    | Asset Hub    | wss://polkadot-asset-hub-rpc.polkadot.io   |
    | Bridge Hub   | wss://polkadot-bridge-hub-rpc.polkadot.io  |
    | Collectives  | wss://polkadot-collectives-rpc.polkadot.io |
    | People Chain | wss://polkadot-people-rpc.polkadot.io      |

=== "Kusama"
    | Network        | WSS Endpoint                             |
    | -------------- | ---------------------------------------- |
    | Asset Hub      | wss://kusama-asset-hub-rpc.polkadot.io   |
    | Bridge Hub     | wss://kusama-bridge-hub-rpc.polkadot.io  |
    | Collectives    | wss://kusama-collectives-rpc.polkadot.io |
    | People Chain   | wss://kusama-people-rpc.polkadot.io      |
    | Coretime Chain | wss://kusama-coretime-rpc.polkadot.io    |

=== "Testnet"
    | Network | WSS Endpoint                  |
    | ------- | ----------------------------- |
    | Westend | wss://westend-rpc.polkadot.io |
    | Rococo  | wss://rococo-rpc.polkadot.io  |
    | Paseo   | wss://paseo-rpc.dwellir.com   |


### Third Party Providers

There are a number of third-party providers of RPC infrastructure to the Polkadot and Kusama
communities, commonly providing access to multiple networks and parachains in a single service. They
provide additional services such as higher rate limits, potentially more reliable and scalable
service, and additional metrics.

!!! note
    The list of third party RPC endpoints above for Polkadot and Kusama is directly fetched from
    [Polkadot-JS UI](https://polkadot.js.org/apps/#/explorer)

- [OnFinality](https://onfinality.io)
- [Dwellir](https://dwellir.com)
- [Pinknode](https://pinknode.io)
- [Radium Block](https://radiumblock.com/)
- [1RPC](https://1rpc.io/)
- [NOWNodes](https://nownodes.io/)
- [All That Node](https://www.allthatnode.com/)
- [SubQuery](https://www.rpc.subquery.network/)
- [dRPC](https://drpc.org/)
