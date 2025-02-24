---
title: Pallet Unit Testing
description: Discover how to create thorough unit tests for pallets built with the Polkadot SDK, using a custom pallet as a practical example.
---

# Pallet Unit Testing

## Introduction

You have learned how to create a new pallet in the [Build a Custom Pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} tutorial; now you will see how to test the pallet to ensure that it works as expected. As stated in the [Pallet Testing](/develop/parachains/testing/pallet-testing/){target=\_blank} article, unit testing is crucial for ensuring the reliability and correctness of pallets in Polkadot SDK-based blockchains. Comprehensive testing helps validate pallet functionality, prevent potential bugs, and maintain the integrity of your blockchain logic.

This tutorial will guide you through creating a unit testing suite for a custom pallet created in the [Build a Custom Pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} tutorial, covering essential testing aspects and steps.

## Prerequisites

To set up your testing environment for Polkadot SDK pallets, you'll need:

- [Polkadot SDK dependencies](/develop/parachains/install-polkadot-sdk/){target=\_blank} installed
- Basic understanding of Substrate/Polkadot SDK concepts
- A custom pallet implementation, check the [Build a Custom Pallet](/tutorials/polkadot-sdk/parachains/zero-to-hero/build-custom-pallet/){target=\_blank} tutorial
- Familiarity with [Rust testing frameworks](https://doc.rust-lang.org/book/ch11-01-writing-tests.html){target=\_blank}

## Set Up the Testing Environment

To effectively create the test environment for your pallet, you'll need to follow these steps:

1. Move to the project directory

    ```bash
    cd custom-pallet
    ```

2. Add the required dependencies to your test configuration in the `Cargo.toml` file of the pallet:

    ```toml title="Cargo.toml"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:10:10'
    ...

    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/Cargo.toml:17:22'
    ...
    ```

3. Create a `mock.rs` and a `tests.rs` files (leave these files empty for now, they will be filled in later):

    ```bash
    touch src/mock.rs
    touch src/tests.rs
    ```

4. Include them in your `lib.rs` module:

    ```rust hl_lines="5-9" title="lib.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:20:28'
    ```

## Implement Mocked Runtime

The following portion of code sets up a mock runtime (`Test`) to test the `custom-pallet` in an isolated environment. Using [`frame_support`](https://paritytech.github.io/polkadot-sdk/master/frame_support/index.html){target=\_blank} macros, it defines a minimal runtime configuration with traits such as `RuntimeCall` and `RuntimeEvent` to simulate runtime behavior. The mock runtime integrates the [`System pallet`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank}, which provides core functionality, and the `custom pallet` under specific indices. Copy and paste the following snippet of code into your `mock.rs` file:

```rust title="mock.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/mock.rs:20:47'
```

Once you have your mock runtime set up, you can customize it by implementing the configuration traits for the `System pallet` and your `custom-pallet`, along with additional constants and initial states for testing. Here's an example of how to extend the runtime configuration. Copy and paste the following snippet of code below the previous one you added to `mock.rs`:

```rust title="mock.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/mock.rs:49:62'
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/mock.rs:64'
```

Explanation of the additions:

- **System pallet configuration** - implements the `frame_system::Config` trait for the mock runtime, setting up the basic system functionality and specifying the block type
- **Custom pallet configuration** - defines the `Config` trait for the `custom-pallet`, including a constant (`CounterMaxValue`) to set the maximum allowed counter value. In this case, that value is set to 10 for testing purposes
- **Test externalities initialization** - the `new_test_ext()` function initializes the mock runtime with default configurations, creating a controlled environment for testing

### Full Mocked Runtime

Expand the following item to see the complete `mock.rs` implementation for the mock runtime.

???-code "mock.rs"

    ```rust title="mock.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/mock.rs:20:62'
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/mock.rs:64'
    ```

## Implement Test Cases

Unit testing a pallet involves creating a comprehensive test suite that validates various scenarios. You ensure your pallet’s reliability, security, and expected behavior under different conditions by systematically testing successful operations, error handling, event emissions, state modifications, and access control.

Expand the following item to see the pallet calls to be tested.

???-code "Custom pallet calls"

    ```rust
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:107:116'
        #[pallet::weight(0)]
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:118:142'
        #[pallet::weight(0)]
        --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:144:186'
        #[pallet::weight(0)]
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/lib.rs:188:217'
    ```

The following sub-sections outline various scenarios in which the `custom-pallet` can be tested. Feel free to add these snippets to your `tests.rs` while you read the examples.

### Successful Operations

Verify that the counter can be successfully incremented under normal conditions, ensuring the increment works and the correct event is emitted.

```rust title="tests.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/tests.rs:61:81'
```

### Preventing Value Overflow

Test that the pallet prevents incrementing beyond the maximum allowed value, protecting against unintended state changes.

```rust title="tests.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/tests.rs:83:96'
```

### Origin and Access Control

Confirm that sensitive operations like setting counter value are restricted to authorized origins, preventing unauthorized modifications.

```rust title="tests.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/tests.rs:35:46'
```

### Edge Case Handling

Ensure the pallet gracefully handles edge cases, such as preventing increment operations that would cause overflow.

```rust title="tests.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/tests.rs:98:110'
```

### Verify State Changes

Test that pallet operations modify the internal state correctly and maintain expected storage values across different interactions.

```rust title="tests.rs"
--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/tests.rs:149:164'
```

### Full Test Suite

Expand the following item to see the complete `tests.rs` implementation for the custom pallet.

???-code "tests.rs"

    ```rust title="tests.rs"
    --8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallets/custom-pallet/src/tests.rs:20'
    ```

## Run the Tests

Execute the test suite for your custom pallet using Cargo's test command. This will run all defined test cases and provide detailed output about the test results.

```bash
cargo test --package custom-pallet
```

After running the test suite, you should see the following output in your terminal:

--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/pallet-unit-testing/unit-testing-output.html'

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Add Pallets to the Runtime__

    ---

    Enhance your runtime with custom functionality! Learn how to add, configure, and integrate pallets in Polkadot SDK-based blockchains.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/)

</div>