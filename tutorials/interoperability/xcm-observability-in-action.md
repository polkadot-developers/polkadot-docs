---
title: XCM Observability in Action
description: Learn how to trace, correlate, and debug cross-chain XCMs using observability features in the Polkadot SDK.
---

# XCM Observability in Action

## Introduction

Cross-Consensus Messaging (XCM) enables powerful interoperability in the Polkadot ecosystem, but tracing flows across multiple chains can be challenging in practice.

This tutorial walks through a **hands-on scenario**: sending assets between parachains and tracing the resulting XCM across origin and destination chains. Along the way, you will:

* Run example scripts that send and replay XCMs
* Learn how to capture `message_id` and [`SetTopic([u8; 32])`](https://github.com/polkadot-fellows/xcm-format#settopic){target=\_blank} for tracking
* Correlate [`PolkadotXcm.Sent`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Event.html#variant.Sent){target=\_blank} and [`MessageQueue.Processed`](https://paritytech.github.io/polkadot-sdk/master/pallet_message_queue/pallet/enum.Event.html#variant.Processed){target=\_blank} events in practice
* Debug failures using indexers and Chopsticks replay

For background concepts and best practices, see the companion page: [XCM Observability](/develop/interoperability/xcm-observability){target=\_blank}.

## Prerequisites

Before you begin, make sure you've:

- [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/){target=\_blank} installed
- Access to local or remote parachain endpoints
- The origin chain running runtime **`stable2503-5`** or later
- A TypeScript development environment with essential tools
- Familiarity with replaying or dry-running XCMs

If you're new to XCM replay or dry-run, see [Replay and Dry Run XCMs Using Chopsticks](/tutorials/interoperability/replay-and-dry-run-xcms/){target=\_blank}.

## Setting Up Your Workspace

1. Create a project directory:

    ```bash
    mkdir -p xcm-obs-demo && cd xcm-obs-demo
    ```

2. Install Chopsticks globally:

    ```bash
    npm install -g @acala-network/chopsticks@latest
    ```

3. Download 1.6.0 runtime, which is built from **`stable2503-5` or later**:

    ```bash
    mkdir -p wasms
    wget https://github.com/polkadot-fellows/runtimes/releases/download/v1.6.0/asset-hub-polkadot_runtime-v1006000.compact.compressed.wasm -O wasms/asset-hub-polkadot_v1.6.0.wasm
    ```

4. Download config of Polkadot Hub:

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

6. Fork the relevant chains locally using Chopsticks:

    ```bash
    npx @acala-network/chopsticks xcm -r polkadot -p configs/polkadot-hub-override.yaml -p hydradx
    ```

   → See the [Fork a Chain with Chopsticks guide](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} for detailed instructions.

7. Open a **new terminal** in the same folder and initialise a Node.js project:

    ```bash
    npm init -y && npm pkg set type="module"
    ```

8. Install TypeScript and Polkadot dependencies:

    ```bash
    npm install --save-dev typescript @types/node tsx
    npm install polkadot-api @polkadot-labs/hdkd @polkadot-labs/hdkd-helpers
    ```

9. Initialise TypeScript:

    ```bash
    npx tsc --init
    ```

10. Add descriptors:

    ```bash
    npx papi add assetHub -w ws://localhost:8000
    npx papi add hydration -w ws://localhost:8001
    ```

## Scenario 1: XCM Flow with Implicit `SetTopic`

### Overview

- **Origin:** Polkadot Hub
- **Destination:** Hydration
- **Extrinsic:** `limited_reserve_transfer_assets` (high-level)
- **Topic:** Automatically set by runtime

### Run the Script

Create and run `limited-reserve-transfer-assets.ts`:

```ts
--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/limited-reserve-transfer-assets.ts'
```

```bash
npx tsx limited-reserve-transfer-assets.ts
```

### Forwarded XCM Example

The runtime adds a `SetTopic` to the forwarded XCM automatically:

--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/forwarded-xcm.html'

### Trace Events

| Chain        | Event                    | Field        | Notes                                  |
|--------------|--------------------------|--------------|----------------------------------------|
| Polkadot Hub | `PolkadotXcm.Sent`       | `message_id` | Matches the topic in the forwarded XCM |
| Hydration    | `MessageQueue.Processed` | `id`         | Matches origin's `message_id`          |

> ⚠️ Dry run generated topics may differ from actual execution.

### Message Trace Output

--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/limited-reserve-transfer-assets-result.html'

## Scenario 2: XCM Transfer with Manual `SetTopic`

### Overview

- **Origin:** Polkadot Hub
- **Destination:** Hydration
- **Topic:** Manually assigned
- **Goal:** Guarantee traceability in custom multi-hop flows

### Run the Script

Create and run `deposit-reserve-asset-with-set-topic.ts`:

```ts
--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/deposit-reserve-asset-with-set-topic.ts'
```

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
- **Goal:** Trace entire multi-hop XCM chain consistently

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

## Workaround for Older Runtimes

* Runtimes prior to **`stable2503-5`** emit a **derived `forwarded_id`** instead of the original topic in downstream `Processed` events.
* The forwarded ID is calculated as:

```rust
fn forward_id_for(original_id: &XcmHash) -> XcmHash { 
    (b"forward_id_for", original_id).using_encoded(sp_io::hashing::blake2_256)
}
```

### Example

| Original `message_id` | Forwarded `message_id`                                        |
|-----------------------|---------------------------------------------------------------|
| `0x5c082b47...`       | `0xb3ae32fd...` == blake2_256("forward_id_for" + original_id) |

Tools and indexers tracing messages across mixed runtime versions should check **both** the original and forwarded IDs.

```ts
--8<-- 'code/tutorials/interoperability/xcm-observability-in-action/forward-id-for.ts'
```

## Troubleshooting on Running Scripts

### Processed Message ID is `undefined`

If you see the following error when running a script:

> ❌ Processed Message ID on Hydration is undefined. Please increase MAX_RETRIES.

This usually means that the message has not yet been processed within the default retry window.

Increase the `MAX_RETRIES` value in your script to give the chain more time:

```ts
const MAX_RETRIES = 8; // Increase for more retries
```

### `PolkadotXcm.Sent` Event Not Found

If you encounter an error indicating that `PolkadotXcm.Sent` is unavailable:

> ⚠️ PolkadotXcm.Sent is available in runtimes built from stable2503-5 or later.

Ensure that `wasm-override` is updated to runtime version 1.6.0+, or to any runtime built from `stable2503-5` or later.

For details on updating your workspace, see [Setting Up Your Workspace](#setting-up-your-workspace).