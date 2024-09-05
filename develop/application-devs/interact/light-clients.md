---
title: Using Light Clients
description: Information about light client options in the Polkadot ecosystem, and how they can be used in the development context.
---

Conventionally, communication between a user interface (UI) and a node built with the Polkadot SDK is through a JSON RPC
protocol. This is usually done through two main approaches:

1. **User-Controlled Nodes**: The UI connects to a node client that the user has installed on their machine. These nodes are secure, but installation and maintenance of these nodes tend to be an inconvenience

2. **Publicly-Accessible Nodes**: The UI connects to a third-party-owned publicly-accessible node client. While these nodes are more prevalent in their usage as they are convenient to use, they are centralized and insecure

With the advent of light clients, applications no longer have to rely on RPC nodes.  Light clients don't sync full blocks; rather, they merely verify the finalized headers of the network.  This option provides a cryptographically robust and less resource intensive way to interact with and ensure the state of the network.  Light clients are also available locally, embedded as part of the application, enabling a trustless solution to running an RPC node.

<!-- TODO: add def for chain specification when glossary is merged -->

As long as the chain specification for a Polkadot SDK-based network is available, a light client implementation (in or out of the browser) may be used to connect to that network. 

### Light Client Options

- The [Polkadot API (PAPI)](https://papi.how/){target=_blank} integrates [`smoldot`](https://github.com/smol-dot/smoldot) as a choice of light client for both browser and server based implementations

- [Substrate connect](https://substrate.io/substrate-connect/) is a browser extension and JavaScript library that enables developers to build application-specific light clients for Substrate chains. There is no installation required or optional extension with minimal or no maintenance.

### Light Client Benefits

A light client allows for all basic features of the chain such as fetching data and
transferring tokens, but it does not a full copy of the entire blockchain or
having to trust remote peers. Light clients fetch the required data that they need from a node with an associated proof to validate the data.

| Full RPC Node                                                                                        | Light Client                                                                                                         |
| ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Full verification of all blocks of the chain                                                                 | Only verifies the authenticity of blocks of the chain                                                         |
| Holds all the previous block data and the chain's storage in database                                       | No database                                                                                                      |
| Installation, maintenance, and execution tend to be exhaustive and require system administration expertise. | No installation; has an optional extension with minimal or no maintenance with a greatly reduced initialization time. |

## Resources

- [What is a light client and why you should care?](https://www.parity.io/blog/what-is-a-light-client/)