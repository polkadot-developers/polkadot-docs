---
title: Replay and Dry Run XCMs
description: Replay and dry-run XCMs using Chopsticks with full logging enabled. Diagnose issues, trace message flow, and debug complex cross-chain interactions.
---

# Replay and Dry Run XCMs Using Chopsticks

## Introduction

This guide demonstrates how to replay and dry-run XCMs using [Chopsticks](/reference/tools/chopsticks/){target=\_blank}, a powerful tool for forking live Polkadot SDK-based chains in your local environment. These techniques are essential for debugging cross-chain message failures, tracing execution across relay chains and parachains, analyzing weight usage and error types, and safely simulating XCMs without committing state changes.

By following this guide, you will learn how to set up a local fork, capture and replay real XCMs, and use dry-run features to diagnose and resolve complex cross-chain issues.

## Prerequisites

Before you begin, make sure you have:

- [Chopsticks](/reference/tools/chopsticks/){target=\_blank} installed
- Access to the endpoint or genesis file of the parachain you want to fork
- The block number or hash where the XCM was sent
- (Optional) A Chopsticks config file for repeated setups

## Set Up Your Project

Start by creating a dedicated workspace for your XCM replay and dry-run experiments:

1. Create a new directory and navigate into it:

    ```bash
    mkdir -p replay-xcm-tests
    cd replay-xcm-tests
    ```

2. Initialize a new Node project:

    ```bash
    npm init -y && npm pkg set type=module
    ```

3. Install Chopsticks globally (recommended to avoid conflicts with local installs):

    ```bash
    npm install -g @acala-network/chopsticks@latest
    ```

4. Install TypeScript and related tooling for local development:

    ```bash
    npm install --save-dev typescript @types/node tsx
    ```

5. Install the required Polkadot packages:

    ```bash
    npm install polkadot-api @polkadot-labs/hdkd @polkadot-labs/hdkd-helpers
    ```

6. Initialize the TypeScript config:

    ```bash
    npx tsc --init
    ```

## Capture the XCM to Replay

To replay a specific XCM, identify:

- The source and destination chains involved
- The block number or height where the XCM was sent
- Optionally, the call payload (if you plan to simulate it manually via development commands)

You can use Polkadot.js Apps, [papi console](https://dev.papi.how/){target=\_blank}, or indexers such as [Subscan](https://polkadot.subscan.io/xcm_dashboard){target=\_blank} to locate and inspect the original XCM execution.

## Fork the Relevant Chains

Use Chopsticks to fork the required chains at the appropriate block heights.

### Set the Block Numbers

Create or edit a `.env` file with the block heights for each chain. These should be just before the XCM is sent to allow a full replay:

```text title=".env"
POLKADOT_BLOCK_NUMBER=26481107
POLKADOT_HUB_BLOCK_NUMBER=9079591
ACALA_BLOCK_NUMBER=8826385
```

### Enable Logging and Wasm Override

Full execution logs only work if the runtime was compiled with logging enabled. Most live chains are built using the `production` profile, which disables logs. To enable logging, you'll need to override the Wasm with a locally built `release` or `debug` version. The `release` profile is faster to load in Chopsticks.

1. Clone the `polkadot-fellows/runtimes` repository:

    ```bash
    git clone git@github.com:polkadot-fellows/runtimes.git
    ```

2. Build the Polkadot Hub runtime:

    ```bash
    cd runtimes
    # Build with the `debug` profile (default): 
    # cargo build -p asset-hub-polkadot-runtime

    # Build with the `release` profile (faster to load in Chopsticks)
    cargo build --release -p asset-hub-polkadot-runtime
    ```

3. Copy the compiled Wasm to your working directory:

    ```bash
    # Assuming you're still in the `runtimes` directory
    mkdir -p ../wasms  # or your <replay-xcm-tests>/wasms path

    # Copy the compiled Wasm to your working directory:

    # If built with the `debug` profile:
    # cp target/debug/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.wasm ../wasms

    # If built with the `release` profile:
    cp target/release/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.compact.compressed.wasm ../wasms
    ```

4. Download and modify a config file:

    ```bash
    # Still in the `runtimes` directory
    cd .. # Return to your replay-xcm-tests root
    mkdir -p configs
    wget https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot-asset-hub.yml -O configs/polkadot-asset-hub-override.yaml
    ```

5. Edit `configs/polkadot-asset-hub-override.yaml` to include:

    ```yaml title="configs/polkadot-asset-hub-override.yaml"
    ...
    runtime-log-level: 5
    # wasm-override: wasms/asset_hub_polkadot_runtime.wasm                     # Uncomment if using the `debug` build
    wasm-override: wasms/asset_hub_polkadot_runtime.compact.compressed.wasm    # Use this if you built with `release`
    ...
    ```

6. Start the forked chains using your custom config:

    ```bash
    npx @acala-network/chopsticks xcm \
    -r polkadot \
    -p configs/polkadot-asset-hub-override.yaml \
    -p acala
    ```

    This command starts the relay chain and parachains locally with full runtime execution logs enabled. Once the chains are running, you should see output indicating that the following RPC endpoints are available:

    - Polkadot Hub RPC on `http://localhost:8000`
    - Acala RPC on `http://localhost:8001`
    - Polkadot RPC on `http://localhost:8002`

    You'll also see runtime logs such as:

    --8<-- 'code/chain-interactions/send-transactions/interoperability/debug-and-preview-xcms/launch-chopsticks.html'

## Identify and Extract the XCM

To replay an XCM, you'll first need to identify the exact extrinsic that triggered it. In this example, we'll use block 9079592 on the Polkadot Hub.

1. Find and open the block on Subscan to inspect its extrinsics and events. In this case, the block is [9079592](https://assethub-polkadot.subscan.io/block/9079592){target=\_blank}.

2. Copy the block hash. Look for the block hash at the top of the page. For block 9079592, the hash is:

    ```bash title="Block Hash"
    0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6
    ```

3. Explore and view the block in [Polkadot.js Apps](https://polkadot.js.org/apps){target=\_blank} using this direct link: [Block Hash Explorer](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot-asset-hub-rpc.polkadot.io#/explorer/query/0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6){target=\_blank}.

4. Locate and decode the XCM extrinsic. Once you've found the extrinsic (e.g., 9079592-2), extract and decode its call data. For example, the call data is:
   
    ```bash title="Call Data"
    0xad028400fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c820016a30461702adc48213e5c9ee4d15c5a481c578cb5cbc935f0bd11fe8aee489082a745ffbbe94282f91b67daa6cb44920d77c30849c1d25f5f6c3e59015a3e383440055040000011f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000
    ```

5. From the decoded view, copy the **hex-encoded call** (e.g. `0x1f08...0000`). You'll pass this into `api.txFromCallData(...)` to replay the XCM locally.

## Replay the XCM

Once your project is set up, you're ready to replay the XCM locally.

This is useful for:

- Diagnosing execution failures or weight limits
- Inspecting all emitted events
- Verifying behavior before submitting a real transaction

### Add the Polkadot Hub Descriptor

Add the Polkadot Hub descriptor to use type-safe APIs with PAPI:

```bash
npx papi add polkadotHub -w ws://localhost:8000
```

!!! note
    The script assumes the Polkadot Hub is served on `ws://localhost:8000`. If you're using a different port or configuration, update the WebSocket endpoint in the script or descriptor.

### Create a Replay Script

Create a file named `replay-xcm.ts` and add the following code to it:

```ts title="replay-xcm.ts"
--8<-- 'code/chain-interactions/send-transactions/interoperability/debug-and-preview-xcms/replay-xcm.ts'
```

### Execute the Replay Script

Ensure Chopsticks is running and serving a chain that includes `pallet-xcm`, such as a Polkadot Hub fork. Run the script:

```bash
npx tsx replay-xcm.ts
```

### Expected Output

You should see output similar to:

--8<-- 'code/chain-interactions/send-transactions/interoperability/debug-and-preview-xcms/replay-xcm-result.html'

## Dry Run the XCM

To simulate the XCM without actually sending it, you can use the `dry_run_call` method. This lets you check whether the XCM would succeed without modifying any state.

### Create a Dry Run Script

Assuming you have the `tx` transaction from the previous step, create a new script named `dry-run-call.ts` and add the following code to it:

```ts title="dry-run-call.ts"
--8<-- 'code/chain-interactions/send-transactions/interoperability/debug-and-preview-xcms/dry-run-call.ts'
```

Ensure your local Chopsticks fork is running and the ports match those used in the script.

### Execute the Dry Run Script

Run the script:

```bash
npx tsx dry-run-call.ts
```

If successful, the dry run confirms that the XCM would execute correctly:

--8<-- 'code/chain-interactions/send-transactions/interoperability/debug-and-preview-xcms/dry-run-success.html'

If it fails, you'll receive detailed error information:

--8<-- 'code/chain-interactions/send-transactions/interoperability/debug-and-preview-xcms/dry-run-failure.html'

For more information, see:

- [Dry Run Call](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/dry_run/trait.DryRunApi.html#method.dry_run_call){target=\_blank} to simulate a full extrinsic.
- [Dry Run XCM](https://paritytech.github.io/polkadot-sdk/master/xcm_runtime_apis/dry_run/trait.DryRunApi.html#method.dry_run_xcm){target=\_blank} to simulate a raw XCM.

## Review and Debug

Replaying XCMs with full logging provides fine-grained control and visibility into cross-chain message behavior. Chopsticks makes this possible in a safe, local environment, empowering developers to debug complex message flows, identify root causes of XCM failures, and improve observability for future integrations.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge external">External</span> **Chopsticks Repository**

    ---

    View the official Chopsticks GitHub repository.

    [:octicons-arrow-right-24: Get Started](https://github.com/AcalaNetwork/chopsticks/){target=\_blank}

- <span class="badge guide">Guide</span> **Get Started with XCM**

    ---

    Learn how to use XCM effectively for cross-chain communication.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/send-transactions/interoperability/transfer-assets-parachains/)

</div>
