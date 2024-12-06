---
title: Pallet Unit Testing
description: Learn how to implement comprehensive unit tests for Substrate pallets using the Polkadot SDK testing framework
---

# Pallet Unit Testing

## Introduction

In Polkadot SDK-based blockchains, unit testing is crucial for ensuring the reliability and correctness of runtime modules (pallets). Comprehensive testing helps validate pallet functionality, prevent potential bugs, and maintain the integrity of your blockchain logic.

This tutorial will guide you through creating robust unit tests for a custom pallet, covering essential testing strategies and best practices specific to the Polkadot SDK ecosystem.

## Prerequisites

To set up your testing environment for Polkadot SDK pallets, you'll need:

- Rust installation
- Basic understanding of Substrate/Polkadot SDK concepts
- A custom pallet implementation
- Familiarity with Rust testing frameworks

## Set Up the Testing Environment

### Create Test Configuration Files

To effectively test your pallet, you'll need to create two key files:

1. **`mock.rs`: Mock Runtime Configuration**
Create a file that simulates a runtime environment for testing:

```rust
use crate as pallet_custom;
use frame_support::{derive_impl, parameter_types};
use sp_runtime::BuildStorage;

type Block = frame_system::mocking::MockBlock<Test>;

#[frame_support::runtime]
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
    pub type System = frame_system::Pallet<Test>;
    
    #[runtime::pallet_index(1)]
    pub type CustomPallet = pallet_custom::Pallet<Test>;
}

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
}

parameter_types! {
    pub const CounterMaxValue: u32 = 10;
}

impl pallet_custom::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = CounterMaxValue;
}

// Build test externalities for isolated test execution
pub fn new_test_ext() -> sp_io::TestExternalities {
    frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}
```

2. **Update `lib.rs` to Include Test Modules**

```rust
#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;
```

## Implement Test Cases

### Test Configuration

Create a comprehensive test suite that covers various scenarios:

1. **Successful Operations**

```rust
#[test]
fn it_works_for_increment() {
    new_test_ext().execute_with(|| {
        // Ensure initial value is set
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));
        
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        System::assert_last_event(Event::CounterIncremented { 
            counter_value: 5, 
            who: 1, 
            incremented_amount: 5 
        }.into());
    });
}
```

2. **Error Handling**

```rust
#[test]
fn increment_fails_for_max_value_exceeded() {
    new_test_ext().execute_with(|| {
        // Set to a value close to max (10)
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 7));
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 4),
            Error::<Test>::CounterValueExceedsMax
        );
    });
}
```

### Origin and Access Control Tests

```rust
#[test]
fn set_counter_value_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        assert_noop!(
            CustomPallet::set_counter_value(RuntimeOrigin::signed(1), 5),
            sp_runtime::traits::BadOrigin
        );
    });
}
```

### Edge Case Handling

```rust
#[test]
fn increment_handles_overflow() {
    new_test_ext().execute_with(|| {
        // Set to max value
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 10));
        assert_noop!(
            CustomPallet::increment(RuntimeOrigin::signed(1), 1),
            Error::<Test>::CounterValueExceedsMax
        );
    });
}
```

### User Interaction Tracking

```rust
#[test]
fn user_interactions_increment() {
    new_test_ext().execute_with(|| {
        // Ensure initial counter value is set
        assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 0));

        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
        assert_ok!(CustomPallet::decrement(RuntimeOrigin::signed(1), 2));

        // Check user interactions
        assert_eq!(UserInteractions::<Test>::get(1).unwrap_or(0), 2);
    });
}
```

## Key Takeaways

In this tutorial, you learned how to:
- Create a mock runtime for testing
- Implement comprehensive test cases
- Verify pallet functionality
- Handle various scenarios and edge cases

## Common Testing Techniques

- Use `assert_ok!()` for successful operations
- Use `assert_noop!()` for expected failures
- Verify state changes
- Check event emissions
- Test access control mechanisms

## Where to Go Next

TODO: 

## Conclusion

Comprehensive unit testing is crucial for developing reliable and secure pallets. By systematically testing various scenarios, you can ensure your pallet behaves correctly under different conditions.