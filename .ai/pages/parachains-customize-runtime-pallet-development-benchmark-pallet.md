---
title: Benchmark Your Pallet
description: Learn how to benchmark your custom pallet extrinsics to generate accurate weight calculations for production use.
categories: Parachains
url: https://docs.polkadot.com/parachains/customize-runtime/pallet-development/benchmark-pallet/
---

## Introduction

Benchmarking is the process of measuring the computational resources (execution time and storage) required by your pallet's extrinsics. Accurate [weight](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/index.html){target=\_blank} calculations are essential for ensuring your blockchain can process transactions efficiently while protecting against denial-of-service attacks.

This guide continues the pallet development series, building on the [Create a Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet), [Mock Your Runtime](/parachains/customize-runtime/pallet-development/mock-runtime), and [Test Your Pallet](/parachains/customize-runtime/pallet-development/pallet-testing) tutorials. You'll learn how to benchmark the counter pallet extrinsics and integrate the generated weights into your runtime.

## Prerequisites

Before you begin, ensure you have:

- Completed the previous pallet development tutorials
- Basic understanding of computational complexity
- Familiarity with Rust's testing framework

## Why Benchmark?

In blockchain systems, every operation consumes resources. Weight is the mechanism Polkadot SDK uses to measure and limit resource consumption. Without accurate weights:

- **Security Risk**: Malicious actors could submit transactions that consume excessive resources, blocking legitimate transactions or halting the chain
- **Inefficiency**: Over-estimated weights waste block space and reduce throughput
- **User Experience**: Inaccurate weights lead to incorrect fee calculations

Benchmarking provides empirical measurements of your extrinsics under various conditions, ensuring weights reflect real-world resource consumption.

## Understanding Weights

The [weight system](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_runtime_types/index.html){target=\_blank} serves multiple purposes:

- **DoS Protection**: Limits the computational work per block, preventing attackers from overwhelming the network
- **Fee Calculation**: Determines transaction fees based on actual resource usage
- **Block Production**: Helps block authors maximize throughput while staying within block limits

Weights are expressed as [`Weight::from_parts(ref_time, proof_size)`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.Weight.html#method.from_parts){target=\_blank} where:

- [`ref_time`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.Weight.html#method.ref_time){target=\_blank}: Computational time measured in picoseconds
- [`proof_size`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.Weight.html#method.proof_size){target=\_blank}: Storage proof size in bytes

## Step 1: Create the Benchmarking Module

Create a new file `benchmarking.rs` in your pallet's `src` directory. This module will contain all the [benchmarking definitions](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=\_blank} for your pallet:

```rust title="pallets/pallet-custom/src/benchmarking.rs"
#![cfg(feature = "runtime-benchmarks")]

use super::*;
use frame::deps::frame_benchmarking::v2::*;
use frame::benchmarking::prelude::RawOrigin;

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn set_counter_value() {
        let new_value: u32 = 100;

        #[extrinsic_call]
        _(RawOrigin::Root, new_value);

        assert_eq!(CounterValue::<T>::get(), new_value);
    }

    #[benchmark]
    fn increment() {
        let caller: T::AccountId = whitelisted_caller();
        let amount: u32 = 50;

        #[extrinsic_call]
        _(RawOrigin::Signed(caller.clone()), amount);

        assert_eq!(CounterValue::<T>::get(), amount);
        assert_eq!(UserInteractions::<T>::get(caller), 1);
    }

    #[benchmark]
    fn decrement() {
        // First set the counter to a non-zero value
        CounterValue::<T>::put(100);

        let caller: T::AccountId = whitelisted_caller();
        let amount: u32 = 30;

        #[extrinsic_call]
        _(RawOrigin::Signed(caller.clone()), amount);

        assert_eq!(CounterValue::<T>::get(), 70);
        assert_eq!(UserInteractions::<T>::get(caller), 1);
    }

    impl_benchmark_test_suite!(Pallet, crate::mock::new_test_ext(), crate::mock::Test);
}
```

**Key components:**

- **`#![cfg(feature = "runtime-benchmarks")]`**: Ensures benchmarking code only compiles when the feature is enabled
- **[`#[benchmarks]` macro](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/attr.benchmarks.html){target=\_blank}**: Marks the module containing benchmark definitions
- **[`#[benchmark]` macro](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/attr.benchmark.html){target=\_blank}**: Defines individual benchmark functions
- **[`#[extrinsic_call]`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/attr.extrinsic_call.html){target=\_blank}**: Marks the actual extrinsic invocation to measure
- **[`whitelisted_caller()`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/fn.whitelisted_caller.html){target=\_blank}**: Generates a funded account for benchmarking
- **[`impl_benchmark_test_suite!`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/macro.impl_benchmark_test_suite.html){target=\_blank}**: Generates test functions to verify benchmarks work correctly

## Step 2: Define the Weight Trait

The [`WeightInfo`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/trait.WeightInfo.html){target=\_blank} trait provides an abstraction layer that allows weights to be swapped at runtime configuration. This enables you to use placeholder weights during development and testing, then switch to auto-generated benchmarked weights in production without modifying the pallet code itself.

Add a `weights` module to your pallet that defines the `WeightInfo` trait:

```rust title="pallets/pallet-custom/src/lib.rs"
#[frame::pallet]
pub mod pallet {
    use frame::prelude::*;
    pub use weights::WeightInfo;

    pub mod weights {
        use frame::prelude::*;

        pub trait WeightInfo {
            fn set_counter_value() -> Weight;
            fn increment() -> Weight;
            fn decrement() -> Weight;
        }

        impl WeightInfo for () {
            fn set_counter_value() -> Weight {
                Weight::from_parts(10_000, 0)
            }
            fn increment() -> Weight {
                Weight::from_parts(15_000, 0)
            }
            fn decrement() -> Weight {
                Weight::from_parts(15_000, 0)
            }
        }
    }

    // ... rest of pallet
}
```

The `()` implementation provides placeholder weights for development. Later, this will be replaced with auto-generated weights from benchmarking.

## Step 3: Add WeightInfo to Config

By making `WeightInfo` an associated type in the `Config` trait, you allow each runtime that uses your pallet to specify which weight implementation to use. Different deployment environments (testnets, production chains, or different hardware configurations) may have different performance characteristics and can use different weight calculations.

Update your pallet's `Config` trait to include `WeightInfo`:

```rust title="pallets/pallet-custom/src/lib.rs"
#[pallet::config]
pub trait Config: frame_system::Config {
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    #[pallet::constant]
    type CounterMaxValue: Get<u32>;

    type WeightInfo: weights::WeightInfo;
}
```

## Step 4: Update Extrinsic Weight Annotations

By calling `T::WeightInfo::function_name()` instead of using hardcoded `Weight::from_parts()` values, your extrinsics automatically use whichever weight implementation is configured in the runtime. This allows you to easily switch between placeholder weights for testing and benchmarked weights for production without changing any pallet code.

Replace the placeholder weights in your extrinsics with calls to the `WeightInfo` trait:

```rust title="pallets/pallet-custom/src/lib.rs"
#[pallet::call]
impl<T: Config> Pallet<T> {
    #[pallet::call_index(0)]
    #[pallet::weight(T::WeightInfo::set_counter_value())]
    pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
        // ... implementation
    }

    #[pallet::call_index(1)]
    #[pallet::weight(T::WeightInfo::increment())]
    pub fn increment(origin: OriginFor<T>, amount: u32) -> DispatchResult {
        // ... implementation
    }

    #[pallet::call_index(2)]
    #[pallet::weight(T::WeightInfo::decrement())]
    pub fn decrement(origin: OriginFor<T>, amount: u32) -> DispatchResult {
        // ... implementation
    }
}
```

## Step 5: Include the Benchmarking Module

The `#[cfg(feature = "runtime-benchmarks")]` attribute ensures that benchmarking code is only compiled when explicitly needed. This keeps your production runtime lean by excluding benchmarking infrastructure from normal builds, as it's only needed when generating weights.

At the top of your `lib.rs`, add the module declaration:

```rust title="pallets/pallet-custom/src/lib.rs"
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;
use alloc::vec::Vec;

pub use pallet::*;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

// ... rest of the pallet
```

## Step 6: Configure Pallet Dependencies

The feature flag system in Cargo allows you to conditionally compile code based on which features are enabled. By defining a `runtime-benchmarks` feature that cascades to FRAME's benchmarking features, you create a clean way to build your pallet with or without benchmarking support, ensuring all necessary dependencies are available when needed but excluded from production builds.

Update your pallet's `Cargo.toml` to enable the benchmarking feature:

```toml title="pallets/pallet-custom/Cargo.toml"
[dependencies]
codec = { features = ["derive"], workspace = true }
scale-info = { features = ["derive"], workspace = true }
frame = { features = ["experimental", "runtime"], workspace = true }

[features]
default = ["std"]
runtime-benchmarks = [
    "frame/runtime-benchmarks",
]
std = [
    "codec/std",
    "scale-info/std",
    "frame/std",
]
```

## Step 7: Update Mock Runtime

In your mock runtime for testing, use the placeholder `()` implementation of `WeightInfo` since unit tests focus on verifying functional correctness rather than performance characteristics. This keeps tests fast and focused on validating logic.

Add the `WeightInfo` type to your test configuration in `mock.rs`:

```rust title="pallets/pallet-custom/src/mock.rs"
impl pallet_custom::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<1000>;
    type WeightInfo = ();
}
```

## Step 8: Configure Runtime Benchmarking

To execute benchmarks, your pallet must be integrated into the runtime's benchmarking infrastructure. This involves three configuration steps:

### Update Runtime Cargo.toml

When you build the runtime with `--features runtime-benchmarks`, this configuration ensures all necessary benchmarking code across all pallets (including yours) is included.

Add your pallet to the runtime's `runtime-benchmarks` feature in `runtime/Cargo.toml`:

```toml title="runtime/Cargo.toml"
runtime-benchmarks = [
    "cumulus-pallet-parachain-system/runtime-benchmarks",
    "hex-literal",
    "pallet-parachain-template/runtime-benchmarks",
    "polkadot-sdk/runtime-benchmarks",
    "pallet-custom/runtime-benchmarks",
]
```

### Update Runtime Configuration

Start with the placeholder implementation during development. After successfully running benchmarks and generating the weights file, you'll update this to use the benchmarked weights.

In `runtime/src/configs/mod.rs`, add the `WeightInfo` type:

```rust title="runtime/src/configs/mod.rs"
impl pallet_custom::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<1000>;
    type WeightInfo = ();
}
```

### Register Benchmarks

The `define_benchmarks!` macro creates the infrastructure that allows the benchmarking CLI tool to discover and execute your pallet's benchmarks.

Add your pallet to the benchmark list in `runtime/src/benchmarks.rs`:

```rust title="runtime/src/benchmarks.rs"
polkadot_sdk::frame_benchmarking::define_benchmarks!(
    [frame_system, SystemBench::<Runtime>]
    [pallet_balances, Balances]
    // ... other pallets
    [pallet_custom, CustomPallet]
);
```

## Step 9: Run Benchmarks

### Test Benchmark Compilation

The `impl_benchmark_test_suite!` macro generates unit tests for each benchmark. Running these tests verifies that your benchmarks compile correctly, execute without panicking, and pass their assertions, catching issues early before building the full runtime.

First, verify your benchmarks compile and run as tests:

```bash
cargo test -p pallet-custom --features runtime-benchmarks
```

You should see your benchmark tests passing:

```
test benchmarking::benchmarks::bench_set_counter_value ... ok
test benchmarking::benchmarks::bench_increment ... ok
test benchmarking::benchmarks::bench_decrement ... ok
```

### Build the Runtime with Benchmarks

This build includes all the benchmarking infrastructure and special host functions needed for measurement. The resulting WASM runtime contains your benchmark code and can communicate with the benchmarking tool's execution environment. This is a special build used only for benchmarking - you'll create a different build later for actually running your chain.

Compile the runtime with benchmarking enabled to generate the WASM binary:

```bash
cargo build --release --features runtime-benchmarks
```

This produces the runtime WASM file needed for benchmarking, typically located at:
```
target/release/wbuild/parachain-template-runtime/parachain_template_runtime.wasm
```

### Install the Benchmarking Tool

[`frame-omni-bencher`](https://paritytech.github.io/polkadot-sdk/master/frame_omni_bencher/index.html){target=\_blank} is the official Polkadot SDK tool specifically designed for FRAME pallet benchmarking. It provides a standardized way to execute benchmarks, measure execution times and storage operations, and generate properly formatted weight files with full integration into the FRAME weight system.

Install the `frame-omni-bencher` CLI tool:

```bash
cargo install frame-omni-bencher --locked
```

### Download the Weight Template

The weight template is a Handlebars file that transforms raw benchmark data into a properly formatted Rust source file. It defines the structure of the generated `weights.rs` file, including imports, trait definitions, documentation comments, and formatting. Using the official template ensures your weight files follow Polkadot SDK conventions and include all necessary metadata like benchmark execution parameters, storage operation counts, and hardware information.

Download the official weight template file:

```bash
curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/substrate/.maintain/frame-weight-template.hbs \
--output ./pallets/pallet-custom/frame-weight-template.hbs
```

### Hardware Requirements for Benchmarking

!!! warning "Critical: Benchmark on Production-Like Hardware"
    Benchmarks must be executed on hardware similar to what will run your chain in production. Weight measurements are hardware-dependent, and benchmarking on different hardware can lead to dangerous under-estimation or wasteful over-estimation of weights.

Weights represent the actual computational time and resources consumed by extrinsics. These measurements vary significantly across different hardware configurations:

- **CPU Performance**: Different processors execute instructions at different speeds. A faster development laptop will produce lower weight values than production server hardware
- **Storage Speed**: Database read/write performance varies between NVMe SSDs, SATA SSDs, and HDDs, affecting storage-related weights
- **Memory Bandwidth**: RAM speed impacts how quickly data can be accessed during execution
- **CPU Cache**: Cache size and architecture differences affect repeated operations

Benchmarking on faster hardware than production leads to under-estimated weights - attackers could submit extrinsics that consume more resources than the weights suggest, potentially causing blocks to take longer than expected to produce or even halting the chain. Conversely, benchmarking on slower hardware creates over-estimated weights, resulting in unnecessarily high transaction fees and wasted block capacity.

**Best practices:**

1. **Match production specifications**: If your chain will run on specific validator hardware, benchmark on identical or very similar machines
2. **Use reference hardware**: The Polkadot ecosystem often uses standardized reference hardware specifications for consistency. Consider following these standards if your chain will connect to Polkadot or Kusama
3. **Dedicated benchmarking environment**: Run benchmarks on a machine without other heavy processes to ensure consistent measurements
4. **Document your hardware**: The generated weight files include hardware information in comments. Review this to ensure it matches your production environment
5. **Re-benchmark when hardware changes**: If your validator hardware specifications change, re-run benchmarks and update weights

For development and testing purposes, you can run benchmarks on any available hardware to verify that your benchmark functions work correctly. However, before deploying to production, always re-run benchmarks on production-equivalent hardware.

### Execute Benchmarks

Benchmarks execute against the compiled WASM runtime rather than native code because WASM is what actually runs in production on the blockchain. WASM execution can have different performance characteristics than native code due to compilation and sandboxing overhead, so benchmarking the WASM ensures your weight measurements reflect real-world conditions.

Run benchmarks for your pallet to generate weight files:

```bash
frame-omni-bencher v1 benchmark pallet \
    --runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.wasm \
    --pallet pallet_custom \
    --extrinsic "" \
    --template ./pallets/pallet-custom/frame-weight-template.hbs \
    --output ./pallets/pallet-custom/src/weights.rs
```

**Command breakdown:**

- `v1`: Specifies the benchmarking framework version (v2 API)
- `benchmark pallet`: Subcommand indicating you want to benchmark pallet extrinsics
- `--runtime`: Path to the compiled WASM runtime file that includes your pallet and benchmarks
- `--pallet pallet_custom`: Name of the pallet to benchmark (must match the name used in `define_benchmarks!`)
- `--extrinsic ""`: Empty string benchmarks all extrinsics in the pallet; you can specify a single extrinsic name to benchmark only that one
- `--template`: Path to the Handlebars template that formats the output
- `--output`: Destination file path for the generated weights module

### Advanced Options

You can customize benchmark execution with additional parameters for more detailed measurements:

```bash
frame-omni-bencher v1 benchmark pallet \
    --runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.wasm \
    --pallet pallet_custom \
    --extrinsic "" \
    --steps 50 \
    --repeat 20 \
    --template ./pallets/pallet-custom/frame-weight-template.hbs \
    --output ./pallets/pallet-custom/src/weights.rs
```

**Additional parameters:**

- `--steps 50`: Number of different input values to test when using linear components (default: 50). More steps provide finer granularity for detecting complexity trends but increase benchmarking time
- `--repeat 20`: Number of repetitions for each measurement (default: 20). More repetitions improve statistical accuracy by averaging out variance, reducing the impact of system noise and providing more reliable weight estimates
- `--heap-pages 4096`: WASM heap pages allocation. Affects available memory during execution
- `--wasm-execution compiled`: WASM execution method. Use `compiled` for performance closest to production conditions

## Step 10: Use Generated Weights

After running benchmarks, a `weights.rs` file is generated containing measured weights. The generated weights are based on actual measurements of your code running on real hardware, accounting for the specific complexity of your logic, storage access patterns, and computational requirements. Estimates or placeholder values cannot capture these nuances and will either waste block space (over-estimation) or create security risks (under-estimation).

The file includes:

- Detailed documentation about the benchmark execution environment (date, hardware, parameters)
- The `WeightInfo` trait definition matching your benchmark functions
- `SubstrateWeight<T>` implementation with measured weights from your benchmarks
- Database read/write costs calculated based on observed storage operations
- Component complexity annotations for variable inputs (if you use linear components)
- A fallback `()` implementation for testing environments

### Integrate the Generated Weights

Unlike the benchmarking module (which is only needed when running benchmarks), the weights module must be available in all builds because the runtime needs to call the weight functions during normal operation to calculate transaction fees and enforce block limits.

Add the weights module to your pallet's `lib.rs`:

```rust title="pallets/pallet-custom/src/lib.rs"
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;
use alloc::vec::Vec;

pub use pallet::*;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;

#[frame::pallet]
pub mod pallet {
    use super::*;
    use frame::prelude::*;
    use crate::weights::WeightInfo;
    // ... rest of pallet
}
```

### Update Runtime Configuration

This change activates your benchmarked weights in the production runtime. Now when users submit transactions that call your pallet's extrinsics, the runtime will use the actual measured weights to calculate fees and enforce block limits.

Update your runtime configuration to use the generated weights instead of the placeholder `()` implementation:

```rust title="runtime/src/configs/mod.rs"
impl pallet_custom::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<1000>;
    type WeightInfo = pallet_custom::weights::SubstrateWeight<Runtime>;
}
```

### Example Generated Weight File

The generated `weights.rs` file will look similar to this:

```rust title="pallets/pallet-custom/src/weights.rs"
//! Autogenerated weights for `pallet_custom`
//!
//! THIS FILE WAS AUTO-GENERATED USING THE SUBSTRATE BENCHMARK CLI VERSION 32.0.0
//! DATE: 2025-01-15, STEPS: `50`, REPEAT: `20`

#![cfg_attr(rustfmt, rustfmt_skip)]
#![allow(unused_parens)]
#![allow(unused_imports)]
#![allow(missing_docs)]

use frame_support::{traits::Get, weights::{Weight, constants::RocksDbWeight}};
use core::marker::PhantomData;

pub trait WeightInfo {
    fn set_counter_value() -> Weight;
    fn increment() -> Weight;
    fn decrement() -> Weight;
}

pub struct SubstrateWeight<T>(PhantomData<T>);
impl<T: frame_system::Config> WeightInfo for SubstrateWeight<T> {
    fn set_counter_value() -> Weight {
        Weight::from_parts(8_234_000, 0)
            .saturating_add(T::DbWeight::get().reads(1))
            .saturating_add(T::DbWeight::get().writes(1))
    }

    fn increment() -> Weight {
        Weight::from_parts(12_456_000, 0)
            .saturating_add(T::DbWeight::get().reads(2))
            .saturating_add(T::DbWeight::get().writes(2))
    }

    fn decrement() -> Weight {
        Weight::from_parts(11_987_000, 0)
            .saturating_add(T::DbWeight::get().reads(2))
            .saturating_add(T::DbWeight::get().writes(2))
    }
}
```

**Note**: The actual numbers will vary based on your hardware and implementation complexity. The [`DbWeight`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.RuntimeDbWeight.html){target=\_blank} accounts for database read and write operations.

## Benchmarking Best Practices

### 1. Test Worst-Case Scenarios

Benchmarks should always measure maximum possible resource consumption. If you benchmark average or best-case scenarios, malicious users could craft transactions that hit worst-case paths in your code, consuming more resources than the weights indicate and potentially slowing down or halting block production.

```rust
#[benchmark]
fn complex_operation() {
    // Set up worst-case storage state
    for i in 0..100 {
        SomeStorage::<T>::insert(i, vec![0u8; 1000]);
    }

    let caller = whitelisted_caller();

    #[extrinsic_call]
    _(RawOrigin::Signed(caller));
}
```

### 2. Use Linear Components for Variable Complexity

Many extrinsics have variable costs depending on input parameters. [Linear components](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/trait.BenchmarkingSetup.html){target=\_blank} tell the benchmarking framework to test your extrinsic with different values of `n`, measure the execution time for each, and calculate a formula like `Weight = base_weight + (n * per_item_weight)`. This produces dynamic weights that accurately reflect the actual work being done.

When extrinsic complexity depends on input size, use linear components:

```rust title="pallets/pallet-custom/src/benchmarking.rs"
#[benchmark]
fn process_items(n: Linear<0, 100>) {
    let caller = whitelisted_caller();
    let items: Vec<u32> = (0..n).collect();

    #[extrinsic_call]
    _(RawOrigin::Signed(caller), items);
}
```

### 3. Verify Results

Assertions ensure that your benchmark is actually testing the code path you think it's testing. If your extrinsic fails silently or takes an early return, the benchmark would measure the wrong scenario and produce inaccurate weights.

Always assert the expected state after extrinsic execution:

```rust title="pallets/pallet-custom/src/benchmarking.rs"
#[benchmark]
fn my_extrinsic() {
    let caller = whitelisted_caller();

    #[extrinsic_call]
    _(RawOrigin::Signed(caller.clone()));

    // Verify the extrinsic had the expected effect
    assert_eq!(MyStorage::<T>::get(&caller), expected_value);
}
```

### 4. Minimize Setup Code

While the benchmarking framework tries to isolate the extrinsic execution, excessive setup code can add noise to measurements. More importantly, setup code that doesn't reflect real-world pre-conditions can lead to benchmarking unrealistic scenarios.

Only include necessary setup in benchmarks:

```rust title="pallets/pallet-custom/src/benchmarking.rs"
#[benchmark]
fn efficient_benchmark() {
    // Minimal setup
    let caller = whitelisted_caller();

    #[extrinsic_call]
    _(RawOrigin::Signed(caller));

    // Minimal assertions
}
```

## Run Your Chain Locally

Now that you've added the pallet to your runtime, you can launch your parachain locally to test the new functionality using the [Polkadot Omni Node](https://crates.io/crates/polkadot-omni-node){target=\_blank}. For instructions on setting up the Polkadot Omni Node and [Polkadot Chain Spec Builder](https://crates.io/crates/staging-chain-spec-builder){target=\_blank}, refer to the [Set Up a Parachain Template](/parachains/launch-a-parachain/set-up-the-parachain-template/){target=\_blank} guide.

### Build the Production Runtime

The `runtime-benchmarks` feature flag adds special host functions (like `ext_benchmarking_current_time` and `ext_benchmarking_get_read_and_written_keys`) that are only available in the benchmarking execution environment. These functions allow the benchmarking framework to precisely measure execution time and track storage operations. However, regular nodes don't provide these host functions, so a runtime compiled with benchmarking features will fail to start on a production node.

Before running your chain, rebuild the runtime **without** the `runtime-benchmarks` feature:

```bash
cargo build --release
```

!!! note "Build Types"
    Understanding the difference between builds is critical:

    - `cargo build --release --features runtime-benchmarks` - Compiles with benchmarking host functions for measurement. Use this ONLY when running benchmarks with `frame-omni-bencher`
    - `cargo build --release` - Compiles production runtime without benchmarking features. Use this for running your actual chain

This produces a production-ready WASM runtime at `target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm`.

### Generate a Chain Specification

The chain specification defines the initial state and configuration of your blockchain, including the runtime WASM code, genesis storage, and network parameters. By generating a new chain spec with your updated runtime (now containing your benchmarked pallet), you ensure that nodes starting from this spec will use the correct version of your code with proper weight calculations.

Create a new chain specification file with the updated runtime:

```bash
chain-spec-builder create -t development \
--relay-chain paseo \
--para-id 1000 \
--runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
named-preset development
```

This command generates a chain specification file, `chain_spec.json`, for your parachain with the updated runtime.

### Start the Parachain Node

Launch the parachain using the Polkadot Omni Node with the generated chain specification by running the following command:

```bash
polkadot-omni-node --chain ./chain_spec.json --dev
```

The node will start and display initialization information including:

- The chain specification name
- The node identity and peer ID
- Database location
- Network endpoints (JSON-RPC and Prometheus)

### Verify Block Production

Once the node is running, you should see log messages indicating successful block production:

```
[Parachain] 🔨 Initializing Genesis block/state (state: 0x47ce…ec8d, header-hash: 0xeb12…fecc)
[Parachain] 🎁 Prepared block for proposing at 1 (3 ms) ...
[Parachain] 🏆 Imported #1 (0xeb12…fecc → 0xee51…98d2)
[Parachain] 🎁 Prepared block for proposing at 2 (3 ms) ...
[Parachain] 🏆 Imported #2 (0xee51…98d2 → 0x35e0…cc32)
```

The parachain will produce new blocks every few seconds. You can now interact with your pallet's extrinsics through the JSON-RPC endpoint at `http://127.0.0.1:9944` using tools like [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}.

## Related Resources

- [FRAME Benchmarking Documentation](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/index.html){target=\_blank}
- [Weight Struct Documentation](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.Weight.html){target=\_blank}
- [Benchmarking v2 API](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=\_blank}
- [frame-omni-bencher Tool](https://paritytech.github.io/polkadot-sdk/master/frame_omni_bencher/index.html){target=\_blank}
