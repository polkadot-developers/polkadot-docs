---
title: Runtime Upgrades
description: Learn how to safely perform runtime upgrades for your Polkadot SDK-based blockchain, including step-by-step instructions.
tutorial_badge: Intermediate
---

# Runtime Upgrades

## Introduction

Upgrading the runtime of your Polkadot SDK-based blockchain is a fundamental feature that allows you to add new functionality, fix bugs, or improve performance without requiring a hard fork. Runtime upgrades are performed by submitting a special extrinsic that replaces the existing on-chain WASM runtime code. This process is trustless, transparent, and can be executed either through governance or using sudo, depending on your chain's configuration.

This tutorial will guide you through the steps to prepare, submit, and verify a runtime upgrade for your parachain or standalone Polkadot SDK-based chain. For this example, you'll continue from the state left by the previous tutorials, where you have a custom pallet integrated into your runtime.

## Update the Runtime

In this section, you will add a new feature to your existing custom pallet and upgrade your runtime to include this new functionality.

### Start Your Chain

Before making any changes, ensure your blockchain node is running properly:

```bash
polkadot-omni-node --chain ./chain_spec.json --dev
```

Verify your chain is operational and note the runtime version state in Polkadot JS. For more details, check the [Interact with the Node](/tutorials/polkadot-sdk/parachains/zero-to-hero/set-up-a-template/#interact-with-the-node){target=\_blank}.

![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-01.webp)

As you can see, the runtime version is `1` since this chain has not been upgraded. Keep this chain running in the background.

### Add a New Feature

Now, you can extend your existing custom pallet by adding a new dispatchable function to reset the counter to zero. This provides a meaningful upgrade that demonstrates new functionality. Copy and paste the following code at the end of your `lib.rs` file in your custom pallet:

```rust title="custom-pallet/src/lib.rs" hl_lines="5-17"
#[pallet::call]
impl<T: Config> Pallet<T> {
    // ... existing calls like increment, decrement, etc.

    /// Reset the counter to zero.
    ///
    /// The dispatch origin of this call must be _Root_.
    ///
    /// Emits `CounterValueSet` event when successful.
    #[pallet::call_index(3)]
    #[pallet::weight(0)]
    pub fn reset_counter(origin: OriginFor<T>) -> DispatchResult {
        ensure_root(origin)?;
        <CounterValue<T>>::put(0u32);
        Self::deposit_event(Event::CounterValueSet { counter_value: 0 });
        Ok(())
    }
}
```

The `reset_counter` function will be a Root-only operation that sets the counter value back to zero, regardless of its current state. This is useful for administrative purposes, such as clearing the counter after maintenance, testing, or at the start of new periods. Unlike the existing increment/decrement functions that any signed user can call, this reset function requires Root privileges, making it a controlled administrative action.

Ensure that your runtime compiles by running:

```bash
cargo build --release
```

Now, you can test this new function in `pallets/custom-pallet/src/tests.rs`

```rust title="custom-pallet/src/tests.rs" hl_lines="4-39"
// ... existing unit tests
...

#[test]
fn reset_counter_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // First increment the counter
        assert_ok!(CustomPallet::increment(RuntimeOrigin::signed(1), 1));

        // Ensure the event matches the increment action
        System::assert_last_event(
            Event::CounterIncremented {
                counter_value: 1,
                who: 1,
                incremented_amount: 1,
            }
            .into(),
        );
        
        // Reset should work with root origin
        assert_ok!(CustomPallet::reset_counter(RuntimeOrigin::root()));
        
        // Check that the event was emitted
        System::assert_last_event(Event::CounterValueSet { counter_value: 0 }.into());
    });
}

#[test]
fn reset_counter_fails_without_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        // Should fail with non-root origin
        assert_noop!(
            CustomPallet::reset_counter(RuntimeOrigin::signed(1)),
            sp_runtime::DispatchError::BadOrigin
        );
    });
}
```

Ensure that your tests pass by running:

```bash
cargo test --package custom-pallet
```

### Update Runtime Configuration

Since you've only added new functionality without changing existing APIs, minimal runtime changes are needed. However, verify that your runtime configuration is still compatible. If you've added new configuration parameters to your pallet, update them accordingly in the `runtime/configs/mod.rs`.

### Bump the Runtime Version

This is a critical step - you must increment the runtime version numbers to signal that an upgrade has occurred. In `runtime/src/lib.rs`:

```rust title="lib.rs" hl_lines="6"
#[sp_version::runtime_version]
pub const VERSION: RuntimeVersion = RuntimeVersion {
	spec_name: alloc::borrow::Cow::Borrowed("parachain-template-runtime"),
	impl_name: alloc::borrow::Cow::Borrowed("parachain-template-runtime"),
	authoring_version: 1,
    spec_version: 2, // <-- increment this (was 1)
	impl_version: 0,
	apis: apis::RUNTIME_API_VERSIONS,
	transaction_version: 1,
	system_version: 1,
};
```

Also update `runtime/Cargo.toml` version:

```toml title="Cargo.toml" hl_lines="4"
[package]
name = "parachain-template-runtime"
description = "A parachain runtime template built with Substrate and Cumulus, part of Polkadot Sdk."
version = "0.2.0" # <-- increment this version
# ... rest of your Cargo.toml
```

For more information about runtime versioning, check the [Runtime Upgrades](/develop/parachains/maintenance/runtime-upgrades#runtime-versioning){target=\_blank} guide.

### Build the New Runtime

Navigate to your project root:

```bash
cd /path/to/your/parachain-template
```

Build the new runtime:

```bash
cargo build --release
```

Verify that you have the proper WASM builds by executing:

```
ls -la target/release/wbuild/parachain-template-runtime/
```

If you can see the following elements, it means that you are ready to submit the runtime upgrade to your running chain:

--8<-- 'code/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-compilation.html'

## Submit the Runtime Upgrade

You can submit a runtime upgrade using the [Sudo pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_sudo/index.html){target=\_blank} (for development chains) or via on-chain governance (for production chains).

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} and connect to your node
2. Click on the **Developer** and select the **Extrinsics** option in the dropdown

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-02.webp) 

3. Prepare the **sudo** call:
    1. Select the **sudo** pallet
    2. Select the **sudo(call)** extrinsic from the list

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-03.webp) 

4. In the **sudo** call:
    1. Select the **system** call
    2. Select **setCode** extrinsic from the list

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-04.webp) 

5. For the `code` parameter, click **file upload** and select your WASM runtime file:
    - Use `parachain_template_runtime.compact.compressed.wasm` if available (smaller file)
    - Otherwise, use `parachain_template_runtime.wasm`

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-05.webp) 

6. Click **Submit Transaction** and sign the transaction with the sudo key

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-06.webp) 

!!!info "Using Governance (Production)"
    For production chains with governance enabled, you must follow the on-chain democratic process. This involves submitting a preimage of the new runtime code (using the Democracy pallet), referencing the preimage hash in a proposal, and then following your chain's governance process (such as voting and council approval) until the proposal passes and is enacted. This ensures that runtime upgrades are transparent and subject to community oversight.

## Verify the Upgrade

After the runtime upgrade extrinsic is included in a block, verify that the upgrade was successful.

### Check Runtime Version

1. In Polkadot.js Apps, navigate to the **Chain State** section
    1. Click the **Developer** dropdown
    2. Click the **Chain State** option

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-07.webp) 

2. Query runtime spec version
    1. Select the **System** pallet
    2. Select the **lastRuntimeUpgrade()** query

        ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-08.webp) 

3. Click the **+** button to query the current runtime version

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-09.webp) 

4. Verify that the `specVersion` matches your new runtime (should be `2` if you followed the example)

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-10.webp) 

### Test New Functionality

1. Navigate to **Developer > Extrinsics**
2. Select your custom pallet from the dropdown
3. You should now see the new `resetCounter` function available

    ![](/images/tutorials/polkadot-sdk/parachains/zero-to-hero/runtime-upgrade/runtime-upgrade-11.webp) 

Now, you can test the new functionality:

- First, increment the counter using your existing function
- Then use the new reset function (note: you'll need sudo/root privileges)
- Verify the counter value is reset to 0

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Deploy on Paseo TestNet__

    ---

    Deploy your Polkadot SDK blockchain on Paseo! Follow this step-by-step guide for a seamless journey to a successful TestNet deployment.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/parachains/zero-to-hero/deploy-to-testnet/)

</div>