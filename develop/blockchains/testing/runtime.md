---
title: Runtime
description: Explore runtime testing in Polkadot SDK to verify how multiple pallets interact, ensuring smooth functionality within the blockchain environment.
---

# Runtime Testing

## Introduction

In the Polkadot SDK, it’s important to test individual pallets in isolation and how they interact within the runtime. Once unit tests for specific pallets are complete, the next step is integration testing to verify that multiple pallets work together correctly within the blockchain system. This ensures that the entire runtime functions as expected under real-world conditions.

This article extends the [Testing Setup](/develop/blockchains/testing/setup){target=\_blank} guide by illustrating how to test interactions between different pallets within the same runtime.

## Testing Pallets Interactions

Once the test environment is ready, tests can be written to simulate interactions between multiple pallets in the runtime. Below is an example of how to test the interaction between two generic pallets, referred to here as `pallet_a` and `pallet_b`. For the coherence of this article, the pallets are assumed to be coupled in the sense that `pallet_b` depends on `pallet_a`. The configuration of `pallet_b` is the following:

```rust
--8<-- "code/develop/blockchains/testing/runtime/pallet-coupling.rs"
```

And also, the `pallet_b` exposes a call that interacts with `pallet_a`:

```rust
--8<-- "code/develop/blockchains/testing/runtime/pallet-b-call.rs"
```

In this first test, a call to `pallet_a` is simulated, and the internal state is checked to ensure it updates correctly. The block number is also checked to ensure it advances as expected.

```rust
--8<-- "code/develop/blockchains/testing/runtime/pallet-a-integration-test.rs"
```

Next, a test can be written to verify the interaction between `pallet_a` and `pallet_b`:

```rust
--8<-- "code/develop/blockchains/testing/runtime/pallet-b-integration-test.rs"
```

This test demonstrates how `pallet_b` can trigger a change in `pallet_a`'s state, verifying that the pallets interact properly within the runtime.

For more information about testing more specific elements like storage, errors, and events, see the [Pallet Testing](/develop/blockchains/custom-blockchains/pallet-testing/){target=\_blank} article.

??? "Integration Test - Complete Code"
    The complete code for the integration test is shown below: 

    ```rust
    --8<-- "code/develop/blockchains/testing/runtime/full-integration-test.rs"
    ```

## Verifying Pallet Interactions

The tests confirm that:

- Pallets initialize correctly - at the start of each test, the system should initialize with block number 0, and the pallets should be in their default states

- Pallets modify each other's state - the second test shows how one pallet can trigger changes in another pallet’s internal state, confirming proper cross-pallet interactions

- State transitions between blocks are seamless - by simulating block transitions, the tests validate that the runtime responds correctly to changes in the block number

## Conclusion

Testing pallet interactions within the runtime is critical for ensuring that the blockchain behaves as expected under real-world conditions. Writing integration tests allows validation of how pallets function together, preventing issues that might arise when the system is fully assembled.

This approach provides a comprehensive view of the runtime's functionality, ensuring that the blockchain is stable and reliable.