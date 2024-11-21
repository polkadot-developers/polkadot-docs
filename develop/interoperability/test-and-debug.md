---
title: Testing and Debugging
description: TOOD
---

# Testing and Debugging

## Introduction

Cross-Consensus Messaging (XCM) is a core feature of the Polkadot ecosystem, enabling communication between parachains, relay chains, and system chains. To ensure the reliability of XCM-powered blockchains, thorough testing and debugging are essential before production deployment.

This article explores two indispensable tools for XCM testing, the [XCM Simulator](#xcm-simulator) and  the [XCM Emulator](#xcm-emulator), to help developers onboard and test their solutions effectively.

## XCM Simulator

Setting up a live network with multiple interconnected parachains for XCM testing can be complex and resource-intensive. To address this, the [`xcm-simulator`](https://github.com/paritytech/polkadot-sdk/tree/master/polkadot/xcm/xcm-simulator){target=\_blank} was developed. This versatile tool enables developers to test and experiment with XCM in a controlled, simulated network environment.

The `xcm-simulator` offers a fast and efficient way to test [`XCM instructions`](https://github.com/polkadot-fellows/xcm-format?tab=readme-ov-file#5-the-xcvm-instruction-set){target=\_blank} against the [`xcm-executor`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/index.html){target=\_blank}. It serves as an experimental playground for developers, supporting features such as:

- Mocking Downward Message Passing (DMP) - retrieve incoming XCMs from the relay chain using the `received_dmp` getter
- Rapid iteration - test XCM messages in isolation without relying on full network simulations

The `xcm-simulator` achieves this by utilizing mocked runtimes for both the relay chain and connected parachains, enabling developers to focus on message logic and configuration without needing a live network.

### How does it work?

The `xcm-simulator` provides the following macros for building a mocked simulation environment:

- [`decl_test_relay_chain`](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/xcm/xcm-simulator/src/lib.rs#L110C14-L110C35){target=\_blank} - implements upward message passing (UMP) for the specified relay chain struct. The struct must define the XCM configuration for the relay chain:

    ```rust
    decl_test_relay_chain! {
        pub struct Relay {
            Runtime = relay_chain::Runtime,
            XcmConfig = relay_chain::XcmConfig,
            new_ext = relay_ext(),
        }
    }
    ```

    The [`relay_ext()`](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/xcm/xcm-simulator/example/src/lib.rs#L117C1-L139C2){target=\_blank} sets up a test environment for the relay chain with predefined storage, then returns a [`TestExternalities`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_frame/testing_prelude/type.TestExternalities.html){target=\_blank} instance for further testing. 


- [`decl_test_parachain`](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/xcm/xcm-simulator/src/lib.rs#L180){target=\_blank} - Implements the [`XcmMessageHandlerT`](https://paritytech.github.io/polkadot-sdk/master/xcm_simulator/trait.XcmpMessageHandlerT.html){target=\_blank} and [`DmpMessageHandlerT`](https://paritytech.github.io/polkadot-sdk/master/xcm_simulator/trait.DmpMessageHandlerT.html){target=\_blank} traits for the specified parachain struct. Requires the parachain struct to include the `XcmpMessageHandler` and `DmpMessageHandler` pallets, which define the logic for processing messages (implemented through [`mock_message_queue`](https://paritytech.github.io/polkadot-sdk/master/xcm_simulator/mock_message_queue/index.html){target=\_blank}). The patter must be the following: 

    ```rust
    decl_test_parachain! {
        pub struct ParaA {
            Runtime = parachain::Runtime,
            XcmpMessageHandler = parachain::MsgQueue,
            DmpMessageHandler = parachain::MsgQueue,
            new_ext = para_ext(1),
        }
    }
    ```

    The [`para_ext(para_id: u32)`](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/xcm/xcm-simulator/example/src/lib.rs#L97C1-L115C2){target=\_blank} function initializes a test environment for a parachain with a specified `para_id`, sets the initial configuration of the parachain, returning a [`TestExternalities`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_frame/testing_prelude/type.TestExternalities.html){target=\_blank} instance for testing.

    !!!note
        Developers can take this idea and define as many parachains as they want, like `ParaA`, `ParaB`, `ParaC`, etc

- [`decl_test_network`](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/xcm/xcm-simulator/src/lib.rs#L292){target=\_blank} - defines a testing network consisting of a relay chain and multiple parachains. Takes a network struct as input and implements functionalities for testing, including [`ParachainXcmRouter`](https://paritytech.github.io/polkadot-sdk/master/xcm_simulator_example/struct.ParachainXcmRouter.html){target=\_blank} and [`RelayChainXcmRouter`](https://paritytech.github.io/polkadot-sdk/master/xcm_simulator_example/struct.RelayChainXcmRouter.html){target=\_blank}. The struct must specify the relay chain and an indexed list of parachains to be included in the network:

    ```rust
    decl_test_network! {
        pub struct ExampleNet {
            relay_chain = Relay,
            parachains = vec![
                (1, ParaA),
                (2, ParaB),
            ],
        }
    }
    ```

By leveraging these macros, developers can customize their testing networks by defining relay chains and parachains tailored to their needs.

For guidance on implementing a mock runtime for a Polkadot SDK-based chain, refer to the [`Pallet Testing`](/develop/blockchains/custom-blockchains/pallet-testing.md){target=\_blank} article. This framework enables thorough testing of runtime and cross-chain interactions.

For a complete example of how to use the `xcm-simulator`, explore the [`sample`](https://github.com/paritytech/polkadot-sdk/tree/master/polkadot/xcm/xcm-simulator/example){target=\_blank} provided in the `xcm-simulator` codebase.


## XCM Emulator

The [`xcm-emulator`](https://github.com/paritytech/polkadot-sdk/tree/master/cumulus/xcm/xcm-emulator){target=\_blank} is a tool designed to simulate the execution of XCM programs using predefined runtime configurations. These configurations include those utilized by live networks like Kusama, Polkadot, and the Asset Hub.

This tool enables testing of cross-chain message passing, providing a way to verify outcomes, weights, and side effects efficiently.

The `xcm-emulator` relies on transport layer pallets. However, the messages do not leverage the same messaging infrastructure as live networks since the transport mechanism is mocked. Additionally, consensus-related events are not covered, such as disputes, staking, and ImOnline events. Parachains should use end-to-end (E2E) tests to validate these events.

### Pros and Cons

The XCM Emulator provides both advantages and limitations when testing cross-chain communication in simulated environments.

- Pros:
    - Interactive debugging - offers tracing capabilities similar to EVM, enabling detailed analysis of issues
    - Runtime composability - facilitates testing and integration of multiple runtime components
    - Immediate feedback - supports Test-Driven Development (TDD) by providing rapid test results
    - Seamless integration testing - simplifies the process of testing new runtime versions in an isolated environment

- Cons:
    - Simplified emulation - always assumes message delivery, which may not mimic real-world network behavior
    - Dependency challenges - requires careful management of dependency versions and patching. Refer to the [Cargo dependency documentation](https://doc.rust-lang.org/cargo/reference/overriding-dependencies.html){target=\_blank}
    - Compilation overhead - testing environments can be resource-intensive, requiring frequent compilation updates









