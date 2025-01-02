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





