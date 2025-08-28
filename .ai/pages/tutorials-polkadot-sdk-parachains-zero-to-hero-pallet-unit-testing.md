---
title: Pallet Unit Testing
...
description: Discover how to create thorough unit tests for pallets built with the Polkadot SDK,
  using a custom pallet as a practical example.
...
categories: Parachains
...
url: https://docs.polkadot.com/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-unit-testing/
...
---

# Pallet Unit Testing

## Introduction

You have learned how to create a new pallet in the [Build a Custom Pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} tutorial; now you will see how to test the pallet to ensure that it works as expected. As stated in the [Pallet Testing](/develop/parachains/testing/pallet-testing/){target=\_blank} article, unit testing is crucial for ensuring the reliability and correctness of pallets in Polkadot SDK-based blockchains. Comprehensive testing helps validate pallet functionality, prevent potential bugs, and maintain the integrity of your blockchain logic.

This tutorial will guide you through creating a unit testing suite for a custom pallet created in the [Build a Custom Pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} tutorial, covering essential testing aspects and steps.

## Prerequisites

To set up your testing environment for Polkadot SDK pallets, you'll need:

- [Polkadot SDK dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} installed.
- Basic understanding of Substrate/Polkadot SDK concepts.
- A custom pallet implementation, check the [Build a Custom Pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} tutorial.
- Familiarity with [Rust testing frameworks](https://doc.rust-lang.org/book/ch11-01-writing-tests.html){target=\_blank}.

## Set Up the Testing Environment

To effectively create the test environment for your pallet, you'll need to follow these steps:

1. Move to the project directory:

    ```bash
    cd custom-pallet
    ```

2. Create a `mock.rs` and a `tests.rs` files (leave these files empty for now, they will be filled in later):

    ```bash
    touch src/mock.rs
    touch src/tests.rs
    ```

3. Include them in your `lib.rs` module:

    ```rust hl_lines="5-9" title="lib.rs"
    -#![cfg_attr(not(feature = "std"), no_std)]

pub use pallet::*;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;
    ```

## Implement Mocked Runtime

The following portion of code sets up a mock runtime (`Test`) to test the `custom-pallet` in an isolated environment. Using [`frame_support`](https://paritytech.github.io/polkadot-sdk/master/frame_support/index.html){target=\_blank} macros, it defines a minimal runtime configuration with traits such as `RuntimeCall` and `RuntimeEvent` to simulate runtime behavior. The mock runtime integrates the [`System pallet`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank}, which provides core functionality, and the `custom pallet` under specific indices. Copy and paste the following snippet of code into your `mock.rs` file:

```rust title="mock.rs"
-use crate as custom_pallet;
use frame::{prelude::*, runtime::prelude::*, testing_prelude::*};

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
#[frame_construct_runtime]
mod runtime {
    #[runtime::runtime]
    #[runtime::derive(
        RuntimeCall,
        RuntimeEvent,
        RuntimeError,
        RuntimeOrigin,
        RuntimeFreezeReason,
        RuntimeHoldReason,
        RuntimeSlashReason,
        RuntimeLockId,
        RuntimeTask
    )]
    pub struct Test;

    #[runtime::pallet_index(0)]
    pub type System = frame_system;

    #[runtime::pallet_index(1)]
    pub type CustomPallet = custom_pallet;
}
```

Once you have your mock runtime set up, you can customize it by implementing the configuration traits for the `System pallet` and your `custom-pallet`, along with additional constants and initial states for testing. Here's an example of how to extend the runtime configuration. Copy and paste the following snippet of code below the previous one you added to `mock.rs`:

```rust title="mock.rs"
-// System pallet configuration
#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
}

// Custom pallet configuration
parameter_types! {
    pub const CounterMaxValue: u32 = 10;
}

impl custom_pallet::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
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

use crate as custom_pallet;
use frame::{prelude::*, runtime::prelude::*, testing_prelude::*};

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
#[frame_construct_runtime]
mod runtime {
    #[runtime::runtime]
    #[runtime::derive(
        RuntimeCall,
        RuntimeEvent,
        RuntimeError,
        RuntimeOrigin,
        RuntimeFreezeReason,
        RuntimeHoldReason,
        RuntimeSlashReason,
        RuntimeLockId,
        RuntimeTask
    )]
    pub struct Test;

    #[runtime::pallet_index(0)]
    pub type System = frame_system;

    #[runtime::pallet_index(1)]
    pub type CustomPallet = custom_pallet;
}

// System pallet configuration
#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
}

// Custom pallet configuration
parameter_types! {
    pub const CounterMaxValue: u32 = 10;
}

impl custom_pallet::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
    type WeightInfo = custom_pallet::weights::SubstrateWeight<Test>;
}

// Test externalities initialization
pub fn new_test_ext() -> TestExternalities {
    frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}

```

Explanation of the additions:

- **System pallet configuration**: Implements the `frame_system::Config` trait for the mock runtime, setting up the basic system functionality and specifying the block type.
- **Custom pallet configuration**: Defines the `Config` trait for the `custom-pallet`, including a constant (`CounterMaxValue`) to set the maximum allowed counter value. In this case, that value is set to 10 for testing purposes.
- **Test externalities initialization**: The `new_test_ext()` function initializes the mock runtime with default configurations, creating a controlled environment for testing.

### Full Mocked Runtime

Expand the following item to see the complete `mock.rs` implementation for the mock runtime.

??? code "mock.rs"

    ```rust title="mock.rs"
    -use crate as custom_pallet;
use frame::{prelude::*, runtime::prelude::*, testing_prelude::*};

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
#[frame_construct_runtime]
mod runtime {
    #[runtime::runtime]
    #[runtime::derive(
        RuntimeCall,
        RuntimeEvent,
        RuntimeError,
        RuntimeOrigin,
        RuntimeFreezeReason,
        RuntimeHoldReason,
        RuntimeSlashReason,
        RuntimeLockId,
        RuntimeTask
    )]
    pub struct Test;

    #[runtime::pallet_index(0)]
    pub type System = frame_system;

    #[runtime::pallet_index(1)]
    pub type CustomPallet = custom_pallet;
}

// System pallet configuration
#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
}

// Custom pallet configuration
parameter_types! {
    pub const CounterMaxValue: u32 = 10;
}

impl custom_pallet::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
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

use crate as custom_pallet;
use frame::{prelude::*, runtime::prelude::*, testing_prelude::*};

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
#[frame_construct_runtime]
mod runtime {
    #[runtime::runtime]
    #[runtime::derive(
        RuntimeCall,
        RuntimeEvent,
        RuntimeError,
        RuntimeOrigin,
        RuntimeFreezeReason,
        RuntimeHoldReason,
        RuntimeSlashReason,
        RuntimeLockId,
        RuntimeTask
    )]
    pub struct Test;

    #[runtime::pallet_index(0)]
    pub type System = frame_system;

    #[runtime::pallet_index(1)]
    pub type CustomPallet = custom_pallet;
}

// System pallet configuration
#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
}

// Custom pallet configuration
parameter_types! {
    pub const CounterMaxValue: u32 = 10;
}

impl custom_pallet::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
    type WeightInfo = custom_pallet::weights::SubstrateWeight<Test>;
}

// Test externalities initialization
pub fn new_test_ext() -> TestExternalities {
    frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}

    ```

## Implement Test Cases

Unit testing a pallet involves creating a comprehensive test suite that validates various scenarios. You ensure your pallet’s reliability, security, and expected behavior under different conditions by systematically testing successful operations, error handling, event emissions, state modifications, and access control.

Expand the following item to see the pallet calls to be tested.

??? code "Custom pallet calls"

    ```rust
    -    #[pallet::call]
    impl<T: Config> Pallet<T> {
        /// Set the value of the counter.
        ///
        /// The dispatch origin of this call must be _Root_.
        ///
        /// - `new_value`: The new value to set for the counter.
        ///
        /// Emits `CounterValueSet` event when successful.
        #[pallet::call_index(0)]
        #[pallet::weight(0)]
        -        pub fn set_counter_value(origin: OriginFor<T>, new_value: u32) -> DispatchResult {
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

        /// Increment the counter by a specified amount.
        ///
        /// This function can be called by any signed account.
        ///
        /// - `amount_to_increment`: The amount by which to increment the counter.
        ///
        /// Emits `CounterIncremented` event when successful.
        #[pallet::call_index(1)]
        #[pallet::weight(0)]
        -        pub fn increment(origin: OriginFor<T>, amount_to_increment: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let current_value = CounterValue::<T>::get().unwrap_or(0);

            let new_value = current_value
                .checked_add(amount_to_increment)
                .ok_or(Error::<T>::CounterOverflow)?;

            ensure!(
                new_value <= T::CounterMaxValue::get(),
                Error::<T>::CounterValueExceedsMax
            );

            CounterValue::<T>::put(new_value);

            UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
                let new_interactions = interactions
                    .unwrap_or(0)
                    .checked_add(1)
                    .ok_or(Error::<T>::UserInteractionOverflow)?;
                *interactions = Some(new_interactions); // Store the new value.

                Ok(())
            })?;

            Self::deposit_event(Event::<T>::CounterIncremented {
                counter_value: new_value,
                who,
                incremented_amount: amount_to_increment,
            });

            Ok(())
        }

        /// Decrement the counter by a specified amount.
        ///
        /// This function can be called by any signed account.
        ///
        /// - `amount_to_decrement`: The amount by which to decrement the counter.
        ///
        /// Emits `CounterDecremented` event when successful.
        #[pallet::call_index(2)]
        #[pallet::weight(0)]
    -        pub fn decrement(origin: OriginFor<T>, amount_to_decrement: u32) -> DispatchResult {
            let who = ensure_signed(origin)?;

            let current_value = CounterValue::<T>::get().unwrap_or(0);

            let new_value = current_value
                .checked_sub(amount_to_decrement)
                .ok_or(Error::<T>::CounterValueBelowZero)?;

            CounterValue::<T>::put(new_value);

            UserInteractions::<T>::try_mutate(&who, |interactions| -> Result<_, Error<T>> {
                let new_interactions = interactions
                    .unwrap_or(0)
                    .checked_add(1)
                    .ok_or(Error::<T>::UserInteractionOverflow)?;
                *interactions = Some(new_interactions); // Store the new value.

                Ok(())
            })?;

            Self::deposit_event(Event::<T>::CounterDecremented {
                counter_value: new_value,
                who,
                decremented_amount: amount_to_decrement,
            });

            Ok(())
        }
    }
}
    ```

The following sub-sections outline various scenarios in which the `custom-pallet` can be tested. Feel free to add these snippets to your `tests.rs` while you read the examples.

### Successful Operations

Verify that the counter can be successfully incremented under normal conditions, ensuring the increment works and the correct event is emitted.

```rust title="tests.rs"
-// Test successful counter increment
#[test]
fn it_works_for_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize the counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Increment the counter by 5
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        // Check that the event emitted matches the increment operation
        System::assert_last_event(
            Event::CounterIncremented {
                counter_value: 5,
                who: 1,
                incremented_amount: 5,
            }
            .into(),
        );
    });
}
```

### Preventing Value Overflow

Test that the pallet prevents incrementing beyond the maximum allowed value, protecting against unintended state changes.

```rust title="tests.rs"
-// Verify increment is blocked when it would exceed max value
#[test]
fn increment_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set counter value close to max (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 7));
        // Ensure that incrementing by 4 exceeds max value (10) and fails
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 4),
            Error::<Test>::CounterValueExceedsMax // Expecting CounterValueExceedsMax error
        );
    });
}
```

### Origin and Access Control

Confirm that sensitive operations like setting counter value are restricted to authorized origins, preventing unauthorized modifications.

```rust title="tests.rs"
-// Ensure non-root accounts cannot set counter value
#[test]
fn set_counter_value_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure only root (privileged account) can set counter value
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::signed(1), 5), // non-root account
            sp_runtime::traits::BadOrigin // Expecting a BadOrigin error
        );
    });
}
```

### Edge Case Handling

Ensure the pallet gracefully handles edge cases, such as preventing increment operations that would cause overflow.

```rust title="tests.rs"
-// Ensure increment fails on u32 overflow
#[test]
fn increment_handles_overflow() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set to max value
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 1));
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), u32::MAX),
            Error::<Test>::CounterOverflow
        );
    });
}
```

### Verify State Changes

Test that pallet operations modify the internal state correctly and maintain expected storage values across different interactions.

```rust title="tests.rs"
-// Check that user interactions are correctly tracked
#[test]
fn user_interactions_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Increment by 5 and decrement by 2
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 2));

        // Check if the user interactions are correctly tracked
        assert_eq!(UserInteractions::<Test>::get(1).unwrap_or(0), 2); // User should have 2 interactions
    });
}
```

### Full Test Suite

Expand the following item to see the complete `tests.rs` implementation for the custom pallet.

??? code "tests.rs"

    ```rust title="tests.rs"
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

use crate::{mock::*, Error, Event, UserInteractions};
use frame::deps::sp_runtime;
use frame::testing_prelude::*;

// Verify root can successfully set counter value
#[test]
fn it_works_for_set_counter_value() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set counter value within max allowed (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 5));
        // Ensure that the correct event is emitted when the value is set
        System::assert_last_event(Event::CounterValueSet { counter_value: 5 }.into());
    });
}

// Ensure non-root accounts cannot set counter value
#[test]
fn set_counter_value_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure only root (privileged account) can set counter value
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::signed(1), 5), // non-root account
            sp_runtime::traits::BadOrigin // Expecting a BadOrigin error
        );
    });
}

// Check that setting value above max is prevented
#[test]
fn set_counter_value_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Ensure the counter value cannot be set above the max limit (10)
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::root(), 11),
            Error::<Test>::CounterValueExceedsMax // Expecting CounterValueExceedsMax error
        );
    });
}

// Test successful counter increment
#[test]
fn it_works_for_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize the counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Increment the counter by 5
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        // Check that the event emitted matches the increment operation
        System::assert_last_event(
            Event::CounterIncremented {
                counter_value: 5,
                who: 1,
                incremented_amount: 5,
            }
            .into(),
        );
    });
}

// Verify increment is blocked when it would exceed max value
#[test]
fn increment_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set counter value close to max (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 7));
        // Ensure that incrementing by 4 exceeds max value (10) and fails
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 4),
            Error::<Test>::CounterValueExceedsMax // Expecting CounterValueExceedsMax error
        );
    });
}

// Ensure increment fails on u32 overflow
#[test]
fn increment_handles_overflow() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set to max value
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 1));
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), u32::MAX),
            Error::<Test>::CounterOverflow
        );
    });
}

// Test successful counter decrement
#[test]
fn it_works_for_decrement() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize counter value to 8
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 8));

        // Decrement counter by 3
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 3));
        // Ensure the event matches the decrement action
        System::assert_last_event(
            Event::CounterDecremented {
                counter_value: 5,
                who: 1,
                decremented_amount: 3,
            }
            .into(),
        );
    });
}

// Verify decrement is blocked when it would go below zero
#[test]
fn decrement_fails_for_below_zero() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Set counter value to 5
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 5));
        // Ensure that decrementing by 6 fails as it would result in a negative value
        assert_noop!(
            CustomPallet::decrement(RuntimeOrigin::signed(1), 6),
            Error::<Test>::CounterValueBelowZero // Expecting CounterValueBelowZero error
        );
    });
}

// Check that user interactions are correctly tracked
#[test]
fn user_interactions_increment() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Increment by 5 and decrement by 2
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 2));

        // Check if the user interactions are correctly tracked
        assert_eq!(UserInteractions::<Test>::get(1).unwrap_or(0), 2); // User should have 2 interactions
    });
}

// Ensure user interactions prevent overflow
#[test]
fn user_interactions_overflow() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Initialize counter value to 0
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        // Set user interactions to max value (u32::MAX)
        UserInteractions::<Test>::insert(1, u32::MAX);
        // Ensure that incrementing by 5 fails due to overflow in user interactions
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 5),
            Error::<Test>::UserInteractionOverflow // Expecting UserInteractionOverflow error
        );
    });
}

    ```

## Run the Tests

Execute the test suite for your custom pallet using Cargo's test command. This will run all defined test cases and provide detailed output about the test results.

```bash
cargo test --package custom-pallet
```

After running the test suite, you should see the following output in your terminal:

-<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>cargo test --package custom-pallet</span>
  <pre>
running 12 tests
test mock::__construct_runtime_integrity_test::runtime_integrity_tests ... ok
test mock::test_genesis_config_builds ... ok
test test::set_counter_value_fails_for_max_value_exceeded ... ok
test test::set_counter_value_fails_for_non_root ... ok
test test::user_interactions_increment ... ok
test test::it_works_for_increment ... ok
test test::it_works_for_set_counter_value ... ok
test test::it_works_for_decrement ... ok
test test::increment_handles_overflow ... ok
test test::decrement_fails_for_below_zero ... ok
test test::increment_fails_for_max_value_exceeded ... ok
test test::user_interactions_overflow ... ok
test result: ok. 12 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.01s

Doc-tests custom_pallet
running 0 tests
test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
    </pre
  >
</div>


## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Add Pallets to the Runtime__

    ---

    Learn how to add and integrate custom pallets in your Polkadot SDK-based blockchain

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/)

</div>
