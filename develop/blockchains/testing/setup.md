---
title: Testing Setup
description: Learn how to create a mock environment to test complete runtime functionalities in the Polkadot SDK, ensuring integration between pallets and system components.
---

# Testing Setup

## Introduction

Testing an entire runtime in the Polkadot SDK requires creating an environment miming the real blockchain system. While unit testing for individual pallets focuses on isolated functionality as described in [Pallet Testing](/develop/blockchains/custom-blockchains/pallet-testing/){target=\_blank}, runtime testing ensures that the pallets interact as expected when combined, providing a complete system simulation.

In Polkadot SDK development, testing is crucial to ensure your blockchain works as expected. While unit testing for individual pallets validates isolated functionality (as discussed in [Pallet Testing](/develop/blockchains/custom-blockchains/pallet-testing/){target=\_blank}), it’s equally important to test how these pallets function together within the runtime. This is where runtime testing comes into play, providing a complete simulation of the blockchain system.

This guide will help you set up an environment to test an entire runtime. This will enable you to assess how different pallets and system components interact, ensuring your blockchain behaves correctly under real-world conditions.


## Runtime Testing

In the context of Polkadot SDK, runtime testing involves creating a simulated environment that mimics real blockchain conditions. This type of testing goes beyond individual pallet validation, focusing on how multiple components integrate and collaborate across the system.

While unit tests provide confidence that individual pallets function correctly in isolation, runtime tests offer a holistic view. These tests validate pallets’ communication and interaction, ensuring a seamless and functional blockchain system. By running integration tests at the runtime level, you can catch issues that only arise when multiple pallets are combined, which is critical for building a stable and reliable blockchain.

### Mocking the Runtime

To thoroughly test a runtime, you'll need a mock environment that simulates the behavior of a live blockchain. This involves creating a module that replicates runtime execution, allowing you to evaluate how the system behaves before deploying to a live network.

The mock runtime includes all the necessary pallets and configurations needed for testing. To simplify the process, you can create a module that integrates all components, making it easier to assess how pallets and system elements interact.

Here’s a simple example of how to create a testing module that simulates these interactions:

```rust
pub mod integration_testing {
    use crate::*;
    // ...
}
```

!!! note
    This snippet `crate::*;`, which imports all the necessary components from your crate (including runtime configurations, pallet modules, and utility functions) into the `integration_testing` module. This allows you to write tests without manually importing each piece, making the code more concise and readable.

Once the testing module is set, the next step is configuring the genesis storage—the initial state of your blockchain. Genesis storage sets the starting conditions for the runtime, defining how pallets are configured before any blocks are produced.

In Polkadot SDK, we can create this storage using the [`BuildStorage`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/trait.BuildStorage.html){target=\_blank} trait from the [`sp_runtime`](https://paritytech.github.io/polkadot-sdk/master/sp_runtime){target=\_blank} crate. This trait is essential for building the configuration that initializes the blockchain's state.

The function `new_test_ext()` demonstrates setting up this environment. It uses `frame_system::GenesisConfig::<Runtime>::default()` to generate a default genesis configuration for the runtime, followed by `.build_storage()` to create the initial storage state. This storage is then converted into a format usable by the testing framework, [`sp_io::TestExternalities`](https://paritytech.github.io/polkadot-sdk/master/sp_io/type.TestExternalities.html){target=\_blank}, allowing tests to be executed in a simulated blockchain environment.

Here’s the code that sets up the mock runtime:

```rust
pub mod integration_testing {
    use crate::*;
    use sp_runtime::BuildStorage;

    pub fn new_test_ext() -> sp_io::TestExternalities {
        frame_system::GenesisConfig::<Runtime>::default()
            .build_storage()
            .unwrap()
            .into()
    }
}
```

## Where to Go Next

With the mock environment in place, you can now write tests to validate how your pallets interact within the runtime. This approach ensures that your blockchain behaves as expected when the entire runtime is assembled.

For more advanced information on runtime testing, please refer to the [`Runtime Testing`](develop/blockchains/testing/runtime/){target=\_blank} article.