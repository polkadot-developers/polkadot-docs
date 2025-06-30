---
title: Replay and Dry Run XCMs
description: Learn how to replay and dry-run XCMs using Chopsticks with full logging enabled. Diagnose issues, trace message flow, and debug complex cross-chain interactions.
---

# Replay and Dry Run XCMs Using Chopsticks

## Introduction

[Chopsticks](https://github.com/AcalaNetwork/chopsticks) is a tool for forking live Polkadot SDK-based chains in a local environment. If you're new to it, check out the [Get Started](/develop/toolkit/parachains/fork-chains/chopsticks/get-started){target=\_blank} guide.

This tutorial focuses on **replaying and dry-running XCMs**, powerful techniques for:

* [Debugging cross-chain message failures](/develop/interoperability/test-and-debug/)
* Tracing execution across relay chains and parachains
* Analysing weight usage, error types, and message flow
* Simulating XCMs safely without committing state changes

## Prerequisites

Before replaying XCMs, ensure you've completed the [Chopsticks setup instructions](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#install-chopsticks){target=\_blank} and can run a local fork of your target chain.

You'll need:

* A working Chopsticks installation (`npm i -g @acala-network/chopsticks`)
* Access to the **endpoint or genesis file** of the parachain you wish to fork
* The block number or hash at which the XCM was sent
* Optionally, a Chopsticks config file to simplify repeated setups

If you've not forked a chain before, see the [Fork a Chain with Chopsticks guide](/tutorials/polkadot-sdk/testing/fork-live-chains/){target=\_blank} or [Fork a Network Locally using Chopsticks](https://wiki.polkadot.network/learn/learn-guides-test-opengov-proposals/#fork-a-network-locally-using-chopsticks){target=\_blank}.

## Step-by-Step Guide

### Project Setup

Begin by creating a dedicated directory for your replay environment and installing the required tools:

```bash
mkdir -p ~/projects/replay-xcm-tests
cd ~/projects/replay-xcm-tests
npm init -y
npm i -g @acala-network/chopsticks@latest
npm i --save-dev typescript @types/node tsx
npm i @polkadot/api polkadot-api
npx tsc --init
```

This sets up a clean workspace and ensures you're using the latest version of Chopsticks.

### Capture the XCM to Replay

To replay a specific XCM, identify:

* The source and destination chains involved
* The block number or height where the XCM was sent
* Optionally, the call payload (if you plan to simulate it manually via development commands)

You can use [Polkadot.js Apps](/tutorials/polkadot-sdk/testing/fork-live-chains/#use-polkotdotjs-apps) or indexers such as [Subscan](https://polkadot.subscan.io/xcm_dashboard) to locate and inspect the original XCM execution.

### Fork the Relevant Chains

Use Chopsticks to [fork the required chains](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing) at the appropriate block heights.

#### Set the Block Numbers

Create/edit a `.env` file with the block heights for each chain. These should be **just before** the XCM is sent to allow a full replay:

```env
POLKADOT_BLOCK_NUMBER=26481107
POLKADOT_ASSET_HUB_BLOCK_NUMBER=9079591
ACALA_BLOCK_NUMBER=8826385
```

#### Enable Logging and Wasm Override

Full execution logs only work if the runtime was compiled with logging enabled. Most live chains are built using the `production` profile, which disables logs. You need to override the Wasm with a `debug` build.

**Clone and Build the Polkadot Asset Hub Runtime**:

```bash
mkdir -p ~/projects && cd ~/projects
git clone git@github.com:polkadot-fellows/runtimes.git
cd runtimes
cargo build -p asset-hub-polkadot-runtime
```

**Copy the Compiled Wasm to Your Working Directory**:

```bash
mkdir -p ~/projects/replay-xcm-tests/wasms
cp target/debug/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.wasm ~/projects/replay-xcm-tests/wasms/
```

**Download and Modify a Config File**:

```bash
cd ~/projects/replay-xcm-tests
mkdir -p configs
wget https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot-asset-hub.yml -O configs/polkadot-asset-hub-override.yaml
```

Edit `configs/polkadot-asset-hub-override.yaml` to include:

```yaml
runtime-log-level: 5
wasm-override: wasms/asset_hub_polkadot_runtime.wasm
```

#### Launch Chopsticks

Start the forked chains using your custom config:

```bash
npx @acala-network/chopsticks xcm \
  -r polkadot \
  -p configs/polkadot-asset-hub-override.yaml \
  -p acala
```

This command starts the relay chain and parachains locally, with full runtime execution logs enabled. Once the chains are running, you should see output indicating that the following RPC endpoints are available:

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

### Identify the XCM to Replay

To replay an XCM, you’ll first need to identify the exact extrinsic that triggered it. In this example, we’ll use **Block #9079592** on the **Polkadot Asset Hub**.

#### Step-by-step:

**Find the Block on Subscan**

Open the block in Subscan to inspect its extrinsics and events:
👉 [https://assethub-polkadot.subscan.io/block/9079592](https://assethub-polkadot.subscan.io/block/9079592)

**Copy the Block Hash**

Look for the block hash at the top of the page. For Block #9079592, the hash is:

```text
0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6
```

**Explore in Polkadot-JS Apps**

View the block in [Polkadot-JS Apps](https://polkadot.js.org/apps) using this direct link:

👉 [Explorer → Block Hash](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot-asset-hub-rpc.polkadot.io#/explorer/query/0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6)

**Locate and Decode the XCM Extrinsic**

Once you've found the extrinsic (e.g. `9079592-2`), extract and decode its call data:

👉 [Decode Extrinsic](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot-asset-hub-rpc.polkadot.io#/extrinsics/decode/0xad028400fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c820016a30461702adc48213e5c9ee4d15c5a481c578cb5cbc935f0bd11fe8aee489082a745ffbbe94282f91b67daa6cb44920d77c30849c1d25f5f6c3e59015a3e383440055040000011f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000)

**Copy the Call Data**

From the decoded view, copy the **hex-encoded call data** (e.g. `0x1f08...0000`). You'll pass this into `api.txFromCallData(...)` to replay the XCM locally.

### Replay the XCM

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

**Save the Script**

Create a file named `replay-xcm.ts` and paste your script into it.

**Install Dependencies**

Install the required packages and add the Asset Hub descriptor:

```bash
npm i @polkadot/api polkadot-api
npx papi add assetHub -w ws://localhost:8000
```

**Run the Script**

* Make sure Chopsticks is running with Polkadot Asset Hub on port `8000`.
* You're connected to a chain that has `pallet-xcm` (e.g. a Polkadot Asset Hub fork)

Execute the script to replay the XCM:

```bash
npx ts-node replay-xcm.ts
```

**What to Expect**

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

## Dry Run the XCM

To simulate the XCM without actually sending it, you can use the `dry_run_call` method. This lets you check whether the XCM would succeed without modifying any state.

Assuming you've the `tx` transaction from the previous step, you can perform a dry run like this:

```ts
const XCM_VERSION = 5;
const origin = Enum("system", Enum("Signed", alice.address));
const dryRunResult: any = await api.apis.DryRunApi.dry_run_call(origin, tx.decodedCall, XCM_VERSION);
console.dir(dryRunResult.value, { depth: null });
```

If successful, the dry run confirms that the XCM would execute correctly:

```console
{
  execution_result: {
    success: true,
    value: { ... }
  },
  emitted_events: [ ... ],
  local_xcm: { ... },
  forwarded_xcms: [ ... ]
}
```

If it fails, you'll receive detailed error information:

```console
{
  execution_result: {
    type: 'Incomplete',
    value: {
      used: { ref_time: 1690000n, proof_size: 0n },
      error: { type: 'Barrier', value: undefined }
    }
  },
  emitted_events: [],
  forwarded_xcms: []
}
```

More details:

* [Dry Run Call](/develop/interoperability/xcm-runtime-apis/#dry-run-call) to simulate a full extrinsic
* [Dry Run XCM](/develop/interoperability/xcm-runtime-apis/#dry-run-xcm) to simulate a raw XCM

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
  <div class="card">
    <a href="/develop/interoperability/xcm-runtime-apis/">
      <h2 class="title">XCM Runtime APIs</h2>
      <hr>
      <p class="description">Learn how to use XCM Runtime APIs.</p>
    </a>
  </div>
</div>
