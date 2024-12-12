---
title: Pallet Unit Testing
description: Discover how to create thorough unit tests for pallets built with the Polkadot SDK, using a custom pallet as a practical example.
---

# Pallet Unit Testing

## Introduction

You have learned how to create a custom pallet in the [Build the Pallet](/tutorials/polkadot-sdk/parachains/build-custom-pallet/){target=\_blank} tutorial; now you will see how to test the pallet to ensure that it works as expected. As stated in the [Pallet Testing](/develop/parachains/customize-parachain/pallet-testing/){target=\_blank} article, unit testing is crucial for ensuring the reliability and correctness of pallets in Polkadot SDK-based blockchains. Comprehensive testing helps validate pallet functionality, prevent potential bugs, and maintain the integrity of your blockchain logic.

This tutorial will guide you through creating a unit testing suite for a custom pallet built in the [previous tutorial](/tutorials/polkadot-sdk/parachains/build-custom-pallet/){target=\_blank}, covering essential testing aspects and steps.

## Prerequisites

To set up your testing environment for Polkadot SDK pallets, you'll need:

- [Polkadot SDK dependencies](/develop/parachains/get-started/install-polkadot-sdk/){target=\_blank} installed
- Basic understanding of Substrate/Polkadot SDK concepts
- A custom pallet implementation, check the [Build the Pallet](/tutorials/polkadot-sdk/parachains/build-custom-pallet/){target=\_blank} tutorial
- Familiarity with [Rust testing frameworks](https://doc.rust-lang.org/book/ch11-01-writing-tests.html){target=\_blank}

## Set Up the Testing Environment

To effectively create the test environment for your pallet, you'll need to follow these steps:

1. Move to the project directory

    ```bash
    cd custom-pallet
    ```

2. Add the required dependencies to your test configuration in the `Cargo.toml` file of the pallet:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/cargo-dev-dependencies.toml'
    ```

3. Create a `mock.rs` and a `tests.rs` files (leave these files empty for now, they will be filled in later):

    ```bash
    touch src/mock.rs
    touch src/tests.rs
    ```

4. Include them in your `lib.rs` module:

    ```rust
    #[cfg(test)]
    mod mock;

    #[cfg(test)]
    mod tests;
    ```

## Implement Mocked Runtime

The following portion of code sets up a mock runtime (`Test`) to test the `custom-pallet` in an isolated environment. Using [`frame_support`](https://paritytech.github.io/polkadot-sdk/master/frame_support/index.html){target=\_blank} macros, it defines a minimal runtime configuration with traits such as `RuntimeCall` and `RuntimeEvent` to simulate runtime behavior. The mock runtime integrates the [`System pallet`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank}, which provides core functionality, and the custom pallet (`pallet_custom`) under specific indices. Copy and paste the following snippet of code into your `mock.rs` file:

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/mock.rs:1:29'
```

Once you have your mock runtime set up, you can customize it by implementing the configuration traits for the `System pallet` and your `custom-pallet`, along with additional constants and initial states for testing. Here's an example of how to extend the runtime configuration. Copy and paste the following snippet of code below the previous one you added to `mock.rs`:

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/mock.rs:30:52'
```

Explanation of the additions:

- **System pallet configuration** - implements the `frame_system::Config` trait for the mock runtime, setting up the basic system functionality and specifying the block type
- **Custom pallet configuration** - defines the `Config` trait for the `custom-pallet`, including a constant (`CounterMaxValue`) to set the maximum allowed counter value. In this case, that value is set to 10 for testing purposes
- **Test externalities initialization** - the `new_test_ext()` function initializes the mock runtime with default configurations, creating a controlled environment for testing

### Full Mocked Runtime

You can view the full `mock.rs` implementation for the mock runtime here:

???- "Complete `mock.rs`"

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/mock.rs'
    ```

## Implement Test Cases

Unit testing a pallet involves creating a comprehensive test suite that validates various scenarios. You ensure your pallet’s reliability, security, and expected behavior under different conditions by systematically testing successful operations, error handling, event emissions, state modifications, and access control.

As demonstrated in the previous tutorial, the pallet calls to be tested are as follows:

???- "Custom pallet calls"

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/pallet-calls.rs'
    ```

The following sub-sections outline various scenarios in which the `custom-pallet` can be tested. Feel free to add these snippets to your `tests.rs` while you read the examples.

### Successful Operations

Verify that the counter can be successfully incremented under normal conditions, ensuring the increment works and the correct event is emitted.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:42:60'
```

### Preventing Value Overflow

Test that the pallet prevents incrementing beyond the maximum allowed value, protecting against unintended state changes.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:61:75'
```

### Origin and Access Control

Confirm that sensitive operations like setting counter value are restricted to authorized origins, preventing unauthorized modifications.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:16:28'
```

### Edge Case Handling

Ensure the pallet gracefully handles edge cases, such as preventing increment operations that would cause overflow.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:76:90'
```

### Verifying State Changes

Test that pallet operations modify the internal state correctly and maintain expected storage values across different interactions.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:125:141'
```

### Full Test Suite

You can check the complete `tests.rs` implementation for the Custom pallet here:

???- "Complete `tests.rs`"

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs'
    ```


## Running Tests

Execute the test suite for your custom pallet using Cargo's test command. This will run all defined test cases and provide detailed output about the test results.

```bash
cargo test --package custom-pallet
```

After running the test suite, you should see the following output in your terminal:

--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/output.html'

## Where to Go Next

Expand your Polkadot SDK development skills by exploring the [`Pallet Benchmarking`](/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-benchmarking){target=\_blank} tutorial.
