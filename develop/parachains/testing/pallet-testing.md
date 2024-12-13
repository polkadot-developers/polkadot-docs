---
title: Pallet Testing
description: Learn how to efficiently test pallets in the Polkadot SDK, ensuring the reliability and security of your pallets operations.
---

# Pallet Testing

## Introduction

Unit testing in the Polkadot SDK helps ensure that the functions provided by a pallet behave as expected. It also confirms that data and events associated with a pallet are processed correctly during interactions. The Polkadot SDK offers a set of APIs to create a test environment to simulate runtime and mock transaction execution for extrinsics and queries.

To begin unit testing, you must first set up a mock runtime that simulates blockchain behavior, incorporating the necessary pallets. For a deeper understanding, consult the [Mock Runtime](/develop/parachains/testing/mock-runtime/){target=\_blank} guide.

## Writing Unit Tests

Once the mock runtime is in place, the next step is to write unit tests that evaluate the functionality of your pallet. Unit tests allow you to test specific pallet features in isolation, ensuring that each function behaves correctly under various conditions. These tests typically reside in your pallet module's `test.rs` file.

Unit tests in the Polkadot SDK use the Rust testing framework, and the mock runtime you've defined earlier will serve as the test environment. Below are the typical steps involved in writing unit tests for a pallet.

The tests confirm that:

- **Pallets initialize correctly** - at the start of each test, the system should initialize with block number 0, and the pallets should be in their default states
- **Pallets modify each other's state** - the second test shows how one pallet can trigger changes in another pallet's internal state, confirming proper cross-pallet interactions
- **State transitions between blocks are seamless** - by simulating block transitions, the tests validate that the runtime responds correctly to changes in the block number

Testing pallet interactions within the runtime is critical for ensuring the blockchain behaves as expected under real-world conditions. Writing integration tests allows validation of how pallets function together, preventing issues that might arise when the system is fully assembled.

This approach provides a comprehensive view of the runtime's functionality, ensuring the blockchain is stable and reliable.

### Test Initialization

Each test starts by initializing the runtime environment, typically using the `new_test_ext()` function, which sets up the mock storage and environment.

```rust
--8<-- 'code/develop/parachains/testing/pallet-testing/test-initialization.rs'
```

### Function Call Testing

Call the pallet's extrinsics or functions to simulate user interaction or internal logic. Use the `assert_ok!` macro to check for successful execution and `assert_err!` to verify that errors are correctly handled.

```rust
--8<-- 'code/develop/parachains/testing/pallet-testing/function-call-testing.rs'
```

### Storage Testing

After calling a function or extrinsic in your pallet, it's essential to verify that the state changes in the pallet's storage match the expected behavior to ensure data is updated correctly based on the actions taken.

The following example shows how to test the storage behavior before and after the function call:

```rust
--8<-- 'code/develop/parachains/testing/pallet-testing/storage-testing.rs'
```

### Event Testing

It's also crucial to test the events that your pallet emits during execution. By default, events generated in a pallet using the [`#generate_deposit`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.generate_deposit.html){target=\_blank} macro are stored under the system's event storage key (system/events) as [`EventRecord`](https://paritytech.github.io/polkadot-sdk/master/frame_system/struct.EventRecord.html){target=\_blank} entries. These can be accessed using [`System::events()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.events){target=\_blank} or verified with specific helper methods provided by the system pallet, such as [`assert_has_event`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.assert_has_event){target=\_blank} and [`assert_last_event`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.assert_last_event){target=\_blank}.

Here's an example of testing events in a mock runtime:

```rust
--8<-- 'code/develop/parachains/testing/pallet-testing/event-testing.rs'
```

Some key considerations are:

- **Block number** - events are not emitted on the genesis block, so you need to set the block number using [`System::set_block_number()`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.set_block_number){target=\_blank} to ensure events are triggered
- **Converting events** - use `.into()` when instantiating your pallet's event to convert it into a generic event type, as required by the system's event storage

## Where to Go Next

- Dive into the full implementation of the [`mock.rs`](https://github.com/paritytech/polkadot-sdk/blob/master/templates/solochain/pallets/template/src/mock.rs){target=\_blank} and [`test.rs`](https://github.com/paritytech/polkadot-sdk/blob/master/templates/solochain/pallets/template/src/tests.rs){target=\_blank} files in the [Solochain Template](https://github.com/paritytech/polkadot-sdk/tree/master/templates/solochain){target=_blank}

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Benchmarking__

    ---

    Explore methods to measure the performance and execution cost of your pallet.

    [:octicons-arrow-right-24: Reference](/develop/parachains/testing/benchmarking)

</div>