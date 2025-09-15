---
title: XCM Observability in Action
description: Follow this step-by-step guide to trace, correlate, and debug cross-chain XCMs using observability tools in the Polkadot SDK.
---

# XCM Observability in Action

## Introduction

Cross-Consensus Messaging (XCM) enables interoperability within the Polkadot ecosystem; however, tracing flows across multiple chains is challenging in practice.

Follow this tutorial to send assets between parachains and trace the resulting XCM across the origin and destination chains. By completing this tutorial, you will:

- Capture `message_id` and [`SetTopic([u8; 32])`](https://github.com/polkadot-fellows/xcm-format#settopic){target=\_blank} for tracking.
- Correlate [`PolkadotXcm.Sent`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Event.html#variant.Sent){target=\_blank} and [`MessageQueue.Processed`](https://paritytech.github.io/polkadot-sdk/master/pallet_message_queue/pallet/enum.Event.html#variant.Processed){target=\_blank} events across chains.
- Apply manual topic tagging for custom multi-hop flows.

## Prerequisites

Before you begin, ensure you have the following:

- [Node.js and npm installed](https://nodejs.org/en/download){target=\_blank}.
- [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/){target=\_blank} installed.
- Access to local or remote parachain endpoints.
- An origin chain running runtime `stable2503-5` or later.
- A TypeScript development environment with essential tools.
- Familiarity with [replaying or dry-running XCMs](/tutorials/interoperability/replay-and-dry-run-xcms/){target=\_blank}.

## Set Up Your Workspace

1. Run the following command to create a new project directory:

    ```bash
    mkdir -p xcm-obs-demo && cd xcm-obs-demo
    ```

2. Install Chopsticks globally using the command:

    ```bash
    npm install -g @acala-network/chopsticks@latest
    ```

3. Next, use the following command to download the 1.6.0 runtime, which is built from `stable2503-5` or later:

    ```bash
    mkdir -p wasms
    wget https://github.com/polkadot-fellows/runtimes/releases/download/v1.6.0/asset-hub-polkadot_runtime-v1006000.compact.compressed.wasm -O wasms/asset-hub-polkadot_v1.6.0.wasm
    ```

4. Download the config for Polkadot Hub:

    ```bash
    mkdir -p configs
    wget https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot-asset-hub.yml -O configs/polkadot-hub-override.yaml
    ```

5. Edit `configs/polkadot-hub-override.yaml` to include:

    ```yaml title="configs/polkadot-hub-override.yaml"
    ...
    db: ./db.sqlite
    wasm-override: wasms/asset-hub-polkadot_v1.6.0.wasm
    
    import-storage:
    ...
    ```

6. Use the following command to fork the relevant chains locally using Chopsticks:

    ```bash
    npx @acala-network/chopsticks xcm -r polkadot -p configs/polkadot-hub-override.yaml -p hydradx
    ```

    !!! tip
   
        See the [Fork a Chain with Chopsticks](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} guide for detailed instructions.

7. Open a new terminal in the same folder and initialize a Node.js project:

    ```bash
    npm init -y && npm pkg set type="module"
    ```

8. Install TypeScript and Polkadot dependencies:

    ```bash
    npm install --save-dev typescript @types/node tsx
    npm install  polkadot-api @polkadot-labs/hdkd @polkadot-labs/hdkd-helpers
    npm install @noble/hashes
    ```

9. Initialize TypeScript using the command:

    ```bash
    npx tsc --init
    ```

10. Add descriptors:

    ```bash
    npx papi add assetHub -w ws://localhost:8000
    npx papi add hydration -w ws://localhost:8001
    ```

## XCM Flow with Implicit `SetTopic`

Assume the following values for this scenario:

- **Origin**: Polkadot Hub
- **Destination**: Hydration
- **Extrinsic**: `limited_reserve_transfer_assets` (high-level)
- **Topic**: Set automatically by the runtime

Follow these steps to complete the implicit `SetTopic` flow:

1. Create a file named `limited-reserve-transfer-assets.ts` and add the following code: 

    ```ts
    --8<-- 'code/tutorials/interoperability/xcm-observability-in-action/limited-reserve-transfer-assets.ts'
    ```

2. Run your script with the following command:

    ```bash
    npx tsx limited-reserve-transfer-assets.ts
    ```

3. You will see terminal output similar to the following:

    --8<-- 'code/tutorials/interoperability/xcm-observability-in-action/limited-reserve-transfer-assets-result.html'

### Forwarded XCM Example

The runtime adds a `SetTopic` to the forwarded XCM automatically:

--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/forwarded-xcm.html'

### Trace Events

| Chain        | Event                    | Field        | Notes                                  |
|--------------|--------------------------|--------------|----------------------------------------|
| Polkadot Hub | `PolkadotXcm.Sent`       | `message_id` | Matches the topic in the forwarded XCM |
| Hydration    | `MessageQueue.Processed` | `id`         | Matches origin's `message_id`          |

!!! note
    Dry run-generated topics may differ from actual execution.

## XCM Flow with Manual `SetTopic`

Assume the following values for this scenario:

- **Origin**: Polkadot Hub
- **Destination**: Hydration
- **Topic**: Manually assigned
- **Goal**: Ensure traceability in custom multi-hop flows

Follow these steps to complete the manual `SetTopic` flow:

1. Create a new file named `deposit-reserve-asset-with-set-topic.ts` and add the following code:

    ```ts
    --8<-- 'code/tutorials/interoperability/xcm-observability-in-action/deposit-reserve-asset-with-set-topic.ts'
    ```

2. Run your script with the following command:

    ```bash
    npx tsx deposit-reserve-asset-with-set-topic.ts
    ```

### Forwarded XCM Example

Your manual `SetTopic` is preserved by the runtime:

--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/forwarded-xcm-custom-topic.html'

### Message Trace Output

--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/deposit-reserve-asset-with-set-topic-result.html'

## Scenario 3: Multi-hop XCM Transfer with Manual `SetTopic`

### Overview

- **Origin:** Polkadot Hub
- **Destination:** Hydration
- **Topic:** Manually assigned and preserved over multiple hops (including remote XCMs)
- **Goal:** Enable consistent tracing across multi-hop XCM flows

### Run the Script

Create and run `initiate-reserve-withdraw-with-set-topic.ts`:

```ts
--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/initiate-reserve-withdraw-with-set-topic.ts'
```

```bash
npx tsx initiate-reserve-withdraw-with-set-topic.ts
```

### Forwarded XCM Example (Hydration)

The runtime preserves your `SetTopic` throughout the multi-hop flow:

--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/forwarded-xcm-remote-topic.html'

### End-to-End Message Trace Output

The same `message_id` is present in all relevant events across chains:

--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/initiate-reserve-withdraw-with-set-topic-result.html'

## Troubleshooting on Running Scripts

### Processed Message ID is `undefined`

If you see the following error when running a script:

> ❌ Processed Message ID on Hydration is undefined. Try increasing MAX_RETRIES to wait for block finalisation.

This usually means that the message has not yet been processed within the default retry window.

Increase the `MAX_RETRIES` value in your script to give the chain more time:

```ts
const MAX_RETRIES = 8; // Number of attempts to wait for block finalisation
```

### `PolkadotXcm.Sent` Event Not Found

If you encounter an error indicating that `PolkadotXcm.Sent` is unavailable:

> ⚠️ PolkadotXcm.Sent is only available in runtimes built from stable2503-5 or later.

Ensure that `wasm-override` is updated to runtime version 1.6.0+, or to any runtime built from `stable2503-5` or later.

For details on updating your workspace, see [Setting Up Your Workspace](#setting-up-your-workspace).

## Summary

This guide demonstrated:

- How `SetTopic` and `message_id` enable tracing and correlating XCMs across chains
- How to interpret and debug XCM failure cases
- How to manually and automatically manage topics for multi-hop flows
- The legacy workaround for older runtimes with derived IDs

With these scenarios and debugging steps, you can confidently develop, trace, and troubleshoot XCM workflows across chains.

To learn more before you begin, see the companion page: [XCM Observability](/develop/interoperability/xcm-observability){target=\_blank}.