---
title: Connect a Parachain
description: This tutorial will guide you through the comprehensive process of connecting a parachain to a relay chain, covering steps from setup to successful integration.
---

# Connect a Parachain

## Introduction

This tutorial illustrates reserving a parachain identifier with a local relay chain and connecting a local parachain to that relay chain. By completing this tutorial, you will accomplish the following objectives:

- Compile a local parachain node
- Reserve a unique identifier with the local relay chain for the parachain to use
- Configure a chain specification for the parachain
- Export the runtime and genesis state for the parachain
- Start the local parachain and see that it connects to the local relay chain

## Prerequisites

Before you begin, ensure that you have the following prerequisites:

- Configured a local relay chain with two validators as described in the [Prepare a Local Relay Chain](/tutorials/polkadot-sdk/build-a-parachain/prepare-relay-chain/) tutorial
- You are aware that parachain versions and dependencies are tightly coupled with the version of the relay chain they connect to and know the software version you used to configure the relay chain

Tutorials generally demonstrate features using the latest Polkadot branch. If a tutorial doesn't work as expected, check whether you have the latest Polkadot branch in your local environment and update your local software if needed.

## Build the Parachain Template

This tutorial uses the [Polkadot SDK Parachain Template](https://github.com/paritytech/polkadot-sdk-parachain-template){target=\_blank} to illustrate how to launch a parachain that connects to a local relay chain. The parachain template is similar to the [Solochain Template](https://github.com/paritytech/polkadot-sdk-solochain-template){target=\_blank} used in development. You can also use the parachain template as the starting point for developing a custom parachain project.

To build the parachain template, follow these steps:

1. Clone the branch of the `polkadot-sdk-parachain-template` repository:

    ```bash
    git clone https://github.com/paritytech/polkadot-sdk-parachain-template.git
    ```

    !!! note
        Ensure that you clone the correct branch of the repository that matches the version of the relay chain you are connecting to.

2. Change the directory to the cloned repository:

    ```bash
    cd polkadot-sdk-solochain-template
    ```

3. Build the parachain template collator by running the following command:

    ```bash
    cargo build --release
    ```

    !!! note
        Depending on your system’s performance, compiling the node can take a few minutes.


## Reserve a Parachain Identifier

Every parachain must reserve a unique identifier the - `ParaID` - that enables it to connect to its specific relay chain. Each relay chain manages its own set of unique identifiers for the parachains that connect to it. The identifier is referred to as a `ParaID` because the same identifier can be used to identify a slot occupied by a [Parachain](https://wiki.polkadot.network/docs/learn-parachains){target=\_blank} or to identify a slot occupied by a [Parathread](https://wiki.polkadot.network/docs/glossary#parathread){target=\_blank}.

You should note that you must have an account with sufficient funds to reserve a slot on a relay chain. You can determine the number of tokens a specific relay chain requires by checking the `ParaDeposit` configuration in the `paras_registrar` pallet for that relay chain. For example, [Rococo](https://github.com/paritytech/polkadot/blob/master/runtime/rococo/src/lib.rs#L1155){target=\_blank} requires 40 ROC to reserve an identifier:

```rust
parameter_types! {
	pub const ParaDeposit: Balance = 40 * UNITS;
}

impl paras_registrar::Config for Runtime {
	type RuntimeOrigin = RuntimeOrigin;
	type RuntimeEvent = RuntimeEvent;
	type Currency = Balances;
	type OnSwap = (Crowdloan, Slots);
	type ParaDeposit = ParaDeposit;
	type DataDepositPerByte = DataDepositPerByte;
	type WeightInfo = weights::runtime_common_paras_registrar::WeightInfo<Runtime>;
}
```

Each relay chain allows its identifiers by incrementing the identifier starting at `2000` for all chains that aren't [common good parachains](https://wiki.polkadot.network/docs/learn-system-chains){target=\_blank}. Common good chains use a different method to allocate slot identifiers.

To reserve a parachain identifier, follow these steps:

1. Ensure your local relay chain validators are running. For further information, refer to the [Prepare a Local Relay Chain](/tutorials/polkadot-sdk/build-a-parachain/prepare-relay-chain/) tutorial.
2. Connect to a local relay chain node using the [Polkadot JS Apps](https://polkadot.js.org/apps/){target=_blank} interface. If you have followed the [Prepare a Local Relay Chain](/tutorials/polkadot-sdk/build-a-parachain/prepare-relay-chain/) tutorial, you can access the Polkadot JS Apps interface at `ws://localhost:9944`

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-1.webp)

3. Navigate to the Parachains sections
      1. Click on the **Network** tab
      2. Select **Parachains** from the dropdown menu

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-2.webp)

4. Register a parathread
      1. Select the **Prathreads** tab
      2. Click on the **+ ParaId** button
   
    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-3.webp)

5. Fill in the required fields and click on the **+ Submit** button:

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-4.webp)

    !!! note
        The account used to reserve the identifier will be the account charged for the transaction and the origin account for the parathread associated with the identifier.

6. After submitting the transaction, you can navigate to the Explorer tab and check the list of recent events for successful `registrar.Reserved`

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-5.webp)

You are now ready to prepare the chain specification and generate the files required for your parachain to connect to the relay chain using the reserved identifier (`paraId 2000`).

## Modify the Default Chain Specification

To register your parachain with the local relay chain, you must modify the default chain specification to use your reserved parachain identifier.

To modify the default chain specification, follow these steps:

1. Generate the plain text chain specification for the parachain template node by running the following command:

    ```bash
    ./target/release/parachain-template-node build-spec --disable-default-bootnode > plain-parachain-chainspec.json
    ```

2. Open the plain text chain specification for the parachain template node in a text editor

3. Set the `para_id` to the parachain identifier that you previously reserved.

      For example, if your reserved identifier is `2000`, set the `para_id` field to 2000:

      ```json
      ...
      "relay_chain": "rococo-local",
      "para_id": 2000,
      "codeSubstitutes": {},
      "genesis": {
        ...
      }
      ...
      ```

4. Set the `parachainId` to the parachain identifier that you previously reserved.

      For example, if your reserved identifier is 2000, set the `parachainId` field to 2000:

      ```json
      ...
        "parachainSystem": null,
        "parachainInfo": {
          "parachainId": 2000
        },
      ...
      ```

5. If you complete this tutorial simultaneously as anyone on the same local network, an additional step is needed to prevent accidentally peering with their nodes. Find the following line and add characters to make your `protocolId` unique:

      ```json
      "protocolId": "template-local"
      ```

6. Save your changes and close the plain text chain specification file

7. Generate a raw chain specification file from the modified chain specification file by running the following command:

      ```bash
      ./target/release/parachain-template-node build-spec --chain plain-parachain-chainspec.json --disable-default-bootnode --raw > raw-parachain-chainspec.json
      ```

      After running the command, you will see the following output:

       <div id="termynal" data-termynal>
       <span data-ty="input"><span class="file-path"></span>./target/release/parachain-template-node build-spec --chain plain-parachain-chainspec.json --disable-default-bootnode --raw > raw-parachain-chainspec.json</span>
       <br>
       <span data-ty="progress">2024-09-10 14:34:58 Building chain spec</span>
       <span data-ty="progress>2024-09-10 14:34:59 assembling new collators for new session 0 at #0</span>
       <span data-ty="progress>2024-09-10 14:34:59 assembling new collators for new session 1 at #0</span>
       </div>

## Prepare the Parachain Collator

With the local relay chain running and the raw chain specification for the parachain template updated, you can start the parachain collator node and export information about its runtime and genesis state.

To prepare the parachain collator to be registered:

1. Export the WebAssembly runtime for the parachain

      The relay chain needs the parachain-specific runtime validation logic to validate parachain blocks. You can export the WebAssembly runtime for a parachain collator node by running a command similar to the following:

      ```bash
      ./target/release/parachain-template-node export-genesis-wasm --chain raw-parachain-chainspec.json para-2000-wasm
      ```

2. Generate a parachain genesis state

      To register a parachain, the relay chain needs to know the genesis state of the parachain. You can export the entire genesis state—hex-encoded—to a file by running a command similar to the following:

      ```bash
      ./target/release/parachain-template-node export-genesis-state --chain raw-parachain-chainspec.json para-2000-genesis-state
      ``` 

      After running the command, you will see the following output:

      <div id="termynal" data-termynal>
         <span data-ty="input"><span class="file-path"></span>./target/release/parachain-template-node export-genesis-state --chain raw-parachain-chainspec.json para-2000-genesis-state</span>
         <br>
         <span data-ty="progress">2024-09-10 14:41:13 🔨 Initializing Genesis block/state (state: 0xb089…1830, header-hash: 0x6b0b…bd69)</span>
      </div>

    !!!note
        You should note that the runtime and state you export must be for the genesis block. You can't connect a parachain with any previous state to a relay chain. All parachains must start from block 0 on the relay chain. See [Convert a Solo Chain](https://docs.substrate.io/reference/how-to-guides/parachains/convert-a-solo-chain/){target=\_blank} for details on how the parachain template was created and how to convert the chain logic—not its history or state migrations—to a parachain.

3. Start a collator node with a command similar to the following:

    ```bash
    ./target/release/parachain-template-node \
      --charlie \
      --collator \
      --force-authoring \
      --chain raw-parachain-chainspec.json \
      --base-path /tmp/charlie-parachain/ \
      --unsafe-force-node-key-generation \
      --port 40333 \
      --rpc-port 8844 \
      -- \
      --chain <INSERT_RELAY_CHAIN_PATH>/local-raw-spec.json \
      --port 30333 \
      --rpc-port 9946
    ```

    !!! note
        Ensure that you replace `<INSERT_RELAY_CHAIN_PATH>` with the path to the raw chain specification for the local relay chain.

    After running the command, you will see the following output:

    <div id="termynal" data-termynal>
    <span data-ty="input"><span class="file-path"></span>./target/release/parachain-template-node \
      --charlie \
      --collator \
      --force-authoring \
      --chain raw-parachain-chainspec.json \
      --base-path /tmp/charlie-parachain/ \
      --unsafe-force-node-key-generation \
      --port 40333 \
      --rpc-port 8844 \
      -- \
      --chain <INSERT_RELAY_CHAIN_PATH>/local-raw-spec.json \
      --port 30333 \
      --rpc-port 9946
    </span>
    <span>...</span>
    <br>
    <span>2024-09-10 16:26:30 [Parachain] PoV size { header: 0.21875kb, extrinsics: 3.6103515625kb, storage_proof: 3.150390625kb }</span>
    <br>
    <span>2024-09-10 16:26:30 [Parachain] Compressed PoV size: 6.150390625kb</span>
    <br>
    <span>2024-09-10 16:26:33 [Relaychain] 💤 Idle (2 peers), best: #1729 (0x3aa4…cb6b), finalized #1726 (0xff7a…4352), ⬇ 9.1kiB/s ⬆ 3.8kiB/s</span>
    <br>
    <span>...</span>
    </div>

## Register With the Local Relay Chain

With the local relay chain and collator node running, you can register the parachain on the local relay chain. In a live public network, registration typically involves a [parachain auction](https://wiki.polkadot.network/docs/learn-auction){target=\_blank}. You can use a Sudo transaction and the Polkadot.Js App interface for this tutorial and local testing. A Sudo transaction lets you bypass the steps required to acquire a parachain or parathread slot.

To register the parachain, follow these steps:

1. Validate that your local relay chain validators are running
2. Navigate to the **Sudo** tab in the Polkadot JS Apps interface
    1. Click on the **Developer** tab
    2. Select **Sudo** from the dropdown menu

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-6.webp)

3. Submit a Sudo change:
    1. Select the **paraSudoWrapper** pallet
    2. Click on the **sudoScheduleParaInitialize** extrinsic from the list of available extrinsics

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-7.webp)

4. Fill in the required fields:
    1. **id** - type the parachain identifier you reserved
    2. **genesisHead** - click the **file upload** button and select the `para-2000-genesis-state` file you exported
    3. **validationCode** - click the **file upload** button and select the `para-2000-wasm` file you exported
    4. **paraKind** - select **Yes** if you are registering a parachain or **No** if you are registering a parathread
    5. Click on the **Submit Transaction** button

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-8.webp)

5. After submitting the transaction, you can navigate to the **Explorer** tab and check the list of recent events for successful `paras.PvfCheckAccepted`

    ![](/images/tutorials/polkadot-sdk/build-a-parachain/connect-a-parachain/connect-a-parachain-9.webp)

    After the parachain is initialized, you can see it in **Parachains** section of the Polkadot JS Apps interface.

6. Click Network and select Parachains and wait for a new epoch to start

   The relay chain tracks the latest block—the head—of each parachain. When a relay chain block is finalized, the parachain blocks that have completed the validation process are also finalized. This is how Polkadot achieves pooled, shared security for its parachains.

   After the parachain connects to the relay chain in the next epoch and finalizes its first block you can see information about it in the Polkadot/Substrate Portal.

   The terminal where the parachain is running also displays details similar to the following:

## Resetting the Blockchain State

The parachain collator you connected to the relay chain in this tutorial contains all of the blockchain data for the parachain. There's only one node in this parachain network, so any transactions you submit are only stored on this node. Relay chains don't store any parachain state. The relay chain only stores header information for the parachains that connect to it.

For testing purposes, you might want to purge the blockchain state to start over periodically. However, you should remember that if you purge the chain state or manually delete the database, you won’t be able to recover the data or restore the chain state. If you want to preserve data, you should ensure you have a copy before you purge the parachain state.

If you want to start over with a clean environment for testing, you should completely remove the chain state for the local relay chain nodes and the parachain.

To reset the blockchain state, follow these steps:

1. In the terminal where the parachain template node is running, press `Control-c`

2. Purge the parachain collator state by running the following command:

    ```bash
     ./target/release/parachain-template-node purge-chain --chain raw-parachain-chainspec.json
    ```

3. In the terminal where either the alice validator node or the bob validator node is running, press `Control-c`

4. Purge the local relay chain state by running the following command:

    ```bash
     ./target/release/polkadot purge-chain --chain local-raw-spec.json
    ```

After purging the chain state, you can start the local relay chain and parachain collator nodes again to start over with a clean environment.