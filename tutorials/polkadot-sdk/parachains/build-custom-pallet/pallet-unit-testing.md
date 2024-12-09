---
title: Pallet Unit Testing
description: Discover how to create thorough unit tests for pallets built with the Polkadot SDK, using a custom pallet as a practical example.
---

# Pallet Unit Testing

## Introduction

You have learned how to create a custom pallet in the [Build the Pallet](/tutorials/polkadot-sdk/parachains/build-custom-pallet/){target=\_blank} tutorial; now you will see how to test the pallet to ensure that it works as expected. As stated in the [Pallet Testing](/develop/parachains/customize-parachain/pallet-testing/){target=\_blank} article, unit testing is crucial for ensuring the reliability and correctness of pallets in Polkadot SDK-based blockchains. Comprehensive testing helps validate pallet functionality, prevent potential bugs, and maintain the integrity of your blockchain logic.

This tutorial will guide you through creating a unit testing suite for a custom pallet built in the previous tutorial, covering essential testing aspects and steps.

## Prerequisites

To set up your testing environment for Polkadot SDK pallets, you'll need:

- Rust installation
- Basic understanding of Substrate/Polkadot SDK concepts
- A custom pallet implementation, check the [Build the Pallet](/tutorials/polkadot-sdk/parachains/build-custom-pallet/){target=\_blank} tutorial
- Familiarity with [Rust testing frameworks](https://doc.rust-lang.org/book/ch11-01-writing-tests.html){target=\_blank}

## Set Up the Testing Environment

### Create Test Configuration Files

To effectively create the test environment for your pallet, you'll need to follow these steps:

1. Add the required dependencies to your test configuration in the `Cargo.toml` file of the pallet:

    ```toml
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/Cargo-dev-dependencies.toml'
    ```

2. Create a `mock.rs` and a `tests.rs` files (leave these files empty for now, they will be filled in later):

    ```bash
    touch mock.rs
    touch tests.rs
    ```

3. Include them in your `lib.rs` module:

    ```rust
    #[cfg(test)]
    mod mock;

    #[cfg(test)]
    mod tests;
    ```

## Implement Mocked Runtime

Mocking the runtime creates an isolated testing environment for your Polkadot SDK pallet. This lightweight runtime simulation allows you to test pallet functionality in a controlled setting with custom parameters and configuration. To do so, you can add the following to your `mock.rs` file:

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/mock.rs'
```

!!! note
    The code snippet above defines a mock runtime (`Test`) with essential configurations and includes and configures the `CustomPallet` for isolated test execution. It sets the `CounterMaxValue` constant to 10, defining the maximum allowed value for the counter in tests. The `new_test_ext()` function initializes a mock runtime environment with a default genesis configuration, enabling isolated and reproducible testing for the pallet.


## Implement Test Cases

Unit testing a pallet involves creating a comprehensive test suite that validates various scenarios. You ensure your pallet’s reliability, security, and expected behavior under different conditions by systematically testing successful operations, error handling, event emissions, state modifications, and access control.

The following sub-sections will show scenarios where the `custom-pallet` can be tested. Feel free to add these snippets to your `tests.rs` while you read the examples.

### Successful Operations

Verify that the counter can be successfully incremented under normal conditions, ensuring the increment works and the correct event is emitted.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:38:54'
```

### Preventing Value Overflow

Test that the pallet prevents incrementing beyond the maximum allowed value, protecting against unintended state changes.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:56:68'
```

### Origin and Access Control

Confirm that sensitive operations like setting counter value are restricted to authorized origins, preventing unauthorized modifications.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:15:26'
```

### Edge Case Handling

Ensure the pallet gracefully handles edge cases, such as preventing increment operations that would cause overflow.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:70:83'
```

### Verifying State Changes

Test that pallet operations modify the internal state correctly and maintain expected storage values across different interactions.

```rust
--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs:114:129'
```

You can check the complete `tests.rs` implementation for the `custom pallet` here:

???+ "Complete `tests.rs` Code"

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/tests.rs'
    ```


## Running Tests

Execute the test suite for your custom pallet using Cargo's test command. This will run all defined test cases and provide detailed output about the test results.

```bash
cargo test -p custom-pallet
```

After running the test suite, you should see the following output in your terminal:

--8<-- 'code/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-unit-testing/output.html'

## Where to Go Next

Expand your Polkadot SDK development skills by exploring the [`Pallet Benchmarking`](/tutorials/polkadot-sdk/parachains/build-custom-pallet/pallet-benchmarking){target=\_blank} tutorial.
