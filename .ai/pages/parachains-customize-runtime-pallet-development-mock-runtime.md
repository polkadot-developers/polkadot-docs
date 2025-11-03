---
title: Mock Your Runtime
description: Learn how to create a mock runtime environment for testing your custom pallets in isolation, enabling comprehensive unit testing before runtime integration.
categories: Parachains
url: https://docs.polkadot.com/parachains/customize-runtime/pallet-development/mock-runtime/
---

# Mock Your Runtime

## Introduction

Testing is a critical part of pallet development. Before integrating your pallet into a full runtime, you need a way to test its functionality in isolation. A mock runtime provides a minimal, simulated blockchain environment where you can verify your pallet's logic without the overhead of running a full node.

In this guide, you'll learn how to create a mock runtime for the custom counter pallet built in the [Make a Custom Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/) guide. This mock runtime will enable you to write comprehensive unit tests that verify:

- Dispatchable function behavior
- Storage state changes
- Event emission
- Error handling
- Access control and origin validation
- Genesis configuration

## Prerequisites

Before you begin, ensure you have:

- Completed the [Make a Custom Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/) guide
- The custom counter pallet from that guide available in `pallets/pallet-custom`
- Basic understanding of [Rust testing](https://doc.rust-lang.org/book/ch11-00-testing.html){target=\_blank}

## Understanding Mock Runtimes

A mock runtime is a minimal implementation of the runtime environment that:

- **Simulates blockchain state** - Provides storage and state management
- **Implements required traits** - Satisfies your pallet's `Config` trait requirements
- **Enables isolated testing** - Allows testing without external dependencies
- **Supports genesis configuration** - Sets initial blockchain state for tests
- **Speeds up development** - Provides instant feedback on code changes

Mock runtimes are used exclusively for testing and are never deployed to a live blockchain.

## Create the Mock Runtime Module

Start by creating a new module file within your pallet to house the mock runtime code.

1. Navigate to your pallet directory:

    ```bash
    cd pallets/pallet-custom/src
    ```

2. Create a new file named `mock.rs`:

    ```bash
    touch mock.rs
    ```

3. Open `src/lib.rs` and add the mock module declaration at the top of the file, right after the `pub use pallet::*;` line:

    ```rust
    #![cfg_attr(not(feature = "std"), no_std)]

    pub use pallet::*;

    #[cfg(test)]
    mod mock;

    #[frame::pallet]
    pub mod pallet {
        // ... existing pallet code
    }
    ```

    The `#[cfg(test)]` attribute ensures this module is only compiled during testing.

## Set Up Basic Mock Infrastructure

Open `src/mock.rs` and add the foundational imports and type definitions:

```rust
use crate as pallet_custom;
use frame::{
    deps::sp_runtime::{traits::IdentityLookup, BuildStorage},
    prelude::*,
    runtime::prelude::*,
    testing_prelude::*,
    traits::ConstU32,
};

// Define the mock runtime struct
frame_support::construct_runtime!(
    pub enum Test {
        System: frame_system,
        CustomPallet: pallet_custom,
    }
);

// Basic parameter types for the mock runtime
parameter_types! {
    pub const BlockHashCount: u64 = 250;
}
```

**Key components:**

- **`construct_runtime!`** - Macro that builds a minimal runtime with only the pallets needed for testing
- **`Test`** - The mock runtime type used in tests
- **`parameter_types!`** - Defines constant values used in trait implementations
- **`BlockHashCount`** - Determines how many recent block hashes to store

## Implement frame_system Configuration

The [`frame_system`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} pallet provides core blockchain functionality and is required by all other pallets. Configure it for the test environment:

```rust
impl frame_system::Config for Test {
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type DbWeight = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type Nonce = u64;
    type Hash = sp_core::H256;
    type Hashing = sp_runtime::traits::BlakeTwo256;
    type AccountId = u64;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = RuntimeEvent;
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ();
    type OnSetCode = ();
    type MaxConsumers = ConstU32<16>;
    type SingleBlockMigrations = ();
    type MultiBlockMigrator = ();
    type PreInherents = ();
    type PostInherents = ();
    type PostTransactions = ();
}
```

**Simplified for testing:**

- **`AccountId = u64`** - Uses simple integers instead of cryptographic account IDs
- **`Lookup = IdentityLookup`** - Direct account ID mapping (no address conversion)
- **`BlockWeights = ()`** - No weight tracking in tests
- **Empty implementations** - Many fields use unit types or empty implementations since they're not needed for basic pallet testing

## Implement Your Pallet's Configuration

Now implement the `Config` trait for your custom pallet. This must match the trait defined in your pallet's `lib.rs`:

```rust
impl pallet_custom::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<1000>;
}
```

**Configuration details:**

- **`RuntimeEvent`** - Connects your pallet's events to the mock runtime's event system
- **`CounterMaxValue`** - Sets the maximum counter value to 1000, matching the production configuration

!!!note
    The configuration here should mirror what you'll use in production unless you specifically need different values for testing.

## Configure Genesis Storage

Genesis storage defines the initial state of your blockchain before any blocks are produced. Since your counter pallet includes genesis configuration (added in the previous guide), you can now set up test environments with different initial states.

### Basic Test Environment

Create a helper function for the default test environment:

```rust
/// Build genesis storage with default values (empty state)
pub fn new_test_ext() -> sp_io::TestExternalities {
    frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}
```

This function creates a clean blockchain state with no initial counter value or user interactions.

### Custom Genesis Configurations

For testing specific scenarios, create additional helper functions with customized genesis states:

```rust
/// Build genesis storage with custom initial counter value
pub fn new_test_ext_with_counter(value: u32) -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap();

    pallet_custom::GenesisConfig::<Test> {
        initial_counter_value: value,
        initial_user_interactions: vec![],
    }
    .assimilate_storage(&mut t)
    .unwrap();

    t.into()
}

/// Build genesis storage with pre-configured user interactions
pub fn new_test_ext_with_users() -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap();

    pallet_custom::GenesisConfig::<Test> {
        initial_counter_value: 0,
        initial_user_interactions: vec![
            (1, 10),  // Alice has 10 interactions
            (2, 20),  // Bob has 20 interactions
            (3, 15),  // Charlie has 15 interactions
        ],
    }
    .assimilate_storage(&mut t)
    .unwrap();

    t.into()
}
```

**Key methods:**

- **[`BuildStorage::build_storage()`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/trait.BuildStorage.html#method.build_storage){target=\_blank}** - Creates the initial storage state
- **[`assimilate_storage`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/trait.BuildStorage.html#method.assimilate_storage){target=\_blank}** - Merges pallet genesis config into the existing storage
- **Multiple configurations** - You can chain multiple `assimilate_storage` calls for different pallets

## Verify Mock Compilation

Before proceeding to write tests, ensure your mock runtime compiles correctly:

```bash
cargo test --package pallet-custom --lib
```

This command compiles the test code (including the mock and genesis configuration) without running tests yet. Address any compilation errors before continuing.

## Understanding the Test Environment

With your mock runtime in place, you can now write tests using this environment. Here's how the testing workflow works:

### Test Structure

A typical test follows this pattern:

```rust
#[test]
fn test_name() {
    new_test_ext().execute_with(|| {
        // Your test code here
    });
}
```

The `execute_with` closure provides:

- **Storage context** - Access to your pallet's storage items
- **Block context** - Simulated block number, timestamp, etc.
- **Event system** - Ability to check emitted events
- **Origin handling** - Test with different account origins

### Available Test Accounts

Since we configured `AccountId = u64`, you can use simple integers as test accounts:

```rust
let alice = 1u64;
let bob = 2u64;
let charlie = 3u64;
```

### Calling Dispatchable Functions

Invoke your pallet's functions using the `Call` enum:

```rust
// As root origin
assert_ok!(CustomPallet::set_counter_value(RuntimeOrigin::root(), 100));

// As signed origin
assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));
```

### Checking Results

Use Rust's testing assertions and FRAME's specialized macros:

```rust
// Assert operation succeeded
assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 5));

// Assert operation failed with specific error
assert_noop!(
    CustomPallet::decrement(RuntimeOrigin::signed(1), 10),
    Error::<Test>::Underflow
);

// Check storage values
assert_eq!(CounterValue::<Test>::get(), 5);
```

### Verifying Events

Check that your pallet emitted the expected events:

```rust
// Get the last event
System::assert_last_event(
    Event::CounterIncremented {
        new_value: 5,
        who: 1,
        amount: 5,
    }
    .into(),
);
```

### Using Genesis in Tests

Here are examples of how to use different genesis configurations:

```rust
#[test]
fn test_with_default_genesis() {
    new_test_ext().execute_with(|| {
        // Counter starts at 0 (default)
        assert_eq!(CounterValue::<Test>::get(), 0);
    });
}

#[test]
fn test_with_initial_counter() {
    new_test_ext_with_counter(500).execute_with(|| {
        // Counter starts at 500
        assert_eq!(CounterValue::<Test>::get(), 500);
        
        // Can increment from this value
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 10));
        assert_eq!(CounterValue::<Test>::get(), 510);
    });
}

#[test]
fn test_with_pre_configured_users() {
    new_test_ext_with_users().execute_with(|| {
        // Alice (account 1) has 10 interactions
        assert_eq!(UserInteractions::<Test>::get(1), 10);
        
        // Bob (account 2) has 20 interactions
        assert_eq!(UserInteractions::<Test>::get(2), 20);
        
        // Charlie (account 3) has 15 interactions
        assert_eq!(UserInteractions::<Test>::get(3), 15);
    });
}
```

!!!tip "Genesis Best Practices"
    - Use default genesis for most tests to ensure they start from a clean state
    - Create specialized genesis helpers for complex scenarios that need specific initial conditions
    - Document what each genesis helper sets up so other developers understand the test context
    - Keep genesis configuration minimal—only set values that are necessary for the specific tests

??? code "Complete Mock Runtime"
    
    Here's the complete `mock.rs` file for reference:

    ```rust
    use crate as pallet_custom;
    use frame::{
        deps::sp_runtime::{traits::IdentityLookup, BuildStorage},
        prelude::*,
        runtime::prelude::*,
        testing_prelude::*,
        traits::ConstU32,
    };

    // Define the mock runtime struct
    frame_support::construct_runtime!(
        pub enum Test {
            System: frame_system,
            CustomPallet: pallet_custom,
        }
    );

    // Basic parameter types for the mock runtime
    parameter_types! {
        pub const BlockHashCount: u64 = 250;
    }

    impl frame_system::Config for Test {
        type BaseCallFilter = frame_support::traits::Everything;
        type BlockWeights = ();
        type BlockLength = ();
        type DbWeight = ();
        type RuntimeOrigin = RuntimeOrigin;
        type RuntimeCall = RuntimeCall;
        type Nonce = u64;
        type Hash = sp_core::H256;
        type Hashing = sp_runtime::traits::BlakeTwo256;
        type AccountId = u64;
        type Lookup = IdentityLookup<Self::AccountId>;
        type Block = Block;
        type RuntimeEvent = RuntimeEvent;
        type Version = ();
        type PalletInfo = PalletInfo;
        type AccountData = ();
        type OnNewAccount = ();
        type OnKilledAccount = ();
        type SystemWeightInfo = ();
        type SS58Prefix = ();
        type OnSetCode = ();
        type MaxConsumers = ConstU32<16>;
        type SingleBlockMigrations = ();
        type MultiBlockMigrator = ();
        type PreInherents = ();
        type PostInherents = ();
        type PostTransactions = ();
    }

    impl pallet_custom::Config for Test {
        type RuntimeEvent = RuntimeEvent;
        type CounterMaxValue = ConstU32<1000>;
    }

    /// Build genesis storage with default values (empty state)
    pub fn new_test_ext() -> sp_io::TestExternalities {
        frame_system::GenesisConfig::<Test>::default()
            .build_storage()
            .unwrap()
            .into()
    }

    /// Build genesis storage with custom initial counter value
    pub fn new_test_ext_with_counter(value: u32) -> sp_io::TestExternalities {
        let mut t = frame_system::GenesisConfig::<Test>::default()
            .build_storage()
            .unwrap();

        pallet_custom::GenesisConfig::<Test> {
            initial_counter_value: value,
            initial_user_interactions: vec![],
        }
        .assimilate_storage(&mut t)
        .unwrap();

        t.into()
    }

    /// Build genesis storage with pre-configured user interactions
    pub fn new_test_ext_with_users() -> sp_io::TestExternalities {
        let mut t = frame_system::GenesisConfig::<Test>::default()
            .build_storage()
            .unwrap();

        pallet_custom::GenesisConfig::<Test> {
            initial_counter_value: 0,
            initial_user_interactions: vec![
                (1, 10),  // Alice has 10 interactions
                (2, 20),  // Bob has 20 interactions
                (3, 15),  // Charlie has 15 interactions
            ],
        }
        .assimilate_storage(&mut t)
        .unwrap();

        t.into()
    }
    ```

## Key Takeaways

You've successfully created a mock runtime with genesis configuration for your custom pallet. You now have:

- **Isolated testing environment** - Test your pallet without a full runtime
- **Simplified configuration** - Minimal setup for rapid development iteration
- **Genesis configuration** - Set initial blockchain state for different test scenarios
- **Multiple test helpers** - Different genesis setups for various testing needs
- **Foundation for unit tests** - Infrastructure to test all pallet functionality
- **Fast feedback loop** - Instant compilation and test execution

The mock runtime with genesis configuration is essential for test-driven development, allowing you to verify logic under different initial conditions before integration into the actual parachain runtime.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Pallet Unit Testing__

    ---

    Learn to write comprehensive unit tests for your pallet using the mock runtime you just created.

    [:octicons-arrow-right-24: Continue](/parachains/customize-runtime/pallet-development/pallet-testing/)

</div>
