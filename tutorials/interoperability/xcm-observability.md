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
- Interpret and handle failed or incomplete messages
- Apply manual topic tagging for reliable tracking across hops
- Use the workaround for older runtimes that emit derived message identifiers

To demonstrate these techniques, the guide introduces a complete example scenario involving a multi-chain XCM transfer. This scenario will serve as the foundation for explaining message lifecycle, event tracking and failure debugging in context.

## Prerequisites

Before you begin, make sure you have:

- [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/){target=\_blank} installed (`npm i -g @acala-network/chopsticks`)
- Access to the endpoint or genesis file of the parachain you want to fork
- The block number or hash where the XCM was sent
- (Optional) A Chopsticks config file for repeated setups

If you haven't replayed or dry-run XCMs before, see the [Replay and Dry Run XCMs Using Chopsticks](/tutorials/interoperability/replay-and-dry-run-xcms/){target=\_blank} tutorial for step-by-step guidance.

## Understanding the Basics

When sending XCMs using `limited_reserve_transfer_assets` or other extrinsics from the `PolkadotXcm` pallet, two key observability features enable you to trace and correlate messages across chains:

- [`SetTopic([u8; 32])`](https://github.com/polkadot-fellows/xcm-format?#settopic)
  An XCM instruction that sets the Topic Register. This 32-byte array becomes the `message_id`, which is recorded in both the `PolkadotXcm.Sent` and `MessageQueue.Processed` events. It allows logical grouping or filtering of related messages across multiple hops.

  > ⚠️ **Note**: The topic is **not guaranteed to be unique**. If uniqueness is required (for example, for deduplication or traceability), it must be enforced by the message creator.

- **`message_id`**
  A hash emitted in both the [`PolkadotXcm.Sent`](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Event.html#variant.Sent) event on the origin chain and the [`MessageQueue.Processed`](https://paritytech.github.io/polkadot-sdk/master/pallet_message_queue/pallet/enum.Event.html#variant.Processed) event on the destination chain. While this identifier is not globally unique, it is sufficient to match a `Sent` message with its corresponding `Processed` result.

These observability features are available in runtimes built from **`stable2503-5` or later**.

## Define a Scenario: DOT to Acala Transfer with Tracing

We will explore the full lifecycle of a cross-chain message from Polkadot Asset Hub to Acala, using the `limited_reserve_transfer_assets` extrinsic.

* **Origin Chain**: Polkadot Asset Hub
* **Destination Chain**: Acala
* **Extrinsic**: `limited_reserve_transfer_assets`
* **Goal**: Transfer DOT and trace the XCM message using the emitted `message_id`

This scenario will demonstrate how `SetTopic` is added (or generated), how to find matching `Sent` and `Processed` events, and how to debug execution failures if they occur.

## Step 1: Launch a Fork with Logging Enabled

To view full logs and track `SetTopic`, override the runtime with a locally built Wasm.

* Fork Polkadot Asset Hub and Acala at the relevant block heights
* Override the Wasm to enable logging
* Use a custom Chopsticks config to load your Wasm

→ See the detailed steps in [Replay and Dry Run XCMs Guide](https://docs.polkadot.com/tutorials/interoperability/replay-and-dry-run-xcms/).

## Step 2: Execute the Transfer with `SetTopic`

We execute a script that sends DOT to Acala with an optional manually defined `SetTopic`.

```ts
--8<-- 'code/develop/toolkit/parachains/fork-chains/chopsticks/replay-and-dry-run-xcms/limited-reserve-transfer-assets.ts'
```

You can run this script with:

```bash
npx tsx limited-reserve-transfer-assets.ts
```

## Step 3: Track the Message Across Chains

After submission, you can match events using the `message_id`:

| Chain              | Event                    | Field        | Notes                                  |
| ------------------ | ------------------------ | ------------ | -------------------------------------- |
| Polkadot Asset Hub | `PolkadotXcm.Sent`       | `message_id` | Emitted automatically or from SetTopic |
| Acala              | `MessageQueue.Processed` | `id`         | Matches message ID from origin chain   |

### Example Log Output

```bash
📣 Sent: 0xb4b8d2c8...
📣 Processed: 0xb4b8d2c8...
✅ Message ID matched
```

→ Matching confirms that the message was received and executed on the destination chain.

## Step 4: Debug Failures

If your XCM fails, you can debug using one of the following:

### View Nested Errors

Most indexers show the outermost error (e.g., `LocalExecutionIncompleteWithError`), which is often enough to understand basic failures.

### Use Chopsticks for Full Logs

With logging enabled, Chopsticks will show:

* Which instruction failed
* Full error chain (e.g., `FailedToTransactAsset`, `AssetNotFound`)
* Precise reason for rollback or halt

→ Useful for understanding weight failures, malformed assets, or execution mismatches.

## Step 5: Handle Older Runtimes

Older runtimes use a **derived `forwarded_id`** in `Processed` events instead of the original topic hash.

```ts
// Calculate forwarded ID for legacy chains
const input = u8aConcat(stringToU8a("forward_id_for"), messageIdBytes);
const forwardedId = blake2AsU8a(input);
```

→ Tools must check both the `original_id` and `forwarded_id` when indexing older chains.

## Additional Samples

After learning the concepts above, you can explore other scenarios:

### `multiple-hops-sample-01.ts`

Transfers assets across multiple chains with auto-generated `SetTopic`.

### `multiple-hops-sample-02.ts`

Transfers assets and explicitly sets a known `SetTopic` for full tracking across multiple hops.

### `hydration-sample1.ts`

Simulates a swap using DOT on Hydration, then returns funds back to the origin.

→ Run each script using `npx tsx <script>.ts`

Each sample includes inline comments and tracking info relevant to its use case.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> __Polkadot XCM Docs__

    ---

    Learn how to use XCM effectively.

    [:octicons-arrow-right-24: Get Started](/develop/interoperability/intro-to-xcm/)

-   <span class="badge tutorial">Tutorial</span> __Replay and Dry Run XCMs__

    ---

    Learn how to replay and dry run XCMs.

    [:octicons-arrow-right-24: Get Started](/tutorials/interoperability/replay-and-dry-run-xcms/)


</div>
