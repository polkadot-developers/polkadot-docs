---
title: Mock Your Runtime
description: Learn how to create a mock runtime environment for testing your custom pallets in isolation, enabling comprehensive unit testing before runtime integration.
categories: Parachains
url: https://docs.polkadot.com/parachains/customize-runtime/pallet-development/mock-runtime/
---

# Mock Your Runtime

## Introduction

Testing is a critical part of pallet development. Before integrating your pallet into a full runtime, you need a way to test its functionality in isolation. A mock runtime provides a minimal, simulated blockchain environment where you can verify your pallet's logic without the overhead of running a full node.

In this guide, you'll learn how to create a mock runtime for the custom counter pallet built in the [Make a Custom Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/){target=\_blank} guide. This mock runtime will enable you to write comprehensive unit tests that verify:

- Dispatchable function behavior.
- Storage state changes.
- Event emission.
- Error handling.
- Access control and origin validation.
- Genesis configuration.

## Prerequisites

Before you begin, ensure you have:

- Completed the [Make a Custom Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/){target=\_blank} guide.
- The custom counter pallet from the Make a Custom Pallet guide. Available in `pallets/pallet-custom`.
- Basic understanding of [Rust testing](https://doc.rust-lang.org/book/ch11-00-testing.html){target=\_blank}.

## Understand Mock Runtimes

A mock runtime is a minimal implementation of the runtime environment that:

- Simulates blockchain state to provide storage and state management.
- Satisfies your pallet's `Config` trait requirements.
- Allows isolated testing without external dependencies.
- Supports genesis configuration to set initial blockchain state for tests.
- Provides instant feedback on code changes for a faster development cycle.

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

3. Next, open `src/lib.rs` and add the mock module declaration at the top of the file, right after the `pub use pallet::*;` line:

    ```rust title="src/lib.rs"
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

## Set Up Basic Mock

Open `src/mock.rs` and add the foundational imports and type definitions:

```rust title="src/mock.rs"
use crate as pallet_custom;
use frame::{
    deps::{
        frame_support::{ derive_impl, traits::ConstU32 },
        sp_io,
        sp_runtime::{ traits::IdentityLookup, BuildStorage },
    },
    prelude::*,
};

type Block = frame_system::mocking::MockBlock<Test>;

// Configure a mock runtime to test the pallet.
frame::deps::frame_support::construct_runtime!(
        pub enum Test
        {
            System: frame_system,
            CustomPallet: pallet_custom,
        }
    );
```

The preceding code includes the following key components: 

- **[`construct_runtime!`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_frame/runtime/apis/trait.ConstructRuntimeApi.html#tymethod.construct_runtime_api){target=\_blank}**: Macro that builds a minimal runtime with only the pallets needed for testing.
- **`Test`**: The mock runtime type used in tests.
- **`Block`**: Type alias for the mock block type that the runtime will use.

## Implement Essential Configuration

The [`frame_system`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} pallet provides core blockchain functionality and is required by all other pallets. Configure it for the test environment as follows:

```rust title="src/mock.rs"
#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Block = Block;
    type AccountId = u64;
    type Lookup = IdentityLookup<Self::AccountId>;
}
```

This simplified configuration for testing includes the following:

- **`#[derive_impl]`**: Automatically provides sensible test defaults for most `frame_system::Config` types.
- **`AccountId = u64`**: Uses simple integers instead of cryptographic account IDs.
- **`Lookup = IdentityLookup`**: Direct account ID mapping (no address conversion).
- **`Block = Block`**: Uses the mock block type we defined earlier.

This approach is much more concise than manually specifying every configuration type, as the `TestDefaultConfig` preset provides appropriate defaults for testing.

## Implement Your Pallet's Configuration

Now implement the `Config` trait for your custom pallet. This trait must match the one defined in your pallet's `src/lib.rs`:

```rust title="src/mock.rs"
impl pallet_custom::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type CounterMaxValue = ConstU32<1000>;
}
```

Configuration details include:

- **`RuntimeEvent`**: Connects your pallet's events to the mock runtime's event system.
- **`CounterMaxValue`**: Sets the maximum counter value to 1000, matching the production configuration.

The configuration here should mirror what you'll use in production unless you specifically need different values for testing.

## Configure Genesis Storage

Genesis storage defines the initial state of your blockchain before any blocks are produced. Since your counter pallet includes the genesis configuration (added in the previous guide), you can now set up test environments with different initial states.

### Basic Test Environment

Create a helper function for the default test environment:

```rust title="src/mock.rs"
// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

    (pallet_custom::GenesisConfig::<Test> {
        initial_counter_value: 0,
        initial_user_interactions: vec![],
    })
        .assimilate_storage(&mut t)
        .unwrap();

    t.into()
}
```

This function creates a clean blockchain state with an initial counter value of 0 and no user interactions.

### Custom Genesis Configurations

For testing specific scenarios, create additional helper functions with customized genesis states:

```rust title="src/mock.rs"
// Helper function to create a test externalities with a specific initial counter value
pub fn new_test_ext_with_counter(initial_value: u32) -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

    (pallet_custom::GenesisConfig::<Test> {
        initial_counter_value: initial_value,
        initial_user_interactions: vec![],
    })
        .assimilate_storage(&mut t)
        .unwrap();

    t.into()
}

// Helper function to create a test externalities with initial user interactions
pub fn new_test_ext_with_interactions(
    initial_value: u32,
    interactions: Vec<(u64, u32)>
) -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

    (pallet_custom::GenesisConfig::<Test> {
        initial_counter_value: initial_value,
        initial_user_interactions: interactions,
    })
        .assimilate_storage(&mut t)
        .unwrap();

    t.into()
}
```

Key methods used in this step include:

- **[`BuildStorage::build_storage()`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/trait.BuildStorage.html#method.build_storage){target=\_blank}**: Creates the initial storage state.
- **[`assimilate_storage`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/trait.BuildStorage.html#method.assimilate_storage){target=\_blank}**: Merges pallet genesis config into the existing storage.

You can chain multiple `assimilate_storage` calls to configure multiple pallets.

## Verify Mock Compilation

Before proceeding to write tests, ensure your mock runtime compiles correctly:

```bash
cargo test --package pallet-custom --lib
```

This command compiles the test code (including the mock and genesis configuration) without running tests yet. Address any compilation errors before continuing.

??? code "Complete mock runtime script"

    Here's the complete `mock.rs` file for reference:

    ```rust title="src/mock.rs"
    use crate as pallet_custom;
    use frame::{
        deps::{
            frame_support::{ derive_impl, traits::ConstU32 },
            sp_io,
            sp_runtime::{ traits::IdentityLookup, BuildStorage },
        },
        prelude::*,
    };

    type Block = frame_system::mocking::MockBlock<Test>;

    // Configure a mock runtime to test the pallet.
    frame::deps::frame_support::construct_runtime!(
            pub enum Test
            {
                System: frame_system,
                CustomPallet: pallet_custom,
            }
        );

    #[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
    impl frame_system::Config for Test {
        type Block = Block;
        type AccountId = u64;
        type Lookup = IdentityLookup<Self::AccountId>;
    }

    impl pallet_custom::Config for Test {
        type RuntimeEvent = RuntimeEvent;
        type CounterMaxValue = ConstU32<1000>;
    }

    // Build genesis storage according to the mock runtime.
    pub fn new_test_ext() -> sp_io::TestExternalities {
        let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

        (pallet_custom::GenesisConfig::<Test> {
            initial_counter_value: 0,
            initial_user_interactions: vec![],
        })
            .assimilate_storage(&mut t)
            .unwrap();

        t.into()
    }

    // Helper function to create a test externalities with a specific initial counter value
    pub fn new_test_ext_with_counter(initial_value: u32) -> sp_io::TestExternalities {
        let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

        (pallet_custom::GenesisConfig::<Test> {
            initial_counter_value: initial_value,
            initial_user_interactions: vec![],
        })
            .assimilate_storage(&mut t)
            .unwrap();

        t.into()
    }

    // Helper function to create a test externalities with initial user interactions
    pub fn new_test_ext_with_interactions(
        initial_value: u32,
        interactions: Vec<(u64, u32)>
    ) -> sp_io::TestExternalities {
        let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();

        (pallet_custom::GenesisConfig::<Test> {
            initial_counter_value: initial_value,
            initial_user_interactions: interactions,
        })
            .assimilate_storage(&mut t)
            .unwrap();

        t.into()
    }
    ```

## Key Takeaways

You've successfully created a mock runtime with a genesis configuration for your custom pallet. You can now:

- Test your pallet without a full runtime.
- Set initial blockchain state for different test scenarios.
- Create different genesis setups for various testing needs.
- Use this minimal setup to test all pallet functionality.

The mock runtime with a genesis configuration is essential for test-driven development, enabling you to verify logic under different initial conditions before integrating it into the actual parachain runtime.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Pallet Unit Testing__

    ---

    Learn to write comprehensive unit tests for your pallet using the mock runtime you just created.

    [:octicons-arrow-right-24: Continue](/parachains/customize-runtime/pallet-development/pallet-testing/)

</div>
