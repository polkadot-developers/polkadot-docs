---
title: Benchmark Testing
description: Learn how to use FRAME's benchmarking framework to benchmark your custom pallets and provide correct weights for on-chain computation and execution of extrinsics.
---

# Benchmark Testing

## Introduction

Benchmark testing is a critical component of developing efficient and secure blockchain runtimes. In the Polkadot ecosystem, accurately benchmark testing your custom pallets ensures that each extrinsic has a precise [weight](/polkadot-protocol/glossary/#weight){target=\_blank}, representing its computational and storage demands. This process is vital for maintaining the blockchain's performance and preventing potential vulnerabilities, such as Denial of Service (DoS) attacks.

The Polkadot SDK leverages the [FRAME](/polkadot-protocol/glossary/#frame-framework-for-runtime-aggregation-of-modularized-entities){target=\_blank} benchmarking framework, offering tools to measure and assign weights to extrinsics. These weights help determine the maximum number of transactions or system-level calls processed within a block. This guide covers how to use FRAME's [benchmarking framework](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=\_blank}, from setting up your environment to writing and running benchmarks for your custom pallets. You'll understand how to generate accurate weights by the end, ensuring your runtime remains performant and secure.

## The Case for Benchmark Testing

Benchmark testing helps validate that the required execution time for different functions is within reasonable boundaries to ensure your blockchain runtime can handle transactions efficiently and securely. By accurately measuring the weight of each extrinsic, you can prevent service interruptions caused by computationally intensive calls that exceed block time limits. Without benchmark testing, runtime performance could be vulnerable to DoS attacks, where malicious users exploit functions with unoptimized weights.

Benchmark testing also ensures predictable transaction fees. Weights derived from benchmark tests accurately reflect the resource usage of function calls, allowing fair fee calculation. This approach discourages abuse while maintaining network reliability.

### Benchmark Testing and Weight 

In Polkadot SDK-based chains, weight quantifies the computational effort needed to process transactions. This weight includes factors such as:

- Computational complexity
- Storage complexity (proof size)
- Database reads and writes 
- Hardware specifications

Benchmark testing uses real-world testing to simulate worst-case scenarios for extrinsics. The framework generates a linear model for weight calculation by running multiple iterations with varied parameters. These worst-case weights ensure blocks remain within execution limits, enabling the runtime to maintain throughput under varying loads. Excess fees can be refunded if a call uses fewer resources than expected, offering users a fair cost model.
  
Because weight is a generic unit of measurement based on computation time for a specific physical machine, the weight of any function can change based on the specifications of hardware used for benchmark testing. By modeling the expected weight of each runtime function, the blockchain can calculate the number of transactions or system-level calls it can execute within a certain period of time.

Within FRAME, each function call that is dispatched must have a `#[pallet::weight]` annotation that can return the expected weight for the worst-case scenario execution of that function given its inputs:

```rust hl_lines="2"
--8<-- 'code/develop/parachains/customize-parachain/benchmarking/dispatchable-pallet-weight.rs'
```

The `WeightInfo` file is automatically generated during benchmark testing. Based on these tests, this file provides accurate weights for each extrinsic.

## Benchmark Process

Benchmark testing a pallet involves the following steps: 

1. Creating a `benchmarking.rs` file within your pallet's structure
2. Writing a benchmarking test for each extrinsic
3. Executing the benchmarking tool to calculate weights based on performance metrics

The benchmarking tool runs multiple iterations to model worst-case execution times and determine the appropriate weight. By default, the benchmark testing pipeline is deactivated. To activate it, compile your runtime with the `runtime-benchmarks` feature flag.

### Prepare Your Environment

Before writing benchmark tests, you need to ensure the `frame-benchmarking` crate is included in your pallet's `Cargo.toml` similar to the following:

```toml title="Cargo.toml"
--8<-- 'code/develop/parachains/customize-parachain/benchmarking/cargo.toml::1'
```

You must also ensure that you add the `runtime-benchmarks` feature flag as follows under the `[features]` section of your pallet's `Cargo.toml`:

```toml title="Cargo.toml"
--8<-- 'code/develop/parachains/customize-parachain/benchmarking/cargo.toml:2:7'
```

Lastly, ensure that `frame-benchmarking` is included in `std = []`: 

```toml title="Cargo.toml"
--8<-- 'code/develop/parachains/customize-parachain/benchmarking/cargo.toml:8:12'
```

Once complete, you have the required dependencies for writing benchmark tests for your pallet.

### Write Benchmark Tests

Create a `benchmarking.rs` file in your pallet's `src/`. Your directory structure should look similar to the following:

```
my-pallet/
├── src/
│   ├── lib.rs          # Main pallet implementation
│   └── benchmarking.rs # Benchmarking
└── Cargo.toml
```

With the directory structure set, you can use the [`polkadot-sdk-parachain-template`](https://github.com/paritytech/polkadot-sdk-parachain-template/tree/master/pallets){target=\_blank} to get started as follows:

```rust title="benchmarking.rs (starter template)"
--8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk-parachain-template/refs/tags/v0.0.2/pallets/template/src/benchmarking.rs'
```

In your benchmarking tests, employ these best practices:

- **Write custom testing functions** - the function `do_something` in the preceding example is a placeholder. Similar to writing unit tests, you must write custom functions to benchmark test your extrinsics. Access the mock runtime and use functions such as `whitelisted_caller()` to sign transactions and facilitate testing
- **Use the `#[extrinsic_call]` macro** - this macro is used when calling the extrinsic itself and is a required part of a benchmark testing function. See the [`extrinsic_call Rust docs](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html#extrinsic_call-and-block){target=_blank} for more details
- **Validate extrinsic behavior** - the `assert_eq` expression ensures that the extrinsic is working properly within the benchmark context

### Add Benchmarks to Runtime

Before running the benchmarking tool, you must integrate benchmarks with your runtime as follows:

1. Create a `benchmarks.rs` file. This file should contain the following macro, which registers all pallets for benchmarking, as well as their respective configurations: 
    ```rust title="benchmarks.rs"
    --8<-- 'code/develop/parachains/customize-parachain/benchmarking/frame-benchmark-macro.rs'
    ```
    For example, to register a pallet named `pallet_parachain_template` for benchmark testing, add it as follows: 
    ```rust title="benchmarks.rs" hl_lines="3"
    --8<-- 'code/develop/parachains/customize-parachain/benchmarking/frame-benchmark-macro.rs::3'
    );
    ```

    !!!warning "Updating `define_benchmarks!` macro is required"
        If the pallet isn't included in the `define_benchmarks!` macro, the CLI cannot access and benchmark it later.

2. Navigate to the runtime's `lib.rs` file and add the import for `benchmarks.rs` as follows: 

    ```rust title="lib.rs"
    #[cfg(feature = "runtime-benchmarks")]
    mod benchmarks;
    ```

    The `runtime-benchmarks` feature gate ensures benchmark tests are isolated from production runtime code.

### Run Benchmarks

You can now compile your runtime with the `runtime-benchmarks` feature flag. This feature flag is crucial as the benchmarking tool will look for this feature being enabled to know when it should run benchmark tests. Follow these steps to compile the runtime with benchmarking enabled:

1. Run `build` with the feature flag included

    ```bash
    cargo build --features runtime-benchmarks --release
    ```

2. Once compiled, run the benchmarking tool to measure extrinsic weights

    ```sh
    ./target/release/INSERT_NODE_BINARY_NAME benchmark pallet \
    --runtime INSERT_PATH_TO_WASM_RUNTIME \
    --pallet INSERT_NAME_OF_PALLET \
    --extrinsic '*' \
    --steps 20 \
    --repeat 10 \
    --output weights.rs
    ```

    !!! info "Flag definitions"
        - `--runtime` - the path to your runtime's Wasm
        - `--pallet` - the name of the pallet you wish to benchmark. This pallet must be configured in your runtime and defined in `define_benchmarks`
        - `--extrinsic` - which extrinsic to test. Using `'*'` implies all extrinsics will be benchmarked
        - `--output` - where the output of the auto-generated weights will reside

The generated `weights.rs` file contains weight annotations for your extrinsics, ready to be added to your pallet. The output should be similar to the following. Some output is omitted for brevity: 

--8<-- 'code/develop/parachains/customize-parachain/benchmarking/benchmark-output.html'

#### Add Benchmark Weights to Pallet

Once the `weights.rs` is generated, you may add the generated weights to your pallet. It is common that `weights.rs` become part of your pallet's root in `src/`:

```rust
--8<-- 'code/develop/parachains/customize-parachain/benchmarking/weight-config.rs'
```

After which, you may add this to the `#[pallet::weight]` annotation in the extrinsic via the `Config`: 

```rust hl_lines="2"
--8<-- 'code/develop/parachains/customize-parachain/benchmarking/dispatchable-pallet-weight.rs'
```

## Where to Go Next

- View the Rust Docs for a more comprehensive, low-level view of the [FRAME V2 Benchmarking Suite](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=_blank}
- Read the [FRAME Benchmarking and Weights](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_benchmarking_weight/index.html){target=_blank} reference document, a concise guide which details how weights and benchmarking work
