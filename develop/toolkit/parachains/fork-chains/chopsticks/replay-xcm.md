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

This command launches the relay chain and parachains locally, with full runtime execution logging enabled. Once the chains are running, you should see output indicating that the following RPC endpoints are available:

* Polkadot Asset Hub RPC on http://localhost:8000
* Acala RPC on http://localhost:8001
* Polkadot RPC on http://localhost:8002

You’ll also see runtime logs such as:

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

### 3. Identify the XCM to Replay

To replay an XCM, you’ll first need to identify the exact extrinsic that triggered it. In this example, we’ll use **Block #9079592** on the **Polkadot Asset Hub**.

#### Step-by-step:

a) **Find the Block on Subscan**
   Open the block in Subscan to inspect its extrinsics and events:
   👉 [https://assethub-polkadot.subscan.io/block/9079592](https://assethub-polkadot.subscan.io/block/9079592)

b) **Copy the Block Hash**
   Look for the block hash at the top of the page. For Block #9079592, the hash is:

   ```
   0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6
   ```

c) **Explore in Polkadot-JS Apps**
   View the block in [Polkadot-JS Apps](https://polkadot.js.org/apps) using this direct link:
   👉 [Explorer → Block Hash](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot-asset-hub-rpc.polkadot.io#/explorer/query/0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6)

d) **Locate and Decode the XCM Extrinsic**
   Once you've identified the extrinsic (e.g. index `9079592-2`), use the hex call data to decode it:
   👉 [Decode Extrinsic](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot-asset-hub-rpc.polkadot.io#/extrinsics/decode/0xad028400fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c820016a30461702adc48213e5c9ee4d15c5a481c578cb5cbc935f0bd11fe8aee489082a745ffbbe94282f91b67daa6cb44920d77c30849c1d25f5f6c3e59015a3e383440055040000011f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000)

e) **Copy the Call Data**
   From the decoded view, copy the **hex-encoded call data**. You will use this later with `api.txFromCallData(...)` to replay the XCM in Chopsticks.

### 4. Replay the XCM

```ts
import { assetHub } from "@polkadot-api/descriptors";
import { Binary, createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { getPolkadotSigner } from "polkadot-api/signer";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

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

    const callData = Binary.fromHex(
        "0x1f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000"
    );
    const tx = await api.txFromCallData(callData);
    console.log("Executing XCM:", JSON.stringify(tx.decodedCall, toHuman, 2));

    await new Promise<void>((resolve) => {
        const subscription = tx.signSubmitAndWatch(aliceSigner).subscribe((ev) => {
            if (ev.type === "finalized" || (ev.type === "txBestBlocksState" && ev.found)) {
                console.log(`📦 Included in block #${ev.block.number}: ${ev.block.hash}`);

                if (!ev.ok) {
                    const dispatchError = ev.dispatchError;
                    if (dispatchError.type === "Module") {
                        const modErr: any = dispatchError.value;
                        console.error(`❌ Dispatch error in module: ${modErr.type} → ${modErr.value?.type}`);
                    } else {
                        console.error("❌ Dispatch error:", JSON.stringify(dispatchError, toHuman, 2));
                    }
                }

                for (const event of ev.events) {
                    console.log("📣 Event:", event.type, JSON.stringify(event.value, toHuman, 2));
                }

                console.log("✅ Process completed, exiting...");
                subscription.unsubscribe();
                resolve();
            }
        });
    });

    client.destroy();
}

main().catch(console.error);
```

#### How to Run

a) **Save the Script**

Create a file named `send-xcm.ts` and paste your script into it.

b) **Install Dependencies**

Install the required packages and add the Asset Hub descriptor:

```bash
npm i @polkadot/api
npm i polkadot-api
npx papi add assetHub -w ws://localhost:8000
```

c) **Run the Script**

* Make sure Chopsticks is running with Polkadot Asset Hub on port `8000`.
* You're connected to a chain that has `pallet-xcm` (e.g. a Polkadot Asset Hub fork)

Execute the script to replay the XCM:

```bash
npx ts-node send-xcm.ts
```

d) **What to Expect**

If everything is working, you'll see logs like:

```console
Executing XCM: {
  "type": "PolkadotXcm",
  "value": {
    "type": "limited_reserve_transfer_assets",
    "value": {
      "dest": { ... },
      "beneficiary": { ... },
      "assets": { ... },
      "fee_asset_item": 0,
      "weight_limit": {
        "type": "Unlimited"
      }
    }
  }
}
📦 Included in block #9079592: 0x227a11c64f6051ba2e090a13abd17e5f7581640a80f6c03fc2d43fac66ab7949
📣 Event: Balances {
  "type": "Upgraded",
  "value": { ... }
}
📣 Event: Balances {
  "type": "Withdraw",
  "value": { ... }
}
📣 Event: Assets {
  "type": "Transferred",
  "value": { ... }
}
📣 Event: PolkadotXcm {
  "type": "Attempted",
  "value": { ... }
}
📣 Event: Balances {
  "type": "Burned",
  "value": { ... }
}
📣 Event: Balances {
  "type": "Minted",
  "value": { ... }
}
📣 Event: PolkadotXcm {
  "type": "FeesPaid",
  "value": { ... }
}
📣 Event: XcmpQueue {
  "type": "XcmpMessageSent",
  "value": { ... }
}
📣 Event: PolkadotXcm {
  "type": "Sent",
  "value": { ... }
}
📣 Event: Balances {
  "type": "Deposit",
  "value": { ... }
}
📣 Event: TransactionPayment {
  "type": "TransactionFeePaid",
  "value": { ... }
}
📣 Event: System {
  "type": "ExtrinsicSuccess",
  "value": { ... }
}
✅ Process completed, exiting...
```

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
