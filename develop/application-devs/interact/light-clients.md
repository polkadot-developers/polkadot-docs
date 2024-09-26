---
title: Using Light Clients
description: Information about light client options available in the Polkadot ecosystem and how they simplify interactions with the network.
---
# Using Light Clients

## Introduction

Conventionally, applications use a JSON-RPC protocol for communication between a user interface (UI) and a Polkadot SDK-built node with one of the following approaches:

- **User controlled nodes** - the UI connects to a node client the user has installed on their machine. These nodes are secure, but installation and maintenance of these nodes tend to be an inconvenience

- **Publicly accessible nodes** - the UI connects to a third-party-owned publicly accessible node client. While these nodes are more prevalent in their usage as they are convenient to use, they are centralized and insecure

With the advent of light clients, applications no longer have to rely on RPC nodes. Light clients don't sync entire blocks. Instead, they merely verify the finalized network headers. This option provides a cryptographically robust and less resource-intensive way to interact with and ensure the state of the network. Light clients are also available locally and embedded as part of the application, enabling a trustless solution versus running an RPC node.

<!-- TODO: add link to chain specification when glossary is merged -->
You can use a light client implementation to connect to a Polkadot SDK-based network, both in and outside the browser, as long as a [chain specification]() for that network is available.

## Light Client Options

- The [Polkadot API (PAPI)](https://papi.how/){target=\_blank} integrates [`smoldot`](https://github.com/smol-dot/smoldot){target=\_blank} as a choice of light client for both browser and server-based implementations

- [Substrate connect](https://substrate.io/substrate-connect/){target=\_blank} is a browser extension and JavaScript library that enables developers to build application-specific light clients for Substrate chains. There is no installation required or optional extension with minimal or no maintenance.

## Light Client Benefits

A light client allows for all essential features of the chain, such as fetching data and transferring tokens, but it doesn't store a copy of the entire blockchain or require the trust of remote peers. Light clients fetch the needed data from a node with an associated proof to validate the data.

=== "Full RPC Node"

    Complete verification of all blocks of the chain

    ---

    Holds all the previous block data and the chain's storage in database

    ---

    Installation, maintenance, and execution tend to be exhaustive and require system administration expertise


=== "Light Client"

    Only verifies the authenticity of blocks of the chain

    ---

    No database

    ---

    No need to provision servers or other DevOps-related maintenance, singificantly reducing initialization time from startup


## Resources

- [What is a light client and why you should care?](https://medium.com/paritytech/what-is-a-light-client-and-why-you-should-care-75f813ae2670){target=\_blank}