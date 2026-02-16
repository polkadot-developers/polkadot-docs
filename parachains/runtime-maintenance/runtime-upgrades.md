---
title: Runtime Upgrades
description: Learn how to safely perform runtime upgrades for your Polkadot SDK-based blockchain, including step-by-step instructions.
tutorial_badge: Intermediate
categories: Parachains
---

# Runtime Upgrades

## Introduction

Upgrading the runtime of your Polkadot SDK-based blockchain is a fundamental feature that allows you to add new functionality, fix bugs, or improve performance without requiring a hard fork. Runtime upgrades are performed by submitting a special extrinsic that replaces the existing on-chain Wasm runtime code. This process is trustless, transparent, and can be executed either through governance or using sudo, depending on your chain's configuration.

This tutorial will guide you through the steps to prepare, submit, and verify a runtime upgrade for your parachain or standalone Polkadot SDK-based chain. You'll add a new dispatchable function to your custom pallet, bump the runtime version, build the new Wasm binary, and submit the upgrade through Polkadot.js Apps.

## Prerequisites

Before getting started, ensure you have done the following:

- Completed the [Install Polkadot SDK](/parachains/install-polkadot-sdk/){target=\_blank} guide
- Set up and run the parachain template by completing the [Set Up the Parachain Template](/parachains/launch-a-parachain/set-up-the-parachain-template/){target=\_blank} tutorial
- Created and integrated a custom pallet by completing the [Create a Custom Pallet](/parachains/customize-runtime/pallet-development/create-a-pallet/){target=\_blank} tutorial
- Access to [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer){target=\_blank} connected to your local node

## Start Your Chain

If you don't already have the parachain template running, start the Omni Node in development mode:

```bash
polkadot-omni-node --chain ./chain_spec.json --dev
```

Once the node is running and producing blocks, open [Polkadot.js Apps](https://polkadot.js.org/apps/#/explorer?rpc=ws://127.0.0.1:9944){target=\_blank} and connect it to your local node at `ws://127.0.0.1:9944`.

Verify your chain is operational. You should see `parachain-template-runtime/1` in the top left corner, indicating the chain is running with spec version `1`:

![Initial runtime version showing spec version 1 in the Polkadot.js Apps header](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-01.webp)

Keep this chain running in the background.

## Add a New Feature

Now, extend your existing custom pallet by adding a new dispatchable function to reset the counter to zero. This provides a meaningful upgrade that demonstrates new functionality.

Open your custom pallet's `lib.rs` file and add the following function inside the `#[pallet::call]` block, after the existing dispatchables:

```rust title="custom-pallet/src/lib.rs"
--8<-- 'code/parachains/runtime-maintenance/runtime-upgrades/reset_something.rs'
```

The `reset_counter` function is a Root-only operation that sets the counter value back to zero, regardless of its current state. This is useful for administrative purposes. Unlike the existing `increment` and `decrement` functions that any signed user can call, this reset function requires Root privileges, making it a controlled administrative action.

Ensure that your runtime compiles correctly:

```bash
cargo build --release
```

## Bump the Runtime Version

Before building the final Wasm binary, you must increment the `spec_version` in the runtime. This tells the chain's executor that the new runtime contains changes and should replace the current one.

Open `runtime/src/lib.rs` and find the `VERSION` constant. The current version looks like this:

```rust title="runtime/src/lib.rs"
--8<-- 'code/parachains/runtime-maintenance/runtime-upgrades/runtime_version.rs'
```

Change `spec_version` from `1` to `2`:

```rust title="runtime/src/lib.rs" hl_lines="6"
--8<-- 'code/parachains/runtime-maintenance/runtime-upgrades/runtime_version_v2.rs'
```

!!!warning
    Forgetting to bump `spec_version` is a common mistake. If you submit a runtime upgrade without incrementing this value, the chain will not recognize it as a new runtime and the upgrade will have no effect.

## Build the New Runtime

With the new feature added and the version bumped, build the runtime:

```bash
cargo build --release
```

After compilation, verify the Wasm binaries were generated:

--8<-- 'code/parachains/runtime-maintenance/runtime-upgrades/runtime-compilation.html'

You'll use the `.compact.compressed.wasm` file for the upgrade, as it's the smallest and most efficient format.

## Submit the Runtime Upgrade

Now submit the new runtime to the chain using the Sudo pallet through Polkadot.js Apps.

1. Open [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank} and connect to your node. Click on **Developer** and select **Extrinsics** from the dropdown

    ![Navigate to Developer then Extrinsics](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-02.webp)

2. Prepare the sudo call:

    1. Select the **sudo** pallet
    2. Select the **sudo(call)** extrinsic from the list

    ![Select the sudo pallet and sudo(call) extrinsic](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-03.webp)

3. In the sudo call:

    1. Select the **system** pallet
    2. Select the **setCode(code)** extrinsic from the list

    ![Select system pallet and setCode extrinsic](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-04.webp)

4. For the `code` parameter, click **file upload** and select the `parachain_template_runtime.compact.compressed.wasm` file from `target/release/wbuild/parachain-template-runtime/`

    ![Upload the Wasm file](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-05.webp)

5. Click **Submit Transaction** and sign the transaction with the sudo key

    ![Sign and submit the transaction](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-06.webp)

!!!info
    On production chains, runtime upgrades are submitted through governance rather than Sudo. The process involves a referendum where token holders vote to approve the upgrade.

After the transaction is included in a block, the runtime upgrade takes effect immediately.

## Verify the Upgrade

### Check Runtime Version

To confirm the upgrade was successful, navigate to the **Developer** dropdown and select **Chain State**. You should notice that the runtime version in the header has changed to `parachain-template-runtime/2`. In the recent events, you can see `parachainSystem.ValidationFunctionApplied` confirming the upgrade was applied:

![Explorer showing updated runtime version and upgrade events](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-07.webp)

Now query the on-chain runtime version:

1. Select the **system** pallet, then select **lastRuntimeUpgrade()** from the query dropdown, and click the **+** button

    ![Select system pallet and lastRuntimeUpgrade query](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-08.webp)

2. Click the **+** button to execute the query

    ![Click the plus button to query](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-09.webp)

3. The result should show `specVersion: 2`, confirming the upgrade was applied

    ![Verify specVersion is 2](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-10.webp)

### Test New Functionality

Navigate to **Developer** > **Extrinsics** and select your **customPallet**. You should now see the new `resetCounter` function available alongside the existing `increment`, `decrement`, and `setCounterValue` functions:

![Custom pallet showing the new resetCounter function](/images/parachains/runtime-maintenance/runtime-upgrades/runtime-upgrade-11.webp)

Now, you can test the new functionality:

1. Increment the counter using the existing `increment` function
2. Use the new `resetCounter` function (note: you'll need sudo/root privileges)
3. Verify the counter value is reset to `0`

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Storage Migrations__

    ---

    Learn how to write and manage storage migrations when runtime upgrades change how data is stored on-chain.

    [:octicons-arrow-right-24: Get Started](/parachains/runtime-maintenance/storage-migrations/)

-   <span class="badge tutorial">Tutorial</span> __Create a Custom Pallet__

    ---

    Learn how to build a custom pallet from scratch to add new functionality to your Polkadot SDK-based runtime.

    [:octicons-arrow-right-24: Get Started](/parachains/customize-runtime/pallet-development/create-a-pallet/)

</div>
