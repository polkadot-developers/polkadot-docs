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
npm i --save-dev typescript @types/node
npm i --save-dev tsx
npm i @polkadot/api
npm i polkadot-api
npx tsc --init
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

1. **Clone and build the Polkadot Asset Hub runtime**:

```bash
mkdir -p ~/projects && cd ~/projects
git clone git@github.com:polkadot-fellows/runtimes.git
cd runtimes
cargo build --release -p asset-hub-polkadot-runtime
```

2. **Copy the compiled Wasm to your working directory**:

```bash
mkdir -p ~/projects/replay-xcm-tests/wasms
cp target/release/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.compact.compressed.wasm ~/projects/replay-xcm-tests/wasms/
```

3. **Download and modify a config file**:

```bash
cd ~/projects/replay-xcm-tests
mkdir -p configs
wget https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot-asset-hub.yml -O configs/polkadot-asset-hub-override.yaml
```

Edit `configs/polkadot-asset-hub-override.yaml` to include:

```yaml
runtime-log-level: 5
wasm-override: wasms/asset_hub_polkadot_runtime.compact.compressed.wasm
```

#### c) Launch Chopsticks

Start the forked chains using your custom config:

```bash
npx @acala-network/chopsticks xcm \
  -r polkadot \
  -p configs/polkadot-asset-hub-override.yaml \
  -p acala
```

After starting the forked chains using your custom config, you should see log output and available RPC endpoints like this:

* Polkadot Asset Hub RPC on http://localhost:8000
* Acala RPC on http://localhost:8001
* Polkadot RPC on http://localhost:8002

```console
        chopsticks::executor  TRACE: [0] Calling Metadata_metadata
        chopsticks::executor  TRACE: [1] Calling Metadata_metadata
[09:29:14.988] INFO: Polkadot Asset Hub RPC listening on http://[::]:8000 and ws://[::]:8000
    app: "chopsticks"
[09:29:14.988] INFO: Loading config file https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/acala.yml
    app: "chopsticks"
[09:29:15.984] INFO: Acala RPC listening on http://[::]:8001 and ws://[::]:8001
    app: "chopsticks"
[09:29:15.990] INFO (xcm): Connected parachains [1000,2000]
    app: "chopsticks"
[09:29:15.990] INFO: Loading config file https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot.yml
    app: "chopsticks"
        chopsticks::executor  TRACE: [2] Calling Metadata_metadata
        chopsticks::executor  TRACE: [2] Completed Metadata_metadata
[09:29:16.927] INFO: Polkadot RPC listening on http://[::]:8002 and ws://[::]:8002
    app: "chopsticks"
[09:29:16.984] INFO (xcm): Connected relaychain 'Polkadot' with parachain 'Polkadot Asset Hub'
    app: "chopsticks"
[09:29:17.028] INFO (xcm): Connected relaychain 'Polkadot' with parachain 'Acala'
    app: "chopsticks"
```

This will launch the relay chain and parachains locally, with full logging enabled for runtime execution. For other chains, follow similar steps using the corresponding runtime to enable logging support.

### 3. Replay the XCM

```ts
import { assetHub, AssetHubCalls, XcmV5Instruction, XcmV5Junction, XcmV5Junctions } from "@polkadot-api/descriptors";
import { Binary, createClient, Enum } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { getPolkadotSigner } from "polkadot-api/signer";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { Keyring } from "@polkadot/keyring";
import { blake2AsHex, cryptoWaitReady } from '@polkadot/util-crypto';

const toHuman = (_key: any, value: any) => {
    if (typeof value === 'bigint') {
        return Number(value);
    }

    if (value && typeof value === "object" && typeof value.asHex === "function") {
        return value.asHex();
    }

    return value;
};

async function main() {
    await cryptoWaitReady();
    const provider = withPolkadotSdkCompat(getWsProvider("ws://localhost:8000"));
    const client = createClient(provider);
    const api = client.getTypedApi(assetHub);

    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");
    const aliceSigner = getPolkadotSigner(alice.publicKey, "Sr25519", alice.sign);

    const message: AssetHubCalls['PolkadotXcm']['execute']['message'] = Enum("V5", [
        XcmV5Instruction.DescendOrigin(
            XcmV5Junctions.X1(XcmV5Junction.AccountId32({ id: Binary.fromBytes(alice.publicKey) }))
        ),
        XcmV5Instruction.SetTopic(Binary.fromHex(blake2AsHex("replay-xcm-tests-topic", 256))),
    ]);
    const weight: any = await api.apis.XcmPaymentApi.query_xcm_weight(message);
    if (weight.success !== true) {
        console.error("❌ Failed to query XCM weight:", weight.error);
        client.destroy();
        return;
    }
    const tx = api.tx.PolkadotXcm.execute({
        message,
        max_weight: weight.value,
    });
    console.log("Executing XCM:", JSON.stringify(tx.decodedCall, toHuman, 2));

    const result = await tx.signAndSubmit(aliceSigner);
    console.log(`✅ Finalised in block #${result.block.number}: ${result.block.hash}`);
    if (!result.ok) {
        const dispatchError = result.dispatchError;
        if (dispatchError.type === "Module") {
            const modErr: any = dispatchError.value;
            console.error("❌ Dispatch error in module:", modErr.type, modErr.value?.type);
        } else {
            console.error("❌ Dispatch error:", JSON.stringify(dispatchError, toHuman, 2));
        }
    }
    for (const event of result.events) {
        console.log("📣 Event:", event.type, JSON.stringify(event.value, toHuman, 2));
    }

    client.destroy();
}

main().catch(console.error);
```

#### How to Run

1. Save the script as `send-xcm.ts`
2. Install dependencies:

```bash
npm i @polkadot/api
npm i polkadot-api
npx papi add assetHub -w ws://localhost:8000
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
