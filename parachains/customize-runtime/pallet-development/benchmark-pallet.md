---
title: Benchmark Your Pallet
description: Learn how to benchmark extrinsics in your custom pallet to generate precise weight calculations suitable for production use.
categories: Parachains
---

## Introduction

Benchmarking is the process of measuring the computational resources (execution time and storage) required by your pallet's extrinsics. Accurate [weight](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/index.html){target=\_blank} calculations are essential for ensuring your blockchain can process transactions efficiently while protecting against denial-of-service attacks.

This guide demonstrates how to benchmark a pallet and incorporate the resulting weight values. This example uses the custom counter pallet from previous guides in this series, but you can replace it with the code from another pallet if desired.

## Prerequisites

Before you begin, ensure you have:

- A pallet to benchmark. If you followed the pallet development tutorials, you can use the counter pallet from the [Create a Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/){target=\_blank} guide. You can also follow these steps to benchmark a custom pallet by updating the `benchmarking.rs` functions, and instances of usage in future steps, to calculate weights using your specific pallet functionality.
- Basic understanding of [computational complexity](https://en.wikipedia.org/wiki/Computational_complexity){target=\_blank}.
- Familiarity with [Rust's testing framework](https://doc.rust-lang.org/book/ch11-00-testing.html){target=\_blank}.
- Familiarity setting up the Polkadot Omni Node and [Polkadot Chain Spec Builder](https://crates.io/crates/staging-chain-spec-builder){target=\_blank}. Refer to the [Set Up a Parachain Template](/parachains/launch-a-parachain/set-up-the-parachain-template/){target=\_blank} guide for instructions if needed.

## Create the Benchmarking Module

Create a new file `benchmarking.rs` in your pallet's `src` directory and add the following code:

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
        // First, set the counter to a non-zero value
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

This module contains all the [benchmarking definitions](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=\_blank} for your pallet. If you are benchmarking a different pallet, update the testing logic as needed to test your pallet's functionality. 

## Define the Weight Trait

Add a `weights` module to your pallet that defines the `WeightInfo` trait using the following code:

```rust title="pallets/pallet-custom/src/weights.rs"
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

The `WeightInfo for ()` implementation provides placeholder weights for development. If you are using a different pallet, update the `weights` module to use your pallet's function names.

## Add WeightInfo to Config 

Update your pallet's `Config` trait to include `WeightInfo` by adding the following code:

```rust title="pallets/pallet-custom/src/lib.rs"
#[pallet::config]
pub trait Config: frame_system::Config {
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    #[pallet::constant]
    type CounterMaxValue: Get<u32>;

    type WeightInfo: weights::WeightInfo;
}
```

The [`WeightInfo`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/trait.WeightInfo.html){target=\_blank} trait provides an abstraction layer that allows weights to be swapped at runtime configuration. By making `WeightInfo` an associated type in the `Config` trait, you will enable each runtime that uses your pallet to specify which weight implementation to use.

## Update Extrinsic Weight Annotations

Replace the placeholder weights in your extrinsics with calls to the `WeightInfo` trait by adding the following code:

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

By calling `T::WeightInfo::function_name()` instead of using hardcoded `Weight::from_parts()` values, your extrinsics automatically use whichever weight implementation is configured in the runtime. You can switch between placeholder weights for testing and benchmarked weights for production easily, without changing any pallet code.

If you are using a different pallet, be sure to update the functions for `WeightInfo` accordingly.

## Include the Benchmarking Module

At the top of your `lib.rs`, add the module declaration by adding the following code:

```rust title="pallets/pallet-custom/src/lib.rs"
#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;
use alloc::vec::Vec;

pub use pallet::*;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

// Additional pallet code
```

The `#[cfg(feature = "runtime-benchmarks")]` attribute ensures that benchmarking code is only compiled when explicitly needed to keep your production runtime efficient.

## Configure Pallet Dependencies

Update your pallet's `Cargo.toml` to enable the benchmarking feature by adding the following code:

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

The Cargo feature flag system lets you conditionally compile code based on which features are enabled. By defining a `runtime-benchmarks` feature that cascades to FRAME's benchmarking features, you create a clean way to build your pallet with or without benchmarking support, ensuring all necessary dependencies are available when needed but excluded from production builds.

## Update Mock Runtime

Add the `WeightInfo` type to your test configuration in `mock.rs` by adding the following code:

```rust title="pallets/pallet-custom/src/mock.rs"
impl pallet_custom::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<1000>;
    type WeightInfo = ();
}
```

In your mock runtime for testing, use the placeholder `()` implementation of `WeightInfo`, since unit tests focus on verifying functional correctness rather than performance.

## Configure Runtime Benchmarking

To execute benchmarks, your pallet must be integrated into the runtime's benchmarking infrastructure. Follow these steps to update the runtime configuration:

1. **Update `runtime/Cargo.toml`**: Add your pallet to the runtime's `runtime-benchmarks` feature as follows:

    ```toml title="runtime/Cargo.toml"
    runtime-benchmarks = [
        "cumulus-pallet-parachain-system/runtime-benchmarks",
        "hex-literal",
        "pallet-parachain-template/runtime-benchmarks",
        "polkadot-sdk/runtime-benchmarks",
        "pallet-custom/runtime-benchmarks",
    ]
    ```

    When you build the runtime with `--features runtime-benchmarks`, this configuration ensures all necessary benchmarking code across all pallets (including yours) is included.

2. **Update runtime configuration**: Using the the placeholder implementation, run development benchmarks as follows:

    ```rust title="runtime/src/configs/mod.rs"
    impl pallet_custom::Config for Runtime {
        type RuntimeEvent = RuntimeEvent;
        type CounterMaxValue = ConstU32<1000>;
        type WeightInfo = ();
    }
    ```

3. **Register benchmarks**: Add your pallet to the benchmark list in `runtime/src/benchmarks.rs` as follows:

    ```rust title="runtime/src/benchmarks.rs"
    polkadot_sdk::frame_benchmarking::define_benchmarks!(
        [frame_system, SystemBench::<Runtime>]
        [pallet_balances, Balances]
        // ... other pallets
        [pallet_custom, CustomPallet]
    );
    ```

    The [`define_benchmarks!`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/macro.define_benchmarks.html){target=\_blank} macro creates the infrastructure that allows the benchmarking CLI tool to discover and execute your pallet's benchmarks.

## Test Benchmark Compilation

Run the following command to verify your benchmarks compile and run as tests:

```bash
cargo test -p pallet-custom --features runtime-benchmarks
```

You will see terminal output similar to the following as your benchmark tests pass:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>cargo test -p pallet-custom --features runtime-benchmarks</span>
  <span data-ty>test benchmarking::benchmarks::bench_set_counter_value ... ok</span>
  <span data-ty>test benchmarking::benchmarks::bench_increment ... ok</span>
  <span data-ty>test benchmarking::benchmarks::bench_decrement ... ok</span>
  <span data-ty="input"><span class="file-path"></span></span>
</div>

The `impl_benchmark_test_suite!` macro generates unit tests for each benchmark. Running these tests verifies that your benchmarks compile correctly, execute without panicking, and pass their assertions, catching issues early before building the entire runtime.

## Build the Runtime with Benchmarks

Compile the runtime with benchmarking enabled to generate the Wasm binary using the following command:

```bash
cargo build --release --features runtime-benchmarks
```

This command produces the runtime WASM file needed for benchmarking, typically located at: `target/release/wbuild/parachain-template-runtime/parachain_template_runtime.wasm`

The build includes all the benchmarking infrastructure and special host functions needed for measurement. The resulting WASM runtime contains your benchmark code and can communicate with the benchmarking tool's execution environment. You'll create a different build later for operating your chain in production.

## Install the Benchmarking Tool

Install the `frame-omni-bencher` CLI tool using the following command:

```bash
cargo install frame-omni-bencher --locked
```

[`frame-omni-bencher`](https://paritytech.github.io/polkadot-sdk/master/frame_omni_bencher/index.html){target=\_blank} is the official Polkadot SDK tool designed explicitly for FRAME pallet benchmarking. It provides a standardized way to execute benchmarks, measure execution times and storage operations, and generate properly formatted weight files with full integration into the FRAME weight system.

## Download the Weight Template

Download the official weight template file using the following commands:

```bash
curl -L https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/substrate/.maintain/frame-weight-template.hbs \
--output ./pallets/pallet-custom/frame-weight-template.hbs
```

The weight template is a Handlebars file that transforms raw benchmark data into a correctly formatted Rust source file. It defines the structure of the generated `weights.rs` file, including imports, trait definitions, documentation comments, and formatting. Using the official template ensures your weight files follow the Polkadot SDK conventions and include all necessary metadata, such as benchmark execution parameters, storage operation counts, and hardware information.

## Execute Benchmarks

Run benchmarks for your pallet to generate weight files using the following commands:

```bash
frame-omni-bencher v1 benchmark pallet \
    --runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.wasm \
    --pallet pallet_custom \
    --extrinsic "" \
    --template ./pallets/pallet-custom/frame-weight-template.hbs \
    --output ./pallets/pallet-custom/src/weights.rs
```

Benchmarks execute against the compiled WASM runtime rather than native code because WASM is what actually runs in production on the blockchain. WASM execution can have different performance characteristics than native code due to compilation and sandboxing overhead, so benchmarking against the WASM ensures your weight measurements reflect real-world conditions.

??? note "Additional customization"

    You can customize benchmark execution with additional parameters for more detailed measurements, as shown in the sample code below:

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
    
    - **`--steps 50`**: Number of different input values to test when using linear components (default: 50). More steps provide finer granularity for detecting complexity trends but increase benchmarking time.
    - **`--repeat 20`**: Number of repetitions for each measurement (default: 20). More repetitions improve statistical accuracy by averaging out variance, reducing the impact of system noise, and providing more reliable weight estimates.
    - **`--heap-pages 4096`**: WASM heap pages allocation. Affects available memory during execution.
    - **`--wasm-execution compiled`**: WASM execution method. Use `compiled` for performance closest to production conditions.

## Use Generated Weights

After running benchmarks, a `weights.rs` file is generated containing measured weights based on actual measurements of your code running on real hardware, accounting for the specific complexity of your logic, storage access patterns, and computational requirements.

Follow these steps to use the generated weights with your pallet:

1. Integrate the generated weights by adding the weights module to your pallet's `lib.rs` as follows:

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

    Unlike the benchmarking module (which is only needed when running benchmarks), the weights module must be available in all builds because the runtime needs to call the weight functions during regular operation to calculate transaction fees and enforce block limits.

2. Update your runtime configuration to use the generated weights instead of the placeholder `()` implementation by adding the following code:

    ```rust title="runtime/src/configs/mod.rs"
    impl pallet_custom::Config for Runtime {
        type RuntimeEvent = RuntimeEvent;
        type CounterMaxValue = ConstU32<1000>;
        type WeightInfo = pallet_custom::weights::SubstrateWeight<Runtime>;
    }
    ```

    This change activates your benchmarked weights in the production runtime. Now, when users submit transactions that call your pallet's extrinsics, the runtime will use the actual measured weights to calculate fees and enforce block limits.

??? code "Example generated weight file"
    
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

    The actual numbers in your `weights.rs` file will vary based on your hardware and implementation complexity. The [`DbWeight`](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.RuntimeDbWeight.html){target=\_blank} accounts for database read and write operations.

Congratulations, you've successfully benchmarked a pallet and updated your runtime to use the generated weight values.

## Related Resources

- [FRAME Benchmarking Documentation](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/index.html){target=\_blank}
- [Weight Struct Documentation](https://paritytech.github.io/polkadot-sdk/master/frame_support/weights/struct.Weight.html){target=\_blank}
- [Benchmarking v2 API](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/index.html){target=\_blank}
- [frame-omni-bencher Tool](https://paritytech.github.io/polkadot-sdk/master/frame_omni_bencher/index.html){target=\_blank}
