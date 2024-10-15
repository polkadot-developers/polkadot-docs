---
title: Runtime APIs
description: Highlights the runtime interfaces that enable communication between outer node services and the WebAssembly runtime of a Polkadot SDK-based node.
---

# Runtime APIs

## Introduction

Polkadot SDK-based nodes comprise a core client with outer node services and a runtime. The client handles network activity such as peer discovery, managing transaction requests, reaching consensus with peers, and responding to RPC calls. The runtime contains all of the application logic for executing the state transition function of the blockchain. This design enables upgrades without the need to fork the network, as the runtime can be updated independently and on the fly with minimal effect on the node. Understanding this separation of responsibilities is essential for designing Polkadot SDK-based chains and building upgradeable logic. 

The following diagram illustrates this separation of responsibilities in simplified form to help you visualize the architecture: 

``` mermaid

block-beta 
    block:client("Client - outer node services")
        columns 3
        A B C
        space space space
        D E F
    end
    block:runtime("Runtime")
        G
    end
    A["Networking"]
    B["Storage"]
    C["Consensus"]
    D["Transaction"]
    E["RPC"]
    F["Telemetry"]
    G["Wasm runtime"]

```

For more information on details of how the meta protocol works, [refer to the Polkadot SDK docs.](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html#summary){target=_blank}

Though they have separate responsibilities, the outer node services and the runtime must communicate with each other to complete many critical operations, including reading and writing data and performing state transitions. The outer node services communicate with the runtime by calling runtime application programming interfaces (APIs) to perform specific tasks.

## Common Runtime APIs

The following section covers common runtime APIs a Polkadot SDK-based outer node service might call. Select the API name to visit the corresponding Rust documentation for more information on exposed functions, parameters, and returns: 

- **[`AccountNonceApi`](https://paritytech.github.io/polkadot-sdk/master/frame_system_rpc_runtime_api/trait.AccountNonceApi.html){target=_blank}** - queries account nonce
- **[`AuraApi`](https://paritytech.github.io/polkadot-sdk/master/sp_consensus_aura/trait.AuraApi.html){target=_blank}** - necessary for block authorship with Aura
- **[`Benchmark`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/trait.Benchmark.html){target=_blank}** - for collecting performance and storage metadata from the runtime during benchmarking tasks
- **[`BlockBuilder`](https://paritytech.github.io/polkadot-sdk/master/sp_block_builder/trait.BlockBuilder.html){target=_blank}** - provides the required functionality for building a block
- **[`GrandpaApi`](https://paritytech.github.io/polkadot-sdk/master/sp_consensus_grandpa/trait.GrandpaApi.html){target=_blank}** - for integrating the GRANDPA finality gadget into runtimes
- **[`NominationPoolsApi`](https://paritytech.github.io/polkadot-sdk/master/pallet_nomination_pools_runtime_api/trait.NominationPoolsApi.html){target=_blank}** - provides methods to query various balances, pending rewards, and whether a nomination pool or member needs delegate migration
- **[`OffchainWorkerApi`](https://paritytech.github.io/polkadot-sdk/master/sp_offchain/trait.OffchainWorkerApi.html){target=_blank}** - for tasks completed by off-chain worker
- **[`SessionKeys`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_frame/runtime/apis/trait.SessionKeys.html){target=_blank}** - for generating and querying session keys
- **[`TaggedTransactionQueue`](https://paritytech.github.io/polkadot-sdk/master/sp_transaction_pool/runtime_api/trait.TaggedTransactionQueue.html){target=_blank}** - for interfering with the transaction queue
- **[`TransactionPaymentApi`](https://paritytech.github.io/polkadot-sdk/master/pallet_transaction_payment_rpc_runtime_api/trait.TransactionPaymentApi.html){target=_blank}** - helps estimate fees based on transaction properties like weight, length, and extrinsic type



