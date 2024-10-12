---
title: Integrating Existing Pallets
description: TODO
---

# Integrating Existing Pallets

## Introduction

As demonstrated in the [Build a Local Solochain](/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/){target=\_blank} guide, the [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} provides a functional runtime that includes default FRAME development modules—pallets—to help you get started with building a custom blockchain.

This article outlines the basic steps for adding a new pallet to the runtime of the node template. These steps apply when integrating a FRAME pallet into your runtime. However, each pallet has specific configuration requirements, such as the parameters and types needed to enable the pallet's functionality. In this guide, you'll learn how to add a pallet to the runtime and configure the settings specific to that pallet. For instance, some pallets may allow users to interact with the blockchain by setting or modifying data, while others may manage transactions or permissions.

The purpose of this article is to help you:

- Learn how to update runtime dependencies to integrate a new pallet
- Understand how to configure pallet-specific Rust traits to enable the pallet's functionality
- Grasp the entire workflow of integrating a new pallet into your runtime

## Prerequisites

Before you begin, ensure that you have:

- You have completed the [Build a Local Solochain](/tutorials/polkadot-sdk/build-a-blockchain/build-a-local-blockchain/){target=\_blank} tutorial and have the Polkadot SDK Solochain Template node template installed locally
- You are generally familiar with how the Polkadot SDK components work and how they interact with the each other

## Configuring Runtime Dependencies

For Rust programs, this configuration is defined in the `Cargo.toml` file, which specifies the settings and dependencies that control what gets compiled into the final binary. Since the Polkadot SDK runtime compiles to both a native binary (which includes standard Rust library functions) and a Wasm binary (which does not include the standard Rust library), the `runtime/Cargo.toml` file manages two key aspects:

- The pallets are imported as dependencies for the runtime, including their locations and versions
- The features in each pallet that should be enabled when compiling the native Rust binary. By enabling the standard (`std`) feature set from each pallet, you ensure that the runtime includes the functions, types, and primitives necessary for the native build, which are otherwise excluded when compiling the WebAssembly binary

!!! note
    For information about adding dependencies in `Cargo.toml` files, see [Dependencies](https://doc.rust-lang.org/cargo/guide/dependencies.html){target=\_blank} page in the Cargo documentation. For information about enabling and managing features from dependent packages, see [Features](https://doc.rust-lang.org/cargo/reference/features.html){target=\_blank} section in the Cargo documentation.

### Adding Dependencies for a New Pallet

To add the dependencies for a new pallet to the runtime, follow these steps:

1. Open the `runtime/Cargo.toml` configuration file in a text editor

2. Add a new line into the `[dependencies]` section with the pallet that you want to add. Ensure that you stick to the following format:

    ```toml
    pallet-example = { 
        version = "4.0.0-dev", 
        default-features = false, 
        git = "https://github.com/paritytech/polkadot-sdk.git", 
        branch = "polkadot-v1.0.0"
    }
    ```

    This line imports the pallet-example crate as a dependency and specifies the following:

    - `version` - the specific version of the crate to import
    - `default-features` - Determines the behavior for including pallet features when compiling the runtime with standard Rust libraries
    - `repository` - the URL where the crate is hosted
    - `branch` - the branch of the repository to use. Ensure that the version and branch information for the new pallet matches those of the other pallets in the runtime

3. Add the pallet’s `std` features to the list of enabled features when compiling the runtime:

    ```toml
    [features]
    default = ["std"]
    std = [
        ...
        "pallet-example/std",
        ...
    ]
    ```

    This section specifies the default feature set for the runtime, which includes the `std` features for each pallet. When the runtime is compiled with the `std` feature set, the standard library features for all listed pallets are enabled. For more details on how the runtime is compiled as both a native binary (using `std`) and a Wasm binary (using `no_std`).

    !!! note
        If you forget to update the features section in the `Cargo.toml` file, you might encounter "cannot find function" errors when compiling the runtime.

4. Ensure the new dependencies resolve correctly by running the following command:

    ```bash
    cargo check -p solochain-template-runtime --release
    ```

## Review the Configuration for Pallets

Every Polkadot SDK pallet defines a [Rust trait](https://doc.rust-lang.org/book/ch10-02-traits.html){target=\_blank} called `Config`. This trait specifies the types and parameters that the pallet needs to integrate with the runtime and perform its functions.

You can inspect the `Config` trait of any pallet by reviewing its Rust documentation or source code. The Config trait ensures the pallet has access to the necessary types (like events, calls, or origins) and integrates smoothly with the rest of the runtime.

At its core, the Config trait typically looks something like this:

```rust
#[pallet::config]
pub trait Config: frame_system::Config {
    /// Event type used by the pallet.
    type RuntimeEvent: From<Event> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

    /// Weight information for controlling extrinsic execution costs.
    type WeightInfo: WeightInfo;
}
```

This basic structure shows that every pallet must define certain types, such as `RuntimeEvent` and `WeightInfo`, to be functional within the runtime. The actual implementation can vary depending on the specific needs of the pallet.

??? "Example - Utility Pallet"
      For instance, in the [`utility`](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/utility){target=\_blank} pallet, the Config trait is implemented with the following types:

      ```rust
      #[pallet::config]
      pub trait Config: frame_system::Config {
          /// The overarching event type.
          type RuntimeEvent: From<Event> + IsType<<Self as frame_system::Config>::RuntimeEvent>;

          /// The overarching call type.
          type RuntimeCall: Parameter
          + Dispatchable<RuntimeOrigin = Self::RuntimeOrigin, PostInfo = PostDispatchInfo>
          + GetDispatchInfo
          + From<frame_system::Call<Self>>
          + UnfilteredDispatchable<RuntimeOrigin = Self::RuntimeOrigin>
          + IsSubType<Call<Self>>
          + IsType<<Self as frame_system::Config>::RuntimeCall>;

          /// The caller origin, overarching type of all pallets origins.
          type PalletsOrigin: Parameter +
          Into<<Self as frame_system::Config>::RuntimeOrigin> +
          IsType<<<Self as frame_system::Config>::RuntimeOrigin as frame_support::traits::OriginTrait>::PalletsOrigin>;

          /// Weight information for extrinsics in this pallet.
          type WeightInfo: WeightInfo;
      }
      ```

      So you can see how the Config trait configures the different types that it will use when calling the pallet.