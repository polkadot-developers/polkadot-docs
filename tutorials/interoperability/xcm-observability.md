---
title: XCM Observability
description: This guide explains how to trace, correlate and debug cross-chain XCMs using observability features enhanced in the Polkadot SDK.
---

# XCM Observability

## Introduction

This guide explains how to **trace, correlate and debug cross-chain XCMs** using observability features enhanced in the Polkadot SDK.

You will learn how to:

- Use `SetTopic` and `message_id` to track XCMs across multiple chains
- Match `PolkadotXcm.Sent` and `MessageQueue.Processed` events to understand message flow
- Apply manual topic tagging for reliable tracking across hops
- Use the workaround for older runtimes that emit derived message identifiers
- Interpret and handle failed or incomplete messages

To demonstrate these techniques, the guide introduces a complete example scenario involving a multi-chain XCM transfer. This scenario will serve as the foundation for explaining message lifecycle, event tracking and failure debugging in context.

## Prerequisites

Before you begin, make sure you have:

- [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/){target=\_blank} installed (`npm i -g @acala-network/chopsticks`)
- Access to the endpoint or genesis file of the parachain you want to fork

If you haven't replayed or dry-run XCMs before, see the [Replay and Dry Run XCMs Using Chopsticks](/tutorials/interoperability/replay-and-dry-run-xcms/){target=\_blank} tutorial for step-by-step guidance.

## Understanding the Basics

When sending XCMs using `limited_reserve_transfer_assets` or other extrinsics from the `PolkadotXcm` pallet, two key observability features enable developers to trace and correlate messages across chains:

- [`SetTopic([u8; 32])`](https://github.com/polkadot-fellows/xcm-format#settopic){target=\_blank}: An XCM instruction that sets the **Topic Register**. This 32-byte value becomes the `message_id`, which appears in both the `PolkadotXcm.Sent` and `MessageQueue.Processed` events. It allows logical grouping and filtering of related messages across one or more hops.

  > ⚠️ **Note**: The topic is **not guaranteed to be unique**. If uniqueness is required (e.g. for deduplication or message tracking), it must be enforced by the message creator.

- `message_id`: A hash emitted in both the [`PolkadotXcm.Sent`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Event.html#variant.Sent){target=\_blank} event (on the origin chain) and the [`MessageQueue.Processed`](https://paritytech.github.io/polkadot-sdk/master/pallet_message_queue/pallet/enum.Event.html#variant.Processed){target=\_blank} event (on the destination chain). While not globally unique, it is sufficient to match a `Sent` message with its corresponding `Processed` result.

These features are available in runtimes built from **`stable2503-5` or later**.

### Key Behaviours

- The runtime **automatically appends** a `SetTopic` instruction at the end of the XCM, if it is not already included. See: [`WithUniqueTopic`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_builder/struct.WithUniqueTopic.html){target=\_blank}

- When using high-level extrinsics such as `limited_reserve_transfer_assets`, you do **not** need to include `SetTopic` manually. The runtime will insert it for you.

- If you are constructing an XCM manually using the `execute` call, you **can provide your own** `SetTopic([u8; 32])`:

    - If a topic is already set, the runtime will **not override** it.
    - `SetTopic` **must be the final instruction** in the list. Placing it elsewhere will result in it being ignored during execution.

- On newer runtimes, the same topic is preserved throughout a multi-hop transfer. This ensures consistent correlation of the `message_id` between origin and destination, even across multiple chains.

## Define a Scenario: XCM Flow with Implicit `SetTopic`

We will examine the full lifecycle of a cross-chain message from Polkadot Asset Hub to Hydration, using the `limited_reserve_transfer_assets` extrinsic.

- **Origin chain**: Polkadot Asset Hub
- **Destination chain**: Hydration
- **Extrinsic**: `limited_reserve_transfer_assets`
- **Goal**: Transfer DOT and trace the XCM using its emitted `message_id`

This scenario demonstrates how a `SetTopic` is included or generated, how to identify matching `Sent` and `Processed` events, and how to interpret failures using runtime logs.

### Launch a Fork for Local Testing

To see XCM tracing in action, fork the relevant chains locally using Chopsticks.

→ See the [Fork a Chain with Chopsticks guide](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} for step-by-step instructions.

Start the local environment:

```bash
npx @acala-network/chopsticks xcm \
    -r polkadot \
    -p polkadot-asset-hub \
    -p hydradx
```

### Execute the Transfer

This example uses the `PolkadotXcm.limited_reserve_transfer_assets` extrinsic to initiate a DOT transfer from Polkadot Asset Hub to Hydration.

The runtime automatically appends a `SetTopic` instruction to the forwarded XCM. This topic becomes the `message_id` used in both `Sent` and `Processed` events, enabling traceability without manual intervention.

Before running the script, add the descriptors:

```bash
npx papi add assetHub -w ws://localhost:8000
npx papi add hydration -w ws://localhost:8001
```

Then execute the TypeScript script:

```ts
--8<-- 'code/tutorials/interoperability/xcm-observability/limited-reserve-transfer-assets.ts'
```

Run it locally:

```bash
npx tsx limited-reserve-transfer-assets.ts
```

#### Forwarded XCM (Destination Chain: Hydration)

During execution, the runtime adds a `SetTopic` instruction automatically. This topic is carried through to the destination chain and becomes the basis for event correlation:

--8<-- 'code/tutorials/interoperability/xcm-observability/forwarded-xcm.html'

This forwarded message is then processed on Hydration, where the `id` is emitted in the `MessageQueue.Processed` event. 

> Note: The value of `SetTopic` generated during a dry-run may differ from the one in the actual execution.

### Track the Message Across Chains

After submitting the transfer, use the `message_id` to correlate the origin and destination events.

The runtime automatically inserts a `SetTopic` instruction (if not manually provided), and the resulting topic is emitted as `message_id` in:

| Chain                               | Event                    | Field        | Description                                                                |
|-------------------------------------|--------------------------|--------------|----------------------------------------------------------------------------|
| Origin (e.g. Asset Hub)             | `PolkadotXcm.Sent`       | `message_id` | Message ID from `SetTopic`. Appended automatically if missing.             |
| Destination (e.g. Acala, Hydration) | `MessageQueue.Processed` | `id`         | Matches `message_id` from the origin chain, enabling reliable correlation. |

These two fields now match on new runtimes (`stable2503-5` or later).

> ⚠️ Do not rely on [`XcmpQueue.XcmpMessageSent`](https://paritytech.github.io/polkadot-sdk/master/cumulus_pallet_xcmp_queue/pallet/enum.Event.html#variant.XcmpMessageSent){target=\_blank}. Its `message_hash` is not derived from `SetTopic` and is not suitable for cross-chain tracking.

#### Example: Message Trace Output

--8<-- 'code/tutorials/interoperability/xcm-observability/limited-reserve-transfer-assets-result.html'

## Define a Scenario: Multi-Hop XCM with Manual `SetTopic`

In complex XCM flows, such as multi-hop transfers that span multiple parachains, you may want to use `SetTopic` to **consistently trace the message across all involved chains**.

* **Origin chain**: Polkadot Asset Hub
* **Destination chain**: Hydration
* **Topic assignment**: Manually set via `SetTopic` instruction
* **Goal**: Transfer DOT and trace the XCM using the manually assigned `message_id`

Setting a `SetTopic` is optional. If you don't explicitly define one, the runtime will automatically generate a topic ID based on the message content (see [XCM Flow with Implicit `SetTopic`](#define-a-scenario-xcm-flow-with-implicit-settopic)). If you require custom end-to-end traceability, you may use `SetTopic` to assign `message_id`.

Before running the script, add the descriptors:

```bash
npx papi add assetHub -w ws://localhost:8000
npx papi add hydration -w ws://localhost:8001
```

Then execute the TypeScript script:

```ts
--8<-- 'code/tutorials/interoperability/xcm-observability/multi-hop-with-set-topic.ts'
```

Run it locally:

```bash
npx tsx multi-hop-with-set-topic.ts
```

#### Forwarded XCM (Destination Chain: Hydration)

During execution, the runtime adds a `SetTopic` instruction with the customised topic, which is carried across the chains:

--8<-- 'code/tutorials/interoperability/xcm-observability/forwarded-xcm-custom.html'

#### Example: Message Trace Output

--8<-- 'code/tutorials/interoperability/xcm-observability/multi-hop-with-set-topic-result.html'

## Workaround for Older Runtimes

* On **older runtimes** (prior to `stable2503-5`), the `message_id` seen in downstream `Processed` events is **not the original topic hash**, but rather a **derived `forwarded_id`**.
* This `forwarded_id` is computed as:

```rust
fn forward_id_for(original_id: &XcmHash) -> XcmHash { 
    (b"forward_id_for", original_id).using_encoded(sp_io::hashing::blake2_256)
}
```

To reliably trace messages across **mixed-version chains**, indexers and tools should **check for both `original_id` and its forwarded form**.

```ts
--8<-- 'code/tutorials/interoperability/xcm-observability/forward-id-for.ts'
```

* ✅ **New runtimes**:
  `message_id == original_id`

* ⚠️ **Old runtimes**:
  `message_id == blake2_256("forward_id_for" + original_id)`

### Failure Event Handling

When an XCM fails, the entire execution is **rolled back**, so no failure events are emitted on-chain. However, you can still observe and debug the failure using two main approaches:

#### View Nested Errors from Indexers

Most indexers (and API responses) will show **nested dispatch errors** such as:

--8<-- 'code/tutorials/interoperability/xcm-observability/execution-with-error.html'

This output is available on runtimes from **`stable2506` or later**, and is often sufficient for identifying common issues like missing assets or execution limits.

#### Use Chopsticks for Full Error Logs

For deeper analysis:

- Use Chopsticks to **replay the message with logging enabled**
- See exactly **which instruction failed**, and why
- View full error chains like `FailedToTransactAsset`, or `AssetNotFound`

This is especially useful when dealing with:

- Multi-hop XCMs
- Custom asset locations
- Execution mismatches or weight issues

→ For replay setup, see [Replay and Dry Run XCMs Using Chopsticks](/tutorials/interoperability/replay-and-dry-run-xcms/){target=\_blank}.

#### Recommended Debugging Workflow

1. **Start with indexer or API output** to inspect dispatch errors.
2. If unclear, **replay using Chopsticks** to trace message steps.
3. **Inspect logs** to pinpoint the failing instruction and error.
4. Adjust asset location, weight, or execution logic accordingly.
