---
title: Add an Existing Pallet to the Runtime
description: Learn how to include and configure pallets in a Polkadot SDK-based runtime, from adding dependencies to implementing necessary traits.
tutorial_badge: Intermediate
categories: Parachains
---

# Add an Existing Pallet to the Runtime

## Introduction

The [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank} provides a functional runtime that includes default [FRAME](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html){target=\_blank} development modules ([pallets](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/pallet/index.html){target=\_blank}) to help you get started building a custom parachain. However, you'll often need to extend your runtime by adding additional pallets to enable new functionality.

Each pallet has specific configuration requirements, such as the parameters and types needed to enable the pallet's functionality. This guide walks you through the complete process of adding an existing pallet to your runtime and configuring it properly using `pallet-utility` as a practical example.

The utility pallet provides batch transaction capabilities, allowing multiple calls to be dispatched together, and origin manipulation functionality for advanced use cases.

In this guide, you'll learn how to:

- Update runtime dependencies to integrate a new pallet
- Configure pallet-specific Rust traits to enable the pallet's functionality
- Run your parachain locally to test the new pallet

## Check Prerequisites

Before you begin, ensure you have:

- A working [Polkadot SDK development environment](/parachains/launch-a-parachain/choose-a-template){target=\_blank}

## Add an Existing Polkadot SDK Pallet to Your Runtime

Adding a pallet to your parachain runtime involves configuring dependencies, implementing the pallet's configuration trait, and registering the pallet in the runtime construct.

### Step 1: Add an Existing Pallet as a Dependency

The Polkadot SDK uses a monorepo structure where many pallets are available as features of the `polkadot-sdk` dependency. For [`pallet-utility`](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/utility){target=\_blank}, you need to add it as a feature.

!!! note
    Existing Polkadot SDK pallets can be found in the [substrate/frame directory](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame){target=\_blank} of the Polkadot SDK repository.

To add the pallet as a dependency:

1. Open the `runtime/Cargo.toml` file.
2. Locate the `[dependencies]` section.
3. Find the `polkadot-sdk` dependency.
4. Add `pallet-utility` to the features array:

    ```toml
    polkadot-sdk = { workspace = true, features = [
        "pallet-utility",
        "cumulus-pallet-aura-ext",
        "cumulus-pallet-session-benchmarking",
        # ... other features
    ], default-features = false }
    ```

!!! note
    If you're adding a custom pallet that isn't part of the Polkadot SDK, you would add it as a separate dependency:

    ```toml
    custom-pallet = { path = "../pallets/custom-pallet", default-features = false }
    ```

    And ensure it's included in the workspace members in the root `Cargo.toml` file.

### Step 2: Enable Standard Library Features

The Polkadot SDK runtime compiles to both a native binary (for running unit tests), which includes standard Rust library functions, and a WebAssembly (Wasm) binary (a more compact size for production use), which does not include the standard library. Since `pallet-utility` is part of the `polkadot-sdk` dependency, its `std` feature is already included when you enable `polkadot-sdk/std`.

To verify the standard library features are enabled:

1. In the `runtime/Cargo.toml` file, locate the `[features]` section.
2. Ensure `polkadot-sdk/std` is included in the `std` array:

    ```toml
    [features]
    default = ["std"]
    std = [
        "codec/std",
        "cumulus-pallet-parachain-system/std",
        "log/std",
        "polkadot-sdk/std",
        "scale-info/std",
        # ... other features
    ]
    ```

!!! note
    If you're adding a custom pallet, you must explicitly add its `std` feature:

    ```toml
    std = [
        # ... other features
        "custom-pallet/std",
    ]
    ```

### Step 3: Review the Config Trait

Every pallet defines a Rust trait called `Config` that specifies the types and parameters needed for the pallet to function within a runtime. Before implementing the configuration, you should understand what the pallet requires.

The `pallet-utility` Config trait requires the following types:

```rust
pub trait Config: frame_system::Config {
    /// The overarching event type
    type RuntimeEvent: From<Event<Self>> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    /// The overarching call type
    type RuntimeCall: Parameter 
        + Dispatchable<RuntimeOrigin = Self::RuntimeOrigin>
        + GetDispatchInfo
        + From<frame_system::Call<Self>>;

    /// The caller origin, overarching type of all pallets origins
    type PalletsOrigin: Parameter + Into<<Self as frame_system::Config>::RuntimeOrigin>;

    /// Weight information for extrinsics in this pallet
    type WeightInfo: WeightInfo;
}
```

This configuration requires:

- **RuntimeEvent** - links the pallet's events to the runtime's event system.
- **RuntimeCall** - allows the utility pallet to dispatch calls from other pallets, which is needed for batch operations.
- **PalletsOrigin** - enables origin manipulation for dispatching calls as other pallets.
- **WeightInfo** - provides weight calculations for the pallet's operations.

!!! tip
    You can find a pallet's `Config` trait requirements by checking the pallet's Rust documentation on [docs.rs](https://docs.rs){target=\_blank}, reviewing the pallet's source code in its repository, or looking at example implementations in template runtimes.

### Step 4: Implement the Config Trait

Now you'll implement the pallet's `Config` trait in your runtime to provide the concrete types the pallet needs.

To implement the Config trait:

1. Open the `runtime/src/configs/mod.rs` file.
2. Add the following implementation at the end of the file:

    ```rust
    /// Configure the utility pallet
    impl pallet_utility::Config for Runtime {
        type RuntimeEvent = RuntimeEvent;
        type RuntimeCall = RuntimeCall;
        type PalletsOrigin = OriginCaller;
        type WeightInfo = pallet_utility::weights::SubstrateWeight<Runtime>;
    }
    ```

This configuration specifies:

- **RuntimeEvent** - uses the runtime's aggregated event type, which includes events from all pallets.
- **RuntimeCall** - uses the runtime's aggregated call type, allowing utility to dispatch calls from any pallet.
- **PalletsOrigin** - uses `OriginCaller`, which is generated by the runtime macro and represents origins from all pallets.
- **WeightInfo** - uses the provided weight implementation from the pallet itself.

### Step 5: Add to Runtime Construct

The final step is to register the pallet in the runtime construct using the `#[frame_support::runtime]` macro. This macro generates the necessary boilerplate code for including pallets in the runtime.

To add the pallet to the runtime construct:

1. Open the `runtime/src/lib.rs` file.
2. Locate the `#[frame_support::runtime]` section (usually near the end of the file).
3. Add your pallet with a unique `pallet_index`:

    ```rust
    #[frame_support::runtime]
    mod runtime {
        #[runtime::runtime]
        #[runtime::derive(
            RuntimeCall,
            RuntimeEvent,
            RuntimeError,
            RuntimeOrigin,
            RuntimeTask,
            RuntimeFreezeReason,
            RuntimeHoldReason,
            RuntimeSlashReason,
            RuntimeLockId,
            RuntimeViewFunction
        )]
        pub struct Runtime;

        #[runtime::pallet_index(0)]
        pub type System = frame_system;

        #[runtime::pallet_index(1)]
        pub type ParachainSystem = cumulus_pallet_parachain_system;

        #[runtime::pallet_index(2)]
        pub type Timestamp = pallet_timestamp;

        // ... other pallets

        #[runtime::pallet_index(50)]
        pub type Utility = pallet_utility;
    }
    ```

When adding the pallet:

- Assign a unique `pallet_index` that doesn't conflict with existing pallets.
- The index determines the pallet's position in the runtime.
- Use a descriptive name for the pallet instance, such as `Utility` for `pallet_utility`.

!!! warning
    Each pallet must have a unique index. Duplicate indices will cause compilation errors.

### Step 6: Verify the Runtime Compiles

After adding and configuring your pallet in the runtime, verify that everything is set up correctly by compiling the runtime.

To compile the runtime:

1. Navigate to your project's root directory.
2. Run the following command:

    ```bash
    cargo build --release
    ```

3. Ensure the build completes successfully without errors.

This command validates the pallet configurations and prepares the build for testing or deployment.

## Run Your Chain Locally

Now that you've added the pallet to your runtime, you can launch your parachain locally to test the new functionality using the [Polkadot Omni Node](https://crates.io/crates/polkadot-omni-node){target=\_blank}. For instructions on setting up the Polkadot Omni Node and [Polkadot Chain Spec Builder](https://crates.io/crates/staging-chain-spec-builder){target=\_blank} refer to [Choose a Template](/parachains/launch-a-parachain/choose-a-template){target=\_blank}.

### Step 7: Generate a Chain Specification

Create a new chain specification file with the updated runtime using the `chain-spec-builder` tool.

To generate a chain specification:

1. Run the following command from your project's root directory:

    ```bash
    chain-spec-builder create -t development \
        --relay-chain paseo \
        --para-id 1000 \
        --runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
        named-preset development
    ```

2. This generates a chain specification file for your parachain with the updated runtime.

### Step 8: Start the Parachain Node

Launch the parachain using the Polkadot omni node with the generated chain specification.

To start the parachain node:

1. Run the following command:

    ```bash
    polkadot-omni-node --chain ./chain_spec.json --dev
    ```

2. Verify the node starts successfully and begins producing blocks.

### Step 9: Interact with the Pallet

Use the Polkadot.js Apps interface to verify you can interact with the new pallet.

To interact with the pallet:

1. Navigate to [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/extrinsics){target=\_blank}.
2. Ensure you're connected to your local node at `ws://127.0.0.1:9944`.
3. Go to the **Developer** > **Extrinsics** tab.
4. In the submit extrinsic section, locate `utility` in the pallet dropdown.
5. Verify you can see the available extrinsics, such as:
    - `batch(calls)` - dispatch multiple calls in a single transaction.
    - `batchAll(calls)` - dispatch multiple calls, stopping on first error.
    - `asDerivative(index, call)` - dispatch a call as a derivative account.

You can now test the pallet's functionality by submitting transactions through the interface.

## Where to Go Next

<div class="subsection-wrapper">
  <div class="card">
    <a href="/parachains/customize-runtime/add-pallet-instances" target="_blank">
      <h2 class="title">Add Multiple Pallet Instances</h2>
      <p class="description">Learn how to implement multiple instances of the same pallet in your Polkadot SDK-based runtime.</p>
    </a>
  </div>
  <div class="card">
    <a href="/parachains/customize-runtime/pallet-development/create-a-pallet" target="_blank">
      <h2 class="title">Make a Custom Pallet</h2>
      <p class="description">Learn how to create custom pallets using FRAME.</p>
    </a>
  </div>
</div>