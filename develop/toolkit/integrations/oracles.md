---
title: Oracles
description: Learn about blockchain oracles, the essential bridges connecting blockchains with real-world data for decentralized applications in the Polkadot ecosystem.
---

# Oracles

## What is a Blockchain Oracle?

Oracles enable blockchains to access external data sources. Since blockchains operate as isolated networks, they cannot natively interact with external systems - this limitation is known as the "blockchain oracle problem." Oracles solves this by extracting data from external sources (like APIs, IoT devices, or other blockchains), validating it, and submitting it on-chain.

While simple oracle implementations may rely on a single trusted provider, more sophisticated solutions use decentralized networks where multiple providers stake assets and reach consensus on data validity. Typical applications include DeFi price feeds, weather data for insurance contracts, and cross-chain asset verification.

## Oracle Implementations

<div class="grid cards" markdown>

-   __Acurast__

    ---

    Acurast is a decentralized, serverless cloud platform that uses a distributed network of mobile devices for oracle services, addressing centralized trust and data ownership issues. In the Polkadot ecosystem, it allows developers to define off-chain data and computation needs, which are processed by these devices acting as decentralized oracle nodes, delivering results to Substrate (Wasm) and EVM environments.

    [:octicons-arrow-right-24: Reference](https://acurast.com/){target=\_blank}

-   __Chainlink__

    ---

    Chainlink is a decentralized oracle network that brings external data onto blockchains. It acts as a secure bridge between traditional data sources and blockchain networks, enabling access to real-world information reliably. In the Polkadot ecosystem, Chainlink provides the [Chainlink Feed Pallet](https://github.com/smartcontractkit/chainlink-polkadot/tree/master/pallet-chainlink-feed){target=\_blank}, a Polkadot SDK-based oracle module that enables access to price reference data across your runtime logic.

    [:octicons-arrow-right-24: Reference](https://chain.link/){target=\_blank}

</div>
