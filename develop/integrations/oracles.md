---
title: Oracles
description: Learn about blockchain oracles, the essential bridges connecting blockchains with real-world data for decentralized applications in the Polkadot ecosystem.
---

# Oracles

## What is a Blockchain Oracle?

An oracle is a bridge that brings real-world data onto the blockchain for use by decentralized applications. Since blockchains are isolated systems, oracles can interact with external data sources such as price feeds, HTTP requests, and other off-chain information.

Think of oracles as trusted messengers between the decentralized blockchain world and traditional data sources. They can range from simple, centralized solutions where a single trusted entity provides data to complex decentralized networks where multiple providers stake assets and face penalties for incorrect data submission.

## Oracle Implementations

<div class="grid cards" markdown>

-   :material-clock-fast:{ .lg .middle } __Acurast__

    ---

    Acurast is a decentralized serverless cloud platform that reimagines oracle services by leveraging a network of mobile devices. Unlike traditional cloud-based solutions, Acurast addresses the challenges of centralized trust and data ownership by creating a distributed network of computing resources.
    In the Polkadot ecosystem, Acurast enables developers to define their off-chain data and computation requirements. These requests are processed by a mobile device network that serves as decentralized oracle nodes, providing data and computation results to Substrate (WASM) and EVM environments.

    [:octicons-arrow-right-24: Reference](https://acurast.com/){target=\_blank}

-   :fontawesome-brands-markdown:{ .lg .middle } __Chainlink__

    ---

    Chainlink is an industry-leading decentralized oracle network that brings external data onto blockchains. It acts as a secure bridge between traditional data sources and blockchain networks, enabling access to real-world information reliably. In the Polkadot ecosystem, Chainlink provides the [Chainlink Feed Pallet](https://github.com/smartcontractkit/chainlink-polkadot/tree/master/pallet-chainlink-feed){target=\_blank}, a Polkadot-SDK oracle module that enables access to price reference data across your runtime logic.

    [:octicons-arrow-right-24: Reference](https://chain.link/){target=\_blank}

</div>