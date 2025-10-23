---
title: Add an Existing Pallet to the Runtime
description: Learn how to include and configure pallets in a Polkadot SDK-based runtime, from adding dependencies to implementing necessary traits.
tutorial_badge: Intermediate
categories: Parachains
---

# Add an Existing Pallet to the Runtime

## Introduction

The [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank} provides a functional runtime that includes default [FRAME](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/index.html){target=\_blank} development modules ([pallets](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/frame_runtime/pallet/index.html){target=\_blank}) to help you get started building a custom parachain. However, you'll often need to extend your runtime by adding additional pallets to enable new functionality.

Each pallet has specific configuration requirements, including the necessary parameters and types that enable its functionality. This guide walks you through the complete process of adding an existing pallet to your runtime and configuring it properly using `pallet-utility` as a practical example.

The Utility pallet offers batch transaction capabilities, enabling multiple calls to be dispatched together, as well as origin manipulation functionality for advanced use cases.

In this guide, you'll learn how to:

- Update runtime dependencies to integrate a new pallet
- Configure pallet-specific Rust traits to enable the pallet's functionality
- Run your parachain locally to test the new pallet

## Check Prerequisites

Before you begin, ensure you have:

- [Polkadot SDK dependencies installed](/parachains/install-polkadot-sdk/){target=\_blank}
- A working [Polkadot SDK development environment](/parachains/launch-a-parachain/set-up-the-parachain-template/){target=\_blank}

## Add an Existing Polkadot SDK Pallet to Your Runtime

Adding a pallet to your parachain runtime involves configuring dependencies, implementing the pallet's configuration trait, and registering the pallet in the runtime construct.

### Add an Existing Pallet as a Dependency

The Polkadot SDK utilizes a monorepo structure, where multiple pallets are available as features of the `polkadot-sdk` dependency. A list of pallets can be found in the [`substrate/frame` directory](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame){target=\_blank} of the Polkadot SDK repository.

For [`pallet-utility`](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/utility){target=\_blank}, you need to add it as a dependency in the features array:

1. Open the `runtime/Cargo.toml` file.
2. Locate the `[dependencies]` section.
3. Find the `polkadot-sdk` dependency.
4. Add `pallet-utility` to the features array:

    ```toml title="runtime/Cargo.toml"
    polkadot-sdk = { workspace = true, features = [
        "pallet-utility",
        "cumulus-pallet-aura-ext",
        "cumulus-pallet-session-benchmarking",
        # ... other features
    ], default-features = false }
    ```

!!! note
    If you're adding a custom pallet that isn't part of the Polkadot SDK, you would add it as a separate dependency:

    ```toml title="runtime/Cargo.toml"
    custom-pallet = { path = "../pallets/custom-pallet", default-features = false }
    ```

    Ensure it's included in the workspace members section of the root `Cargo.toml` file.

### Enable Standard Library Features

The Polkadot SDK runtime compiles to both a native binary (for running unit tests), which includes standard Rust library functions, and a WebAssembly (Wasm) binary (a more compact size for production use), which does not include the standard library. Since `pallet-utility` is part of the `polkadot-sdk` dependency, its `std` feature is already included when you enable `polkadot-sdk/std`.

To verify that the standard library features are enabled:

1. In the `runtime/Cargo.toml` file, locate the `[features]` section.
2. Ensure `polkadot-sdk/std` is included in the `std` array:

    ```toml title="runtime/Cargo.toml"
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

    ```toml title="runtime/Cargo.toml"
    std = [
        # ... other features
        "custom-pallet/std",
    ]
    ```

### Review the Config Trait

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

- **`RuntimeEvent`**: Links the pallet's events to the runtime's event system.
- **`RuntimeCall`**: Allows the utility pallet to dispatch calls from other pallets, which is needed for batch operations.
- **`PalletsOrigin`**: Enables origin manipulation for dispatching calls as other pallets.
- **`WeightInfo`**: Provides weight calculations for pallet operations.

!!! tip
    You can view a pallet's `Config` trait requirements in the [Polkadot SDK Rust docs](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/index.html){target=\_blank}. Search for the pallet's name and check the type defined by its [`Config`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/guides/your_first_pallet/pallet/trait.Config.html){target=\_blank} trait.

### Implement the Config Trait

Now you'll implement the pallet's `Config` trait in your runtime to provide the concrete types the pallet needs.

To implement the Config trait:

1. Open the `runtime/src/configs/mod.rs` file.
2. Add the following implementation at the end of the file:

    ```rust title="runtime/src/configs/mod.rs"
    /// Configure the utility pallet
    impl pallet_utility::Config for Runtime {
        type RuntimeEvent = RuntimeEvent;
        type RuntimeCall = RuntimeCall;
        type PalletsOrigin = OriginCaller;
        type WeightInfo = pallet_utility::weights::SubstrateWeight<Runtime>;
    }
    ```

### Add to Runtime Construct

The final step is to register the pallet in the runtime construct using the [`#[frame_support::runtime]` macro](https://paritytech.github.io/polkadot-sdk/master/frame_support/attr.runtime.html){target=\_blank}. This macro generates the necessary boilerplate code for including pallets in the runtime.

To add the pallet to the runtime construct:

1. Open the `runtime/src/lib.rs` file.
2. Locate the `#[frame_support::runtime]` section (usually near the end of the file).
3. Add your pallet with a unique `pallet_index`:

    ```rust title="runtime/src/lib.rs"
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

- Assign a unique `pallet_index` that doesn't conflict with existing pallets. The index determines the pallet's position in the runtime.
- Use a descriptive name for the pallet instance, such as `Utility` for `pallet_utility`.

!!! warning
    Each pallet must have a unique index. Duplicate indices will cause compilation errors.

### Verify the Runtime Compiles

After adding and configuring your pallet in the runtime, verify that everything is set up correctly by compiling the runtime.

To compile the runtime:

1. Navigate to the root directory of your project.
2. Run the following command:

    ```bash
    cargo build --release
    ```

3. Ensure the build completes successfully without errors.

This command validates the pallet configurations and prepares the build for testing or deployment.

## Run Your Chain Locally

Now that you've added the pallet to your runtime, you can launch your parachain locally to test the new functionality using the [Polkadot Omni Node](https://crates.io/crates/polkadot-omni-node){target=\_blank}. For instructions on setting up the Polkadot Omni Node and [Polkadot Chain Spec Builder](https://crates.io/crates/staging-chain-spec-builder){target=\_blank}, refer to the [Set Up a Parachain Template](/parachains/launch-a-parachain/set-up-the-parachain-template/){target=\_blank} guide.

### Generate a Chain Specification

Create a new chain specification file with the updated runtime by running the following command from your project's root directory using the `chain-spec-builder` tool:

```bash
chain-spec-builder create -t development \
--relay-chain paseo \
--para-id 1000 \
--runtime ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm \
named-preset development
```

This command generates a chain specification file, `chain_spec.json`, for your parachain with the updated runtime.

### Start the Parachain Node

Launch the parachain using the Polkadot Omni Node with the generated chain specification by running the following command:

```bash
polkadot-omni-node --chain ./chain_spec.json --dev
```

Verify the node starts successfully and begins producing blocks.

### Interact with the Pallet

Use the Polkadot.js Apps interface to verify you can interact with the new pallet.

To interact with the pallet:

1. Navigate to [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2F127.0.0.1%3A9944#/extrinsics){target=\_blank}.
2. Ensure you're connected to your local node at `ws://127.0.0.1:9944`.
3. Go to the **Developer** > **Extrinsics** tab.
4. In the **submit the following extrinsic** section, locate **utility** in the pallet dropdown.
5. Verify you can see the available extrinsics, such as:
    - **`batch(calls)`**: Dispatch multiple calls in a single transaction.
    - **`batchAll(calls)`**: Dispatch multiple calls, stopping on the first error.
    - **`asDerivative(index, call)`**: Dispatch a call as a derivative account.

    ![](/images/parachains/customize-runtime/pallet-development/add-pallet-to-runtime/add-pallets-to-runtime-01.webp)

You can now test the pallet's functionality by submitting transactions through the interface.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Add Multiple Pallet Instances__

    ---

    Learn how to implement multiple instances of the same pallet in your Polkadot SDK-based runtime.

    [:octicons-arrow-right-24: Get Started](/parachains/customize-runtime/add-pallet-instances/)

-   <span class="badge guide">Guide</span> __Make a Custom Pallet__

    ---

    Learn how to create custom pallets using FRAME.

    [:octicons-arrow-right-24: Get Started](/parachains/customize-runtime/pallet-development/create-a-pallet/)

</div>
