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

    Download the appropriate executable for your operating system from the [latest release](https://github.com/paritytech/zombienet/releases){target=\_blank} page. Each release includes executables for Linux and macOS.

    Make the downloaded file executable:

    ```bash
    chmod +x zombienet-{{ dependencies.repositories.zombienet.architecture }}
    ```

    !!! warning "macOS Gatekeeper: Unidentified Developer"
        If macOS blocks the app with "cannot be opened because it is from an unidentified developer":

        Remove the quarantine attribute so the terminal can run it by running the following command:
        
          ```bash
          xattr -d com.apple.quarantine zombienet-{{ dependencies.repositories.zombienet.architecture }}
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

Ensure to replace `INSERT_PROVIDER` with the appropriate provider: `kubernetes`, `podman`, or `native`.

### Kubernetes

Kubernetes is compatible with [GKE](https://cloud.google.com/kubernetes-engine){target=\_blank}, [Docker Desktop](https://docs.docker.com/desktop/use-desktop/kubernetes/){target=\_blank}, and [kind](https://kind.sigs.k8s.io/){target=\_blank}.

- **Requirements**: Install [`kubectl`](https://kubernetes.io/docs/tasks/tools/#kubectl){target=\_blank} and ensure proper cluster permissions.
- **Features**: Uses Prometheus operator for monitoring when available.

### Podman

Podman is a daemonless container engine for Linux. Zombienet supports Podman rootless as a provider.

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

Zombienet uses JSON or TOML configuration files to define network topology, nodes, and parameters. The [Zombienet repository](https://github.com/paritytech/zombienet/tree/main/examples){target=\_blank} provides example configurations.

### Basic Configuration

A minimal configuration includes settings, relay chain configuration, and parachain configuration.

!!! important "Polkadot TestNet chain specs"
    For Polkadot TestNet, use chain specs from the official [Polkadot TestNet chain specs repository](https://github.com/paseo-network/paseo-chain-specs/){target=\_blank}. Download the needed files and set `chain_spec_path` in your config. To download Polkadot Hub TestNet specs, you can use the following command:

    ```bash
    wget https://paseo-r2.zondax.ch/chain-specs/paseo-asset-hub.json
    ```

=== "TOML"

    ```toml title="basic-network.toml"
    [settings]
    timeout = 1000

    [relaychain]
    chain = "paseo"
    default_command = "polkadot"

        [[relaychain.nodes]]
        name = "alice"
        validator = true

        [[relaychain.nodes]]
        name = "bob"
        validator = true

    [[parachains]]
    id = 1000
    chain_spec_path = "./paseo-asset-hub.json"

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
        "chain": "paseo",
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
          "chain_spec_path": "./paseo-asset-hub.json",
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

### Settings

Through the keyword `settings`, it's possible to define the general settings for the network. The available keys are:

- **`global_volumes?`** ++"GlobalVolume[]"++: A list of global volumes to use.

    ??? child "`GlobalVolume` interface definition"
        ```js
        export interface GlobalVolume {
          name: string;
          fs_type: string;
          mount_path: string;
        }
        ```

- **`bootnode`** ++"boolean"++: Add bootnode to network. Defaults to `true`.
- **`bootnode_domain?`** ++"string"++: Domain to use for bootnode.
- **`timeout`** ++"number"++: Global timeout to use for spawning the whole network.
- **`node_spawn_timeout?`** ++"number"++: Timeout to spawn pod/process.
- **`grafana?`** ++"boolean"++: Deploy an instance of Grafana.
- **`prometheus?`** ++"boolean"++: Deploy an instance of Prometheus.
- **`telemetry?`** ++"boolean"++: Enable telemetry for the network.
- **`jaeger_agent?`** ++"string"++: The Jaeger agent endpoint passed to the nodes. Only available on Kubernetes.
- **`tracing_collator_url?`** ++"string"++: The URL of the tracing collator used to query by the tracing assertion. Should be tempo query compatible.
- **`tracing_collator_service_name?`** ++"string"++: Service name for tempo query frontend. Only available on Kubernetes. Defaults to `tempo-tempo-distributed-query-frontend`.
- **`tracing_collator_service_namespace?`** ++"string"++: Namespace where tempo is running. Only available on Kubernetes. Defaults to `tempo`.
- **`tracing_collator_service_port?`** ++"number"++: Port of the query instance of tempo. Only available on Kubernetes. Defaults to `3100`.
- **`enable_tracing?`** ++"boolean"++: Enable the tracing system. Only available on Kubernetes. Defaults to `true`.
- **`provider`** ++"string"++: Provider to use. Default is `kubernetes`".
- **`polkadot_introspector?`** ++"boolean"++: Deploy an instance of polkadot-introspector. Only available on Podman and Kubernetes. Defaults to `false`.
- **`backchannel?`** ++"boolean"++: Deploy an instance of backchannel server. Only available on Kubernetes. Defaults to `false`.
- **`image_pull_policy?`** ++"string"++: Image pull policy to use in the network. Possible values are `Always`, `IfNotPresent`, and `Never`.
- **`local_ip?`** ++"string"++: IP used for exposing local services (rpc/metrics/monitors). Defaults to `"127.0.0.1"`.
- **`global_delay_network_global_settings?`** ++"number"++: Delay in seconds to apply to the network.
- **`node_verifier?`** ++"string"++: Specify how to verify node readiness or deactivate by using `None`. Possible values are `None` and `Metric`. Defaults to `Metric`.

For example, the following configuration file defines a minimal example for the settings:

=== "TOML"

    ```toml title="base-example.toml"
    --8<-- 'code/parachains/testing/run-a-parachain-network/base-example.toml'
    ```

=== "JSON"

    ```json title="base-example.json"
    --8<-- 'code/parachains/testing/run-a-parachain-network/base-example.json'
    ```

### Relay Chain Configuration

You can use the `relaychain` keyword to define further parameters for the relay chain at start-up. The available keys are:

- **`default_command?`** ++"string"++: The default command to run. Defaults to `polkadot`.
- **`default_image?`** ++"string"++: The default Docker image to use.
- **`default_resources?`** ++"Resources"++: Represents the resource limits/reservations the nodes need by default. Only available on Kubernetes.

    ??? child "`Resources` interface definition"
        ```js
        export interface Resources {
          resources: {
            requests?: {
              memory?: string;
              cpu?: string;
            };
            limits?: {
              memory?: string;
              cpu?: string;
            };
          };
        }
        ```

- **`default_db_snapshot?`** ++"string"++: The default database snapshot to use.
- **`default_prometheus_prefix`** ++"string"++: A parameter for customizing the metric's prefix. Defaults to `substrate`.
- **`default_substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++: Set the Substrate CLI arguments version.

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`default_keystore_key_types?`** ++"string[]"++: Defines which keystore keys should be created.
- **`chain`** ++"string"++: The chain name.
- **`chain_spec_path?`** ++"string"++: Path to the chain spec file. Should be the plain version to allow customizations.
- **`chain_spec_command?`** ++"string"++: Command to generate the chain spec. It can't be used in combination with `chain_spec_path`.
- **`default_args?`** ++"string[]"++: An array of arguments to use as default to pass to the command.
- **`default_overrides?`** ++"Override[]"++: An array of overrides to upload to the node.

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        }
        ```

- **`random_nominators_count?`** ++"number"++: If set and the stacking pallet is enabled, Zombienet will generate the input quantity of nominators and inject them into the genesis.
- **`max_nominations`** ++"number"++: The max number of nominations allowed by a nominator. Should match the value set in the runtime. Defaults to `24`.
- **`nodes?`** ++"Node[]"++: An array of nodes to spawn. It is further defined in the [Node Configuration](#node-configuration) section.
- **`node_groups?`** ++"NodeGroup[]"++: An array of node groups to spawn. It is further defined in the [Node Group Configuration](#node-group-configuration) section.
- **`total_node_in_group?`** ++"number"++: The total number of nodes in the group. Defaults to `1`.
- **`genesis`** ++"JSON"++: The genesis configuration.
- **`default_delay_network_settings?`** ++"DelayNetworkSettings"++: Sets the expected configuration to delay the network.

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

#### Node Configuration

One specific key capable of receiving more subkeys is the `nodes` key. This key is used to define further parameters for the nodes. The available keys:

- **`name`** ++"string"++: Name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`).
- **`image?`** ++"string"++: Override default Docker image to use for this node.
- **`command?`** ++"string"++: Override default command to run.
- **`command_with_args?`** ++"string"++: Override default command and arguments.
- **`args?`** ++"string[]"++: Arguments to be passed to the command.
- **`env?`** ++"envVars[]"++: Environment variables to set in the container.

    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++: Customizes the metric's prefix for the specific node. Defaults to `substrate`.
- **`db_snapshot?`** ++"string"++: Database snapshot to use.
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++: Set the Substrate CLI arguments version directly to skip binary evaluation overhead.

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++: Represent the resources limits/reservations needed by the node.

    ??? child "`Resources` interface definition"
        ```js
        export interface Resources {
          resources: {
            requests?: {
              memory?: string;
              cpu?: string;
            };
            limits?: {
              memory?: string;
              cpu?: string;
            };
          };
        }
        ```

- **`keystore_key_types?`** ++"string[]"++: Defines which keystore keys should be created.
- **`validator`** ++"boolean"++: Pass the `--validator` flag to the command. Defaults to `true`.
- **`invulnerable`** ++"boolean"++: If true, add the node to invulnerables in the chain spec. Defaults to `false`.
- **`balance`** ++"number"++: Balance to set in balances for node's account. Defaults to `2000000000000`.
- **`bootnodes?`** ++"string[]"++: Array of bootnodes to use.
- **`add_to_bootnodes?`** ++"boolean"++: Add this node to the bootnode list. Defaults to `false`.
- **`ws_port?`** ++"number"++: WS port to use.
- **`rpc_port?`** ++"number"++: RPC port to use.
- **`prometheus_port?`** ++"number"++: Prometheus port to use.
- **`p2p_cert_hash?`** ++"string"++: Libp2p certhash to use with webRTC transport.
- **`delay_network_settings?`** ++"DelayNetworkSettings"++: Sets the expected configuration to delay the network.

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

The following configuration file defines a minimal example for the relay chain, including the `nodes` key:

=== "TOML"

    ```toml title="relaychain-example-nodes.toml"
    --8<-- 'code/parachains/testing/run-a-parachain-network/relaychain-example-nodes.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-nodes.json"
    --8<-- 'code/parachains/testing/run-a-parachain-network/relaychain-example-nodes.json'
    ```

#### Node Group Configuration

The `node_groups` key defines further parameters for the node groups. The available keys are:

- **`name`** ++"string"++: Name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`).
- **`image?`** ++"string"++: Override default Docker image to use for this node.
- **`command?`** ++"string"++: Override default command to run.
- **`args?`** ++"string[]"++: Arguments to be passed to the command.
- **`env?`** ++"envVars[]"++: Environment variables to set in the container.

    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`overrides?`** ++"Override[]"++: Array of overrides definitions.

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++: Customizes the metric's prefix for the specific node. Defaults to `substrate`.
- **`db_snapshot?`** ++"string"++: Database snapshot to use.
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++: Set the Substrate CLI arguments version directly to skip binary evaluation overhead.

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++: Represent the resources limits/reservations needed by the node.

    ??? child "`Resources` interface definition"
        ```js
        export interface Resources {
          resources: {
            requests?: {
              memory?: string;
              cpu?: string;
            };
            limits?: {
              memory?: string;
              cpu?: string;
            };
          };
        }
        ```

- **`keystore_key_types?`** ++"string[]"++: Defines which keystore keys should be created.
- **`count`** ++"number | string"++: Number of nodes to launch for this group.
- **`delay_network_settings?`** ++"DelayNetworkSettings"++: Sets the expected configuration to delay the network.

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

The following configuration file defines a minimal example for the relay chain, including the `node_groups` key:

=== "TOML"

    ```toml title="relaychain-example-node-groups.toml"
    --8<-- 'code/parachains/testing/run-a-parachain-network/relaychain-example-node-groups.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-node-groups.json"
    --8<-- 'code/parachains/testing/run-a-parachain-network/relaychain-example-node-groups.json'
    ```

### Parachain Configuration

The `parachain` keyword defines further parameters for the parachain. The available keys are:

- **`id`** ++"number"++: The id to assign to this parachain. Must be unique.
- **`chain?`** ++"string"++: The chain name.
- **`force_decorator?`** ++"string"++: Force the use of a specific decorator.
- **`genesis?`** ++"JSON"++: The genesis configuration.
- **`balance?`** ++"number"++: Balance to set in balances for parachain's account.
- **`delay_network_settings?`** ++"DelayNetworkSettings"++: Sets the expected configuration to delay the network.

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

- **`add_to_genesis?`** ++"boolean"++: Flag to add parachain to genesis or register in runtime. Defaults to `true`.
- **`register_para?`** ++"boolean"++: Flag to specify whether the para should be registered. The `add_to_genesis` flag must be set to false for this flag to have any effect. Defaults to `true`.
- **`onboard_as_parachain?`** ++"boolean"++: Flag to specify whether the para should be onboarded as a parachain, rather than remaining a parathread. Defaults to `true`.
- **`genesis_wasm_path?`** ++"string"++: Path to the Wasm file to use.
- **`genesis_wasm_generator?`** ++"string"++: Command to generate the Wasm file.
- **`genesis_state_path?`** ++"string"++: Path to the state file to use.
- **`genesis_state_generator?`** ++"string"++: Command to generate the state file.
- **`chain_spec_path?`** ++"string"++: Path to the chain spec file.
- **`chain_spec_command?`** ++"string"++: Command to generate the chain spec.
- **`cumulus_based?`** ++"boolean"++: Flag to use cumulus command generation. Defaults to `true`.
- **`bootnodes?`** ++"string[]"++: Array of bootnodes to use.
- **`prometheus_prefix?`** ++"string"++: Parameter for customizing the metric's prefix for all parachain nodes/collators. Defaults to `substrate`.
- **`collator?`** ++"Collator"++: Further defined in the [Collator Configuration](#collator-configuration) section.
- **`collator_groups?`** ++"CollatorGroup[]"++: An array of collator groups to spawn. It is further defined in the [Collator Groups Configuration](#collator-groups-configuration) section.

For example, the following configuration file defines a minimal example for the parachain:

=== "TOML"

    ```toml title="parachain-example.toml"
    --8<-- 'code/parachains/testing/run-a-parachain-network/parachain-example.toml'
    ```

=== "JSON"

    ```json title="parachain-example.json"
    --8<-- 'code/parachains/testing/run-a-parachain-network/parachain-example.json'
    ```

#### Collator Configuration

One specific key capable of receiving more subkeys is the `collator` key. This key defines further parameters for the nodes. The available keys are:

- **`name`** ++"string"++: Name of the collator. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`).
- **`image?`** ++"string"++: Image to use for the collator.
- **`command_with_args?`** ++"string"++: Overrides both command and arguments for the collator.
- **`validator`** ++"boolean"++: Pass the `--validator` flag to the command. Defaults to `true`.
- **`invulnerable`** ++"boolean"++: If true, add the collator to invulnerables in the chain spec. Defaults to `false`.
- **`balance`** ++"number"++: Balance to set in balances for collator's account. Defaults to `2000000000000`.
- **`bootnodes?`** ++"string[]"++: Array of bootnodes to use.
- **`add_to_bootnodes?`** ++"boolean"++: Add this collator to the bootnode list. Defaults to `false`.
- **`ws_port?`** ++"number"++: WS port to use.
- **`rpc_port?`** ++"number"++: RPC port to use.
- **`prometheus_port?`** ++"number"++: Prometheus port to use.
- **`p2p_port?`** ++"number"++: P2P port to use.
- **`p2p_cert_hash?`** ++"string"++: Libp2p certhash to use with webRTC transport.
- **`delay_network_settings?`** ++"DelayNetworkSettings"++: Sets the expected configuration to delay the network.

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

- **`command?`** ++"string"++: Override default command to run.
- **`args?`** ++"string[]"++: Arguments to be passed to the command.
- **`env?`** ++"envVars[]"++: Environment variables to set in the container.

    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`overrides?`** ++"Override[]"++: Array of overrides definitions.

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++: Customizes the metric's prefix for the specific node. Defaults to `substrate`.
- **`db_snapshot?`** ++"string"++: Database snapshot to use.
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++: Set the Substrate CLI arguments version directly to skip binary evaluation overhead.

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++: Represent the resources limits/reservations needed by the node.

    ??? child "`Resources` interface definition"
        ```js
        export interface Resources {
          resources: {
            requests?: {
              memory?: string;
              cpu?: string;
            };
            limits?: {
              memory?: string;
              cpu?: string;
            };
          };
        }
        ```

- **`keystore_key_types?`** ++"string[]"++: Defines which keystore keys should be created.

The configuration file below defines a minimal example for the collator:

=== "TOML"

    ```toml title="collator-example.toml"
    --8<-- 'code/parachains/testing/run-a-parachain-network/collator-example.toml'
    ```

=== "JSON"

    ```json title="collator-example.json"
    --8<-- 'code/parachains/testing/run-a-parachain-network/collator-example.json'
    ```

#### Collator Groups Configuration

The `collator_groups` key defines further parameters for the collator groups. The available keys are:

- **`name`** ++"string"++: Name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`).
- **`image?`** ++"string"++: Override default Docker image to use for this node.
- **`command?`** ++"string"++: Override default command to run.
- **`args?`** ++"string[]"++: Arguments to be passed to the command.
- **`env?`** ++"envVars[]"++: Environment variables to set in the container.

    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`overrides?`** ++"Override[]"++: Array of overrides definitions.

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++: Customizes the metric's prefix for the specific node. Defaults to `substrate`.
- **`db_snapshot?`** ++"string"++: Database snapshot to use.
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++: Set the Substrate CLI arguments version directly to skip binary evaluation overhead.

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++: Represent the resources limits/reservations needed by the node.

    ??? child "`Resources` interface definition"
        ```js
        export interface Resources {
          resources: {
            requests?: {
              memory?: string;
              cpu?: string;
            };
            limits?: {
              memory?: string;
              cpu?: string;
            };
          };
        }
        ```

- **`keystore_key_types?`** ++"string[]"++: Defines which keystore keys should be created.
- **`count`** ++"number | string"++: Number of nodes to launch for this group.
- **`delay_network_settings?`** ++"DelayNetworkSettings"++: Sets the expected configuration to delay the network.

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

For instance, the configuration file below defines a minimal example for the collator groups:

=== "TOML"

    ```toml title="collator-groups-example.toml"
    --8<-- 'code/parachains/testing/run-a-parachain-network/collator-groups-example.toml'
    ```

=== "JSON"

    ```json title="collator-groups-example.json"
    --8<-- 'code/parachains/testing/run-a-parachain-network/collator-groups-example.json'
    ```

### XCM Configuration

You can use the `hrmp_channels` keyword to define further parameters for the XCM channels at start-up. The available keys are:

- **`hrmp_channels`** ++"HrmpChannelsConfig[]"++: Array of Horizontal Relay-routed Message Passing (HRMP) channel configurations.

    ??? child "`HrmpChannelsConfig` interface definition"
        ```js
        export interface HrmpChannelsConfig {
          sender: number;
          recipient: number;
          max_capacity: number;
          max_message_size: number;
        }
        ```
        Each of the `HrmpChannelsConfig` keys are defined as follows:

        - **`sender` ++"number"++**: Parachain ID of the sender.
        - **`recipient` ++"number"++**: Parachain ID of the recipient.
        - **`max_capacity` ++"number"++**: Maximum capacity of the HRMP channel.
        - **`max_message_size` ++"number"++**: Maximum message size allowed in the HRMP channel.

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

- Metrics from Prometheus
- Log patterns
- System events
- On-chain storage
- Custom JavaScript/TypeScript scripts

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

- **Well-known functions**: `alice: is up`, `alice: parachain 100 is registered within 225 seconds`
- **Metrics**: `alice: reports node_roles is 4`
- **Logs**: `alice: log line matches glob "Imported #1" within 10 seconds`
- **System events**: `alice: system event matches ""paraId":[0-9]+" within 10 seconds`
- **Custom scripts**: `alice: js-script ./script.js return is greater than 1 within 200 seconds`

## Configuration Reference

For detailed configuration options, see:

- [Configuration examples](https://github.com/paritytech/zombienet/tree/main/examples){target=\_blank}: Sample configurations for various scenarios.
- [Testing DSL specification](https://paritytech.github.io/zombienet/cli/test-dsl-definition-spec.html){target=\_blank}: Complete DSL syntax reference.
- [Zombienet book](https://paritytech.github.io/zombienet/){target=\_blank}: Comprehensive documentation.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge external">External</span> __Zombienet Support__

    ---

    For further support and information, refer to the official resources.

    [:octicons-arrow-right-24: GitHub Repository](https://github.com/paritytech/zombienet){target=\_blank}

    [:octicons-arrow-right-24: Element Channel](https://matrix.to/#/!FWyuEyNvIFygLnWNMh:parity.io?via=parity.io&via=matrix.org&via=web3.foundation){target=\_blank}

</div>
