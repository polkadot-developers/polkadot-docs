---
title: Pallet Unit Testing
description: Learn how to write comprehensive unit tests for your custom pallets using mock runtimes, ensuring reliability and correctness before deployment.
categories: Parachains
url: https://docs.polkadot.com/parachains/customize-runtime/pallet-development/pallet-testing/
---

# Pallet Unit Testing

## Introduction

Unit testing in the Polkadot SDK helps ensure that the functions provided by a pallet behave as expected. It also confirms that data and events associated with a pallet are processed correctly during interactions. With your mock runtime in place from the previous guide, you can now write comprehensive tests that verify your pallet's behavior in isolation.

In this guide, you'll learn how to:

- Structure test modules effectively
- Test dispatchable functions
- Verify storage changes
- Check event emission
- Test error conditions
- Use genesis configurations in tests

## Prerequisites

Before you begin, ensure you have:

- Completed the [Make a Custom Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/) guide
- Completed the [Mock Your Runtime](/parachains/customize-runtime/pallet-development/mock-runtime/) guide
- The custom counter pallet with mock runtime in `pallets/pallet-custom`
- Basic understanding of [Rust testing](https://doc.rust-lang.org/book/ch11-00-testing.html){target=\_blank}

## Understanding FRAME Testing Tools

FRAME provides specialized testing macros and utilities that make pallet testing more efficient:

### Assertion Macros

- **[`assert_ok!`](https://paritytech.github.io/polkadot-sdk/master/frame_support/macro.assert_ok.html){target=\_blank}** - Asserts that a dispatchable call succeeds
- **[`assert_noop!`](https://paritytech.github.io/polkadot-sdk/master/frame_support/macro.assert_noop.html){target=\_blank}** - Asserts that a call fails without changing state (no operation)
- **`assert_eq!`** - Standard Rust equality assertion

!!!info "`assert_noop!` Explained"
    Use `assert_noop!` to ensure the operation fails without any state changes. This is critical for testing error conditions - it verifies both that the error occurs AND that no storage was modified.

### System Pallet Test Helpers

The [`frame_system`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} pallet provides useful methods for testing:

- **[`System::events()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.events){target=\_blank}** - Returns all events emitted during the test
- **[`System::assert_last_event()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.assert_last_event){target=\_blank}** - Asserts the last event matches expectations
- **[`System::set_block_number()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.set_block_number){target=\_blank}** - Sets the current block number

!!!warning "Events and Block Number"
    Events are not emitted on block 0 (genesis block). If you need to test events, ensure you set the block number to at least 1 using `System::set_block_number(1)`.

### Origin Types

- **[`RuntimeOrigin::root()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/enum.RawOrigin.html#variant.Root){target=\_blank}** - Root/sudo origin for privileged operations
- **[`RuntimeOrigin::signed(account)`](https://paritytech.github.io/polkadot-sdk/master/frame_system/enum.RawOrigin.html#variant.Signed){target=\_blank}** - Signed origin from a specific account
- **[`RuntimeOrigin::none()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/enum.RawOrigin.html#variant.None){target=\_blank}** - No origin (typically fails for most operations)

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

    ```rust
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
use frame_support::{assert_noop, assert_ok};
```

This setup imports:
- The mock runtime and test utilities from `mock.rs`
- Your pallet's `Error` and `Event` types
- FRAME's assertion macros

## Write Your First Test

Let's start with a simple test to verify the increment function works correctly.

### Test Basic Increment

```rust
#[test]
fn increment_works() {
    new_test_ext().execute_with(|| {
        // Given: counter starts at 0
        let alice = 1u64;
        
        // When: Alice increments by 5
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(alice), 5));
        
        // Then: counter value and user interactions are updated
        assert_eq!(crate::CounterValue::<Test>::get(), 5);
        assert_eq!(crate::UserInteractions::<Test>::get(alice), 1);
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

🎉 Congratulations! You've written and run your first pallet test.

## Test Error Conditions

Now let's test that our pallet correctly handles errors. Error testing is crucial to ensure your pallet fails safely.

### Test Overflow Protection

```rust
#[test]
fn increment_handles_overflow() {
    new_test_ext_with_counter(u32::MAX).execute_with(|| {
        // Given: counter is at maximum u32 value
        let alice = 1u64;
        
        // When: attempting to increment
        // Then: should fail with overflow error and no state change
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(alice), 1),
            Error::<Test>::Overflow
        );
        
        // Verify no state changes occurred
        assert_eq!(crate::CounterValue::<Test>::get(), u32::MAX);
        assert_eq!(crate::UserInteractions::<Test>::get(alice), 0);
    });
}
```

Test overflow protection:

```bash
cargo test --package pallet-custom increment_handles_overflow
```

### Test Underflow Protection

```rust
#[test]
fn decrement_handles_underflow() {
    new_test_ext_with_counter(5).execute_with(|| {
        // Given: counter is at 5
        let alice = 1u64;
        
        // When: attempting to decrement by more than current value
        // Then: should fail with underflow error
        assert_noop!(
            CustomPallet::decrement(RuntimeOrigin::signed(alice), 10),
            Error::<Test>::Underflow
        );
        
        // Verify no state changes occurred
        assert_eq!(crate::CounterValue::<Test>::get(), 5);
        assert_eq!(crate::UserInteractions::<Test>::get(alice), 0);
    });
}
```

Verify underflow protection:

```bash
cargo test --package pallet-custom decrement_handles_underflow
```

## Test Access Control

Verify that origin checks work correctly and unauthorized access is prevented.

### Test Root-Only Access

```rust
#[test]
fn set_counter_value_requires_root() {
    new_test_ext().execute_with(|| {
        let alice = 1u64;
        
        // When: non-root user tries to set counter
        // Then: should fail with BadOrigin
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::signed(alice), 100),
            sp_runtime::DispatchError::BadOrigin
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

```rust
#[test]
fn increment_emits_event() {
    new_test_ext().execute_with(|| {
        let alice = 1u64;
        
        // Set block number to enable events
        System::set_block_number(1);
        
        // When: increment occurs
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(alice), 5));
        
        // Then: correct event is emitted
        System::assert_last_event(
            Event::CounterIncremented {
                new_value: 5,
                who: alice,
                amount: 5,
            }
            .into(),
        );
    });
}
```

Run the event test:

```bash
cargo test --package pallet-custom increment_emits_event
```

## Test Genesis Configuration

Verify that genesis configuration works correctly.

### Test Genesis Setup

```rust
#[test]
fn genesis_config_works() {
    new_test_ext_with_counter(100).execute_with(|| {
        // Given: genesis sets counter to 100
        // Then: counter should start at that value
        assert_eq!(crate::CounterValue::<Test>::get(), 100);
        
        // And: we can still interact with it
        let alice = 1u64;
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(alice), 10));
        assert_eq!(crate::CounterValue::<Test>::get(), 110);
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

```
running 6 tests
test tests::decrement_handles_underflow ... ok
test tests::genesis_config_works ... ok
test tests::increment_emits_event ... ok
test tests::increment_handles_overflow ... ok
test tests::increment_works ... ok
test tests::set_counter_value_requires_root ... ok

test result: ok. 6 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

🎉 Congratulations! You have a well-tested pallet covering the essential testing patterns!

These six tests demonstrate the core patterns you'll use in pallet testing. As you build more complex pallets, you'll apply these same patterns to test additional functionality.

??? code "Full Test Suite Code"
    Here's the complete `tests.rs` file for quick reference:

    ```rust
    use crate::{mock::*, Error, Event};
    use frame_support::{assert_noop, assert_ok};

    #[test]
    fn increment_works() {
        new_test_ext().execute_with(|| {
            let alice = 1u64;
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(alice), 5));
            assert_eq!(crate::CounterValue::<Test>::get(), 5);
            assert_eq!(crate::UserInteractions::<Test>::get(alice), 1);
        });
    }

    #[test]
    fn increment_handles_overflow() {
        new_test_ext_with_counter(u32::MAX).execute_with(|| {
            let alice = 1u64;
            assert_noop!(
                CustomPallet::increment(RuntimeOrigin::signed(alice), 1),
                Error::<Test>::Overflow
            );
            assert_eq!(crate::CounterValue::<Test>::get(), u32::MAX);
            assert_eq!(crate::UserInteractions::<Test>::get(alice), 0);
        });
    }

    #[test]
    fn decrement_handles_underflow() {
        new_test_ext_with_counter(5).execute_with(|| {
            let alice = 1u64;
            assert_noop!(
                CustomPallet::decrement(RuntimeOrigin::signed(alice), 10),
                Error::<Test>::Underflow
            );
            assert_eq!(crate::CounterValue::<Test>::get(), 5);
            assert_eq!(crate::UserInteractions::<Test>::get(alice), 0);
        });
    }

    #[test]
    fn set_counter_value_requires_root() {
        new_test_ext().execute_with(|| {
            let alice = 1u64;
            assert_noop!(
                CustomPallet::set_counter_value(RuntimeOrigin::signed(alice), 100),
                sp_runtime::DispatchError::BadOrigin
            );
            assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 100));
            assert_eq!(crate::CounterValue::<Test>::get(), 100);
        });
    }

    #[test]
    fn increment_emits_event() {
        new_test_ext().execute_with(|| {
            let alice = 1u64;
            System::set_block_number(1);
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(alice), 5));
            System::assert_last_event(
                Event::CounterIncremented {
                    new_value: 5,
                    who: alice,
                    amount: 5,
                }
                .into(),
            );
        });
    }

    #[test]
    fn genesis_config_works() {
        new_test_ext_with_counter(100).execute_with(|| {
            assert_eq!(crate::CounterValue::<Test>::get(), 100);
            let alice = 1u64;
            assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(alice), 10));
            assert_eq!(crate::CounterValue::<Test>::get(), 110);
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
