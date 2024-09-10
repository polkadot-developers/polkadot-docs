---
title: Runtime APIs
description: Highlights the runtime interfaces that enable communication with outer node services.  These APIs allow for the outer node to communicate with the WebAssembly runtime of a Polkadot SDK-based node.
---

Nodes consist of outer node services and a runtime.  This separation of responsibilities is an important concept for designing Polkadot SDK-based chains and building upgradeable logic.

For more information on details of how the meta protocol works, [read the Polkadot SDK docs.](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/index.html#summary){target=_blank}

However, the outer node services and the runtime must communicate with each other to complete many critical operations, including reading and writing data and performing state transitions.

The outer node services communicate with the runtime by calling runtime application programming interfaces to perform specific tasks.

By default, the runtime provides the following traits for outer node services to call:

- [`AccountNonceApi`](https://paritytech.github.io/polkadot-sdk/master/frame_system_rpc_runtime_api/trait.AccountNonceApi.html){target=_blank}
- [`AuraApi`](https://paritytech.github.io/polkadot-sdk/master/sp_consensus_aura/trait.AuraApi.html){target=_blank}
- [`Benchmark`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/trait.Benchmark.html){target=_blank}
- [`BlockBuilder`](https://paritytech.github.io/polkadot-sdk/master/sp_block_builder/trait.BlockBuilder.html){target=_blank}
- [`GrandpaApi`](https://paritytech.github.io/polkadot-sdk/master/sp_consensus_grandpa/trait.GrandpaApi.html){target=_blank}
- [`NominationPoolsApi`](https://paritytech.github.io/polkadot-sdk/master/pallet_nomination_pools_runtime_api/trait.NominationPoolsApi.html){target=_blank}
- [`OffchainWorkerApi`](https://paritytech.github.io/polkadot-sdk/master/sp_offchain/trait.OffchainWorkerApi.html){target=_blank}
- [`SessionKeys`](https://paritytech.github.io/polkadot-sdk/master/sp_session/trait.SessionKeys.html)
- [`TaggedTransactionQueue`](https://paritytech.github.io/polkadot-sdk/master/sp_transaction_pool/runtime_api/trait.TaggedTransactionQueue.html){target=_blank}
- [`TransactionPaymentApi`](https://paritytech.github.io/polkadot-sdk/master/pallet_transaction_payment_rpc_runtime_api/trait.TransactionPaymentApi.html){target=_blank}
