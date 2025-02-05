---
title: Pallet Benchmarking
description: Learn how to benchmark Polkadot SDK-based pallets, assigning precise weights to extrinsics for accurate fee calculation and runtime optimization.
---

## Introduction

After validating your pallet through testing and integrating it into your runtime, the next crucial step is benchmarking. Testing procedures were detailed in the [Pallet Unit Testing](/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-unit-testing/){target=\_blank} tutorial, while runtime integration was covered in the [Add Pallets to the Runtime](/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/){target=\_blank} guide.

Benchmarking assigns precise [weight](/polkadot-protocol/glossary/#weight){target=\_blank} to each extrinsic, 
measuring their computational and storage costs. These derived weights enable accurate fee calculation and resource 
allocation within the runtime.

This tutorial demonstrates how to:

- Configure your development environment for benchmarking
- Create and implement benchmark tests for your extrinsics
- Apply benchmark results to your pallet's extrinsics

For comprehensive information about benchmarking concepts, refer to the [Benchmarking](/develop/parachains/testing/benchmarking/){target=\_blank} guide.

## Environment Setup

Follow these steps to prepare your environment for pallet benchmarking:

1. Install the [`frame-omni-bencher`](https://crates.io/crates/frame-omni-bencher){target=\_blank} command-line tool:
    
    ```bash
    cargo install frame-omni-bencher
    ```

2. Update your pallet's `Cargo.toml` file in the `pallets/custom-pallet` directory with the following modifications:
    1. Add the [`frame-benchmarking`](https://docs.rs/frame-benchmarking/latest/frame_benchmarking/){target=\_blank} dependency:
    
        ```toml hl_lines="3" title="Cargo.toml"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:10:10'
        ...
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:15:15'
        ```

    2. Enable benchmarking in the `std` features:
        ```toml hl_lines="6" title="Cargo.toml"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:24:30'
        ```

    3. Add the `runtime-benchmarks` feature flag:
        ```toml hl_lines="3-8" title="Cargo.toml"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:22:22'
        ...
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:31:36'
        ```

3. Add your pallet to the runtime's benchmark configuration:
    1.  Register your pallet in `runtime/src/benchmarks.rs`:
        ```rust hl_lines="11" title="benchmarks.rs"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/benchmarks.rs:26:37'
        ```

    2. Enable runtime benchmarking for your pallet in `runtime/Cargo.toml`:
        ```toml hl_lines="3" title="Cargo.toml"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/Cargo.toml:136:136'
          ...
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/Cargo.toml:160:161'
        ```

4. Set up the benchmarking module in your pallet:
    1. Create a new `benchmarking.rs` file in your pallet directory:
        ```bash
        touch benchmarking.rs
        ```

    2. Add the benchmarking module to your pallet. In the pallet `lib.rs` file add the following:
        ```rust hl_lines="9-10" title="lib.rs"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:21:32'
        ```

    The `benchmarking` module is gated behind the `runtime-benchmarks` feature flag. It will only be compiled when this flag is explicitly enabled in your project's `Cargo.toml` or via the `--features runtime-benchmarks` compilation flag.

## Implement Benchmark Tests

When writing benchmarking tests for your pallet, you'll create specialized test functions for each extrinsic, similar to unit tests. These tests use the mock runtime you created earlier for testing, allowing you to leverage its utility functions.

Every benchmark test must follow a three-step pattern:

1. **Setup** - perform any necessary setup before calling the extrinsic. This might include creating accounts, setting initial states, or preparing test data
2. **Execute the extrinsic** - execute the actual extrinsic using the [`#[extrinsic_call]`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/attr.extrinsic_call.html){target=\_blank} macro. This must be a single line that calls your extrinsic function with the origin as its first argument
3. **Verification** - check that the extrinsic worked correctly within the benchmark context by checking the expected state changes

Check the following example on how to benchmark the `increment` extrinsic:

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/benchmarking.rs:41:55'
```

This benchmark test:

1. Creates a whitelisted caller and sets an initial counter value of 5
2. Calls the increment extrinsic to increase the counter by 1
3. Verifies that the counter was properly incremented to 6 and that the user's interaction was recorded in storage

This example demonstrates how to properly set up state, execute an extrinsic, and verify its effects during benchmarking.

Now, implement the complete set of benchmark tests. Copy the following content in the `benchmarking.rs` file:

```rust title="benchmarking.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/benchmarking.rs:20'
```

The [`#[benchmark]`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/attr.benchmark.html){target=\_blank} macro marks these functions as benchmark tests, while the `#[extrinsic_call]` macro specifically identifies which line contains the extrinsic being measured. For more information, see the [frame_benchmarking](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=\_blank} Rust docs.

## Execute the Benchmarking

After implementing your benchmark test suite, you'll need to execute the tests and generate the weights for your extrinsics. This process involves building your runtime with benchmarking features enabled and using the `frame-omni-bencher` CLI tool. To do that, follow these steps:

1. Build your runtime with the `runtime-benchmarks` feature enabled:

    ```bash
    cargo build --features runtime-benchmarks --release
    ```

    This special build includes all the necessary benchmarking code that's normally excluded from production builds.

2. Create a `weights.rs` file in your pallet's `src/` directory. This file will store the auto-generated weight calculations:

    ```bash
    touch weights.rs
    ```

3. Before running the benchmarking tool, you'll need a template file that defines how weight information should be formatted. Download the official template from the Polkadot SDK repository and save it in your project folders for future use:

    ```bash
    mkdir ./pallets/benchmarking && \
    curl https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/substrate/.maintain/frame-weight-template.hbs \
    --output ./pallets/benchmarking/frame-weight-template.hbs
    ```

4. Execute the benchmarking process using the `frame-omni-bencher` CLI:

    ```bash
    frame-omni-bencher v1 benchmark pallet \
    --runtime target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
    --pallet "custom_pallet" \
    --extrinsic "" \
    --template ./pallets/benchmarking/frame-weight-template.hbs \
    --output ./pallets/custom-pallet/src/weights.rs
    ```

When the benchmarking process completes, your `weights.rs` file will contain auto-generated code with weight calculations for each of your pallet's extrinsics. These weights help ensure fair and accurate fee calculations when your pallet is used in a production environment.

## Add Benchmarking Weights to the Pallet

After generating the weight calculations, you need to integrate these weights into your pallet's code. This integration ensures your pallet properly accounts for computational costs in its extrinsics.

First, add the necessary module imports to your pallet. These imports make the weights available to your code:

```rust hl_lines="4-5" title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:30:34'
```

Next, update your pallet's `Config` trait to include weight information. Define the `WeightInfo` type:

```rust hl_lines="11-12" title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:45:57'
```

Now you can assign weights to your extrinsics. Here's how to add weight calculations to the `set_counter_value` function:

```rust hl_lines="2" title="lib.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:116:133'
```

You must apply similar weight annotations to the other extrinsics in your pallet. Add the `#[pallet::weight(T::WeightInfo::function_name())]` attribute to both `increment` and `decrement`, replacing `function_name` with the respective function names from your `WeightInfo` trait.

For testing purposes, you must implement the weight calculations in your mock runtime. Open `custom-pallet/src/mock.rs` and add:

```rust hl_lines="4" title="mock.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/mock.rs:60:64'
```

Finally, configure the actual weight values in your production runtime. In `runtime/src/config/mod.rs`, add:

```rust hl_lines="5" title="mod.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime/src/configs/mod.rs:327:332'
```

Your pallet is now complete with full testing and benchmarking support, ready for production use.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy on Paseo TestNet__

    ---

    Deploy your Polkadot SDK blockchain on Paseo! Follow this step-by-step guide for a seamless journey to a successful TestNet deployment.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/)

</div>