---
title: Off-Chain Operations
description: TODO
---

# Off-Chain Operations

## Introduction

There are many use cases where you might want to query data from an off-chain source or process data without using on-chain resources before updating the on-chain state. The conventional way of incorporating off-chain data involves connecting to oracles to supply the data from some traditional source. Although using oracles is one approach to working with off-chain data sources, there are limitations to the security, scalability, and infrastructure efficiency that oracles can provide.

To make the off-chain data integration more secure and efficient, Substrate supports off-chain operations through the following features:

- Off-chain workers are a subsystem of components that enable the execution of long-running and possibly non-deterministic tasks, such as:
    - website service requests
    - encryption, decryption, and signing of data
    - random number generation
    - CPU-intensive computations
    - enumeration or aggregation of on-chain data

- Offchain workers enable you to move tasks that might require more execution time than allowed out of the block processing pipeline. Any task that might take longer than the maximum block execution permitted time is a reasonable candidate for off-chain processing

- Off-chain storage is storage that is local to a Substrate node and can be accessed by both off-chain workers and on-chain logic:
    - Offchain workers have both read and write access to off-chain storage
    - On-chain logic has write access through offchain indexing but doesn't have read access. The offchain storage allows different worker threads to communicate with each other and to store user-specific or node-specific data that does not require consensus over the whole network

- Offchain indexing is an optional service that allows the runtime to write directly to off-chain storage independently from off-chain workers. The off-chain index provides temporary storage for on-chain logic and complements the on-chain state

## Off-chain workers

Offchain workers run in their own Wasm execution environment outside of the Polkadot SDK runtime. This separation of concerns ensures that long-running off-chain tasks do not impact block production. However, because chain workers are declared in the same code as the runtime, they can easily access on-chain state for their computations.

<!-- TODO: Migrate image into mermaid diagram -->