---
title: Off-Chain Operations
description: Overview of off-chain workers in the Polkadot SDK, including their structure and the basic operations you can perform using them.
---
<!--TODO: delete this page => info moved to 
polkadot-protocol/polkadot-sdk.md-->

# Off-Chain Operations

## Introduction

Many use cases exist for querying data from an off-chain source or processing data using off-chain resources before updating the on-chain state. The conventional way of incorporating off-chain data involves connecting to oracles to supply the data from some traditional source. Although using oracles is one approach to working with off-chain data sources, there are limitations to the security, scalability, and infrastructure efficiency that oracles can provide.

To make off-chain data integration more secure and efficient, the Polkadot SDK supports off-chain operations through the following features:

- [`Structure`](#off-chain-workers-structure) - off-chain workers are a subsystem of components that enable the execution of long-running and possibly non-deterministic tasks, such as:
    - Website service requests
    - Encryption, decryption, and signing of data
    - Random number generation
    - CPU-intensive computations
    - Enumeration or aggregation of on-chain data

    Off-chain workers enable you to move long-running tasks out of the block processing pipeline. Any task that might take longer than the maximum permitted block execution time is a reasonable candidate for off-chain processing.

- [`Storage`](#off-chain-storage) - off-chain storage is local to the Polkadot SDK node and can be accessed by both off-chain workers and on-chain logic:
    - Off-chain workers have both read and write access to off-chain storage
    - On-chain logic has write access through off-chain indexing but not read access. The off-chain storage allows different worker threads to communicate with each other and to store user-specific or node-specific data that does not require consensus over the whole network

- [`Indexing`](#off-chain-indexing) - off-chain indexing is an optional service that allows the runtime to write directly to off-chain storage independently from off-chain workers. The off-chain index provides temporary storage for on-chain logic and complements the on-chain state

## Off-Chain Workers Structure

Off-chain workers run in their own Wasm execution environment outside of the Polkadot SDK runtime. This separation of concerns ensures that long-running off-chain tasks do not impact block production. However, because chain workers are declared in the same code as the runtime, they can easily access the on-chain state for their computations.

Consider the communication flow when a user initiates an action on a dApp. The request arrives at the node, which then interacts with on-chain and off-chain processes to carry out the requested transaction and make the needed state changes. If all goes well, the user receives a notification of success via the dApp's UI. If the request is something simple and fast, like requesting a token price, the communication flow might look like this:

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

Now, imagine the user initiates a request requiring a call to a longer running or non-deterministic external process like random number generation. If the external process can't be completed within the block execution time, the node can delegate the task to an off-chain worker. The off-chain worker will call the external services, wait for the response, and send information back to the node once the task is complete. The node can use this information to make any needed transaction and state changes during block execution. The communication flow using off-chain workers might look like this:

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

Off-chain workers have access to extended APIs to communicate with the external world. These connections facilitate multiple capabilities, such as the ability to:

- [Submit transactions](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/trait.TransactionPool.html){target=\_blank}, either signed or unsigned, to the chain to publish computation results
- Access and fetch data from external services via a fully-featured HTTP client 
- Access the local keystore to sign and verify statements or transactions
- Use an additional, local [key-value database](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/trait.OffchainStorage.html){target=\_blank} shared between all off-chain workers
- Generate random numbers using a secure, local entropy source
- Access the node's precise [local time](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/offchain/struct.Timestamp.html){target=\_blank}
- Sleep and resume work

Since off-chain worker results aren't subject to traditional transaction verification, including a verification method is crucial to control what data enters the chain. Mechanisms like voting, averaging, or checking signatures can verify off-chain transactions.

Additionally, off-chain workers don't have special permissions by default, which could pose a security risk. Relying solely on whether an off-chain worker submitted a transaction isn't enough; restrict access and enforce security measures.

Finally, off-chain workers are triggered during block imports but aren't run during initial chain synchronization.

## Off-Chain Storage

Off-chain storage in the Polkadot SDK is local to individual nodes, not shared across the network or subject to consensus. It can be accessed by off-chain workers or through on-chain logic using off-chain indexing. Since multiple off-chain worker threads may run concurrently, a [mutex lock](https://en.wikipedia.org/wiki/Lock_(computer_science)){target=\_blank} ensures data consistency when threads access storage. Off-chain storage acts as a bridge between off-chain workers and on-chain logic, and it can be read using RPC, making it ideal for storing large, growing datasets without burdening on-chain storage.

## Off-Chain Indexing

While on-chain storage is expensive and limited, off-chain indexing allows efficient access to historical or user-generated data without using off-chain worker threads. By using the `--enable-offchain-indexing` option when starting the Polkadot SDK node, data is consistently written to off-chain storage each time a block is processed. This approach ensures that off-chain data is synchronized across all nodes with indexing enabled.

## Further Resources

Refer to the [Polkadot SDK documentation](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_offchain_workers/index.html){target=\_blank} for more in-depth details on the implementation of off-chain workers.