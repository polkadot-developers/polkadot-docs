---
title: Pallet Benchmarking
...
description: Learn how to benchmark Polkadot SDK-based pallets, assigning precise weights to extrinsics
  for accurate fee calculation and runtime optimization.
...
categories: Parachains
...
url: https://docs.polkadot.com/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-benchmarking/
...
---

## Introduction

After validating your pallet through testing and integrating it into your runtime, the next crucial step is benchmarking. Testing procedures were detailed in the [Pallet Unit Testing](/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-unit-testing/){target=\_blank} tutorial, while runtime integration was covered in the [Add Pallets to the Runtime](/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/){target=\_blank} guide.

Benchmarking assigns precise [weight](/polkadot-protocol/glossary/#weight){target=\_blank} to each extrinsic, 
measuring their computational and storage costs. These derived weights enable accurate fee calculation and resource 
allocation within the runtime.

This tutorial demonstrates how to:

- Configure your development environment for benchmarking.
- Create and implement benchmark tests for your extrinsics.
- Apply benchmark results to your pallet's extrinsics.

For comprehensive information about benchmarking concepts, refer to the [Benchmarking](/develop/parachains/testing/benchmarking/){target=\_blank} guide.

## Environment Setup

Follow these steps to prepare your environment for pallet benchmarking:

1. Install the [`frame-omni-bencher`](https://crates.io/crates/frame-omni-bencher/0.13.0){target=\_blank} command-line tool:
    
    ```bash
    cargo install --locked frame-omni-bencher@0.13.0
    ```

2. Update your pallet's `Cargo.toml` file in the `pallets/custom-pallet` directory by adding the `runtime-benchmarks` feature flag:

    ```toml hl_lines="4" title="Cargo.toml"
    -[package]
name = "custom-pallet"
version = "0.1.0"
license.workspace = true
authors.workspace = true
homepage.workspace = true
repository.workspace = true
edition.workspace = true

[dependencies]
codec = { features = ["derive"], workspace = true }
scale-info = { features = ["derive"], workspace = true }
frame = { features = ["experimental", "runtime"], workspace = true }

[features]
default = ["std"]
std = ["codec/std", "frame/std", "scale-info/std"]
runtime-benchmarks = ["frame/runtime-benchmarks"]

    ```

3. Add your pallet to the runtime's benchmark configuration:

    1.  Register your pallet in `runtime/src/benchmarks.rs`:

        ```rust hl_lines="11" title="benchmarks.rs"
        -polkadot_sdk::frame_benchmarking::define_benchmarks!(
    [frame_system, SystemBench::<Runtime>]
    [pallet_balances, Balances]
    [pallet_session, SessionBench::<Runtime>]
    [pallet_timestamp, Timestamp]
    [pallet_message_queue, MessageQueue]
    [pallet_sudo, Sudo]
    [pallet_collator_selection, CollatorSelection]
    [cumulus_pallet_parachain_system, ParachainSystem]
    [cumulus_pallet_xcmp_queue, XcmpQueue]
    [custom_pallet, CustomPallet]
);
        ```

    2. Enable runtime benchmarking for your pallet in `runtime/Cargo.toml`:

        ```toml hl_lines="6" title="Cargo.toml"
        -runtime-benchmarks = [
	"cumulus-pallet-parachain-system/runtime-benchmarks",
	"hex-literal",
	"pallet-parachain-template/runtime-benchmarks",
	"polkadot-sdk/runtime-benchmarks",
	"custom-pallet/runtime-benchmarks",
]
        ```

4. Set up the benchmarking module in your pallet:
    1. Create a `benchmarking.rs` file in your pallet's `src/` directory:
    
        ```bash
        touch benchmarking.rs
        ```

    2. Add the benchmarking module to your pallet. In the pallet `lib.rs` file add the following:

        ```rust hl_lines="9-10" title="lib.rs"
        -
pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

        ```

    The `benchmarking` module is gated behind the `runtime-benchmarks` feature flag. It will only be compiled when this flag is explicitly enabled in your project's `Cargo.toml` or via the `--features runtime-benchmarks` compilation flag.

## Implement Benchmark Tests

When writing benchmarking tests for your pallet, you'll create specialized test functions for each extrinsic, similar to unit tests. These tests use the mock runtime you created earlier for testing, allowing you to leverage its utility functions.

Every benchmark test must follow a three-step pattern:

1. **Setup**: Perform any necessary setup before calling the extrinsic. This might include creating accounts, setting initial states, or preparing test data.
2. **Execute the extrinsic**: Execute the actual extrinsic using the [`#[extrinsic_call]`](https://paritytech.github.io/polkadot-sdk/master/frame_benchmarking/v2/attr.extrinsic_call.html){target=\_blank} macro. This must be a single line that calls your extrinsic function with the origin as its first argument.
3. **Verification**: Check that the extrinsic worked correctly within the benchmark context by checking the expected state changes.

Check the following example on how to benchmark the `increment` extrinsic:

```rust
-    #[benchmark]
    fn increment() {
        let caller: T::AccountId = whitelisted_caller();

        assert_ok!(CustomPallet::<T>::set_counter_value(
            RawOrigin::Root.into(),
            5u32
        ));

        #[extrinsic_call]
        increment(RawOrigin::Signed(caller.clone()), 1);

        assert_eq!(CounterValue::<T>::get(), Some(6u32.into()));
        assert_eq!(UserInteractions::<T>::get(caller), 1u32.into());
    }
```

This benchmark test:

1. Creates a whitelisted caller and sets an initial counter value of 5.
2. Calls the increment extrinsic to increase the counter by 1.
3. Verifies that the counter was properly incremented to 6 and that the user's interaction was recorded in storage.

This example demonstrates how to properly set up state, execute an extrinsic, and verify its effects during benchmarking.

Now, implement the complete set of benchmark tests. Copy the following content in the `benchmarking.rs` file:

```rust title="benchmarking.rs"
-// This file is part of 'custom-pallet'.

// SPDX-License-Identifier: MIT-0

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

#![cfg(feature = "runtime-benchmarks")]

use super::{Pallet as CustomPallet, *};
use frame::deps::frame_support::assert_ok;
use frame::{deps::frame_benchmarking::v2::*, prelude::*};

#[benchmarks]
mod benchmarks {
    use super::*;
    #[cfg(test)]
    use crate::pallet::Pallet as CustomPallet;
    use frame_system::RawOrigin;

    #[benchmark]
    fn set_counter_value() {
        #[extrinsic_call]
        set_counter_value(RawOrigin::Root, 5);

        assert_eq!(CounterValue::<T>::get(), Some(5u32.into()));
    }

    #[benchmark]
    fn increment() {
        let caller: T::AccountId = whitelisted_caller();

        assert_ok!(CustomPallet::<T>::set_counter_value(
            RawOrigin::Root.into(),
            5u32
        ));

        #[extrinsic_call]
        increment(RawOrigin::Signed(caller.clone()), 1);

        assert_eq!(CounterValue::<T>::get(), Some(6u32.into()));
        assert_eq!(UserInteractions::<T>::get(caller), 1u32.into());
    }

    #[benchmark]
    fn decrement() {
        let caller: T::AccountId = whitelisted_caller();

        assert_ok!(CustomPallet::<T>::set_counter_value(
            RawOrigin::Root.into(),
            5u32
        ));

        #[extrinsic_call]
        decrement(RawOrigin::Signed(caller.clone()), 1);

        assert_eq!(CounterValue::<T>::get(), Some(4u32.into()));
        assert_eq!(UserInteractions::<T>::get(caller), 1u32.into());
    }

    impl_benchmark_test_suite!(CustomPallet, crate::mock::new_test_ext(), crate::mock::Test);
}

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
    curl https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/heads/stable2412/substrate/.maintain/frame-umbrella-weight-template.hbs \
    --output ./pallets/benchmarking/frame-umbrella-weight-template.hbs
    ```

4. Execute the benchmarking process using the `frame-omni-bencher` CLI:

    ```bash
    frame-omni-bencher v1 benchmark pallet \
    --runtime target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
    --pallet "custom_pallet" \
    --extrinsic "" \
    --template ./pallets/benchmarking/frame-umbrella-weight-template.hbs \
    --output ./pallets/custom-pallet/src/weights.rs
    ```

When the benchmarking process completes, your `weights.rs` file will contain auto-generated code with weight calculations for each of your pallet's extrinsics. These weights help ensure fair and accurate fee calculations when your pallet is used in a production environment.

## Add Benchmarking Weights to the Pallet

After generating the weight calculations, you need to integrate these weights into your pallet's code. This integration ensures your pallet properly accounts for computational costs in its extrinsics.

First, add the necessary module imports to your pallet. These imports make the weights available to your code:

```rust hl_lines="4-5" title="lib.rs"
-#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub mod weights;
use crate::weights::WeightInfo;
```

Next, update your pallet's `Config` trait to include weight information. Define the `WeightInfo` type:

```rust hl_lines="9-10" title="lib.rs"
-    pub trait Config: frame_system::Config {
        // Defines the event type for the pallet.
        type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

        // Defines the maximum value the counter can hold.
        #[pallet::constant]
        type CounterMaxValue: Get<u32>;

        /// A type representing the weights required by the dispatchables of this pallet.
        type WeightInfo: WeightInfo;
    }
```

Now you can assign weights to your extrinsics. Here's how to add weight calculations to the `set_counter_value` function:

```rust hl_lines="1" title="lib.rs"
-        #[pallet::weight(T::WeightInfo::set_counter_value())]
        pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
            ensure_root(origin)?;

            ensure!(
                new_value <= T::CounterMaxValue::get(),
                Error::<T>::CounterValueExceedsMax
            );

            CounterValue::<T>::put(new_value);

            Self::deposit_event(Event::<T>::CounterValueSet {
                counter_value: new_value,
            });

            Ok(())
        }

```

You must apply similar weight annotations to the other extrinsics in your pallet. Add the `#[pallet::weight(T::WeightInfo::function_name())]` attribute to both `increment` and `decrement`, replacing `function_name` with the respective function names from your `WeightInfo` trait.

For testing purposes, you must implement the weight calculations in your mock runtime. Open `custom-pallet/src/mock.rs` and add:

```rust hl_lines="4" title="mock.rs"
-impl custom_pallet::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
    type WeightInfo = custom_pallet::weights::SubstrateWeight<Test>;
}
```

Finally, configure the actual weight values in your production runtime. In `runtime/src/config/mod.rs`, add:

```rust hl_lines="5" title="mod.rs"
-
// Define counter max value runtime constant.
parameter_types! {
    pub const CounterMaxValue: u32 = 500;
}

```

Your pallet is now complete with full testing and benchmarking support, ready for production use.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Runtime Upgrade__

    ---

    Learn how to safely perform runtime upgrades for your Polkadot SDK-based blockchain, including step-by-step instructions for preparing, submitting, and verifying upgrades.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/)

</div>
