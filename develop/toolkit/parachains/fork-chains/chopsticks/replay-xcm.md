---
title: Replay XCMs
description: Learn how to replay and analyse XCMs using Chopsticks with full logging enabled. Diagnose issues, trace message flow, and debug complex cross-chain interactions.
---

# Replay XCMs Using Chopsticks

## Introduction

[Chopsticks](https://github.com/AcalaNetwork/chopsticks) is a tool for forking live Polkadot SDK-based chains in a local environment. If you're new to it, check out the [Get Started](../get-started/) guide.

This tutorial focuses specifically on **replaying XCMs with full logging enabled** – a powerful technique for:

* Debugging cross-chain message failures
* Tracing execution across relay chains and parachains
* Analysing weight usage, error types, and message flow

## Prerequisites

Before replaying XCMs, ensure you have completed the [Chopsticks setup instructions](../get-started/) and can run a local fork of your target chain.

You will need:

- A working Chopsticks installation (`npm i -g @acala-network/chopsticks`)
- Access to the **endpoint or genesis file** of the parachain you wish to fork
- The block number or hash at which the XCM was sent
- Optionally, a Chopsticks configuration file to simplify repeated setups

If you have not forked a chain before, see the [Fork a Chain with Chopsticks guide](/tutorials/polkadot-sdk/testing/fork-live-chains/).

## Step-by-Step Guide

### 1. Capture the XCM to Replay

To replay a specific XCM, you must know:

- The source and destination chains involved
- The XCM or block height where it was sent
- Optionally, the call payload (if simulating manually via dev commands)

You can use Polkadot.js Apps or indexers like Subscan to locate and review the original XCM execution.

### 2. Fork the Relevant Chains

Use Chopsticks to fork the involved chains at the relevant block(s):

```bash
npx @acala-network/chopsticks xcm \
--r polkadot \
--p asset-hub-polkadot \
--p moonbeam
````

Make sure to fork at blocks *before* the XCM is sent, so you can replay it in full.

### 3. Enable Full Logging

Pass the `--log trace` flag when launching Chopsticks to view all internal logs, including:

* XCM execution paths
* Frame events and logs
* Errors and weight usage

```bash
npx @acala-network/chopsticks xcm \
--r polkadot \
--p asset-hub-polkadot \
--p moonbeam \
--log trace
```

You can also inspect JSON-RPC logs using tools like `jq`, or redirect logs to a file:

```bash
... --log trace > xcm-debug.log
```

### 4. Replay the XCM

There are two approaches:

#### a) **Replay by Block**

If you know the block containing the XCM send or execution, you can run:

```bash
npx @acala-network/chopsticks run-block \
--endpoint wss://rpc.polkadot.io \
--block 17000000 \
--output-path ./xcm-output.json \
--html --open
```

This will replay the block and highlight storage diffs and logs.

#### b) **Send the XCM Manually**

Use the `dev.xcm.send` JSON-RPC method with Chopsticks to resend a previously captured message:

```bash
curl -H "Content-Type: application/json" -d '{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "dev.xcm.send",
  "params": [
    "1000", // Parachain ID
    {
      "V3": { "instructions": [ ... ] } // your XCM payload
    }
  ]
}' http://localhost:8000
```

You can find real XCM payloads from prior events, logs, or Subscan.

### 5. Interpret the Logs

Look for logs such as:

* `xcm::execute_instruction` or `xcm::attempt_execute_xcm`
* `frame_system::events`
* `xcmPallet::success` / `xcmPallet::fail`
* Any emitted `SetTopic` or `WeightConsumed` details

These help you trace how the message was processed and where it may have failed.

## Common Issues & Troubleshooting

### The XCM didn't execute

* Ensure the chains were forked at the correct block height
* Double-check the format of your XCM (version, instructions, encoding)

### Logs are missing or unclear

* Use `--log trace` to ensure all debug info is enabled
* Consider dumping logs to file and searching by `xcm` or `fail`

### No response from `dev.xcm.send`

* Ensure you're sending to the correct port for the parachain
* Check that you're using the correct JSON-RPC format and headers

## Conclusion

Replaying XCMs with full logging gives you fine-grained control and visibility into how cross-chain messages behave. Chopsticks makes this possible in a safe local environment, empowering developers to:

* Debug complex message flows
* Identify root causes of XCM failures
* Improve observability for future integrations

For further reading:

* [Polkadot XCM Docs](https://wiki.polkadot.network/docs/learn/xcm)
* [Chopsticks GitHub](https://github.com/AcalaNetwork/chopsticks)
* [Polkadot SDK Issue #6119: XCM Observability](https://github.com/paritytech/polkadot-sdk/issues/6119)

```