---
title: Off-Chain Operations
description: Overview of Off-Chain workers in the Polkadot SDK, including their structure and the basic operations that can be performed on them.
---

# Off-Chain Operations

## Introduction

There are many use cases where you might want to query data from an Off-Chain source or process data without using On-Chain resources before updating the On-Chain state. The conventional way of incorporating Off-Chain data involves connecting to oracles to supply the data from some traditional source. Although using oracles is one approach to working with Off-Chain data sources, there are limitations to the security, scalability, and infrastructure efficiency that oracles can provide.

To make the Off-Chain data integration more secure and efficient, the Polkadot SDK supports Off-Chain operations through the following features:

- [`Structure`](#off-chain-workers-structure) - Off-Chain workers are a subsystem of components that enable the execution of long-running and possibly non-deterministic tasks, such as:
    - Website service requests
    - Encryption, decryption, and signing of data
    - Random number generation
    - CPU-intensive computations
    - Enumeration or aggregation of On-Chain data

    Off-Chain workers enable you to move tasks that might require more execution time than allowed out of the block processing pipeline. Any task that might take longer than the maximum block execution permitted time is a reasonable candidate for Off-Chain processing

- [`Storage`](#off-chain-storage) - Off-Chain storage is local to a the Polkadot SDK node and can be accessed by both Off-Chain workers and On-Chain logic:
    - Off-Chain workers have both read and write access to Off-Chain storage
    - On-Chain logic has write access through Off-Chain indexing but doesn't have read access. The Off-Chain storage allows different worker threads to communicate with each other and to store user-specific or node-specific data that does not require consensus over the whole network

- [`Indexing`](#off-chain-indexing) - Off-Chain indexing is an optional service that allows the runtime to write directly to Off-Chain storage independently from Off-Chain workers. The Off-Chain index provides temporary storage for On-Chain logic and complements the On-Chain state

## Off-Chain Workers Structure

Off-Chain workers run in their own Wasm execution environment outside of the Polkadot SDK runtime. This separation of concerns ensures that long-running Off-Chain tasks do not impact block production. However, because chain workers are declared in the same code as the runtime, they can easily access On-Chain state for their computations.

<!-- TODO: Migrate image into mermaid diagram -->
![](/images/polkadot-protocol/polkadot-operations/offchain-operations/off-chain-workers-structure.png)

Off-Chain workers have access to extended APIs for communicating with the external world:

- Ability to [`submit transactions`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/trait.TransactionPool.html){target=\_blank}, either signed or unsigned to the chain to publish computation results
- A fully-featured HTTP client allows the worker to access and fetch data from external services
- Access to the local keystore to sign and verify statements or transactions
- An additional, local [`key-value database`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/trait.OffchainStorage.html){target=\_blank} is shared between all off-chain workers
- A secure, local entropy source for random number generation
- Access to the node's precise [`local time`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/struct.Timestamp.html){target=\_blank}
- The ability to sleep and resume work

Note that the results from Off-Chain workers are not subject to regular transaction verification. Therefore, ensure the off-chain operation includes a verification method to determine what information enters the chain. For example, you might verify Off-Chain transactions by implementing a mechanism for voting, averaging, or checking sender signatures.

You should also note that Off-Chain workers don't have specific privileges or permissions by default, representing a potential attack vector that a malicious user could exploit. In most cases, checking whether an Off-Chain worker submitted a transaction before writing to storage isn't sufficient to protect the network. Instead of assuming that the Off-Chain worker can be trusted without safeguards, you should intentionally set restrictive permissions that limit access to the process and what it can do.

Off-Chain workers are spawned during each block import. However, they aren't executed during initial blockchain synchronization.

## Off-Chain Storage

Off-Chain storage is always local to a Polkadot SDK node and is not shared On-Chain with any other blockchain nodes or subject to consensus. You can access the data stored in the Off-Chain storage using Off-Chain worker threads that have read and write access or through the On-Chain logic using Off-Chain indexing.

Because an Off-Chain worker thread is spawned during each block import, multiple Off-Chain worker threads can run at any given time. As with any multi-threaded programming environment, utilities to a [`mutex lock`](https://en.wikipedia.org/wiki/Lock_(computer_science)){target=\_blank} the Off-Chain storage when Off-Chain worker threads access it to ensure data consistency.

Off-Chain storage serves as a bridge for Off-Chain worker threads to communicate to each other and for communication between Off-Chain and On-Chain logic. It can also be read using remote procedure calls (RPC) so it fits the use case of storing indefinitely growing data without over-consuming the On-Chain storage.

## Off-chain Indexing

In a blockchain context, storage is most often concerned with the On-Chain state. However, On-Chain state is expensive because it must be agreed upon and populated to multiple nodes in the network. Therefore, you shouldn't store historical or user-generated data—which grows indefinitely over time—using On-Chain storage.

To address the need to access historical or user-generated data, the Polkadot SDK provides access to the Off-Chain storage using Off-Chain indexing. Off-Chain indexing allows the runtime to write directly to the Off-Chain storage without using Off-Chain worker threads. You can enable this functionality to persist data by starting a the Polkadot SDK node with the `--enable-offchain-indexing` command-line option.

Unlike Off-Chain workers, Off-Chain indexing populates the Off-Chain storage every time a block is processed. By populating the data at every block, Off-Chain indexing ensures that the data is always consistent and exactly the same for every node running with indexing enabled.

## Further Resources

For more in-depth details on the implementation of Off-Chain workers, refer to the [Polkadot SDK documentation](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_offchain_workers/index.html){target=\_blank}.