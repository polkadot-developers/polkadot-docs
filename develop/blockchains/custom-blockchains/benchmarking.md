---
title: Benchmarking
description: Learn how to use FRAME's benchmarking framework to benchmark your custom pallets and provide correct weights for on-chain computation and execution of extrinsics.
---

## Introduction

Along with the development and testing capabilities that the Polkadot SDK provides, a crucial part of pallet development is **benchmarking**. Benchmarking your pallet ensures that an accurate [weight](../../../polkadot-protocol/glossary.md#weight) is assigned to your pallet's extrinsics. Each block has an allotted amount of time for executing extrinsics. The weight of an extrinsic is determined by the time it takes to execute and the storage reads/writes that it performs. Without the ability to know the computational resources that an extrinsic may take, it may run indefinitely or present an opportunity for a Denial of Service (DoS) attack that may halt block production.

[FRAME](../../../polkadot-protocol/glossary.md#frame-framework-for-runtime-aggregation-of-modularized-entities) provides a benchmarking framework ([`frame_benchmarking`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=_blank}), which is a suite of tools that contain a set of macros (similar to conventional unit tests), a CLI for executing benchmarks, and linear regression analysis for processing benchmark data. These tools allow each extrinsic to be benchmarked and assigned an accurate weight within the runtime.

## Why Benchmark Pallets

Including or excluding transactions based on available resources ensures that the runtime can continue to produce and import blocks without service interruptions. For example, suppose you have a function call that requires particularly intensive computation. In that case, executing the call might exceed the maximum time allowed for producing or importing a block, disrupting the block handling process or stopping blockchain progress altogether. Benchmarking helps you validate that the execution time required for different functions is within reasonable boundaries.

Similarly, a malicious user might attempt to disrupt network service by repeatedly executing a function call that requires intensive computation or doesn't accurately reflect the necessary computation. If the cost of executing a function call doesn't accurately reflect the computation involved, there's no incentive to deter a malicious user from attacking the network. 

!!!info "Benchmarking helps with predictable fees and computational outcomes."
    Because benchmarking helps you evaluate the weight associated with executing transactions, it also helps you to determine appropriate transaction fees. Based on your benchmarks, you can set fees representing the resources consumed by executing specific calls on the blockchain.

### Benchmarking and Weight 

Polkadot SDK-based chains use weight to represent the time it takes to execute the transactions in a block. The time required to execute any particular call in a transaction depends on several factors, including the following:

- Computational complexity
- Storage complexity (proof size)
- Database read and write operations required
- Hardware used
  
To calculate an appropriate weight for a transaction, you can use benchmark parameters to measure the time it takes to execute the function calls on different hardware, using different values and repeating them multiple times. You can then use the results of the benchmarking tests to establish an approximate worst-case weight to represent the resources required to execute each function call and each code path. Fees are then based on the worst-case weight. If the actual call performs better than the worst case, the weight is adjusted, and any excess fees can be returned.

Because weight is a generic unit of measurement based on computation time for a specific physical machine, the weight of any function can change based on the specific hardware used for benchmarking. By modeling the expected weight of each runtime function, the blockchain can calculate the number of transactions or system-level calls it can execute within a certain period of time.

Within FRAME, each function call that is dispatched must have a `#[pallet::weight]` annotation that can return the expected weight for the worst-case scenario execution of that function given its inputs:

```rust hl_lines="2"
#[pallet::call_index(0)]
#[pallet::weight(T::WeightInfo::do_something())]
pub fn do_something(origin: OriginFor<T>, bn: u32) -> DispatchResultWithPostInfo { ... }
```

The benchmarking framework automatically generates a file with those formulas for you, as is the case with `T::WeightInfo::do_something()`, which contains the weight measurements for that specific extrinsic post benchmarking.

## Benchmarking Steps

Benchmarking a pallet involves the following steps: 

1. Creating a `benchmarking.rs` file within your pallet's structure
2. Writing a benchmarking test for each extrinisic
3. Executing the benchmarking tool, producing a linear model that measures the weight (time and proof size for an extrinsic)

The benchmarking tool then runs multiple iterations with different possible parameters for each of these functions, wherein the approximate **worst** case scenario is run and applied as the weight. In usage, if the weight is better than this benchmark, fees are adjusted and refunded accordingly. By default, the benchmarking pipeline is deactivated, and it can be enabled by passing in the `runtime-benchmarks` feature flag when compiling your runtime.

## Preparing Your Environment

Before writing benchmarks, you need to ensure the `frame-benchmarking` crate is included in your pallet's `Cargo.toml`:

```toml
frame-benchmarking = { version = "37.0.0", default-features = false }
```

You must also ensure that you add the `runtime-benchmarks` feature flag as follows under the `[features]` section of your pallet's `Cargo.toml`:

```toml
runtime-benchmarks = [
    "frame-benchmarking/runtime-benchmarks",
    "frame-support/runtime-benchmarks",
    "frame-system/runtime-benchmarks",
    "sp-runtime/runtime-benchmarks",
]
```

Lastly, ensure that `frame-benchmarking` is included in `std = []`: 

```toml
std = [
    # ...
    "frame-benchmarking?/std",
    # ...
]
```

Once this is complete, you have the required dependencies for writing benchmarks for your pallet.

## Writing Benchmarks

Create a `benchmarking.rs` file in your pallet's `src/`:

```
my-pallet/
├── src/
│   ├── lib.rs          # Main pallet implementation
│   └── benchmarking.rs # Benchmarking
└── Cargo.toml
```

After which, you may copy the barebones template below to get started:

!!!note "This example is from the pallet template"
    Take a look at the repository in the [`polkadot-sdk-parachain-template`](https://github.com/paritytech/polkadot-sdk-parachain-template/tree/master/pallets){target=\_blank}

```rust
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk-parachain-template/refs/tags/v0.0.2/pallets/template/src/benchmarking.rs'
```

The function `do_something` is a placeholder; you must write your own function that tested your extrinsic. Similar to writing unit tests, you have access to the mock runtime, and can use functions such as `whitelisted_caller()` (an account whitelisted for DB reads/writes) to sign transactions in the benchmarking context.

There are a couple practices to notice: 

- The `#[extrinsic_call]` macro is used when calling the extrinsic itself. This macro is a required part of a benchmarking function, [see the Rust docs](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html#extrinsic_call-and-block){target=_blank} for more clarification
- The `assert_eq` expression ensures that the extrinsic is working properly within the benchmark context

## Adding Benchmarks to Runtime

The last step before running the benchmarking tool is to ensure that the benchmarks are configured as part of your runtime.

Create another file in the node's directory called `benchmarks.rs`. This is where the pallets you wish to benchmark will be registered. This file should contain the following macro, which registers all pallets for benchmarking, as well as their respective configurations: 

```rust
frame_benchmarking::define_benchmarks!(
 [frame_system, SystemBench::<Runtime>]
 [pallet_balances, Balances]
 [pallet_session, SessionBench::<Runtime>]
 [pallet_timestamp, Timestamp]
 [pallet_message_queue, MessageQueue]
 [pallet_sudo, Sudo]
 [pallet_collator_selection, CollatorSelection]
 [cumulus_pallet_parachain_system, ParachainSystem]
 [cumulus_pallet_xcmp_queue, XcmpQueue]
);
```

For example, if the pallet named `pallet_parachain_template` is ready to be benchmarked, it may be added as follows: 

```rust hl_lines="3"
frame_benchmarking::define_benchmarks!(
    // ...
 [pallet_parachain_template, TemplatePallet]
    // ...
);
```

!!!warning 
    If the pallet isn't included in the `define_benchmarks!` macro, the CLI will not be able to access it and benchmark it later.

Navigate to the runtime's `lib.rs` file, and add the import for `benchmarks.rs` as follows: 

```rust 
#[cfg(feature = "runtime-benchmarks")]
mod benchmarks;
```

!!!info 
    The `runtime-benchmarks` feature gate ensures that the benchmarking operations aren't a part of the production runtime. 

## Running Benchmarks

You can now compile your runtime with the following command with the `runtime-benchmarks` feature flag. It is crucial that you have a runtime with this flag enabled, as this is used for benchmarking later:

```bash
cargo build --features runtime-benchmarks --release
```

Once it is compiled with the correct feature set, you can run the benchmarking tool:

```sh
./target/release/<node-binary-name> benchmark pallet \
--runtime <path-to-wasm-runtime> \
--pallet <name-of-the-pallet> \
--extrinsic '*' \
--steps 20 \
--repeat 10 \
--output weights.rs
```

- `--runtime` - the path to your runtime's Wasm
- `--pallet` - the name of the pallet you wish to benchmark. This pallet must be configured in your runtime and defined in `define_benchmarks`
- `--extrinsic` - which extrinsic to test. Using `'*'` implies all extrinsics will be benchmarked
- `--output` - where the output of the auto-generated weights will reside

The result should be a `weights.rs` file containing the types you can use to annotate your extrinsic with the correctly balanced weights in your runtime. The output should be similar to the following. Some output has been omitted for brevity: 

```sh
2024-10-28 11:07:25 Loading WASM from ./target/release/wbuild/educhain-runtime/educhain_runtime.wasm
2024-10-28 11:07:26 Could not find genesis preset 'development'. Falling back to default.
2024-10-28 11:07:26 assembling new collators for new session 0 at #0
2024-10-28 11:07:26 assembling new collators for new session 1 at #0
2024-10-28 11:07:26 Loading WASM from ./target/release/wbuild/educhain-runtime/educhain_runtime.wasm
Pallet: "pallet_parachain_template", Extrinsic: "do_something", Lowest values: [], Highest values: [], Steps: 20, Repeat: 10

# ... Storage Info, Median Slopes, and Min Squares Analysis ...

Created file: "weights.rs"
2024-10-28 11:07:27 [  0 % ] Starting benchmark: pallet_parachain_template::do_something
2024-10-28 11:07:27 [ 50 % ] Starting benchmark: pallet_parachain_template::cause_error
```

### Adding Benchmarked Weights to Pallet

Once the `weights.rs` is generated, you may add the generated weights to your pallet. It is common that `weights.rs` become part of your pallet's root in `src/`:
```rust
use crate::weights::WeightInfo;

/// Configure the pallet by specifying the parameters and types on which it depends.
#[pallet::config]
pub trait Config: frame_system::Config {
    /// A type representing the weights required by the dispatchables of this pallet.
    type WeightInfo: WeightInfo;
}
```

After which, you may add this to the `#[pallet::weight]` annotation in the extrinsic via the `Config`: 

```rust hl_lines="2"
#[pallet::call_index(0)]
#[pallet::weight(T::WeightInfo::do_something())]
pub fn do_something(origin: OriginFor<T>, bn: u32) -> DispatchResultWithPostInfo { ... }
```

## What's Next

- View the Rust Docs for a more comprehensive, low-level view of the [FRAME V2 Benchmarking Suite](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=_blank}
- Read the [FRAME Benchmarking and Weights](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_benchmarking_weight/index.html){target=_blank} reference document, a concise guide which details how weights and benchmarking work
