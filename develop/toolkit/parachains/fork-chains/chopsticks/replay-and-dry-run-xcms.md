---
title: Replay and Dry Run XCMs
description: Learn how to replay and dry-run XCMs using Chopsticks with full logging enabled. Diagnose issues, trace message flow, and debug complex cross-chain interactions.
---

# Replay and Dry Run XCMs Using Chopsticks

## Introduction

[Chopsticks](https://github.com/AcalaNetwork/chopsticks){target=\_blank} is a tool for forking live Polkadot SDK-based chains in a local environment. If you're new to it, check out the [Get Started](/develop/toolkit/parachains/fork-chains/chopsticks/get-started){target=\_blank} guide.

This tutorial focuses on **replaying and dry-running XCMs**, powerful techniques for:

* [Debugging cross-chain message failures](/develop/interoperability/test-and-debug/){target=\_blank}
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

Begin by creating a dedicated directory for your replay environment:

```bash
mkdir -p replay-xcm-tests
cd replay-xcm-tests
```

Initialise a new Node.js project:

```bash
npm init -y
```

Install **Chopsticks globally** (run this separately to avoid interference with local installs):

```bash
npm install -g @acala-network/chopsticks@latest
```

Install **TypeScript and related tooling** for local development:

```bash
npm install --save-dev typescript @types/node tsx
```

Install the required Polkadot packages:

```bash
npm install @polkadot/api polkadot-api
```

Finally, initialise the TypeScript config:

```bash
npx tsc --init
```

This setup ensures you're using a clean, stable workspace and the latest versions of required tools.

### Capture the XCM to Replay

To replay a specific XCM, identify:

* The source and destination chains involved
* The block number or height where the XCM was sent
* Optionally, the call payload (if you plan to simulate it manually via development commands)

You can use [Polkadot.js Apps](/tutorials/polkadot-sdk/testing/fork-live-chains/#use-polkotdotjs-apps){target=\_blank} or indexers such as [Subscan](https://polkadot.subscan.io/xcm_dashboard){target=\_blank} to locate and inspect the original XCM execution.

### Fork the Relevant Chains

Use Chopsticks to [fork the required chains](/tutorials/polkadot-sdk/testing/fork-live-chains/#xcm-testing){target=\_blank} at the appropriate block heights.

#### Set the Block Numbers

Create/edit a `.env` file with the block heights for each chain. These should be **just before** the XCM is sent to allow a full replay:

```text title=".env"
POLKADOT_BLOCK_NUMBER=26481107
POLKADOT_ASSET_HUB_BLOCK_NUMBER=9079591
ACALA_BLOCK_NUMBER=8826385
```

#### Enable Logging and Wasm Override

Full execution logs only work if the runtime was compiled with logging enabled. Most live chains are built using the `production` profile, which disables logs. To enable logging, you'll need to override the Wasm with a locally built `debug` version.

**Clone the `polkadot-fellows/runtimes` Repository**

```bash
git clone git@github.com:polkadot-fellows/runtimes.git
```

**Build the Polkadot Asset Hub Runtime**

```bash
cd runtimes
cargo build -p asset-hub-polkadot-runtime
```

**Copy the Compiled Wasm to Your Working Directory**

```bash
# Assuming you're still in the `runtimes` directory
mkdir -p ../wasms # or your <replay-xcm-tests>/wasms path
cp target/debug/wbuild/asset-hub-polkadot-runtime/asset_hub_polkadot_runtime.wasm ../wasms
```

**Download and Modify a Config File**

```bash
# Still in the `runtimes` directory
cd .. # Return to your replay-xcm-tests root
mkdir -p configs
wget https://raw.githubusercontent.com/AcalaNetwork/chopsticks/master/configs/polkadot-asset-hub.yml -O configs/polkadot-asset-hub-override.yaml
```

Edit `configs/polkadot-asset-hub-override.yaml` to include:

```yaml title="configs/polkadot-asset-hub-override.yaml"
...
runtime-log-level: 5
wasm-override: wasms/asset_hub_polkadot_runtime.wasm
...
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

You'll also see runtime logs such as:

--8<-- 'code/develop/toolkit/parachains/fork-chains/chopsticks/replay-and-dry-run-xcms/launch-chopsticks.html'

### Identify the XCM to Replay

To replay an XCM, you'll first need to identify the exact extrinsic that triggered it. In this example, we'll use **Block #9079592** on the **Polkadot Asset Hub**.

#### Step-by-step:

**Find the Block on Subscan**

Open the block in Subscan to inspect its extrinsics and events:

👉 [Block #9079592](https://assethub-polkadot.subscan.io/block/9079592){target=\_blank}

**Copy the Block Hash**

Look for the block hash at the top of the page. For Block #9079592, the hash is:

```text
0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6
```

**Explore in Polkadot-JS Apps**

View the block in [Polkadot-JS Apps](https://polkadot.js.org/apps){target=\_blank} using this direct link:

👉 [Explorer → Block Hash](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot-asset-hub-rpc.polkadot.io#/explorer/query/0xeb5a5737d47367dc1c02b978232283cdb096eb7e51d2eb22366a106a011347f6){target=\_blank}

**Locate and Decode the XCM Extrinsic**

Once you've found the extrinsic (e.g. `9079592-2`), extract and decode its call data:

👉 [Decode Extrinsic](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot-asset-hub-rpc.polkadot.io#/extrinsics/decode/0xad028400fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c820016a30461702adc48213e5c9ee4d15c5a481c578cb5cbc935f0bd11fe8aee489082a745ffbbe94282f91b67daa6cb44920d77c30849c1d25f5f6c3e59015a3e383440055040000011f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000){target=\_blank}

**Copy the Call Data**

From the decoded view, copy the **hex-encoded call** (e.g. `0x1f08...0000`). You'll pass this into `api.txFromCallData(...)` to replay the XCM locally.

### Replay the XCM

Once your project is set up (see [Project Setup](#project-setup)), you're ready to replay the XCM locally.

This is useful for:

* Diagnosing execution failures or weight limits
* Inspecting all emitted events
* Verifying behaviour before submitting a real transaction

**Add the Asset Hub Descriptor**

This will let you use type-safe APIs with PAPI:

```bash
npx papi add assetHub -w ws://localhost:8000
```

> ℹ️ The script assumes the Polkadot Asset Hub is served on `ws://localhost:8000`.
> If you're using a different port or config, update the WebSocket endpoint in the script or descriptor.
> You can confirm the port by checking your terminal logs or see [Launch Chopsticks](#launch-chopsticks).

**Create the Script**

Create a file named `replay-xcm.ts` and copy the following code into it:

```ts
--8<-- 'code/develop/toolkit/parachains/fork-chains/chopsticks/replay-and-dry-run-xcms/replay-xcm.ts'
```

**Execute the Script**

Ensure Chopsticks is running and serving a chain that includes `pallet-xcm`, such as a Polkadot Asset Hub fork. Then run:

```bash
npx tsx replay-xcm.ts
```

**Expected Output**

If everything is working, you'll see logs like:

--8<-- 'code/develop/toolkit/parachains/fork-chains/chopsticks/replay-and-dry-run-xcms/replay-xcm-result.html'

## Dry Run the XCM

To simulate the XCM without actually sending it, you can use the `dry_run_call` method. This lets you check whether the XCM would succeed without modifying any state.

Assuming you've the `tx` transaction from the previous step, you can perform a dry run like this:

```ts
const XCM_VERSION = 5;
const origin = Enum("system", Enum("Signed", alice.address)); // import { Enum } from "polkadot-api";
const dryRunResult: any = await api.apis.DryRunApi.dry_run_call(origin, tx.decodedCall, XCM_VERSION);
console.dir(dryRunResult.value, { depth: null });
```

If successful, the dry run confirms that the XCM would execute correctly:

--8<-- 'code/develop/toolkit/parachains/fork-chains/chopsticks/replay-and-dry-run-xcms/dry-run-success.html'

If it fails, you'll receive detailed error information:

--8<-- 'code/develop/toolkit/parachains/fork-chains/chopsticks/replay-and-dry-run-xcms/dry-run-failure.html'

More details:

* [Dry Run Call](/develop/interoperability/xcm-runtime-apis/#dry-run-call){target=\_blank} to simulate a full extrinsic
* [Dry Run XCM](/develop/interoperability/xcm-runtime-apis/#dry-run-xcm){target=\_blank} to simulate a raw XCM

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
