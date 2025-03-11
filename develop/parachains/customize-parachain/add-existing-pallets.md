---
title: Add a Pallet to the Runtime
description: Learn how to include and configure pallets in a Polkadot SDK-based runtime, from adding dependencies to implementing necessary traits.
---

# Add a Pallet to the Runtime

## Introduction

The [Polkadot SDK Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} provides a functional runtime that includes default FRAME development modules (pallets) to help you get started with building a custom blockchain.

Each pallet has specific configuration requirements, such as the parameters and types needed to enable the pallet's functionality. In this guide, you'll learn how to add a pallet to a runtime and configure the settings specific to that pallet.

The purpose of this article is to help you:

- Learn how to update runtime dependencies to integrate a new pallet
- Understand how to configure pallet-specific Rust traits to enable the pallet's functionality
- Grasp the entire workflow of integrating a new pallet into your runtime

## Configuring Runtime Dependencies

For Rust programs, this configuration is defined in the `Cargo.toml` file, which specifies the settings and dependencies that control what gets compiled into the final binary. Since the Polkadot SDK runtime compiles to both a native binary (which includes standard Rust library functions) and a Wasm binary (which does not include the standard Rust library), the `runtime/Cargo.toml` file manages two key aspects:

- The locations and versions of the pallets that are to be imported as dependencies for the runtime
- The features in each pallet that should be enabled when compiling the native Rust binary. By enabling the standard (`std`) feature set from each pallet, you ensure that the runtime includes the functions, types, and primitives necessary for the native build, which are otherwise excluded when compiling the Wasm binary


For information about adding dependencies in `Cargo.toml` files, see the [Dependencies](https://doc.rust-lang.org/cargo/guide/dependencies.html){target=\_blank} page in the Cargo documentation. To learn more about enabling and managing features from dependent packages, see the [Features](https://doc.rust-lang.org/cargo/reference/features.html){target=\_blank} section in the Cargo documentation.

## Dependencies for a New Pallet

To add the dependencies for a new pallet to the runtime, you must modify the `Cargo.toml` file by adding a new line into the `[workspace.dependencies]` section with the pallet you want to add. This pallet definition might look like:

```toml title="Cargo.toml"
pallet-example = { version = "4.0.0-dev", default-features = false }
```

This line imports the `pallet-example` crate as a dependency and specifies the following:

- **`version`** - the specific version of the crate to import
- **`default-features`** - determines the behavior for including pallet features when compiling the runtime with standard Rust libraries

!!! tip
    If you're importing a pallet that isn't available on [`crates.io`](https://crates.io/){target=\_blank}, you can specify the pallet's location (either locally or from a remote repository) by using the `git` or `path` key. For example:

    ```toml title="Cargo.toml"
    pallet-example = { 
        version = "4.0.0-dev",
        default-features = false,
        git = "INSERT_PALLET_REMOTE_URL",
    }
    ```

    In this case, replace `INSERT_PALLET_REMOTE_URL` with the correct repository URL. For local paths, use the path key like so:

    ```toml title="Cargo.toml"
    pallet-example = { 
        version = "4.0.0-dev",
        default-features = false,
        path = "INSERT_PALLET_RELATIVE_PATH",
    }
    ```

    Ensure that you substitute `INSERT_PALLET_RELATIVE_PATH` with the appropriate local path to the pallet.

Next, add this dependency to the `[dependencies]` section of the `runtime/Cargo.toml` file, so it inherits from the main `Cargo.toml` file:

```toml title="runtime/Cargo.toml"
pallet-examples.workspace = true
```

To enable the `std` feature of the pallet, add the pallet to the following section:

```toml title="runtime/Cargo.toml"
[features]
default = ["std"]
std = [
    ...
    "pallet-example/std",
    ...
]
```

This section specifies the default feature set for the runtime, which includes the `std` features for each pallet. When the runtime is compiled with the `std` feature set, the standard library features for all listed pallets are enabled. If you forget to update the features section in the `Cargo.toml` file, you might encounter `cannot find function` errors when compiling the runtime.

For more details about how the runtime is compiled as both a native binary (using `std`) and a Wasm binary (using `no_std`), refer to the [Wasm build](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/polkadot_sdk/substrate/index.html#wasm-build){target=\_blank} section in the Polkadot SDK documentation.

To ensure that the new dependencies resolve correctly for the runtime, you can run the following command:

```bash
cargo check --release
```

## Config Trait for Pallets

Every Polkadot SDK pallet defines a Rust trait called `Config`. This trait specifies the types and parameters that the pallet needs to integrate with the runtime and perform its functions. The primary purpose of this trait is to act as an interface between this pallet and the runtime in which it is embedded. A type, function, or constant in this trait is essentially left to be configured by the runtime that includes this pallet.

Consequently, a runtime that wants to include this pallet must implement this trait.

You can inspect any pallet’s `Config` trait by reviewing its Rust documentation or source code. The `Config` trait ensures the pallet has access to the necessary types (like events, calls, or origins) and integrates smoothly with the rest of the runtime.

At its core, the `Config` trait typically looks like this:

```rust
--8<-- 'code/develop/parachains/customize-parachain/add-existing-pallets/pallet-basic-config-trait.rs'
```

This basic structure shows that every pallet must define certain types, such as `RuntimeEvent` and `WeightInfo`, to function within the runtime. The actual implementation can vary depending on the pallet’s specific needs.

### Utility Pallet Example

For instance, in the [`utility`](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/substrate/frame/utility){target=\_blank} pallet, the `Config` trait is implemented with the following types:

```rust
--8<-- 'code/develop/parachains/customize-parachain/add-existing-pallets/utility-pallet-config-trait.rs'
```

This example shows how the `Config` trait defines types like `RuntimeEvent`, `RuntimeCall`, `PalletsOrigin`, and `WeightInfo`, which the pallet will use when interacting with the runtime.

## Parameter Configuration for Pallets

Traits in Rust define shared behavior, and within the Polkadot SDK, they allow runtimes to integrate and utilize a pallet's functionality by implementing its associated configuration trait and parameters. Some of these parameters may require constant values, which can be defined using the [`parameter_types!`](https://paritytech.github.io/polkadot-sdk/master/frame_support/macro.parameter_types.html){target=\_blank} macro. This macro simplifies development by expanding the constants into the appropriate struct types with functions that the runtime can use to access their types and values in a consistent manner.

For example, the following code snippet shows how the solochain template configures certain parameters through the [`parameter_types!`]({{ dependencies.repositories.polkadot_sdk_solochain_template.repository_url }}/blob/{{dependencies.repositories.polkadot_sdk_solochain_template.version}}/runtime/src/lib.rs#L138){target=\_blank} macro in the `runtime/lib.rs` file:

```rust
--8<-- 'code/develop/parachains/customize-parachain/add-existing-pallets/parameter-types-example.rs'
```

## Pallet Config in the Runtime

To integrate a new pallet into the runtime, you must implement its `Config` trait in the `runtime/lib.rs` file. This is done by specifying the necessary types and parameters in Rust, as shown below:

```rust
--8<-- 'code/develop/parachains/customize-parachain/add-existing-pallets/impl-pallet-example-in-runtime.rs'
```

Finally, to compose the runtime, update the list of pallets in the same file by modifying the [`#[frame_support::runtime]`](https://paritytech.github.io/polkadot-sdk/master/frame_support/attr.runtime.html){target=\_blank} section. This Rust macro constructs the runtime with your specified name and pallets, wraps the runtime's configuration, and automatically generates boilerplate code for pallet inclusion. 

Use the following format when adding your pallet:

```rust
--8<-- 'code/develop/parachains/customize-parachain/add-existing-pallets/frame-support-runtime-macro.rs'
```

## Where to Go Next

With the pallet successfully added and configured, the runtime is ready to be compiled and used. Following this guide’s steps, you’ve integrated a new pallet into the runtime, set up its dependencies, and ensured proper configuration. You can now proceed to any of the following points:

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Make a Custom Pallet__

    ---

    Learn how to create custom pallets using FRAME, allowing for flexible, modular, and scalable blockchain development. Follow the step-by-step guide.

    [:octicons-arrow-right-24: Reference](/develop/parachains/customize-parachain/make-custom-pallet/)

-   <span class="badge guide">Guide</span> __Pallet Testing__

    ---

    Learn how to efficiently test pallets in the Polkadot SDK, ensuring the reliability and security of your pallets operations.

    [:octicons-arrow-right-24: Reference](/develop/parachains/testing)

</div>