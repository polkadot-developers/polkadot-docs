---
title: Unit Test Pallets
description: Learn how to efficiently test pallets in the Polkadot SDK, ensuring the reliability and security of your pallets operations.
categories: Parachains
---

# Unit Test Pallets

## Introduction

Unit testing in the Polkadot SDK helps ensure that the functions provided by a pallet behave as expected. It also confirms that data and events associated with a pallet are processed correctly during interactions. With your mock runtime in place from the [previous guide](/parachains/customize-runtime/pallet-development/mock-runtime/), you can now write comprehensive tests that verify your pallet's behavior in isolation.

In this guide, you'll learn how to:

- Structure test modules effectively.
- Test dispatchable functions.
- Verify storage changes.
- Check event emission.
- Test error conditions.
- Use genesis configurations in tests.

## Prerequisites

Before you begin, ensure you:

- Completed the [Make a Custom Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/) guide.
- Completed the [Mock Your Runtime](/parachains/customize-runtime/pallet-development/mock-runtime/) guide.
- Configured custom counter pallet with mock runtime in `pallets/pallet-custom`.
- Understood the basics of [Rust testing](https://doc.rust-lang.org/book/ch11-00-testing.html){target=\_blank}.

## Understanding FRAME Testing Tools

[FRAME](/reference/glossary/#frame-framework-for-runtime-aggregation-of-modularized-entities){target=\_blank} provides specialized testing macros and utilities that make pallet testing more efficient:

### Assertion Macros

- **[`assert_ok!`](https://paritytech.github.io/polkadot-sdk/master/frame_support/macro.assert_ok.html){target=\_blank}** - Asserts that a dispatchable call succeeds.
- **[`assert_noop!`](https://paritytech.github.io/polkadot-sdk/master/frame_support/macro.assert_noop.html){target=\_blank}** - Asserts that a call fails without changing state (no operation).
- **[`assert_eq!`](https://doc.rust-lang.org/std/macro.assert_eq.html){target=\_blank}** - Standard Rust equality assertion.

!!!info "`assert_noop!` Explained"
    Use `assert_noop!` to ensure the operation fails without any state changes. This is critical for testing error conditions - it verifies both that the error occurs AND that no storage was modified.

### System Pallet Test Helpers

The [`frame_system`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} pallet provides useful methods for testing:

- **[`System::events()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.events){target=\_blank}** - Returns all events emitted during the test.
- **[`System::assert_last_event()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.assert_last_event){target=\_blank}** - Asserts the last event matches expectations.
- **[`System::set_block_number()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.set_block_number){target=\_blank}** - Sets the current block number.

!!!info "Events and Block Number"
    Events are not emitted on block 0 (genesis block). If you need to test events, ensure you set the block number to at least 1 using `System::set_block_number(1)`.

### Origin Types

- **[`RuntimeOrigin::root()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/enum.RawOrigin.html#variant.Root){target=\_blank}** - Root/sudo origin for privileged operations.
- **[`RuntimeOrigin::signed(account)`](https://paritytech.github.io/polkadot-sdk/master/frame_system/enum.RawOrigin.html#variant.Signed){target=\_blank}** - Signed origin from a specific account.
- **[`RuntimeOrigin::none()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/enum.RawOrigin.html#variant.None){target=\_blank}** - No origin (typically fails for most operations).

Learn more about origins in the [FRAME Origin reference document](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_origin/index.html){target=\_blank}.

## Create the Tests Module

Create a new file for your tests within the pallet directory:

1. Navigate to your pallet directory:

    ```bash
    cd pallets/pallet-custom/src
    ```

2. Create a new file named `tests.rs`:

    ```bash
    touch tests.rs
    ```

3. Open `src/lib.rs` and add the tests module declaration after the mock module:

    ```rust title="src/lib.rs"
    #![cfg_attr(not(feature = "std"), no_std)]

    pub use pallet::*;

    #[cfg(test)]
    mod mock;

    #[cfg(test)]
    mod tests;

    #[frame::pallet]
    pub mod pallet {
        // ... existing pallet code
    }
    ```

## Set Up the Test Module

Open `src/tests.rs` and add the basic structure with necessary imports:

```rust
use crate::{mock::*, Error, Event};
use frame::deps::frame_support::{assert_noop, assert_ok};
use frame::deps::sp_runtime::DispatchError;
```

This setup imports:

- The mock runtime and test utilities from `mock.rs`
- Your pallet's `Error` and `Event` types
- FRAME's assertion macros via `frame::deps`
- `DispatchError` for testing origin checks

???+ code "Complete Pallet Code Reference"
    Here's the complete pallet code that you'll be testing throughout this guide:

    ```rust
    ---8<-- 'code/parachains/customize-runtime/pallet-development/create-a-pallet/lib-complete.rs'
    ```

## Write Your First Test

Let's start with a simple test to verify the increment function works correctly.

### Test Basic Increment

Test that the increment function increases counter value and emits events.

```rust
#[test]
fn increment_works() {
    new_test_ext().execute_with(|| {
        // Set block number to 1 so events are registered
        System::set_block_number(1);

        let account = 1u64;

        // Increment by 50
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account), 50));
        assert_eq!(crate::CounterValue::<Test>::get(), 50);

        // Check event was emitted
        System::assert_last_event(
            Event::CounterIncremented {
                new_value: 50,
                who: account,
                amount: 50,
            }
            .into(),
        );

        // Check user interactions were tracked
        assert_eq!(crate::UserInteractions::<Test>::get(account), 1);
    });
}
```

Run your first test:

```bash
cargo test --package pallet-custom increment_works
```

You should see:

```
running 1 test
test tests::increment_works ... ok
```

Congratulations! You've written and run your first pallet test.

## Test Error Conditions

Now let's test that our pallet correctly handles errors. Error testing is crucial to ensure your pallet fails safely.

### Test Overflow Protection

Test that incrementing at u32::MAX fails with Overflow error.

```rust
#[test]
fn increment_fails_on_overflow() {
    new_test_ext_with_counter(u32::MAX).execute_with(|| {
        // Attempt to increment when at max u32 should fail
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 1),
            Error::<Test>::Overflow
        );
    });
}
```

Test overflow protection:

```bash
cargo test --package pallet-custom increment_fails_on_overflow
```

### Test Underflow Protection

Test that decrementing below zero fails with Underflow error.

```rust
#[test]
fn decrement_fails_on_underflow() {
    new_test_ext_with_counter(10).execute_with(|| {
        // Attempt to decrement below zero should fail
        assert_noop!(
            CustomPallet::decrement(RuntimeOrigin::signed(1), 11),
            Error::<Test>::Underflow
        );
    });
}
```

Verify underflow protection:

```bash
cargo test --package pallet-custom decrement_fails_on_underflow
```

## Test Access Control

Verify that origin checks work correctly and unauthorized access is prevented.

### Test Root-Only Access

Test that set_counter_value requires root origin and rejects signed origins.

```rust
#[test]
fn set_counter_value_requires_root() {
    new_test_ext().execute_with(|| {
        let alice = 1u64;

        // When: non-root user tries to set counter
        // Then: should fail with BadOrigin
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::signed(alice), 100),
            DispatchError::BadOrigin
        );

        // But root should succeed
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 100));
        assert_eq!(crate::CounterValue::<Test>::get(), 100);
    });
}
```

Test access control:

```bash
cargo test --package pallet-custom set_counter_value_requires_root
```

## Test Event Emission

Verify that events are emitted correctly with the right data.

### Test Event Data

The [`increment_works`](/parachains/customize-runtime/pallet-development/pallet-testing/#test-basic-increment) test (shown earlier) already demonstrates event testing by:

1. Setting the block number to 1 to enable event emission.
2. Calling the dispatchable function.
3. Using `System::assert_last_event()` to verify the correct event was emitted with expected data.

This pattern applies to all dispatchables that emit events. For a dedicated event-only test focusing on the `set_counter_value` function:

Test that set_counter_value updates storage and emits correct event.

```rust
#[test]
fn set_counter_value_works() {
    new_test_ext().execute_with(|| {
        // Set block number to 1 so events are registered
        System::set_block_number(1);

        // Set counter to 100
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 100));
        assert_eq!(crate::CounterValue::<Test>::get(), 100);

        // Check event was emitted
        System::assert_last_event(Event::CounterValueSet { new_value: 100 }.into());
    });
}
```

Run the event test:

```bash
cargo test --package pallet-custom set_counter_value_works
```

## Test Genesis Configuration

Verify that genesis configuration works correctly.

### Test Genesis Setup

Test that genesis configuration correctly initializes counter and user interactions.

```rust
#[test]
fn genesis_config_works() {
    new_test_ext_with_interactions(42, vec![(1, 5), (2, 10)]).execute_with(|| {
        // Check initial counter value
        assert_eq!(crate::CounterValue::<Test>::get(), 42);

        // Check initial user interactions
        assert_eq!(crate::UserInteractions::<Test>::get(1), 5);
        assert_eq!(crate::UserInteractions::<Test>::get(2), 10);
    });
}
```

Test genesis configuration:

```bash
cargo test --package pallet-custom genesis_config_works
```

## Run All Tests

Now run all your tests together:

```bash
cargo test --package pallet-custom
```

You should see all tests passing:

<div id="termynal" data-termynal>
  <span data-ty="input">$ cargo test --package pallet-custom</span>
  <span data-ty>running 15 tests</span>
  <span data-ty>test mock::__construct_runtime_integrity_test::runtime_integrity_tests ... ok</span>
  <span data-ty>test mock::test_genesis_config_builds ... ok</span>
  <span data-ty>test tests::decrement_fails_on_underflow ... ok</span>
  <span data-ty>test tests::decrement_tracks_multiple_interactions ... ok</span>
  <span data-ty>test tests::decrement_works ... ok</span>
  <span data-ty>test tests::different_users_tracked_separately ... ok</span>
  <span data-ty>test tests::genesis_config_works ... ok</span>
  <span data-ty>test tests::increment_fails_on_overflow ... ok</span>
  <span data-ty>test tests::increment_respects_max_value ... ok</span>
  <span data-ty>test tests::increment_tracks_multiple_interactions ... ok</span>
  <span data-ty>test tests::increment_works ... ok</span>
  <span data-ty>test tests::mixed_increment_and_decrement_works ... ok</span>
  <span data-ty>test tests::set_counter_value_requires_root ... ok</span>
  <span data-ty>test tests::set_counter_value_respects_max_value ... ok</span>
  <span data-ty>test tests::set_counter_value_works ... ok</span>
  <span data-ty></span>
  <span data-ty>test result: ok. 15 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out</span>
</div>

!!!note "Mock Runtime Tests"
    You'll notice 2 additional tests from the `mock` module:

    - `mock::__construct_runtime_integrity_test::runtime_integrity_tests` - Auto-generated test that validates runtime construction
    - `mock::test_genesis_config_builds` - Validates that genesis configuration builds correctly

    These tests are automatically generated from your mock runtime setup and help ensure the test environment itself is valid.

Congratulations! You have a well-tested pallet covering the essential testing patterns!

These tests demonstrate comprehensive coverage including basic operations, error conditions, access control, event emission, state management, and genesis configuration. As you build more complex pallets, you'll apply these same patterns to test additional functionality.

??? code "Full Test Suite Code"
    Here's the complete `tests.rs` file for quick reference:

    ```rust
    use crate::{mock::*, Error, Event};
    use frame::deps::frame_support::{assert_noop, assert_ok};
    use frame::deps::sp_runtime::DispatchError;

    #[test]
    fn set_counter_value_works() {
        new_test_ext().execute_with(|| {
            // Set block number to 1 so events are registered
            System::set_block_number(1);

            // Set counter to 100
            assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 100));
            assert_eq!(crate::CounterValue::<Test>::get(), 100);

            // Check event was emitted
            System::assert_last_event(Event::CounterValueSet { new_value: 100 }.into());
        });
    }

    #[test]
    fn set_counter_value_requires_root() {
        new_test_ext().execute_with(|| {
            // Attempt to set counter with non-root origin should fail
            assert_noop!(
                CustomPallet::set_counter_value(RuntimeOrigin::signed(1), 100),
                DispatchError::BadOrigin
            );
        });
    }

    #[test]
    fn set_counter_value_respects_max_value() {
        new_test_ext().execute_with(|| {
            // Attempt to set counter above max value (1000) should fail
            assert_noop!(
                CustomPallet::set_counter_value(RuntimeOrigin::root(), 1001),
                Error::<Test>::CounterMaxValueExceeded
            );

            // Setting to exactly max value should work
            assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 1000));
            assert_eq!(crate::CounterValue::<Test>::get(), 1000);
        });
    }

    #[test]
    fn increment_works() {
        new_test_ext().execute_with(|| {
            // Set block number to 1 so events are registered
            System::set_block_number(1);

            let account = 1u64;

            // Increment by 50
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account), 50));
            assert_eq!(crate::CounterValue::<Test>::get(), 50);

            // Check event was emitted
            System::assert_last_event(
                Event::CounterIncremented {
                    new_value: 50,
                    who: account,
                    amount: 50,
                }
                .into(),
            );

            // Check user interactions were tracked
            assert_eq!(crate::UserInteractions::<Test>::get(account), 1);
        });
    }

    #[test]
    fn increment_tracks_multiple_interactions() {
        new_test_ext().execute_with(|| {
            let account = 1u64;

            // Increment multiple times
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account), 10));
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account), 20));
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account), 30));

            // Check counter value
            assert_eq!(crate::CounterValue::<Test>::get(), 60);

            // Check user interactions were tracked (should be 3)
            assert_eq!(crate::UserInteractions::<Test>::get(account), 3);
        });
    }

    #[test]
    fn increment_fails_on_overflow() {
        new_test_ext_with_counter(u32::MAX).execute_with(|| {
            // Attempt to increment when at max u32 should fail
            assert_noop!(
                CustomPallet::increment(RuntimeOrigin::signed(1), 1),
                Error::<Test>::Overflow
            );
        });
    }

    #[test]
    fn increment_respects_max_value() {
        new_test_ext_with_counter(950).execute_with(|| {
            // Incrementing past max value (1000) should fail
            assert_noop!(
                CustomPallet::increment(RuntimeOrigin::signed(1), 51),
                Error::<Test>::CounterMaxValueExceeded
            );

            // Incrementing to exactly max value should work
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 50));
            assert_eq!(crate::CounterValue::<Test>::get(), 1000);
        });
    }

    #[test]
    fn decrement_works() {
        new_test_ext_with_counter(100).execute_with(|| {
            // Set block number to 1 so events are registered
            System::set_block_number(1);

            let account = 2u64;

            // Decrement by 30
            assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(account), 30));
            assert_eq!(crate::CounterValue::<Test>::get(), 70);

            // Check event was emitted
            System::assert_last_event(
                Event::CounterDecremented {
                    new_value: 70,
                    who: account,
                    amount: 30,
                }
                .into(),
            );

            // Check user interactions were tracked
            assert_eq!(crate::UserInteractions::<Test>::get(account), 1);
        });
    }

    #[test]
    fn decrement_fails_on_underflow() {
        new_test_ext_with_counter(10).execute_with(|| {
            // Attempt to decrement below zero should fail
            assert_noop!(
                CustomPallet::decrement(RuntimeOrigin::signed(1), 11),
                Error::<Test>::Underflow
            );
        });
    }

    #[test]
    fn decrement_tracks_multiple_interactions() {
        new_test_ext_with_counter(100).execute_with(|| {
            let account = 3u64;

            // Decrement multiple times
            assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(account), 10));
            assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(account), 20));

            // Check counter value
            assert_eq!(crate::CounterValue::<Test>::get(), 70);

            // Check user interactions were tracked (should be 2)
            assert_eq!(crate::UserInteractions::<Test>::get(account), 2);
        });
    }

    #[test]
    fn mixed_increment_and_decrement_works() {
        new_test_ext_with_counter(50).execute_with(|| {
            let account = 4u64;

            // Mix of increment and decrement
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account), 25));
            assert_eq!(crate::CounterValue::<Test>::get(), 75);

            assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(account), 15));
            assert_eq!(crate::CounterValue::<Test>::get(), 60);

            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account), 10));
            assert_eq!(crate::CounterValue::<Test>::get(), 70);

            // Check user interactions were tracked (should be 3)
            assert_eq!(crate::UserInteractions::<Test>::get(account), 3);
        });
    }

    #[test]
    fn different_users_tracked_separately() {
        new_test_ext().execute_with(|| {
            let account1 = 1u64;
            let account2 = 2u64;

            // User 1 increments
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account1), 10));
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(account1), 10));

            // User 2 decrements
            assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(account2), 5));

            // Check counter value (10 + 10 - 5 = 15)
            assert_eq!(crate::CounterValue::<Test>::get(), 15);

            // Check user interactions are tracked separately
            assert_eq!(crate::UserInteractions::<Test>::get(account1), 2);
            assert_eq!(crate::UserInteractions::<Test>::get(account2), 1);
        });
    }

    #[test]
    fn genesis_config_works() {
        new_test_ext_with_interactions(42, vec![(1, 5), (2, 10)]).execute_with(|| {
            // Check initial counter value
            assert_eq!(crate::CounterValue::<Test>::get(), 42);

            // Check initial user interactions
            assert_eq!(crate::UserInteractions::<Test>::get(1), 5);
            assert_eq!(crate::UserInteractions::<Test>::get(2), 10);
        });
    }
    ```

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Add Your Custom Pallet to the Runtime__

    ---

    Your pallet is tested and ready! Learn how to integrate it into your runtime.

    [:octicons-arrow-right-24: Integrate](/parachains/customize-runtime/pallet-development/add-to-runtime/)

</div>
