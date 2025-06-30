---
title: Runtime Upgrades
description: Learn how to safely and efficiently perform runtime upgrades for your Substrate-based blockchain, including best practices and step-by-step instructions.
tutorial_badge: Intermediate
---

# Runtime Upgrades

## Introduction

Upgrading the runtime of your Polkadot SDK-based blockchain is a core feature that enables you to add new functionality, fix bugs, or optimize performance without requiring a hard fork. Runtime upgrades are performed by submitting a special extrinsic that replaces the existing Wasm runtime code on-chain. This process is trustless, transparent, and can be executed via governance or sudo, depending on your chain's configuration.

This tutorial will guide you through the process of preparing, submitting, and verifying a runtime upgrade for your parachain or standalone Polkadot-SDK based chain.

## Prerequisites

Before proceeding, ensure you have:

- A working Polkadot SDK-based chain
- The latest source code for your runtime, with desired changes implemented and tested
- [Rust toolchain](https://www.rust-lang.org/) and [wasm32-unknown-unknown target](https://substrate.dev/docs/en/knowledgebase/getting-started/#add-the-wasm-target) installed
- Sufficient privileges to submit a runtime upgrade (sudo or governance access)
- [Polkadot.js Apps](https://polkadot.js.org/apps/) or another compatible tool for submitting extrinsics

## Prepare the Runtime Upgrade

1. **Implement and Test Changes**
   - Make your desired changes to the runtime code (e.g., add a pallet, update logic, fix bugs).
   - Thoroughly test your changes locally using unit tests and integration tests.
   - Optionally, run your chain locally with the new runtime to ensure it works as expected.

---

### Example: Making a Meaningful Runtime Upgrade (Custom Pallet)

Suppose you have followed the Zero to Hero tutorials and already have a custom pallet integrated into your runtime. Here's how you could make a meaningful upgrade by extending your custom pallet and updating the runtime:

#### 1. Add a New Feature to the Custom Pallet

For example, add a new dispatchable function to reset the counter to zero:

**In `pallets/custom-pallet/src/lib.rs`:**

```rust
#[pallet::call]
impl<T: Config> Pallet<T> {
    // ... existing calls ...

    /// Reset the counter to zero. Only callable by Root.
    #[pallet::weight(T::WeightInfo::reset_counter())]
    pub fn reset_counter(origin: OriginFor<T>) -> DispatchResult {
        ensure_root(origin)?;
        <CounterValue<T>>::put(0u32);
        Self::deposit_event(Event::CounterValueSet { new_value: 0 });
        Ok(())
    }
}
```

- Update your pallet's `Event` and `WeightInfo` as needed.
- Add unit tests for the new function in `tests.rs`.

#### 2. Update the Runtime to Use the New Pallet Version

- If you changed the pallet's public API, ensure the runtime's configuration is updated accordingly (e.g., in `runtime/src/lib.rs` and `runtime/src/configs/mod.rs`).
- Re-export the updated pallet if needed.

#### 3. Bump the Runtime Version

- In your runtime's `Cargo.toml` and `lib.rs`, increment the `spec_version` and `impl_version` fields. For example:

**In `runtime/src/lib.rs`:**
```rust
sp_version::runtime_version! {
    pub const VERSION: RuntimeVersion = RuntimeVersion {
        spec_name: create_runtime_str!("parachain_template_runtime"),
        impl_name: create_runtime_str!("parachain_template_runtime"),
        authoring_version: 1,
        spec_version: 2, // <-- increment this
        impl_version: 2, // <-- and this
        // ...
    };
}
```

#### 4. Build and Test the New Runtime

- Run your tests to ensure everything works:
  ```bash
  cargo test --package custom-pallet
  ```
- Build the new Wasm runtime as described below.

---

2. **Build the Wasm Runtime**
   - Navigate to your runtime directory (commonly `runtime/` or `parachain-template/runtime/`).
   - Build the Wasm blob:
     ```bash
     cargo build --release --target wasm32-unknown-unknown
     ```
   - The compiled Wasm file is usually located at:
     ```
     ./target/wasm32-unknown-unknown/release/<runtime_name>.wasm
     ```
   - For parachain templates, you may also find the compressed Wasm at:
     ```
     ./target/release/wbuild/parachain-template-runtime/parachain_template_runtime.compact.compressed.wasm
     ```

## Step 2: Submit the Runtime Upgrade

You can submit a runtime upgrade using the Sudo pallet (for development/testnets) or via on-chain governance (for production chains).

### Using Sudo (Development/Testnet)

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/).
2. Connect to your node (local or remote).
3. Navigate to **Developer > Sudo**.
4. In the **sudo** call dropdown, select `system > setCode`.
5. Upload your new Wasm runtime file.
6. Click **Submit Sudo** and sign the transaction with the sudo key.

### Using Governance (Production)

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/).
2. Navigate to **Democracy > Propose** (or the relevant governance module).
3. Select the `system > setCode` call and upload the new Wasm runtime.
4. Submit the proposal and follow the governance process (referenda, council, etc.).

## Step 3: Verify the Upgrade

1. After the extrinsic is included in a block, your chain will schedule the upgrade.
2. The runtime will be upgraded at the start of the next block.
3. Verify the upgrade:
   - Check the **Explorer** tab for events like `system.CodeUpdated`.
   - Confirm the runtime version has incremented (see **Developer > Chain state > system > version**).
   - Test new features or changes to ensure they are live.

## Best Practices

- Always test your runtime thoroughly before upgrading a live chain.
- Back up your chain data before performing upgrades on production networks.
- Increment the `spec_version` and `impl_version` in your runtime's `Cargo.toml` and `lib.rs`.
- Communicate upgrade plans with your community and validators.
- Monitor the chain closely after the upgrade for unexpected issues.

## Troubleshooting

- **Upgrade fails to apply:** Ensure the Wasm blob is correct and compatible with your chain's state.
- **Chain halts after upgrade:** Check for breaking changes or missing migrations in your runtime code.
- **Extrinsic rejected:** Verify you have sufficient privileges and that the Wasm file is not too large.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy on Paseo TestNet__

    ---

    Deploy your Polkadot SDK blockchain on Paseo! Follow this step-by-step guide for a seamless journey to a successful TestNet deployment.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/)

-   <span class="badge tutorial">Tutorial</span> __Obtain Coretime__

    ---

    Get coretime for block production now! Follow this guide to explore on-demand and bulk options for seamless and efficient operations.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/obtain-coretime/)

</div> 