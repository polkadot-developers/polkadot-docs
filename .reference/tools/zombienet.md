---
title: Zombienet
description: Zombienet is a testing framework for Polkadot SDK-based blockchain networks, enabling developers to deploy and test ephemeral environments across various platforms.
categories: Parachains, Tooling
---

# Zombienet

## Introduction

Zombienet is a testing framework designed for Polkadot SDK-based blockchain networks. It enables developers to efficiently deploy and test ephemeral blockchain environments on platforms like Kubernetes, Podman, and native setups. With its simple CLI and Domain Specific Language (DSL) for writing tests, Zombienet streamlines network spawning, testing, and performance validation.

Key features include:

- **Multi-provider support**: Run networks on Kubernetes, Podman, or locally as native processes.
- **Network orchestration**: Spawn relay chains with multiple validators and parachains with collators.
- **Test DSL**: Write natural-language test scripts to evaluate metrics, logs, events, and on-chain storage.
- **Monitoring integration**: Built-in support for Prometheus, Grafana, and Tempo on supported providers.

## Install Zombienet

Zombienet releases are available on the [Zombienet repository](https://github.com/paritytech/zombienet){target=\_blank}. Choose one of the following installation methods:

=== "Use the executable"

    Download the appropriate executable for your operating system from the [latest release](https://github.com/paritytech/zombienet/releases){target=\_blank} page. Each release includes executables for Linux and macOS, generated using [pkg](https://github.com/vercel/pkg){target=\_blank}, which allows Zombienet to run without Node.js.

    Make the downloaded file executable:

    ```bash
    chmod +x zombienet-{{ dependencies.repositories.zombienet.architecture }}
    ```

    Verify the installation:

    ```bash
    ./zombienet-{{ dependencies.repositories.zombienet.architecture }} version
    ```

    Optionally, move the executable to your PATH:

    ```bash
    mv zombienet-{{ dependencies.repositories.zombienet.architecture }} /usr/local/bin/zombienet
    ```

    Now you can use the `zombienet` command directly:

    ```bash
    zombienet version
    ```

=== "Use Nix"

    For Nix users, the Zombienet repository provides a [`flake.nix`](https://github.com/paritytech/zombienet/blob/main/flake.nix){target=\_blank} file. You need [Flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes){target=\_blank} enabled.
    
    Run Zombienet directly:

    ```bash
    nix run github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION -- \
    spawn INSERT_ZOMBIENET_CONFIG_FILE_NAME.toml
    ```

    Or include Zombienet in your current shell:
    
    ```bash
    nix shell github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION
    ```

=== "Use Docker"

    Run Zombienet using Docker:

    ```bash
    docker run -it --rm \
    -v $(pwd):/home/nonroot/zombie-net/host-current-files \
    paritytech/zombienet
    ```

    Inside the container, set up the necessary binaries:

    ```bash
    npm run zombie -- setup polkadot polkadot-parachain
    ```

    Add the binaries to your PATH:

    ```bash
    export PATH=/home/nonroot/zombie-net:$PATH
    ```

    Spawn a network:

    ```bash
    npm run zombie -- -p native spawn host-current-files/minimal.toml
    ```

## Providers

Zombienet supports different backend providers for running nodes: [Kubernetes](https://kubernetes.io/){target=\_blank}, [Podman](https://podman.io/){target=\_blank}, and native (local processes). Specify the provider using the `--provider` flag or in your network configuration file:

```bash
zombienet spawn network.toml --provider INSERT_PROVIDER
```

Or set it in the configuration:

```toml title="network.toml"
[settings]
provider = "INSERT_PROVIDER"
...
```

### Kubernetes

Kubernetes is compatible with [GKE](https://cloud.google.com/kubernetes-engine){target=\_blank}, [Docker Desktop](https://docs.docker.com/desktop/features/kubernetes/){target=\_blank}, and [kind](https://kind.sigs.k8s.io/){target=\_blank}.

- **Requirements**: Install [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl){target=\_blank} and ensure proper cluster permissions.
- **Features**: Uses Prometheus operator for monitoring when available.

### Podman

Podman is a daemonless container engine that works on Linux-based systems. Zombienet supports Podman rootless as a provider.

- **Requirements**: Install [Podman](https://podman.io/getting-started/installation){target=\_blank} on Linux.

- **Features**: Deploys Prometheus, Tempo, and Grafana for monitoring. Services are accessible at `http://127.0.0.1:34123` (Prometheus), `http://127.0.0.1:34125` (Tempo), and `http://127.0.0.1:41461` (Grafana).

### Native

The native provider runs nodes as local processes on your machine.

- **Requirements**: Have the necessary binaries (`polkadot`, `polkadot-parachain`) in your PATH. Install them using:

```bash
zombienet setup polkadot polkadot-parachain
```

For custom binaries, specify the path in your configuration or add them to your PATH:

```bash
export PATH=$PATH:INSERT_PATH_TO_BINARY
```

- **Features**: No additional monitoring features.

## Configure Zombienet

Zombienet uses configuration files in JSON or TOML format to define network topology, nodes, and parameters. The [Zombienet repository](https://github.com/paritytech/zombienet/tree/main/examples){target=\_blank} provides example configurations.

### Basic Configuration

A minimal configuration includes settings, relay chain configuration, and parachain configuration:

=== "TOML"

    ```toml title="basic-network.toml"
    [settings]
    timeout = 1000

    [relaychain]
    chain = "rococo-local"
    default_command = "polkadot"

        [[relaychain.nodes]]
        name = "alice"
        validator = true

        [[relaychain.nodes]]
        name = "bob"
        validator = true

    [[parachains]]
    id = 1000
    chain = "asset-hub-rococo-local"

        [parachains.collator]
        name = "collator-01"
        command = "polkadot-parachain"
    ```

=== "JSON"

    ```json title="basic-network.json"
    {
      "settings": {
        "timeout": 1000
      },
      "relaychain": {
        "chain": "rococo-local",
        "default_command": "polkadot",
        "nodes": [
          {
            "name": "alice",
            "validator": true
          },
          {
            "name": "bob",
            "validator": true
          }
        ]
      },
      "parachains": [
        {
          "id": 1000,
          "chain": "asset-hub-rococo-local",
          "collator": {
            "name": "collator-01",
            "command": "polkadot-parachain"
          }
        }
      ]
    }
    ```

### CLI Commands

Zombienet provides the following commands:

- **`spawn <networkConfig>`**: Spawn the network defined in the configuration file.
- **`test <testFile>`**: Run tests on the spawned network.
- **`setup <binaries>`**: Download and set up `polkadot` or `polkadot-parachain` binaries.
- **`convert <filePath>`**: Convert a [polkadot-launch](https://github.com/paritytech/polkadot-launch){target=\_blank} configuration to Zombienet format.
- **`version`**: Print Zombienet version.
- **`help`**: Print help information.

Common flags:

- **`-p`, `--provider`**: Override the provider.
- **`-d`, `--dir`**: Specify directory for network files.
- **`-m`, `--monitor`**: Start as monitor without auto cleanup.
- **`-c`, `--spawn-concurrency`**: Number of concurrent spawning processes.

## Spawn a Network

To spawn a network, create a configuration file and run:

```bash
zombienet spawn network.toml --provider native
```

Zombienet will:

1. Download or locate the required binaries.
2. Generate chain specifications.
3. Start relay chain validators.
4. Register and start parachain collators.
5. Display connection endpoints and logs.

Access the running nodes via the provided RPC endpoints (typically `ws://127.0.0.1:9944` for the first node).

## Write Tests

Zombienet provides a Domain Specific Language (DSL) for writing tests in `.zndsl` files. Tests can evaluate:

- Metrics from Prometheus.
- Log patterns.
- System events.
- On-chain storage.
- Custom JavaScript/TypeScript scripts.

### Test File Structure

Test files contain a header and body:

```toml title="example-test.zndsl"
Description: Example test suite
Network: ./network.toml
Creds: config

# Test assertions
alice: is up
bob: is up
alice: parachain 1000 is registered within 200 seconds
alice: parachain 1000 block height is at least 10 within 300 seconds
```

### Run Tests

Execute tests using:

```bash
zombienet test example-test.zndsl --provider native
```

The test runner will execute each assertion and report pass/fail status.

### Common Assertions

Some frequently used assertions include:

- **Well-known functions**: `alice: is up`, `alice: parachain 100 is registered within 225 seconds`.
- **Metrics**: `alice: reports node_roles is 4`.
- **Logs**: `alice: log line matches glob "rted #1" within 10 seconds`.
- **System events**: `alice: system event matches ""paraId":[0-9]+" within 10 seconds`.
- **Custom scripts**: `alice: js-script ./script.js return is greater than 1 within 200 seconds`.

## Configuration Reference

For detailed configuration options, see:

- [Configuration examples](https://github.com/paritytech/zombienet/tree/main/examples){target=\_blank} - Sample configurations for various scenarios.
- [Testing DSL specification](https://paritytech.github.io/zombienet/cli/test-dsl-definition-spec.html){target=\_blank} - Complete DSL syntax reference.
- [Zombienet book](https://paritytech.github.io/zombienet/){target=\_blank} - Comprehensive documentation.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Spawn a Basic Chain with Zombienet__

    ---

    Learn to spawn, connect to, and monitor a basic blockchain network with Zombienet using customizable configurations.

    [:octicons-arrow-right-24: Get Started](/tutorials/polkadot-sdk/testing/spawn-basic-chain/)

-   <span class="badge external">External</span> __Zombienet Support__

    ---

    For further support and information, refer to the official resources.

    [:octicons-arrow-right-24: GitHub Repository](https://github.com/paritytech/zombienet){target=\_blank}

    [:octicons-arrow-right-24: Element Channel](https://matrix.to/#/!FWyuEyNvIFygLnWNMh:parity.io?via=parity.io&via=matrix.org&via=web3.foundation){target=\_blank}

</div>
