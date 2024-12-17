---
title: Runtime Upgrades
description: This page covers how runtime versioning and storage migration support forkless upgrades for Polkadot SDK-based networks and how they factor into chain upgrades.
---

# Runtime Upgrades

## Introduction

One of the defining features of Polkadot SDK-based blockchains is the ability to perform forkless runtime upgrades. Unlike traditional blockchains, which require hard forks and node coordination for upgrades, Polkadot networks enable seamless updates without network disruption.

Forkless upgrades are achieved through WebAssembly (Wasm) runtimes stored on-chain, which can be securely swapped and upgraded as part of the blockchain's state. By leveraging decentralized consensus, runtime updates can be happen trustlessly, ensuring continuous improvement and evolution without halting operations.

This guide explains how Polkadot's runtime versioning, Wasm deployment, and storage migrations enable these upgrades, ensuring the blockchain evolves smoothly and securely. You'll also learn how different upgrade processes apply to solo chains and parachains, depending on the network setup.

## How Runtime Upgrades Work

In FRAME, the [`system`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} pallet uses the [`set_code`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/enum.Call.html#variant.set_code){target=\_blank} extrinsic to update the Wasm code for the runtime. This method allows solo chains to upgrade without disruption. 

For parachains, upgrades are more complex. Parachains must first call `authorize_upgrade`, followed by `apply_authorized_upgrade`, to ensure the relay chain approves and applies the changes. Additionally, changes to current functionality that impact storage often require a [storage migration](#storage-migrations).

### Runtime Versioning

The executor is the component that selects the runtime execution environment to communicate with. Although you can override the default execution strategies for custom scenarios, in most cases, the executor selects the appropriate binary to use by evaluating and comparing key parameters from the native and Wasm runtime binaries.

The runtime includes a [runtime version struct](https://paritytech.github.io/polkadot-sdk/master/sp_version/struct.RuntimeVersion.html){target=\_blank} to provide the needed parameter information to the executor process. A sample runtime version struct might look as follows:

```rust
--8<-- 'code/develop/parachains/maintenance/runtime-upgrades/runtime_version.rs'
```

The struct provides the following parameter information to the executor:

- **`spec_name`** - the identifier for the different runtimes
- **`impl_name`** - the name of the implementation of the spec. Serves only to differentiate code of different implementation teams
- **`authoring_version`** - the version of the authorship interface. An authoring node won't attempt to author blocks unless this is equal to its native runtime
- **`spec_version`** - the version of the runtime specification. A full node won't attempt to use its native runtime in substitute for the on-chain Wasm runtime unless the `spec_name`, `spec_version`, and `authoring_version` are all the same between the Wasm and native binaries. Updates to the `spec_version` can be automated as a CI process, as is done for the [Polkadot network](https://gitlab.parity.io/parity/mirrors/polkadot/-/blob/master/scripts/ci/gitlab/check_extrinsics_ordering.sh){target=\_blank}. This parameter is typically incremented when there's an update to the `transaction_version`
- **`impl_version`** - the version of the implementation of the specification. Nodes can ignore this. It is only used to indicate that the code is different. As long as the `authoring_version` and the `spec_version` are the same, the code might have changed, but the native and Wasm binaries do the same thing. In general, only non-logic-breaking optimizations would result in a change of the `impl_version`
- **`transaction_version`** - the version of the interface for handling transactions. This parameter can be useful to synchronize firmware updates for hardware wallets or other signing devices to verify that runtime transactions are valid and safe to sign. This number must be incremented if there is a change in the index of the pallets in the `construct_runtime!` macro or if there are any changes to dispatchable functions, such as the number of parameters or parameter types. If `transaction_version` is updated, then the `spec_version` must also be updated
- **`apis`** - a list of supported [runtime APIs](https://paritytech.github.io/polkadot-sdk/master/sp_api/macro.impl_runtime_apis.html){target=\_blank} along with their versions                                                    

The executor follows the same consensus-driven logic for both the native runtime and the Wasm runtime before deciding which to execute. Because runtime versioning is a manual process, there is a risk that the executor could make incorrect decisions if the runtime version is misrepresented or incorrectly defined.

### Accessing the Runtime Version

The runtime version can be accessed through the `state.getRuntimeVersion` RPC endpoint, which accepts an optional block identifier. It can also be accessed through the runtime metadata to understand the APIs the runtime exposes and how to interact with them.

The runtime metadata should only change when the chain's [runtime `spec_version`](https://paritytech.github.io/polkadot-sdk/master/sp_version/struct.RuntimeVersion.html#structfield.spec_version){target=\_blank} changes.

## Storage Migrations

[Storage migrations](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_runtime_upgrades_and_migrations/index.html#migrations){target=\_blank} are custom, one-time functions that allow you to update storage to adapt to changes in the runtime.

For example, if a runtime upgrade changes the data type used to represent user balances from an unsigned integer to a signed integer, the storage migration would read the existing value as an unsigned integer and write back an updated value that has been converted to a signed integer.

If you don't make changes to how data is stored when needed, the runtime can't properly interpret the storage values to include in the runtime state and is likely to lead to undefined behavior.

### Storage Migrations with FRAME

FRAME storage migrations are implemented using the [`OnRuntimeUpgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.OnRuntimeUpgrade.html){target=\_blank} trait. The `OnRuntimeUpgrade` trait specifies a single function, `on_runtime_upgrade`, that allows you to specify logic to run immediately after a runtime upgrade but before any `on_initialize` functions or transactions are executed.

For further details about this process, see the [Storage Migrations](/develop/parachains/maintenance/storage-migrations/){target=\_blank} page.

### Ordering Migrations

By default, FRAME orders the execution of `on_runtime_upgrade` functions based on the order in which the pallets appear in the `construct_runtime!` macro. The functions run in reverse order for upgrades, starting with the last pallet executed first. You can impose a custom order if needed.

FRAME storage migrations run in this order:

1. Custom `on_runtime_upgrade` functions if using a custom order
2. System `frame_system::on_runtime_upgrade` functions
3. All `on_runtime_upgrade` functions defined in the runtime starting with the last pallet in the `construct_runtime!` macro

<!-- ## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Add Pallets to the Runtime__

    ---

    TODO!

    [:octicons-arrow-right-24: Get started](/tutorials/polkadot-sdk/parachains/zero-to-hero/add-pallets-to-runtime/)

</div> -->