---
title: Replay XCMs
description: Learn how to replay and analyse XCMs using Chopsticks with full logging enabled. Diagnose issues, trace message flow, and debug complex cross-chain interactions.
---

# Replay XCMs Using Chopsticks

## Introduction

[Chopsticks](https://github.com/AcalaNetwork/chopsticks) is a tool for forking live Polkadot SDK-based chains in a local environment. If you're new to it, check out the [Get Started](../get-started/) guide.

This tutorial focuses specifically on **replaying XCMs**, a powerful technique for:

* [Debugging cross-chain message failures](/develop/interoperability/test-and-debug/)
* Tracing execution across relay chains and parachains
* Analysing weight usage, error types, and message flow

## Prerequisites

Before replaying XCMs, ensure you have completed the [Chopsticks setup instructions](../get-started/) and can run a local fork of your target chain.

You will need:

* A working Chopsticks installation (`npm i -g @acala-network/chopsticks`)
* Access to the **endpoint or genesis file** of the parachain you wish to fork
* The block number or hash at which the XCM was sent
* Optionally, a Chopsticks config file to simplify repeated setups

If you have not forked a chain before, see the [Fork a Chain with Chopsticks guide](/tutorials/polkadot-sdk/testing/fork-live-chains/).

## Step-by-Step Guide

### 0. Project Setup

Begin by creating a dedicated directory for your replay environment and installing the required tools:

```bash
mkdir -p ~/projects/replay-xcm-tests
cd ~/projects/replay-xcm-tests
npm init -y
npm i -g @acala-network/chopsticks@latest
npm i polkadot-api
```

This sets up a clean workspace and ensures you are using the latest version of Chopsticks.

### 1. Capture the XCM to Replay

To replay a specific XCM, identify:

* The source and destination chains involved
* The block number or height at which the XCM was sent
* Optionally, the call payload (if you plan to simulate it manually via development commands)

You can use [Polkadot.js Apps](/tutorials/polkadot-sdk/testing/fork-live-chains/#use-polkotdotjs-apps) or indexers such as [Subscan](https://polkadot.subscan.io/xcm_dashboard) to locate and inspect the original XCM execution.

### 2. Fork the Relevant Chains

Use Chopsticks to [fork the required chains](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing) at the appropriate block heights.

#### a) Set the Block Numbers

Create/edit a `.env` file with the block heights for each chain. These should be **just before** the XCM is sent to allow a full replay:

```env
POLKADOT_BLOCK_NUMBER=26481107
POLKADOT_ASSET_HUB_BLOCK_NUMBER=9079591
ACALA_BLOCK_NUMBER=8826385
```

#### b) Enable Logging and Wasm Override

Full execution logs only work if the runtime was compiled with logging enabled. Most live chains are built using the `production` profile, which disables logs. You need to override the Wasm with a `release` build.

1. **Clone and build the Polkadot runtime**:

```bash
mkdir -p ~/projects && cd ~/projects
git clone git@github.com:polkadot-fellows/runtimes.git
cd runtimes
cargo build --release -p polkadot-runtime
```

2. **Copy the compiled Wasm to your working directory**:

```bash
mkdir -p ~/projects/replay-xcm-tests/wasms
cp target/release/wbuild/polkadot-runtime/polkadot_runtime.compact.compressed.wasm ~/projects/replay-xcm-tests/wasms/
```

3. **Download and modify a config file**:

```bash
cd ~/projects/replay-xcm-tests
mkdir -p configs
wget https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml -O configs/polkadot-override.yaml
```

Edit `configs/polkadot-override.yaml` to include:

```yaml
runtime-log-level: 5
wasm-override: wasms/polkadot_runtime.compact.compressed.wasm
```

#### c) Launch Chopsticks

Start the forked chains using your custom config:

```bash
npx @acala-network/chopsticks xcm \
  -r configs/polkadot-override.yaml \
  -p polkadot-asset-hub \
  -p acala
```

This will launch the relay chain and parachains locally, with full logging enabled for runtime execution. For other chains, follow similar steps using the corresponding runtime to enable logging support.

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

  await new Promise<void>(async (resolve) => {
    const unsub = await tx.signAndSend(alice, ({ status, events, dispatchError }) => {
      if (status.isInBlock) {
        console.log('📦 Included in block:', status.asInBlock.toHex());
      } else if (status.isFinalized) {
        console.log('✅ Finalised in block:', status.asFinalized.toHex());
        unsub();
        resolve();
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
  });

  await api.disconnect();
}

main().catch(console.error);
```

#### How to Run

1. Save the script as `send-xcm.ts`
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
* You're connected to a chain that has `pallet-xcm` (e.g. a Polkadot Asset Hub fork)

## Conclusion

Replaying XCMs with full logging provides fine-grained control and visibility into cross-chain message behaviour. Chopsticks makes this possible in a safe, local environment – empowering developers to:

* Debug complex message flows
* Identify root causes of XCM failures
* Improve observability for future integrations

## Additional Resources

<div class="subsection-wrapper">
  <div class="card">
    <a href="https://github.com/AcalaNetwork/chopsticks/" target="_blank">
      <h2 class="title">Chopsticks Repository</h2>
      <hr>
      <p class="description">View the official Chopsticks GitHub repository.</p>
    </a>
  </div>
  <div class="card">
    <a href="/develop/interoperability/intro-to-xcm/">
      <h2 class="title">Polkadot XCM Docs</h2>
      <hr>
      <p class="description">Learn how to use XCM effectively.</p>
    </a>
  </div>
</div>
