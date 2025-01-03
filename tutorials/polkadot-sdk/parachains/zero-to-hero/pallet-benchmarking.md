---
title: Pallet Benchmarking
description: TODO
---

## Introduction

After implementing and testing your pallet with a mock runtime, the next crucial step is benchmarking. Benchmarking assigns precise [weight](/polkadot-protocol/glossary/#weight){target=\_blank} to each extrinsic, measuring their computational and storage costs. These derived weights enable accurate fee calculation and resource allocation within the runtime.
This tutorial demonstrates how to:

- Configure your development environment for benchmarking
- Create and implement benchmark tests for your extrinsics
- Apply benchmark results to your pallet's extrinsics

For comprehensive information about benchmarking concepts, refer to the [Benchmarking](/develop/parachains/testing/benchmarking/){target=\_blank} guide.

---

## Environment Setup

Follow these steps to prepare your environment for pallet benchmarking:

1. Install the `frame-omni-bencher` command-line tool:
    
    ```bash
    cargo install frame-omni-bencher
    ```

2. Update your pallet's `Cargo.toml` file in the `pallets/custom-pallet` directory with the following modifications:
    1. Add the [`frame-benchmarking`](https://docs.rs/frame-benchmarking/latest/frame_benchmarking/){target=\_blank} dependency:
    
        ```toml hl_lines="3"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/pallet-cargo.toml:10:10'
        ...
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/pallet-cargo.toml:15:15'
        ```

    2. Enable benchmarking in the `std` features:
        ```toml hl_lines="6"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/pallet-cargo.toml:24:30'
        ```

    3. Add the `runtime-benchmarks` feature flag:
        ```toml
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/pallet-cargo.toml:31:36'
        ```

    ??? "View complete `Cargo.toml` file:"
        ```toml
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/pallet-cargo.toml'
        ```

3. Add your pallet to the runtime's benchmark configuration:
    1.  Register your pallet in `runtime/src/benchmarks.rs`:
        ```rust hl_lines="11"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/benchmarks.rs:26:37'
        ```

    2. Enable runtime benchmarking for your pallet in `runtime/Cargo.toml`:
        ```toml hl_lines="25"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/runtime-cargo.toml:136:161'
        ```

4. Set up the benchmarking module in your pallet:
    1. Create a new `benchmarking.rs` file in your pallet directory:
        ```bash
        touch benchmarking.rs
        ```

    2. Add the benchmarking module to your pallet. In the pallet `lib.rs` file add the following:
        ```rust hl_lines="9-10"
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/lib.rs:1:12'
        ```

## Implement Benchmark Tests

When writing benchmarking tests for your pallet, you'll create specialized test functions for each extrinsic, similar to unit tests. These tests use the mock runtime you created earlier for testing, allowing you to leverage its utility functions.

Every benchmark test must follow a three-step pattern:

1. **Setup** - perform any necessary setup before calling the extrinsic. This might include creating accounts, setting initial states, or preparing test data
2. **Execute the extrinsic** - execute the actual extrinsic using the `#[extrinsic_call]` macro. This must be a single line that calls your extrinsic function with the origin as its first argument
3. **Verification** - check that the extrinsic worked correctly within the benchmark context by checking the expected state changes

Check the following example on how to benchmark the `set_counter_value` extrinsic:

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/benchmarking.rs:15:23'
```

Now, implement the complete set of benchmark tests. Copy the following content in the `benchmarking.rs` file:

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/benchmarking.rs'
```

!!!note
    The `#[benchmark]` macro marks these functions as benchmark tests, while the `#[extrinsic_call]` macro specifically identifies which line contains the extrinsic being measured. For more information check the [frame_benchmarking](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=\_blank} rust docs.

## Execute the Benchmarking

After you set up your environment and implemented the benchmarking test suit, you have to execute them. To do that, follow these steps:

1. Build your runtime again, but this time with the feature `runtime-benchmarks` enabled:

    ```bash
    cargo build --features runtime-benchmarks --release
    ```

2. Create a `weights.rs` file in your pallet's `src/` dir:

    ```bash
    touch weights.rs
    ```

3. Before executing the benchmarking cli, you will need to download a template file that will help you autogenerate the weights for your extrinsics. Execute the following command:

    ```bash
    mkdir ./pallets/benchmarking && \
    curl https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/substrate/.maintain/frame-weight-template.hbs \
    --output ./pallets/benchmarking/frame-weight-template.hbs
    ```

4. Run the benchmarking cli:

    ```bash
    frame-omni-bencher v1 benchmark pallet \
    --runtime target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
    --pallet "custom_pallet" \
    --extrinsic "" \
    --template ./pallets/benchmarking/frame-weight-template.hbs \
    --output ./pallets/custom-pallet/src/weights.rs
    ```

After that, the `weights.rs` file should have the autogenerated code with the necessary information to be added to the extrinsics.

## Add Benchmarking Weights to the Pallet

