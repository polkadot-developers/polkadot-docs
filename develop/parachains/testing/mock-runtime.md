---
title: Mock Runtime for Pallet Testing
description: Learn to create a mock environment in the Polkadot SDK for testing intra-pallet functionality and inter-pallet interactions seamlessly.
---

# Mock Runtime

## Introduction

Testing is essential in Polkadot SDK development to ensure your blockchain operates as intended and effectively handles various potential scenarios. This guide walks you through setting up an environment to test pallets within the [runtime](/polkadot-protocol/glossary#runtime){target=_blank}, allowing you to evaluate how different pallets, their configurations, and system components interact to ensure reliable blockchain functionality.

## Configuring a Mock Runtime

### Testing Module

The mock runtime includes all the necessary pallets and configurations needed for testing. To ensure proper testing, you must create a module that integrates all components, enabling assessment of interactions between pallets and system elements.


Here's a simple example of how to create a testing module that simulates these interactions:

```rust
--8<-- 'code/develop/parachains/testing/mock-runtime/integration-testing-module.rs'
```

The `crate::*;` snippet imports all the components from your crate (including runtime configurations, pallet modules, and utility functions) into the `tests` module. This allows you to write tests without manually importing each piece, making the code more concise and readable. You can opt to instead create a separate `mock.rs` file to define the configuration for your mock runtime and a companion `tests.rs` file to house the specific logic for each test.

Once the testing module is configured, you can craft your mock runtime using the [`frame_support::runtime`](https://paritytech.github.io/polkadot-sdk/master/frame_support/attr.runtime.html){target=\_blank} macro. This macro allows you to define a runtime environment that will be created for testing purposes:

```rust
--8<-- 'code/develop/parachains/testing/mock-runtime/mock-runtime.rs'
```
### Genesis Storage

The next step is configuring the genesis storage—the initial state of your runtime. Genesis storage sets the starting conditions for the runtime, defining how pallets are configured before any blocks are produced. You can only customize the initial state only of those items that implement the [`[pallet::genesis_config]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.genesis_config.html){target=\_blank} and [`[pallet::genesis_build]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/pallet_macros/attr.genesis_build.html){target=\_blank} macros within their respective pallets.

In Polkadot SDK, you can create this storage using the [`BuildStorage`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/trait.BuildStorage.html){target=\_blank} trait from the [`sp_runtime`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime){target=\_blank} crate. This trait is essential for building the configuration that initializes the blockchain's state. 

The function `new_test_ext()` demonstrates setting up this environment. It uses `frame_system::GenesisConfig::<Test>::default()` to generate a default genesis configuration for the runtime, followed by `.build_storage()` to create the initial storage state. This storage is then converted into a format usable by the testing framework, [`sp_io::TestExternalities`](https://paritytech.github.io/polkadot-sdk/master/sp_io/type.TestExternalities.html){target=\_blank}, allowing tests to be executed in a simulated blockchain environment.

Here's the code that sets the genesis storage configuration:

```rust
--8<-- 'code/develop/parachains/testing/mock-runtime/genesis-config.rs'
```

You can also customize the genesis storage to set initial values for your runtime pallets. For example, you can set the initial balance for accounts like this:

```rust
--8<-- 'code/develop/parachains/testing/mock-runtime/genesis-config-custom.rs'
```

For a more idiomatic approach, see the [Your First Pallet](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/guides/your_first_pallet/index.html#better-test-setup){target=\_blank} guide from the Polkadot SDK Rust documentation.

### Pallet Configuration

Each pallet in the mocked runtime requires an associated configuration, specifying the types and values it depends on to function. These configurations often use basic or primitive types (e.g., u32, bool) instead of more complex types like structs or traits, ensuring the setup remains straightforward and manageable.

```rust
--8<-- 'code/develop/parachains/testing/mock-runtime/pallets-configurations.rs'
```

The configuration should be set for each pallet existing in the mocked runtime. The simplification of types is for simplifying the testing process. For example, `AccountId` is `u64`, meaning a valid account address can be an unsigned integer:

```rust
let alice_account: u64 = 1;
```

## Where to Go Next

With the mock environment in place, developers can now test and explore how pallets interact and ensure they work seamlessly together. For further details about mocking runtimes, see the following [Polkadot SDK docs guide](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/guides/your_first_pallet/index.html#your-first-test-runtime){target=\_blank}.

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Pallet Testing__

    ---

    Learn how to efficiently test pallets in the Polkadot SDK, ensuring your pallet operations are reliable and secure.

    [:octicons-arrow-right-24: Reference](/develop/parachains/testing/pallet-testing/)

</div>