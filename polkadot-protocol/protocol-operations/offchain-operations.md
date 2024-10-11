---
title: Off-Chain Operations
description: Overview of off-chain workers in the Polkadot SDK, including their structure and the basic operations that can be performed on them.
---

# Off-Chain Operations

## Introduction

There are many use cases where you might want to query data from an off-chain source or process data without using on-chain resources before updating the on-chain state. The conventional way of incorporating off-chain data involves connecting to oracles to supply the data from some traditional source. Although using oracles is one approach to working with off-chain data sources, there are limitations to the security, scalability, and infrastructure efficiency that oracles can provide.

To make off-chain data integration more secure and efficient, the Polkadot SDK supports off-chain operations through the following features:

- [`Structure`](#off-chain-workers-structure) - off-chain workers are a subsystem of components that enable the execution of long-running and possibly non-deterministic tasks, such as:
    - Website service requests
    - Encryption, decryption, and signing of data
    - Random number generation
    - CPU-intensive computations
    - Enumeration or aggregation of on-chain data

    Off-chain workers enable you to move long running tasks out of the block processing pipeline. Any task that might take longer than the maximum permitted block execution time is a reasonable candidate for off-chain processing.

- [`Storage`](#off-chain-storage) - off-chain storage is local to a the Polkadot SDK node and can be accessed by both off-chain workers and on-chain logic:
    - Off-chain workers have both read and write access to off-chain storage
    - On-chain logic has write access through off-chain indexing but doesn't have read access. The off-chain storage allows different worker threads to communicate with each other and to store user-specific or node-specific data that does not require consensus over the whole network

- [`Indexing`](#off-chain-indexing) - off-chain indexing is an optional service that allows the runtime to write directly to off-chain storage independently from off-chain workers. The off-chain index provides temporary storage for on-chain logic and complements the on-chain state

## Off-Chain Workers Structure

Off-chain workers run in their own Wasm execution environment outside of the Polkadot SDK runtime. This separation of concerns ensures that long-running off-chain tasks do not impact block production. However, because chain workers are declared in the same code as the runtime, they can easily access on-chain state for their computations.

Consider the communication flow when a user initiates an action on a dApp. The request arrives at the node which then interacts with on-chain and off-chain processes to carry out the requested transaction and make the needed state changes. If all goes well, the user receives notification of success via the UI of the dApp. If the request is something simple and fast, like requesting a token price, the communication flow might look like this:

<div class="mermaid">
``` mermaid
sequenceDiagram
    box Application 
    participant D as dApp
    end
    box Polkadot SDK Node
    participant N as Node
    end
    box External Services
    participant E as External Services
    end
    D->>N: What is token price?
    N->>E: What is token price?
    E->>N: The token is USD$5
    N->>D: The token is USD$5
```
</div>

Now, imagine the user initiates a request requiring a call to a longer running or non-deterministic external process like random number generation. If the external process can't be completed within the block execution time, the node can delegate the task to an off-chain worker. The off-chain worker will make the call to the external services, wait for the response, and send information back to the node once the task is complete. The node can then take the returned information and make any needed transaction and state changes during block execution. The communication flow using off-chain workers might look like this:

<div class="mermaid">
``` mermaid
sequenceDiagram
    box Application 
    participant D as dApp
    end
    box Polkadot SDK Node
    participant R as RPC API<br/>Substrate Runtime<br/>Core Infrastructure
    participant O as Offchain Workers
    end
    box External Services
    participant E as External Services
    end
    
    D->>R: Action initiated
    R-->>O: Signed or unsigned<br/>transactions
    O->>E: Call external<br/>service
    E->>O: External service<br/>response
    O->>R: Signed or unsigned<br/>transactions
    R->>D: Result communicated<br/>to user
```
</div>


Off-chain workers have access to extended APIs for communicating with the external world:

- Ability to [`submit transactions`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/trait.TransactionPool.html){target=\_blank}, either signed or unsigned to the chain to publish computation results
- A fully-featured HTTP client allows the worker to access and fetch data from external services
- Access to the local keystore to sign and verify statements or transactions
- An additional, local [`key-value database`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/trait.OffchainStorage.html){target=\_blank} is shared between all off-chain workers
- A secure, local entropy source for random number generation
- Access to the node's precise [`local time`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/struct.Timestamp.html){target=\_blank}
- The ability to sleep and resume work

Note that the results from off-chain workers are not subject to regular transaction verification. Therefore, ensure the off-chain operation includes a verification method to determine what information enters the chain. For example, you might verify off-chain transactions by implementing a mechanism for voting, averaging, or checking sender signatures.

You should also note that off-chain workers don't have specific privileges or permissions by default, representing a potential attack vector that a malicious user could exploit. In most cases, checking whether an off-chain worker submitted a transaction before writing to storage isn't sufficient to protect the network. Instead of assuming that the off-chain worker can be trusted without safeguards, you should intentionally set restrictive permissions that limit access to the process and what it can do.

Off-chain workers are spawned during each block import. However, they aren't executed during initial blockchain synchronization.

## Off-Chain Storage

Off-chain storage is always local to a Polkadot SDK node and is not shared on-chain with any other blockchain nodes or subject to consensus. You can access the data stored in the off-chain storage using off-chain worker threads that have read and write access or through the on-chain logic using off-chain indexing.

Because an off-chain worker thread is spawned during each block import, multiple off-chain worker threads can run at any given time. As with any multi-threaded programming environment, utilities to a [`mutex lock`](https://en.wikipedia.org/wiki/Lock_(computer_science)){target=\_blank} the off-chain storage when off-chain worker threads access it to ensure data consistency.

Off-chain storage serves as a bridge for off-chain worker threads to communicate to each other and for communication between off-chain and on-chain logic. It can also be read using remote procedure calls (RPC) so it fits the use case of storing indefinitely growing data without over-consuming the on-chain storage.

## Off-Chain Indexing

In a blockchain context, storage is most often concerned with the on-chain state. However, on-chain state is expensive because it must be agreed upon and populated to multiple nodes in the network. Therefore, you shouldn't store historical or user-generated data—which grows indefinitely over time—using on-chain storage.

To address the need to access historical or user-generated data, the Polkadot SDK provides access to the off-chain storage using off-chain indexing. Off-chain indexing allows the runtime to write directly to the off-chain storage without using off-chain worker threads. You can enable this functionality to persist data by starting a the Polkadot SDK node with the `--enable-offchain-indexing` command-line option.

Unlike off-chain workers, off-chain indexing populates the off-chain storage every time a block is processed. By populating the data at every block, off-chain indexing ensures that the data is always consistent and exactly the same for every node running with indexing enabled.

## Further Resources

For more in-depth details on the implementation of off-chain workers, refer to the [Polkadot SDK documentation](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_offchain_workers/index.html){target=\_blank}.