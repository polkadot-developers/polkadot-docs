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

To replay a specific XCM, you must identify:

* The source and destination chains involved
* The block number or height at which the XCM was sent
* Optionally, the call payload (if you plan to simulate it manually via development commands)

You can use [Polkadot.js Apps](/tutorials/polkadot-sdk/testing/fork-live-chains/#use-polkotdotjs-apps) or indexers such as [Subscan](https://polkadot.subscan.io/xcm_dashboard) to locate and review the original XCM execution.

### 2. Fork the Relevant Chains

Use Chopsticks to [fork](https://docs.polkadot.com/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing) the involved chains at the relevant block(s).

* Set the block numbers for each chain in a `.env` file
    * Ensure each block number *before* the XCM is sent, so you can replay it in full.

```env
POLKADOT_BLOCK_NUMBER=26481107
POLKADOT_ASSET_HUB_BLOCK_NUMBER=9079591
ACALA_BLOCK_NUMBER=8826385
```

* Launch Chopsticks using the chain config files
  * All config files should have `runtime-log-level: 5` set to enable detailed execution logs for debugging.

```bash
npx @acala-network/chopsticks xcm \
  --r polkadot \
  --p polkadot-asset-hub \
  --p acala
```

### 3. Replay the XCM

```ts
import { ApiPromise, WsProvider, Keyring } from '@polkadot/api';

async function main() {
  const provider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider });

  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');

  const tx = api.tx.polkadotXcm.send(
          {
            V5: {
              parents: 1,
              interior: 'Here'
            }
          },
          {
            V5: [
              { SetTopic: '0x' + '00'.repeat(28) + '12345678' }
            ]
          }
  );

  console.log('Submitting extrinsic:', tx.toHuman());

  const unsub = await tx.signAndSend(alice, ({ status, events, dispatchError }) => {
    if (status.isInBlock) {
      console.log('📦 Included in block:', status.asInBlock.toHex());
    } else if (status.isFinalized) {
      console.log('✅ Finalized in block:', status.asFinalized.toHex());
      unsub();
    }

    if (dispatchError) {
      if (dispatchError.isModule) {
        const decoded = api.registry.findMetaError(dispatchError.asModule);
        console.error('❌ Dispatch error:', decoded.section, decoded.name);
      } else {
        console.error('❌ Dispatch error:', dispatchError.toString());
      }
    }

    for (const { event } of events) {
      console.log('📣 Event:', event.section, event.method, event.data.toHuman());
    }
  });
}

main().catch(console.error).finally(() => process.exit());
```

#### How to Run

1. Save as `send-xcm.ts`
2. Install dependencies:

```bash
npm install @polkadot/api
```

3. Run the script:

```bash
npx ts-node send-xcm.ts
```

Make sure:

* Chopsticks is running on port `8000`
* You're on a chain that supports `polkadotXcm.send` (e.g. `statemint` / Asset Hub fork)

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