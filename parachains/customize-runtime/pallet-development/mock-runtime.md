---
title: Mock Your Runtime
description: Learn how to create a mock runtime environment for testing your custom pallets in isolation, enabling comprehensive unit testing before runtime integration.
categories: Parachains
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
    --8<-- 'code/parachains/customize-runtime/pallet-development/mock-runtime/lib.rs'
    ```

    The `#[cfg(test)]` attribute ensures this module is only compiled during testing.

## Set Up Basic Mock

Open `src/mock.rs` and add the foundational imports and type definitions:

```rust title="src/mock.rs"
--8<-- 'code/parachains/customize-runtime/pallet-development/mock-runtime/mock.rs:1:20'
```

The preceding code includes the following key components: 

- **[`construct_runtime!`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_frame/runtime/apis/trait.ConstructRuntimeApi.html#tymethod.construct_runtime_api){target=\_blank}**: Macro that builds a minimal runtime with only the pallets needed for testing.
- **`Test`**: The mock runtime type used in tests.
- **`Block`**: Type alias for the mock block type that the runtime will use.

## Implement Essential Configuration

The [`frame_system`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} pallet provides core blockchain functionality and is required by all other pallets. Configure it for the test environment as follows:

```rust title="src/mock.rs"
--8<-- 'code/parachains/customize-runtime/pallet-development/mock-runtime/mock.rs:22:27'
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
--8<-- 'code/parachains/customize-runtime/pallet-development/mock-runtime/mock.rs:29:32'
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
--8<-- 'code/parachains/customize-runtime/pallet-development/mock-runtime/mock.rs:34:46'
```

This function creates a clean blockchain state with an initial counter value of 0 and no user interactions.

### Custom Genesis Configurations

For testing specific scenarios, create additional helper functions with customized genesis states:

```rust title="src/mock.rs"
--8<-- 'code/parachains/customize-runtime/pallet-development/mock-runtime/mock.rs:48:77'
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
    --8<-- 'code/parachains/customize-runtime/pallet-development/mock-runtime/mock.rs'
    ```

## Key Takeaways

You've successfully created a mock runtime with a genesis configuration for your custom pallet. You can now:

- Test your pallet without a full runtime.
- Set initial blockchain state for different test scenarios.
- Create different genesis setups for various testing needs.
- Use this minimal setup to test all pallet functionality.

The mock runtime with a genesis configuration is essential for test-driven development, enabling you to verify logic under different initial conditions before integrating it into the actual parachain runtime.

<div class="status-badge" markdown>
[![Mock Your Runtime](https://github.com/polkadot-developers/polkadot-cookbook/actions/workflows/polkadot-docs-mock-runtime.yml/badge.svg)](https://github.com/polkadot-developers/polkadot-cookbook/actions/workflows/polkadot-docs-mock-runtime.yml){target=\_blank}
[:material-code-tags: View tests](https://github.com/polkadot-developers/polkadot-cookbook/blob/master/polkadot-docs/parachains/customize-runtime/pallet-development/mock-runtime/tests/guide.test.ts){ .tests-button target=\_blank}
</div>

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Pallet Unit Testing__

    ---

    Learn to write comprehensive unit tests for your pallet using the mock runtime you just created.

    [:octicons-arrow-right-24: Continue](/parachains/customize-runtime/pallet-development/pallet-testing/)

</div>