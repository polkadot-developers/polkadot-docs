---
title: Runtime Upgrades
description: Explains how runtime versioning and storage migration support forkless upgrades for Polkadot SDK-based networks and they factor in to chain upgrades.
---

# Runtime Upgrades

## Introduction

One of the defining features of Polkadot SDK-based blockchains is the ability to perform forkless runtime upgrades. Unlike traditional blockchains, which require hard forks and node coordination for upgrades, Polkadot networks enable seamless updates without network disruption.

Forkless upgrades are achieved through the use of WebAssembly (Wasm) runtimes stored on-chain, which can be securely swapped in and upgraded as part of the blockchain's state. By leveraging decentralized consensus, runtime updates can be made trustlessly, ensuring continuous improvement and evolution without halting operations.

This guide explores how runtime versioning, Wasm deployment, and storage migrations facilitate these upgrades.

In FRAME, the [`system`](https://paritytech.github.io/polkadot-sdk/master/frame_system/index.html){target=\_blank} pallet defines the [`set_code`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/enum.Call.html#variant.set_code){target=\_blank} extrinsic that is used to update the Wasm code for the runtime. 

!!!info "Parachain versus Solo Chain Upgrades"
    While the `set_code` extrinsic is sufficient for updating the runtime in solo chain setups, parachains must undergo a different procedure of calling `authorize_upgrade`, followed by `apply_authorized_upgrade`. These extrinsics ensure that the relay chain is aware of the upgrade, and that it gets applied.

When updating a runtime, there is a differentiation in adding functionality to the runtime versus updating existing functionality. In many cases, updating existing functionality, such as how a pallet stores state, would require a [storage migration](#storage-migrations).

## Runtime Versioning

The component that selects the runtime execution environment to communicate with is called the executor. Although you can override the default execution strategies for custom scenarios, in most cases the executor selects the appropriate binary to use by evaluating and comparing key parameters from the native and Wasm runtime binaries.

To provide this parameter information to the executor process, the runtime includes a [runtime version struct](https://paritytech.github.io/polkadot-sdk/master/sp_version/struct.RuntimeVersion.html){target=\_blank} similar to the following:

```rust
--8<-- 'code/develop/parachain-devs/parachain-maintenance/runtime_version.rs'
```

The parameters in the struct provide the following information to the executor:

- **`spec_name`** - the identifier for the different runtimes
- **`impl_name`** - the name of the implementation of the spec. This is of little consequence for the node and serves only to differentiate code of different implementation teams
- **`authoring_version`** - the version of the authorship interface. An authoring node won't attempt to author blocks unless this is equal to its native runtime
- **`spec_version`** - the version of the runtime specification. A full node won't attempt to use its native runtime in substitute for the on-chain Wasm runtime unless the `spec_name`, `spec_version`, and `authoring_version` are all the same between the Wasm and native binaries. Updates to the `spec_version` can be automated as a CI process, as is done for the [Polkadot network](https://gitlab.parity.io/parity/mirrors/polkadot/-/blob/master/scripts/ci/gitlab/check_extrinsics_ordering.sh){target=\_blank}. This parameter is typically incremented when there's an update to the `transaction_version`
- **`impl_version`** - the version of the implementation of the specification. Nodes can ignore this. It is only used to indicate that the code is different. As long as the `authoring_version` and the `spec_version` are the same, the code might have changed, but the native and Wasm binaries do the same thing. In general, only non-logic-breaking optimizations would result in a change of the `impl_version`
- **`transaction_version`** - the version of the interface for handling transactions. This parameter can be useful to synchronize firmware updates for hardware wallets or other signing devices to verify that runtime transactions are valid and safe to sign. This number must be incremented if there is a change in the index of the pallets in the `construct_runtime!` macro or if there are any changes to dispatchable functions, such as the number of parameters or parameter types. If `transaction_version` is updated, then the `spec_version` must also be updated
- **`apis`** - a list of supported [runtime APIs](https://paritytech.github.io/polkadot-sdk/master/sp_api/macro.impl_runtime_apis.html){target=\_blank} along with their versions                                                    

The executor follows the same consensus-driven logic for both the native runtime and the Wasm runtime before deciding which to execute. However, since runtime versioning is manually set, there is a risk that the executor could make incorrect decisions if the runtime version is misrepresented or incorrectly defined.

## Accessing the Runtime Version

The runtime version can be accessed through the `state.getRuntimeVersion` RPC endpoint, which accepts an optional block identifier. It can also be accessed through the runtime metadata to understand the APIs the runtime exposes and how to interact with them.

The runtime metadata should only change when the chain's [runtime `spec_version`](https://paritytech.github.io/polkadot-sdk/master/sp_version/struct.RuntimeVersion.html#structfield.spec_version){target=\_blank} changes.

## Storage Migrations

[Storage migrations](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/frame_runtime_upgrades_and_migrations/index.html#migrations){target=\_blank} are custom, one-time functions that allow you to update storage to adapt to changes in the runtime.

For example, if a runtime upgrade changes the data type used to represent user balances from an unsigned integer to a signed integer, the storage migration would read the existing value as an unsigned integer and write back an updated value that has been converted to a signed integer.

If you don't make changes to how data is stored when needed, the runtime can't properly interpret the storage values to include in the runtime state and is likely to lead to undefined behavior.

### Storage Migrations with FRAME

FRAME storage migrations are implemented using the [`OnRuntimeUpgrade`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.OnRuntimeUpgrade.html){target=\_blank} trait. The `OnRuntimeUpgrade` trait specifies a single function, `on_runtime_upgrade`, that allows you to specify logic to run immediately after a runtime upgrade but before any `on_initialize` functions or transactions are executed.

### Ordering Migrations

By default, FRAME orders the execution of `on_runtime_upgrade` functions based on the order in which the pallets appear in the `construct_runtime!` macro. The functions run in reverse order for upgrades, starting with the last pallet executed first. You can impose a custom order, if needed.

FRAME storage migrations run in this order:

1. Custom `on_runtime_upgrade` functions if using a custom order
2. System `frame_system::on_runtime_upgrade` functions
3. All `on_runtime_upgrade` functions defined in the runtime starting with the last pallet in the `construct_runtime!` macro



