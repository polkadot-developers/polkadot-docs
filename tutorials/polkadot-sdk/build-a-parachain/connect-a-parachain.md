---
title: Connect a Parachain
description: This tutorial will guide you through the comprehensive process of connecting a parachain to a relay chain, covering steps from setup to successful integration.
---

# Connect a Parachain

## Introduction

This tutorial illustrates reserving a parachain identifier with a local relay chain and connect a local parachain to that relay chain. By completing this tutorial, you will accomplish the following objectives:

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
        Compiling the node can take a few minutes, depending on your system's performance.

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

Each relay chain allots its own identifiers by incrementing the identifier starting at `2000` for all chains that are not [common good parachains](https://wiki.polkadot.network/docs/learn-system-chains){target=\_blank}. Common good chains use a different method to allocate slot identifiers.

To reserve a parachain identifier, follow these steps:

1. Ensure your local relay chain validators are running
2. Connect to a local relay chain node using the [Polkadot JS Apps](https://polkadot.js.org/apps/){target=_blank} interface. If you have followed the [Prepare a Local Relay Chain](/tutorials/polkadot-sdk/build-a-parachain/prepare-relay-chain/) tutorial, you can access the Polkadot JS Apps interface at `ws://localhost:9944`
Click Network and select Parachains.



