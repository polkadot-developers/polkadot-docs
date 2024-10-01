---
title: Runtime APIs
description: Highlights the runtime interfaces that enable communication between outer node services and the WebAssembly runtime of a Polkadot SDK-based node.
---

# Runtime APIs

## Introduction

Polkadot SDK-based nodes consist of a core client with outer node services and a runtime. The client handles network activity such as peer discovery, managing transaction requests, reaching consensus with peers, and responding to RPC calls. The runtime contains all of the application logic for executing the state transition function of the blockchain. This design enables upgrades without the need to fork the network as the runtime can be updated independently and on the fly with minimal effect on the node. Understanding this separation of responsibilities is an important concept for designing Polkadot SDK-based chains and building upgradeable logic. 

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

The following section covers common runtime APIs a Polkadot SDK-based outer node service might call. Expand each API section for additional details, including a description of each API's functionality and the methods provided. It is recommended to refer to the Rust documentation for each respective API, which you will also find linked below: 

??? function "**[`AccountNonceApi`](https://paritytech.github.io/polkadot-sdk/master/frame_system_rpc_runtime_api/trait.AccountNonceApi.html){target=_blank}** - queries account nonce"

    ??? function "`account_nonce()` - Get current account nonce of given `AccountId`"

        === "Parameters"

            - `account` ++"AccountId"++ - the account to get nonce for

        === "Returns"

            - `Nonce` ++"u64"++ - index of a transaction


??? function "**[`AuraApi`](https://paritytech.github.io/polkadot-sdk/master/sp_consensus_aura/trait.AuraApi.html){target=_blank}** - necessary for block authorship with Aura"

    ??? function "`slot_duration()` - Returns the slot duration for Aura"

        === "Parameters"

            None

        === "Returns"

            - `SlotDuration` ++"u64"++ - slot duration defined in milliseconds

    ??? function "`authorities()` - Returns the current set of authorities"

        === "Parameters"

            None

        === "Returns"

            - `AuthorityId` ++"vector"++ - an array of current authority IDs


??? function "**[`Benchmark`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/trait.Benchmark.html){target=_blank}** - for collecting performance and storage metadata from the runtime during benchmarking tasks"

    ??? function "`benchmark_metadata()` - get the benchmark metadata available for this runtime"

        === "Parameters"

            `extra` ++"bool"++ - if `true`, list benchmarks marked 'extra' which would otherwise not be needed for weight calculation

        === "Returns"

            `Result` ++"tuple"++ - returns a tuple of two vectors named `BenchmarkList` and `StorageInfo`

    ??? function "`dispatch_benchmark()` - dispatch the given benchmark"

        === "Parameters"

            ??? function "`config` ++"struct"++ - a `BenchmarkConfig` struct"
                - `pallet` ++"Vec<u8>"++ - the encoded name of the pallet to benchmark
                - `benchmark` ++"Vec<u8>"++ - the encoded name of the benchmark or extrinsic to run
                - `selected_components` ++"Vec<(BenchmarkParameter, u32)>"++ - the selected component values to use when running the benchmark
                - `verify` ++"bool"++ - if true, enable an extra benchmark iteration which runs the verification logic for a benchmark
                - `internal_repeats` ++"u32"++ - number of times to repeat benchmark within the Wasm environment (versus within the client)

        === "Returns"

            - `Result` ++"Vec<BenchmarkBatch>"++ - the results of a single of benchmark

??? function "**[`BlockBuilder`](https://paritytech.github.io/polkadot-sdk/master/sp_block_builder/trait.BlockBuilder.html){target=_blank}** - provides the required functionality for building a block"

    ??? function "`apply_extrinsic()` - apply the given extrinsic"

        === "Parameters"

            `extrinsic` ++"<Block as BlockT>::Extrinsic"++ - the extrinsic to apply

        === "Returns"

            `Result` ++"<ApplyExtrinsicResult>"++ - an inclusion outcome which specifies if this extrinsic is included in this block or not

    ??? function "`finalize_block()` - finish the current block"

        === "Parameters"

            None

        === "Returns"

            `Result` ++"<Block as BlockT>::Header"++ - block header

    ??? function "`inherent_extrinsics()` - generate inherent extrinsics. The inherent data will vary from chain to chain"

        === "Parameters"

            `inherent` ++"InherentData"++ - parachain inherent-data passed into the runtime by a block author

        === "Returns"

            `Result` ++"<Vec<Block as BlockT>::Extrinsic>"++ - an array of generated extrinsics

    ??? function "`check_inherents()` - check that the inherents are valid. The inherent data will vary from chain to chain"

        === "Parameters"

            `block` ++"struct"++ - abstraction over a block comprised of header and extrinsics

        === "Returns"

            `Result` ++"CheckInherentsResult"++ - the result of checking inherents. Returns okay if no errors found, stores any occurred errors, and fails if encounters a fatal error

??? function "**[`GrandpaApi`](https://paritytech.github.io/polkadot-sdk/master/sp_consensus_grandpa/trait.GrandpaApi.html){target=_blank}** - for integrating the GRANDPA finality gadget into runtimes"

    ??? function "`grandpa_authorities()` - get the current GRANDPA authorities and weights"

        === "Parameters"

            None

        === "Returns"

            `Result` ++"AuthorityList"++ - a list of Grandpa authorities with associated weights

    ??? function "`submit_report_equivocation_unsigned_extrinsic()` - submits an unsigned extrinsic to report an equivocation"

        === "Parameters"

            `equivocation_proof` ++"struct"++ - proof of voter misbehavior on a given set id. Equivocation happens when a voter votes on the same round for different blocks. Proving is achieved by collecting the signed messages of conflicting votes

            ---

            `key_owner_proof` ++"OpaqueValue"++ - an opaque type used to represent the key ownership proof at the runtime API boundary. 

        === "Returns"

            `Option` ++"enum"++ - returns `None` when creation of the extrinsic fails

    ??? function "`generate_key_ownership_proof()` - generates a proof of key ownership for the given authority in the given set"

        === "Parameters"

            `set_id` ++"u64"++ - the identifier of a GRANDPA set of authorities

            ---

            `authority_id` ++"AuthorityId"++ - identity of a GRANDPA authority 

        === "Returns"

            `OpaqueKeyOwnershipProof` ++"OpaqueValue"++ - an opaque type used to represent the key ownership proof at the runtime API boundary

    ??? function "`current_set_id()` - get current GRANDPA authority set id"

        === "Parameters"

            None

        === "Returns"

            `SetId` ++"u64"++ - the identifier of a GRANDPA set of authorities

??? function "**[`NominationPoolsApi`](https://paritytech.github.io/polkadot-sdk/master/pallet_nomination_pools_runtime_api/trait.NominationPoolsApi.html){target=_blank}** - provides methods to query various balances, pending rewards, and whether a nomination pool or member needs delegate migration"

    ??? function "`pending_rewards()` - returns the pending rewards for the passed `AccountId`"

        === "Parameters"

            `who` ++"u128"++ - the ID of the account to check for pending rewards

        === "Returns"

            `Balance` ++"u128"++ - the balance of pending rewards for the account

    ??? function "`points_to_balance()` - returns the equivalent balance of `points` for a given pool"

        === "Parameters"

            `pool_id` ++"u32"++ - the ID of the pool to check for `points`

        === "Returns"

            `Balance` ++"u128"++ - the balance of `points` for the pool

    ??? function "`balance_to_points()` - returns the equivalent `points` of `new_funds` for a given pool"

        === "Parameters"

            `pool_id` ++"u32"++ - the ID of the pool to check for `points`

        === "Returns"

            `Balance` ++"u128"++ - the equivalent `points` of `new_funds` for the pool

    ??? function "`pool_pending_slash()` - returns the pending slash for a given pool"

        === "Parameters"

            `pool_id` ++"u32"++ - the ID of the pool to check for pending slashing

        === "Returns"

            `Balance` ++"u128"++ - the pending slash amount for the pool

    ??? function "`member_pending_slash()` - returns the pending slash for a given pool member"

        === "Parameters"

            `member` ++"u128"++ - the ID of the member to check for pending slashing

        === "Returns"

            `Balance` ++"u128"++ - the pending slash amount for the given member

    ??? function "`pool_needs_delegate_migration()` - returns `true` if the pool with the passed `pool_id` needs migration"

        === "Parameters"

            `pool_id` ++"u32"++ - the ID of the pool to check for needed migration

        === "Returns"

            `true` ++"bool"++ - returns true if the pool needs migration

    ??? function "`member_needs_delegate_migration()` - returns `true` if the delegated funds of the pool `member` need migration"

        === "Parameters"

            `member` ++"u128"++ - the ID of the member to check for needed migration

        === "Returns"

            `true` ++"bool"++ - returns true if the delegated funds of the pool member need migration

    ??? function "`member_total_balance()` - returns the total contribution of a pool member including any balance that is unbonding"

        === "Parameters"

            `who` ++"u128"++ - the ID of the member to check for total pool contributions

        === "Returns"

            `Balance` ++"u128"++ - the total contribution of a pool member including any balance that is unbonding

    ??? function "`pool_balance()` - total balance contributed to the pool"

        === "Parameters"

            `pool_id` ++"u32"++ - the ID of the pool to check total balance

        === "Returns"

            `Balance` ++"u128"++ - total balance contributed to the pool

??? function "**[`OffchainWorkerApi`](https://paritytech.github.io/polkadot-sdk/master/sp_offchain/trait.OffchainWorkerApi.html){target=_blank}** - for tasks completed by off-chain worker"

    ??? function "`offchain_worker()` - starts the off-chain task for given block header"

        === "Parameters"

            `header` ++"struct"++ - abstraction over a block header for a Polkadot SDK-based chain

        === "Returns"

            `Result` ++"enum"++ - returns `Ok` on success

??? function "**[`SessionKeys`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_frame/runtime/apis/trait.SessionKeys.html){target=_blank}** - for generating and querying session keys"

    ??? function "`generate_session_keys()` - generate a set of session keys with optionally using the given seed"

        === "Parameters"

            `seed` ++"Option<Vec<u8>>"++ - optional seed for generating keys. The seed needs to be a valid `utf8` string

        === "Returns"

            `Result` ++"Vec<u8>"++ - returns the concatenated SCALE encoded public keys

    ??? function "`decode_session_keys()` - decode the given public session keys"

        === "Parameters"

            `encoded` ++"Vec<u8>"++ - the public session keys you wish to decode

        === "Returns"

            `Result` ++"<Vec<(Vec<u8>, KeyTypeId)>>"++ - returns the list of public raw public keys and key type

??? function "**[`TaggedTransactionQueue`](https://paritytech.github.io/polkadot-sdk/master/sp_transaction_pool/runtime_api/trait.TaggedTransactionQueue.html){target=_blank}** - for interfering with the transaction queue"

    ??? function "`validate_transaction()` - validate the transaction"

        === "Parameters"

            `uxt` ++"enum"++ - the source of the transaction

        === "Returns"

            `TransactionValidity` ++"enum"++ - returns `Ok` on success

??? function "**[`TransactionPaymentApi`](https://paritytech.github.io/polkadot-sdk/master/pallet_transaction_payment_rpc_runtime_api/trait.TransactionPaymentApi.html){target=_blank}** - helps estimate fees based on transaction properties like weight, length, and extrinsic type"

    ??? function "`query_info()` - information related to a dispatchable’s class, weight, and fee that can be queried from the runtime"

        === "Parameters"

            `uxt` ++"enum"++ - the extrinsic

            ---

            `len` ++"u32"++ - the length of the extrinsic

        === "Returns"

            `RuntimeDispatchInfo<Balance>` ++"struct<u128>"++ - information related to a dispatchable’s class, weight, and fee that can be queried from the runtime


    ??? function "`query_fee_details()` - return information about the transaction fees for a specified transaction"

        === "Parameters"

            `uxt` ++"enum"++ - the extrinsic

            ---

            `len` ++"u32"++ - the length of the extrinsic

        === "Returns"

            `FeeDetails<Balance>` ++"struct<u128>"++ - composed of inclusion fee (the minimum fee for a transaction to be included in a block) and tip amount, if any

    ??? function "`query_weight_to_fee()` - determine the fee for a given weight"

        === "Parameters"

            `weight` ++"enum"++ - used to characterize the time it takes to execute the calls in the body of a block

        === "Returns"

            `Balance` ++"u128"++ - the given weight converted into a fee

    ??? function "`query_length_to_fee()` - determine the fee for a given length extrinsic"

        === "Parameters"

            `length` ++"u32"++ - the length of the extrinsic

        === "Returns"

            `Balance` ++"u128"++ - the given length converted into a fee



