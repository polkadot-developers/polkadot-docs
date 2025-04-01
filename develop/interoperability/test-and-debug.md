---
title: Testing and Debugging
description: Learn how to test and debug cross-chain communication via the XCM Emulator to ensure interoperability and reliable execution.
---

# Testing and Debugging

## Introduction

Cross-Consensus Messaging (XCM) is a core feature of the Polkadot ecosystem, enabling communication between parachains, relay chains, and system chains. To ensure the reliability of XCM-powered blockchains, thorough testing and debugging are essential before production deployment.

This guide covers the XCM Emulator, a tool designed to facilitate onboarding and testing for developers. Use the emulator if:

- A live runtime is not yet available
- Extensive configuration adjustments are needed, as emulated chains differ from live networks
- Rust-based tests are preferred for automation and integration

For scenarios where real blockchain state is required, [Chopsticks](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} allows testing with any client compatible with Polkadot SDK-based chains.

## XCM Emulator

Setting up a live network with multiple interconnected parachains for XCM testing can be complex and resource-intensive. 

The [`xcm-emulator`](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/xcm/xcm-emulator){target=\_blank} is a tool designed to simulate the execution of XCM programs using predefined runtime configurations. These configurations include those utilized by live networks like Kusama, Polkadot, and Asset Hub.

This tool enables testing of cross-chain message passing, providing a way to verify outcomes, weights, and side effects efficiently. It achieves this by utilizing mocked runtimes for both the relay chain and connected parachains, enabling developers to focus on message logic and configuration without needing a live network.

The `xcm-emulator` relies on transport layer pallets. However, the messages do not leverage the same messaging infrastructure as live networks since the transport mechanism is mocked. Additionally, consensus-related events are not covered, such as disputes and staking events. Parachains should use end-to-end (E2E) tests to validate these events.

### Advantages and Limitations

The XCM Emulator provides both advantages and limitations when testing cross-chain communication in simulated environments.

- **Advantages**:
    - **Interactive debugging** - offers tracing capabilities similar to EVM, enabling detailed analysis of issues
    - **Runtime composability** - facilitates testing and integration of multiple runtime components
    - **Immediate feedback** - supports Test-Driven Development (TDD) by providing rapid test results
    - **Seamless integration testing** - simplifies the process of testing new runtime versions in an isolated environment

- **Limitations**:
    - **Simplified emulation** - always assumes message delivery, which may not mimic real-world network behavior
    - **Dependency challenges** - requires careful management of dependency versions and patching. Refer to the [Cargo dependency documentation](https://doc.rust-lang.org/cargo/reference/overriding-dependencies.html){target=\_blank}
    - **Compilation overhead** - testing environments can be resource-intensive, requiring frequent compilation updates

### How Does It Work?

The `xcm-emulator` provides macros for defining a mocked testing environment. Check all the existing macros and functionality in the [XCM Emulator source code](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/xcm/xcm-emulator/src/lib.rs){target=\_blank}. The most important macros are:

- [**`decl_test_relay_chains`**](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/xcm/xcm-emulator/src/lib.rs#L355){target=\_blank} - defines runtime and configuration for the relay chains. Example:

    ```rust
    --8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/cumulus/parachains/integration-tests/emulated/chains/relays/westend/src/lib.rs:26:47'
    ```

- [**`decl_test_parachains`**](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/xcm/xcm-emulator/src/lib.rs#L590){target=\_blank} - defines runtime and configuration for the parachains. Example:

    ```rust
    --8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/cumulus/parachains/integration-tests/emulated/chains/parachains/assets/asset-hub-westend/src/lib.rs:32:55'
    ```

- [**`decl_test_bridges`**](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/xcm/xcm-emulator/src/lib.rs#L1178){target=\_blank} - creates bridges between chains, specifying the source, target, and message handler. Example:

    ```rust
    --8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/cumulus/parachains/integration-tests/emulated/networks/rococo-westend-system/src/lib.rs:63:74'
    ```

- [**`decl_test_networks`**](https://github.com/paritytech/polkadot-sdk/blob/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/xcm/xcm-emulator/src/lib.rs#L916){target=\_blank} - defines a testing network with relay chains, parachains, and bridges, implementing message transport and processing logic. Example:

    ```rust
    --8<-- 'https://raw.githubusercontent.com/paritytech/polkadot-sdk/refs/tags/polkadot-stable2412/cumulus/parachains/integration-tests/emulated/networks/westend-system/src/lib.rs:38:52'
    ```

By leveraging these macros, developers can customize their testing networks by defining relay chains and parachains tailored to their needs. For guidance on implementing a mock runtime for a Polkadot SDK-based chain, refer to the [Pallet Testing](/develop/parachains/testing/pallet-testing/){target=\_blank} article. 

This framework enables thorough testing of runtime and cross-chain interactions, enabling developers to effectively design, test, and optimize cross-chain functionality.

To see a complete example of implementing and executing tests, refer to the [integration tests](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/cumulus/parachains/integration-tests/emulated){target=\_blank} in the Polkadot SDK repository.