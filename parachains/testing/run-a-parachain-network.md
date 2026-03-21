---
title: Run a Parachain Network
description: Learn how to deploy a local parachain test network using Zombienet, including building a custom collator and verifying block production.
categories: Parachains, Tooling
---

# Run a Parachain Network Using Zombienet

<div class="status-badge" markdown>
[![Run a Parachain Network](https://github.com/polkadot-developers/polkadot-cookbook/actions/workflows/polkadot-docs-run-a-parachain-network.yml/badge.svg?event=push)](https://github.com/polkadot-developers/polkadot-cookbook/actions/workflows/polkadot-docs-run-a-parachain-network.yml){target=\_blank}
</div>

## Introduction

[Zombienet](https://github.com/paritytech/zombienet){target=\_blank} is a testing framework designed for Polkadot SDK-based blockchain networks. It enables developers to efficiently deploy and test ephemeral blockchain environments using a simple CLI.

This tutorial walks you through spawning a local parachain test network using Zombienet's native provider. You will build a custom parachain binary from the [Polkadot SDK parachain template]({{ dependencies.repositories.polkadot_sdk_parachain_template.repository_url }}){target=\_blank}, download the relay chain binaries, configure a network with two relay chain validators and a parachain collator, and verify that the network produces blocks.

For detailed information about Zombienet installation methods, providers, CLI commands, and configuration options, refer to the [Zombienet reference page](/reference/tools/zombienet/){target=\_blank}.

## Prerequisites

Before starting, ensure you have the following installed:

- [Rust](https://www.rust-lang.org/tools/install){target=\_blank} and Cargo
- The `wasm32-unknown-unknown` target. Add it with:

    ```bash
    rustup target add wasm32-unknown-unknown
    ```

- [Zombienet](/reference/tools/zombienet/#install-zombienet){target=\_blank} - see the reference page for installation instructions
- [Git](https://git-scm.com/downloads){target=\_blank}

## Set Up the Parachain Template

Clone and build the Polkadot SDK parachain template:

1. Clone the repository:

    ```bash
    git clone --branch {{ dependencies.repositories.polkadot_sdk_parachain_template.version }} \
      {{ dependencies.repositories.polkadot_sdk_parachain_template.repository_url }} \
    && cd polkadot-sdk-parachain-template
    ```

2. Build the parachain node binary:

    ```bash
    cargo build --release
    ```

    This compiles the `parachain-template-node` binary to `target/release/`.

3. Add the binary to your PATH:

    ```bash
    export PATH=$PATH:$(pwd)/target/release
    ```

## Download Relay Chain Binaries

You need the Polkadot relay chain binaries (`polkadot`, `polkadot-prepare-worker`, and `polkadot-execute-worker`) to run the relay chain validators.

!!! note
    When using the parachain template {{ dependencies.repositories.polkadot_sdk_parachain_template.version }}, ensure you use a compatible relay chain binary. The recommended version is `{{ dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_sdk_version }}`, which you can download from the [Polkadot SDK releases](https://github.com/paritytech/polkadot-sdk/releases/tag/{{ dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_sdk_version }}){target=\_blank}.

Download the binaries for your platform and make them executable:

```bash
mkdir -p bin
curl -L -o bin/polkadot \
  https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_sdk_version }}/polkadot
curl -L -o bin/polkadot-prepare-worker \
  https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_sdk_version }}/polkadot-prepare-worker
curl -L -o bin/polkadot-execute-worker \
  https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_sdk_version }}/polkadot-execute-worker
chmod +x bin/polkadot bin/polkadot-prepare-worker bin/polkadot-execute-worker
```

Alternatively, you can use Zombienet's setup command:

```bash
zombienet setup polkadot polkadot-parachain
```

## Generate a Paseo Local Chain Spec

To run a local Paseo-based relay chain, you need to generate a chain spec using `chain-spec-builder` and the Paseo runtime. This creates a local testnet chain spec with development accounts (Alice, Bob) as validators.

1. Download `chain-spec-builder` from the [Polkadot SDK releases](https://github.com/paritytech/polkadot-sdk/releases/tag/{{ dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_sdk_version }}){target=\_blank}:

    ```bash
    curl -L -o bin/chain-spec-builder \
      https://github.com/paritytech/polkadot-sdk/releases/download/{{ dependencies.repositories.polkadot_sdk_parachain_template.subdependencies.polkadot_sdk_version }}/chain-spec-builder
    chmod +x bin/chain-spec-builder
    ```

2. Download the Paseo runtime Wasm from the [Paseo runtimes releases](https://github.com/paseo-network/runtimes/releases){target=\_blank}:

    ```bash
    curl -L -o bin/paseo_runtime.compressed.wasm \
      https://github.com/paseo-network/runtimes/releases/download/INSERT_PASEO_RUNTIME_VERSION/paseo_runtime.compressed.wasm
    ```

3. Generate the local testnet chain spec:

    ```bash
    bin/chain-spec-builder -c configs/paseo-local.json \
      create -r bin/paseo_runtime.compressed.wasm named-preset local_testnet
    ```

    This creates a `configs/paseo-local.json` chain spec with the `local_testnet` preset, which includes Alice and Bob as validators.

## Configure the Network

Create a `network.toml` file that defines the network topology. This configuration sets up a relay chain with two validators and a parachain with one collator, using the Paseo local chain spec generated in the previous step:

```toml title="network.toml"
[settings]
timeout = 1000
provider = "native"

[relaychain]
chain_spec_path = "./configs/paseo-local.json"
default_command = "./bin/polkadot"

[[relaychain.nodes]]
name = "alice"
validator = true
rpc_port = 9944

[[relaychain.nodes]]
name = "bob"
validator = true
rpc_port = 9945

[[parachains]]
id = 1000

[[parachains.collators]]
name = "collator01"
command = "./polkadot-sdk-parachain-template/target/release/parachain-template-node"
rpc_port = 9988
```

For a full reference of all available configuration options, see the [Zombienet configuration reference](/reference/tools/zombienet/#settings){target=\_blank}.

## Spawn the Network

Launch the network using Zombienet:

```bash
zombienet spawn network.toml --provider native
```

Zombienet will:

1. Generate chain specifications.
2. Start relay chain validators (Alice and Bob).
3. Register and start the parachain collator.
4. Display connection endpoints and logs.

Wait for the output to confirm the network has launched. You'll see RPC endpoints for each node.

## Verify the Network

Once the network is running, verify that the relay chain is producing blocks by querying the RPC endpoint:

```bash
curl -s -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"chain_getHeader","params":[],"id":1}' \
  http://127.0.0.1:9944
```

The response should include a `number` field showing the current block number, confirming the relay chain is producing blocks.

You can also check the parachain collator:

```bash
curl -s -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"chain_getHeader","params":[],"id":1}' \
  http://127.0.0.1:9988
```

To stop the network, press **Ctrl + C** in the terminal where Zombienet is running.

<div class="status-badge" markdown>
[![Run a Parachain Network](https://github.com/polkadot-developers/polkadot-cookbook/actions/workflows/polkadot-docs-run-a-parachain-network.yml/badge.svg?event=push)](https://github.com/polkadot-developers/polkadot-cookbook/actions/workflows/polkadot-docs-run-a-parachain-network.yml){target=\_blank}
[:material-code-tags: View tests](https://github.com/polkadot-developers/polkadot-cookbook/blob/master/polkadot-docs/networks/run-a-parachain-network/tests/docs.test.ts){ .tests-button target=\_blank}
</div>

## Where to Go Next

<div class="grid cards" markdown>

-   __Zombienet Reference__

    ---

    Explore the full Zombienet configuration reference, including all settings, relay chain, parachain, and collator options.

    [:octicons-arrow-right-24: Zombienet Reference](/reference/tools/zombienet/)

-  <span class="badge external">External</span> __Zombienet Support__

    ---

    [Parity Technologies](https://www.parity.io/){target=\_blank} has designed and developed this framework, now maintained by the Zombienet team.

    For further support and information, refer to the following contact points:

    [:octicons-arrow-right-24: Zombienet repository](https://github.com/paritytech/zombienet){target=\_blank}

    [:octicons-arrow-right-24: Element public channel](https://matrix.to/#/!FWyuEyNvIFygLnWNMh:parity.io?via=parity.io&via=matrix.org&via=web3.foundation){target=\_blank}

</div>
