---
title: Pallet Testing
description: Learn how to efficiently test pallets in the Polkadot SDK, ensuring the reliability and security of your pallets operations.
---

# Pallet Testing

## Introduction

Unit testing in the Polkadot SDK helps ensure that the functions provided by a pallet behave as expected. It also confirms that data and events associated with a pallet are processed correctly during interactions. The Polkadot SDK offers a set of APIs to create a test environment that can simulate runtime and mock transaction execution for both extrinsic and queries.

This guide will explore how to mock a runtime and test a pallet. For that, the Polkadot SDK pallets use the `mock.rs` and `test.rs` files as a basis for testing pallet processes. The `mock.rs` file allows the mock runtime to be tested, and the `test.rs` file allows writing unit test functions to check the functionality of isolated pieces of code within the pallet.

## Mocking the Runtime

To test a pallet, a mock runtime is created to simulate the behavior of the blockchain environment where the pallet will be included. This involves defining a minimal runtime configuration that only provides for the required dependencies for the tested pallet. 

For a complete example of a mocked runtime, check out the `mock.rs` file in the [Solochain Template](https://github.com/paritytech/polkadot-sdk/blob/master/templates/solochain/pallets/template/src/mock.rs){target=\_blank}.

A `mock.rs` file defines the mock runtime in a typical Polkadot SDK project. It includes the elements described below.


### Runtime Composition

This section describes the pallets included for the mocked runtime. For example, the following code snippet shows how to build a mocked runtime called `Test` that consists of the `frame_system` pallet and the `pallet_template`:

```rust
--8<-- 'code/develop/blockchains/custom-blockchains/pallet-testing/runtime-composition.rs'
```

###  Pallets Configurations

This section outlines the types linked to each pallet in the mocked runtime. For testing, many of these types are simple or primitive, replacing more complex, abstract types to streamline the process.

```rust
--8<-- 'code/develop/blockchains/custom-blockchains/pallet-testing/pallets-configurations.rs'
```

The configuration should be set for each pallet existing in the mocked runtime.

!!! note
    The simplification of types is for simplifying the testing process. For example, `AccountId` is `u64`, meaning a valid account address can be an unsigned integer:

    ```rust
    let alice_account: u64 = 1;
    ```

### Genesis Config Initialization

To initialize the genesis storage according to the mocked runtime, the following function can be used:

```rust
--8<-- 'code/develop/blockchains/custom-blockchains/pallet-testing/genesis-config-initialization.rs'
```

## Pallet Unit Testing

Once the mock runtime is in place, the next step is to write unit tests that evaluate the functionality of your pallet. Unit tests allow you to test specific pallet features in isolation, ensuring that each function behaves correctly under various conditions. These tests typically reside in your pallet’s module’s `test.rs` file.

### Writing Unit Tests

Unit tests in the Polkadot SDK use the Rust testing framework, and the mock runtime you’ve defined earlier will serve as the test environment. Below are the typical steps involved in writing unit tests for a pallet.

#### Test Initialization

Each test starts by initializing the runtime environment, typically using the `new_test_ext()` function, which sets up the mock storage and environment.

```rust
--8<-- 'code/develop/blockchains/custom-blockchains/pallet-testing/test-initialization.rs'
```

#### Function Call Testing

Call the pallet’s extrinsics or functions to simulate user interaction or internal logic. Use the `assert_ok!` macro to check for successful execution and `assert_err!` to verify that errors are handled properly.

```rust
--8<-- 'code/develop/blockchains/custom-blockchains/pallet-testing/function-call-testing.rs'
```

#### Storage Testing

After calling a function or extrinsic in your pallet, it's important to verify that the state changes in the pallet's storage match the expected behavior. This ensures that data is updated correctly based on the actions taken.

The following example shows how to test the storage behavior before and after the function call:

```rust
--8<-- 'code/develop/blockchains/custom-blockchains/pallet-testing/storage-testing.rs'
```

#### Event Testing

It’s also crucial to test the events that your pallet emits during execution. By default, events generated in a pallet using the [`#generate_deposit`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.generate_deposit.html){target=\_blank} macro are stored under the system's event storage key (system/events) as [`EventRecord`](https://paritytech.github.io/polkadot-sdk/master/frame_system/struct.EventRecord.html){target=\_blank} entries. These can be accessed using [`System::events()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.events){target=\_blank} or verified with specific helper methods provided by the system pallet, such as [`assert_has_event`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.assert_has_event){target=\_blank} and [`assert_last_event`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.assert_last_event){target=\_blank}.

Here’s an example of testing events in a mock runtime:

```rust
--8<-- 'code/develop/blockchains/custom-blockchains/pallet-testing/event-testing.rs'
```

Some key considerations are:

- **Block number** - events are not emitted on the genesis block, so you need to set the block number using [`System::set_block_number()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.set_block_number){target=\_blank} to ensure events are triggered
- **Converting events** - use `.into()` when instantiating your pallet’s event to convert it into a generic event type, as required by the system’s event storage

## Where to Go Next

- Dive into the full implementation of the [`mock.rs`](https://github.com/paritytech/polkadot-sdk/blob/master/templates/solochain/pallets/template/src/mock.rs){target=\_blank} and [`test.rs`](https://github.com/paritytech/polkadot-sdk/blob/master/templates/solochain/pallets/template/src/tests.rs){target=\_blank} files in the [Solochain Template](https://github.com/paritytech/polkadot-sdk/tree/master/templates/solochain){target=_blank}
- To evaluate the resource usage of your pallet operations, refer to the [Benchmarking documentation](/develop/blockchains/custom-blockchains/benchmarking/){target=\_blank} for guidance on measuring efficiency