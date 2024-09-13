---
title: Zombienet for Ephemeral Polkadot SDK Networks
description: Diving deeper into Zombienet, a versatile tool enabling the creation of temporary Substrate networks for testing purposes.
---

# Zombienet

## Introduction

Zombienet is a testing framework designed for Polkadot SDK-based blockchains. It provides a simple CLI tool for creating and testing blockchain environments locally or across networks. This allows developers to easily run and interact with blockchain nodes in a controlled environment. Zombienet is a JavaScript library designed to run on Node.js and supports various backend providers, including Kubernetes, Podman, and local setups for running blockchain nodes.

The framework enables developers to create tests using natural language tools to verify on-chain storage, metrics, logs, and custom interactions with the blockchain. It is particularly effective for setting up local relaychains with validators and parachains with collators.

[Parity Technologies](https://www.parity.io/){target=_blank} has designed and developed this framework, now maintained by the Zombienet team. For further support and information, refer to the following contact points:

- [Zombienet repository](https://github.com/paritytech/zombienet){target=_blank}
- [Element public channel](https://matrix.to/#/!FWyuEyNvIFygLnWNMh:parity.io?via=parity.io&via=matrix.org&via=web3.foundation){target=_blank}

## Install Zombienet

Zombienet releases are available on the [Zombienet repository](https://github.com/paritytech/zombienet){target=_blank}.

In order to install Zombienet, there are multiple options available, depending on the user's preferences and the environment where it will be used. The following section will guide you through the installation process for each of the available options.

=== "Using the Executable"

    Zombienet executables can be downloaded using the latest release uploaded on the [Zombienet repository](https://github.com/paritytech/zombienet/releases){target=_blank}. You can download the executable for your operating system and architecture and then move it to a directory in your PATH. Each release includes executables for Linux and macOS, which are generated using [pkg](https://github.com/vercel/pkg){target=_blank}. This allows the Zombienet CLI to operate without requiring Node.js to be installed. 

    Alternatively, you can also download the executable using either `curl` or `wget`:

    === "curl"

        ```bash
        curl -LO \
        https://github.com/paritytech/zombienet/releases/download/<INSERT_ZOMBIENET_VERSION>/<INSERT_ZOMBIENET_EXECUTABLE>
        ```

    === "wget"

        ```bash
        wget \
        https://github.com/paritytech/zombienet/releases/download/<INSERT_ZOMBIENET_VERSION>/<INSERT_ZOMBIENET_EXECUTABLE>
        ```

    !!! note
        Ensure to replace the URL with the `<INSERT_ZOMBIENET_VERSION>` that you want to download, as well as the `<INSERT_ZOMBIENET_EXECUTABLE>` with the name of the executable file that matches your operating system and architecture. This guide uses `v{{ dependencies.zombienet.version }}` and `zombienet-{{ dependencies.zombienet.architecture }}`.
    
    !!! note
        This documentation explains the functionality of Chopsticks version `{{ dependencies.chopsticks.version }}`. Make sure you're using the correct version to match these instructions.

    Then, ensure the downloaded file is executable:

    ```bash
    chmod +x zombienet-{{ dependencies.zombienet.architecture }}
    ```

    Finally, you can run the following command to check if the installation was successful. If so, it will display the version of the installed Zombienet:

    ```bash
    ./zombienet-{{ dependencies.zombienet.architecture }} version
    ```

    If you want to add the `zombienet` executable to your PATH, you can move it to a directory in your PATH, such as `/usr/local/bin`:

    ```bash
    mv zombienet-{{ dependencies.zombienet.architecture }} /usr/local/bin/zombienet
    ```

    So then, you can refer to the `zombienet` executable directly:

    ```bash
    zombienet version
    ```

    So then, you can refer to the `zombienet` executable directly:

    ```bash
    zombienet version
    ```

=== "Using Nix"

    For Nix users, the Zombienet repository provides a [`flake.nix`](https://github.com/paritytech/zombienet/blob/main/flake.nix){target=_blank} file that can be used to install Zombienet. This means that users can easily incorporate Zombienet into their Nix-based projects. 
    
    To install Zombienet utilizing Nix, users can run the following command, triggering the fetching of the flake and subsequently installing the Zombienet package:

    ```bash
    nix run github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION -- \
    spawn INSERT_ZOMBIENET_CONFIG_FILE_NAME.toml
    ```

    !!! note
        Ensure to replace the `INSERT_ZOMBIENET_VERSION` with the desired version of Zombienet. Also, replace the `INSERT_ZOMBIENET_CONFIG_FILE_NAME` with the name of the configuration file you want to use.

    To run the command above, you need to have [Flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes){target=_blank} enabled.

    Alternatively, you can also include the Zombienet binary in the PATH for the current shell. This can be achieved by:
    
    ```bash
    nix shell github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION
    ```

=== "Using Docker"

    Zombienet can also be run using Docker. The Zombienet repository provides a Docker image that can be used to run the Zombienet CLI. To run Zombienet using Docker, you can use the following command:

    ```bash
    docker run -it --rm \
    -v $(pwd):/home/nonroot/zombie-net/host-current-files \
    paritytech/zombienet
    ```
    The command above will run the Zombienet CLI inside a Docker container and mount the current directory to the `/home/nonroot/zombie-net/host-current-files` directory inside the container. This allows Zombienet to access the configuration file and other files in the current directory. If you want to mount a different directory, replace `$(pwd)` with the desired directory path.

    Inside the Docker container, you can run the Zombienet CLI commands. First, you need to set up Zombienet downloading the necessary binaries:

    ```bash
    npm run zombie -- setup polkadot polkadot-parachain
    ```

    After that, you need to add those binaries to the PATH:

    ```bash
    export PATH=/home/nonroot/zombie-net:$PATH
    ```

    Finally, you can run the Zombienet CLI commands. For example, to spawn a network using a specific configuration file, you can run the following command:

    ```bash
    npm run zombie -- -p native spawn host-current-files/minimal.toml
    ```

    The command above mounts the current directory to the `/workspace` directory inside the Docker container. This allows Zombienet to access the configuration file and other files in the current directory. If you want to mount a different directory, replace `$(pwd)` with the desired directory path.

## Providers

Zombienet supports different backend providers for running the nodes. At this moment, [Kubernetes](https://kubernetes.io/){target=_blank}, [Podman](https://podman.io/){target=_blank}, and local are supported, which can be declared as `kubernetes`, `podman`, or `native`, respectively.

To use a particular provider, you can specify it in the network file or use the `--provider` flag in the CLI:

```bash
zombienet spawn network.toml --provider INSERT_PROVIDER
```

Alternatively, you can set the provider in the network file:

```toml
[settings]
provider = "INSERT_PROVIDER"
...
```

At the moment, Zombienet supports the following providers: `kubernetes`, `podman`, and `native`.

It's important to note that each provider has specific requirements and associated features. The subsequent sections will guide you through the installation process for each provider and the requirements and features each provider offers.

### Kubernetes

#### Requirements

Zombienet is designed to be compatible with a variety of Kubernetes clusters, including [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine){target=_blank}, [Docker Desktop](https://docs.docker.com/desktop/kubernetes/){target=_blank}, and [kind](https://kind.sigs.k8s.io/){target=_blank}. To effectively interact with your cluster, you'll need to ensure that [`kubectl`](https://kubernetes.io/docs/reference/kubectl/){target=_blank} is installed on your system, which is the Kubernetes command-line tool that allows you to run commands against Kubernetes clusters. If you don't have `kubectl` installed, you can follow the instructions provided on the [Kubernetes website](https://kubernetes.io/docs/tasks/tools/#kubectl){target=_blank}.

Moreover, in order to create resources such as namespaces, pods, and CronJobs within the target cluster, you must have the appropriate permissions granted to your user or service account. These permissions are essential for managing and deploying applications effectively within Kubernetes.

#### Features

In Kubernetes, Zombienet uses the Prometheus operator (if available) to oversee monitoring and visibility. This configuration ensures that only essential networking-related pods are deployed. Using the Prometheus operator, Zombienet improves its ability to efficiently monitor and manage network activities within the Kubernetes cluster. 

### Podman

#### Requirements

Zombienet supports Podman rootless as a provider. To use Podman as a provider, you need to have Podman installed on your system. Podman is a daemonless container engine for developing, managing, and running Open Container Initiative (OCI) containers and container images on Linux-based systems. You can install Podman by following the instructions provided on the [Podman website](https://podman.io/getting-started/installation){target=_blank}.

!!! warning
    Currently, Podman can only be used with Zombienet on Linux machines. Although Podman has support for macOS through an internal VM, the Zombienet provider code requires Podman to run natively on Linux.

#### Features

Using Podman, Zombienet deploys additional pods to enhance the monitoring and visibility of the active network. Specifically, pods for [Prometheus](https://prometheus.io/){target=_blank}, [Tempo](https://grafana.com/docs/tempo/latest/operations/monitor/){target=_blank}, and [Grafana](https://grafana.com/){target=_blank} are included in the deployment. Grafana is configured with Prometheus and Tempo as data sources.

Upon launching Zombienet, access to these monitoring services is facilitated through specific URLs provided in the output:

- Prometheus - [http://127.0.0.1:34123](http://127.0.0.1:34123){target=_blank}
- Tempo - [http://127.0.0.1:34125](http://127.0.0.1:34125){target=_blank}
- Grafana - [http://127.0.0.1:41461](http://127.0.0.1:41461){target=_blank}

It's important to note that Grafana is deployed with default administrator access.

!!! note
    When network operations cease —either by halting a running spawn with Ctrl+C or upon completion of the test— Zombienet automatically removes all associated pods.

### Local

#### Requirements

The Zombienet local provider, also referred to as native, enables you to run nodes as local processes in your environment. You must have the necessary binaries for your network (such as `polkadot` and `polkadot-parachain`). These binaries should be available in your PATH, allowing Zombienet to spawn the nodes as local processes.

To install the necessary binaries, you can use the Zombienet CLI command:

```bash
zombienet setup polkadot polkadot-parachain
```

This command will download and prepare the necessary binaries for Zombienet’s use.

!!! warning
    The `polkadot` and `polkadot-parachain` binaries releases are not compatible with macOS. As a result, macOS users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=_blank}, build the Polkadot binary, and manually add it to their PATH for `polkadot` and `polkadot-parachain` to work.

If you need to use a custom binary, ensure the binary is available in your PATH. You can also specify the binary path in the network configuration file. To showcase this, this guide will use the custom [OpenZeppelin template](https://github.com/OpenZeppelin/polkadot-runtime-templates){target=_blank} as an example.

First, clone the OpenZeppelin template repository:

```bash
git clone https://github.com/OpenZeppelin/polkadot-runtime-templates \
&& cd polkadot-runtime-templates/generic-template

Then, build the custom binary:

```bash
cargo build --release
```

After that, add the custom binary to your PATH:

```bash
export PATH=$PATH:/path/to/polkadot-runtime-templates/parachain-template-node/target/release
```

Alternatively, you can specify the binary path in the network configuration file:

```toml
[relaychain]
chain = "rococo-local"
default_command = "./bin-v1.6.0/polkadot"

[parachain]
id = 1000

	[parachain.collators]
	name = "collator01"
	command = "./target/release/parachain-template-node"
```

!!! note
    The local provider exclusively utilizes the command configuration for nodes/collators, which supports both relative and absolute paths. You can employ the `default_command` configuration to specify the binary for spawning all nodes in the relay chain.

#### Features

Currently, the local provider does not execute any additional layers or processes.

## CLI Usage

Zombienet provides a CLI that allows interaction with the tool. The CLI can receive commands and flags to perform different kinds of operations. These operations can be initiated using the following syntax:

```bash
zombienet <arguments> <commands>
```

The following sections will guide you through the primary usage of the Zombienet CLI and the available commands and flags.

### CLI Commands

??? function "`spawn` - spawn the network defined in the configuration file"

    === "Argument"

        - `<networkConfig>` - a file that declares the desired network to be spawned in `.toml` or `.json` format. For further information, check out the [Configuration Files](#configuration-files) section

    !!! warning
        For the `spawn` command to work on macOS, users need to be aware that the Polkadot binary is currently not compatible with macOS. As a result, macOS users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=_blank}, build Polkadot binary, and manually add it to their PATH.

??? function "`test` - run test on the network spawned"

    === "Argument"

        - `<testFile>` - a file that defines assertions and tests against the spawned network, using natural language expressions to evaluate metrics, logs, and built-in functions

??? function "`setup` - set up the Zombienet development environment"

    === "Argument"

        - `<binaries>` - executables that will be downloaded and prepared to be used by Zombienet. Options: `polkadot`, `polkadot-parachain`

??? function "`convert` - transforms a (now deprecated) polkadot-launch configuration file to a Zombienet configuration file"

    === "Argument"

        - `<filePath>` - path to a [polkadot-launch](https://github.com/paritytech/polkadot-launch){target=_blank} configuration file with a `.js` or `.json` extension defined by [the `LaunchConfig` interface](https://github.com/paritytech/polkadot-launch/blob/295a6870dd363b0b0108e745887f51e7141d7b5f/src/types.d.ts#L10){target=_blank}

??? function "`version` - prints Zombienet version"

    === "Argument"

        None 

??? function "`help` - prints help information"

    === "Argument"

        None 

### CLI Flags

You can use the following flags to customize the behavior of the CLI:

??? function "`-p`, `--provider` - override provider to use. Defaults to `kubernetes`"

    === "Argument"

        - `<provider>` - the provider to use. Options: `podman`, `kubernetes`, `native`

??? function "`-d`, `--dir` - directory path for placing the network files instead of random temp one"

    === "Argument"

        - `<path>` - desired path for network files  

    === "Example"

        ```zombienet -d /home/user/my-zombienet```

??? function "`-f`, `--force` - force override all prompt commands"

    === "Argument"

        None

??? function "`-l`, `--logType` - type of logging on the console. Defaults to `table`"

    === "Argument"

        - `<logType>` desired type of logging. Options: `table`, `text`, `silent`

??? function "`-m`, `--monitor` - start as monitor, do not auto clean up network"

    === "Argument"

        None

??? function "`-c`, `--spawn-concurrency` - number of concurrent spawning processes to launch. Defaults to `1`"

    === "Argument"

        - `<concurrency>` - desired quantity of processes

??? function "`-h`, `--help` - display help for command"

    === "Argument"

        None

## Configuration Files

The network configuration can be given in either JSON or TOML format. The Zombienet repository also provides a [folder with some examples](https://github.com/paritytech/zombienet/tree/main/examples){target=_blank} of configuration files that can be used as a reference.

!!! note
    Each section may include provider-specific keys that are not recognized by other providers. For example, if you use the local provider, any references to images for nodes will be disregarded.

### Settings

Through the keyword `settings`, it's possible to define the general settings for the network. The available keys are:

- `global_volumes?` ++"GlobalVolume[]"++ - a list of global volumes to use. The `GlobalVolume` interface is defined as follows: 
  ```js
  export interface GlobalVolume {
    name: string;
    fs_type: string;
    mount_path: string;
  }
  ```
- `bootnode` ++"boolean"++ - add bootnode to network. Default is `true`
- `bootnode_domain?` ++"string"++ - domain to use for bootnode
- `timeout` ++"number"++ - global timeout to use for spawning the whole network"
- `node_spawn_timeout?` ++"number"++ - timeout to spawn pod/process
- `grafana?` ++"boolean"++ - deploy an instance of Grafana
- `prometheus?` ++"boolean"++ - deploy an instance of Prometheus
- `telemetry?` ++"boolean"++ - enable telemetry for the network
- `jaeger_agent?` ++"string"++ - the Jaeger agent endpoint passed to the nodes. Only available on Kubernetes
- `tracing_collator_url?` ++"string"++ - the URL of the tracing collator used to query by the tracing assertion. Should be tempo query compatible
- `tracing_collator_service_name?` ++"string"++ - service name for tempo query frontend. Only available on Kubernetes. Defaults to `tempo-tempo-distributed-query-frontend`
- `tracing_collator_service_namespace?` ++"string"++ - namespace where tempo is running. Only available on Kubernetes. Defaults to `tempo`
- `tracing_collator_service_port?` ++"number"++ - port of the query instance of tempo. Only available on Kubernetes. Defaults to `3100`
- `enable_tracing?` ++"boolean"++ - enable the tracing system. Only available on Kubernetes. Defaults to `true`
- `provider` ++"string"++ - provider to use. Default is `kubernetes`"
- `polkadot_introspector?` ++"boolean"++ - deploy an instance of polkadot-introspector. Only available on Podman and Kubernetes. Defaults to `false`
- `backchannel?` ++"boolean"++ - deploy an instance of backchannel server. Only available on Kubernetes. Defaults to `false`
- `image_pull_policy?` ++"string"++ - image pull policy to use in the network. Possible values are `Always`, `IfNotPresent`, and `Never`
- `local_ip?` ++"string"++ - IP used for exposing local services (rpc/metrics/monitors). Defaults to `"127.0.0.1"`
- `global_delay_network_global_settings?` ++"number"++ - delay in seconds to apply to the network
- `node_verifier?` ++"string"++ - specify how to verify node readiness or deactivate by using `None`. Possible values are `None` and `Metric`. Defaults to `Metric`

For example, the following configuration file defines a minimal example for the settings:

=== "TOML"

    ```toml title="base-example.toml"
    --8<-- 'code/developer-tools/zombienet/overview/base-example.toml'
    ```

=== "JSON"

    ```json title="base-example.json"
    --8<-- 'code/developer-tools/zombienet/overview/base-example.json'
    ```

### Relay Chain Configuration

You can use the `relaychain` keyword to define further parameters for the relay chain at start-up. The available keys are:

- `default_command?` ++"string"++ - the default command to run. Defaults to `polkadot`
- `default_image?` ++"string"++ - the default Docker image to use
- `default_resources?` ++"Resources"++ - represents the resources limits/reservations needed by the nodes by default. Only available on Kubernetes. The `Resources` interface is defined as follows:
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
- `default_db_snapshot?` ++"string"++ - the default database snapshot to use
- `default_prometheus_prefix` ++"string"++ - a parameter for customizing the metric's prefix. Defaults to `substrate`
- `default_substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version. The `SubstrateCliArgsVersion` enum is defined as follows:
  ```js
  export enum SubstrateCliArgsVersion {
    V0 = 0,
    V1 = 1,
    V2 = 2,
    V3 = 3,
  }
  ```
- `default_keystore_key_types?` ++"string[]"++ - defines which keystore keys should be created 
- `chain` ++"string"++ - the chain name
- `chain_spec_path?` ++"string"++ - path to the chain spec file. Should be the plain version to allow customizations
- `chain_spec_command?` ++"string"++ - command to generate the chain spec. It can't be used in combination with `chain_spec_path`
- `default_args?` ++"string[]"++ - an array of arguments to use as default to pass to the command
- `default_overrides?` ++"Override[]"++ - an array of overrides to upload to the node. The `Override` interface is defined as follows:
  ```js
  export interface Override {
    local_path: string;
    remote_name: string;
  } 
  ```
- `random_nominators_count?` ++"number"++ - if set and the stacking pallet is enabled, Zombienet will generate the input quantity of nominators and inject them into the genesis
- `max_nominations` ++"number"++ - the max number of nominations allowed by a nominator. Should match the value set in the runtime. Defaults to `24`
- `nodes?` ++"Node[]"++ - an array of nodes to spawn. It is further defined on the [Node Configuration](#node-configuration) section
- `node_groups?` ++"NodeGroup[]"++ - an array of node groups to spawn. It is further defined on the [Node Group Configuration](#node-group-configuration) section
- `total_node_in_group?` ++"number"++ - the total number of nodes in the group. Defaults to `1`
- `genesis` ++"JSON"++ - the genesis configuration
- `default_delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network. The `DelayNetworkSettings` interface is defined as follows:
  ```js
  export interface DelayNetworkSettings {
    latency: string;
    correlation?: string; // should be parsable as float by k8s
    jitter?: string;
  }
  ```

#### Node Configuration

There is one specific key capable of receiving more subkeys: the `nodes` key. This key is used to define further parameters for the nodes. The available keys:

- `name` ++"string"++ - name of the node. Any whitespace will be replaced with a dash (e.g., `new alice` will be converted to `new-alice`)
- `image?` ++"string"++ - override default Docker image to use for this node
- `command?` ++"string"++ - override default command to run
- `command_with_args?` ++"string"++ - override default command and arguments
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container. The `envVars` interface is defined as follows:
  ```js
  export interface EnvVars {
    name: string;
    value: string;
  }
  ```
- `overrides?` ++"Override[]"++ - array of overrides definitions. The `Override` interface is defined as follows:
  ```js
  export interface Override {
    local_path: string;
    remote_name: string;
  }
  ```
- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead. The `SubstrateCliArgsVersion` enum is defined as follows:
  ```js
  export enum SubstrateCliArgsVersion {
    V0 = 0,
    V1 = 1,
    V2 = 2,
    V3 = 3,
  }
  ```
- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node. The `Resources` interface is defined as follows:
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
- `keystore_key_types?` ++"string[]"++ - defines which keystore keys should be created
- `validator` ++"boolean"++ - pass the `--validator` flag to the command. Defaults to `true`
- `invulnerable` ++"boolean"++ - if true, add the node to invulnerables in the chain spec. Defaults to `false`
- `balance` ++"number"++ - balance to set in balances for node's account. Defaults to `2000000000000`
- `bootnodes?` ++"string[]"++ - array of bootnodes to use
- `add_to_bootnodes?` ++"boolean"++ - add this node to the bootnode list. Defaults to `false`
- `ws_port?` ++"number"++ - WS port to use
- `rpc_port?` ++"number"++ - RPC port to use
- `prometheus_port?` ++"number"++ - Prometheus port to use
- `p2p_cert_hash?` ++"string"++ - libp2p certhash to use with webRTC transport
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network. The `DelayNetworkSettings` interface is defined as follows:
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
    --8<-- 'code/developer-tools/zombienet/overview/relaychain-example-nodes.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-nodes.json"
    --8<-- 'code/developer-tools/zombienet/overview/relaychain-example-nodes.json'
    ```

#### Node Group Configuration

The `node_groups` key is used to define further parameters for the node groups. The available keys are:

- `name` ++"string"++ - name of the node. Any whitespace will be replaced with a dash (e.g., `new alice` will be converted to `new-alice`)
- `image?` ++"string"++ - override default Docker image to use for this node
- `command?` ++"string"++ - override default command to run
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container. The `envVars` interface is defined as follows:
  ```js
  export interface EnvVars {
    name: string;
    value: string;
  }
  ```
- `overrides?` ++"Override[]"++ - array of overrides definitions. The `Override` interface is defined as follows:
  ```js
  export interface Override {
    local_path: string;
    remote_name: string;
  }
  ```
- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead. The `SubstrateCliArgsVersion` enum is defined as follows:
  ```js
  export enum SubstrateCliArgsVersion {
    V0 = 0,
    V1 = 1,
    V2 = 2,
    V3 = 3,
  }
  ```
- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node. The `Resources` interface is defined as follows:
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
- `keystore_key_types?` ++"string[]"++ - defines which keystore keys should be created
- `count` ++"number | string"++ - number of nodes to launch for this group
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network. The `DelayNetworkSettings` interface is defined as follows:
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
    --8<-- 'code/developer-tools/zombienet/overview/relaychain-example-node-groups.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-node-groups.json"
    --8<-- 'code/developer-tools/zombienet/overview/relaychain-example-node-groups.json'
    ```

### Parachain Configuration

The `parachain` keyword is used to define further parameters for the parachain. The available keys are:

- `id` ++"number"++ - the id to assign to this parachain. Must be unique
- `chain?` ++"string"++ - the chain name
- `force_decorator?` ++"string"++ - force the use of a specific decorator
- `genesis?` ++"JSON"++ - the genesis configuration
- `balance?` ++"number"++ - balance to set in balances for parachain's account
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network. The `DelayNetworkSettings` interface is defined as follows:
  ```js
  export interface DelayNetworkSettings {
    latency: string;
    correlation?: string; // should be parsable as float by k8s
    jitter?: string;
  }
  ```
- `add_to_genesis?` ++"boolean"++ - flag to add parachain to genesis or register in runtime. Defaults to `true`
- `register_para?` ++"boolean"++ - flag to specify whether the para should be registered. The `add_to_genesis` flag must be set to false for this flag to have any effect. Defaults to `true`
- `onboard_as_parachain?` ++"boolean"++ - flag to specify whether the para should be onboarded as a parachain, rather than remaining a parathread. Defaults to `true`
- `genesis_wasm_path?` ++"string"++ - path to the Wasm file to use
- `genesis_wasm_generator?` ++"string"++ - command to generate the Wasm file
- `genesis_state_path?` ++"string"++ - path to the state file to use
- `genesis_state_generator?` ++"string"++ - command to generate the state file
- `chain_spec_path?` ++"string"++ - path to the chain spec file
- `chain_spec_command?` ++"string"++ - command to generate the chain spec
- `cumulus_based?` ++"boolean"++ - flag to use cumulus command generation. Defaults to `true`
- `bootnodes?` ++"string[]"++ - array of bootnodes to use
- `prometheus_prefix?` ++"string"++ - parameter for customizing the metric's prefix for all parachain nodes/collators. Defaults to `substrate`
- `collator?` ++"Collator"++ - further defined on the [Collator Configuration](#collator-configuration) section
- `collators?` ++"Collator[]"++ - an array of collators to spawn. It is further defined on the [Collator Configuration](#collator-configuration) section
- `collator_groups?` ++"CollatorGroup[]"++ - an array of collator groups to spawn. It is further defined on the [Collator Groups](#collator-groups) section
 

For example, the following configuration file defines a minimal example for the parachain:

=== "TOML"

    ```toml title="parachain-example.toml"
    --8<-- 'code/developer-tools/zombienet/overview/parachain-example.toml'
    ```

=== "JSON"

    ```json title="parachain-example.json"
    --8<-- 'code/developer-tools/zombienet/overview/parachain-example.json'
    ```

#### Collator Configuration

One specific key capable of receiving more subkeys is the `collator` key. This key is used to define further parameters for the nodes. The available keys are:

- `name` ++"string"++ - name of the collator. Any whitespace will be replaced with a dash (e.g., `new alice` will be converted to `new-alice`)
- `image?` ++"string"++ - image to use for the collator
- `command_with_args?` ++"string"++ - overrides both command and arguments for the collator
- `validator` ++"boolean"++ - pass the `--validator` flag to the command. Defaults to `true`
- `invulnerable` ++"boolean"++ - if true, add the collator to invulnerables in the chain spec. Defaults to `false`
- `balance` ++"number"++ - balance to set in balances for collator's account. Defaults to `2000000000000`
- `bootnodes?` ++"string[]"++ - array of bootnodes to use
- `add_to_bootnodes?` ++"boolean"++ - add this collator to the bootnode list. Defaults to `false`
- `ws_port?` ++"number"++ - WS port to use
- `rpc_port?` ++"number"++ - RPC port to use
- `prometheus_port?` ++"number"++ - Prometheus port to use
- `p2p_port?` ++"number"++ - P2P port to use
- `p2p_cert_hash?` ++"string"++ - libp2p certhash to use with webRTC transport
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network. The `DelayNetworkSettings` interface is defined as follows:
  ```js
  export interface DelayNetworkSettings {
    latency: string;
    correlation?: string; // should be parsable as float by k8s
    jitter?: string;
  }
  ```
- `command?` ++"string"++ - override default command to run
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container. The `envVars` interface is defined as follows:
  ```js
  export interface EnvVars {
    name: string;
    value: string;
  }
  ```
- `overrides?` ++"Override[]"++ - array of overrides definitions. The `Override` interface is defined as follows:
  ```js
  export interface Override {
    local_path: string;
    remote_name: string;
  }
  ```
- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead. The `SubstrateCliArgsVersion` enum is defined as follows:
  ```js
  export enum SubstrateCliArgsVersion {
    V0 = 0,
    V1 = 1,
    V2 = 2,
    V3 = 3,
  }
  ```
- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node. The `Resources` interface is defined as follows:
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
- `keystore_key_types?` ++"string[]"++ - defines which keystore keys should be created

The configuration file below defines a minimal example for the collator:

=== "TOML"

    ```toml title="collator-example.toml"
    --8<-- 'code/developer-tools/zombienet/overview/collator-example.toml'
    ```

=== "JSON"

    ```json title="collator-example.json"
    --8<-- 'code/developer-tools/zombienet/overview/collator-example.json'
    ```

#### Collator Groups

The `collator_groups` key is used to define further parameters for the collator groups. The available keys are:

- `name` ++"string"++ - name of the node. Any whitespace will be replaced with a dash (e.g., `new alice` will be converted to `new-alice`)
- `image?` ++"string"++ - override default Docker image to use for this node
- `command?` ++"string"++ - override default command to run
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container. The `envVars` interface is defined as follows:
  ```js
  export interface EnvVars {
    name: string;
    value: string;
  }
  ```
- `overrides?` ++"Override[]"++ - array of overrides definitions. The `Override` interface is defined as follows:
  ```js
  export interface Override {
    local_path: string;
    remote_name: string;
  }
  ```
- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead. The `SubstrateCliArgsVersion` enum is defined as follows:
  ```js
  export enum SubstrateCliArgsVersion {
    V0 = 0,
    V1 = 1,
    V2 = 2,
    V3 = 3,
  }
  ```
- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node. The `Resources` interface is defined as follows:
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
- `keystore_key_types?` ++"string[]"++ - defines which keystore keys should be created
- `count` ++"number | string"++ - number of nodes to launch for this group
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network. The `DelayNetworkSettings` interface is defined as follows:
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
    --8<-- 'code/developer-tools/zombienet/overview/collator-groups-example.toml'
    ```

=== "JSON"

    ```json title="collator-groups-example.json"
    --8<-- 'code/developer-tools/zombienet/overview/collator-groups-example.json'
    ```

### XCM Configuration

You can use the `hrmp_channels` keyword to define further parameters for the XCM channels at start-up. The available keys are:

- `hrmp_channels` ++"HrmpChannelsConfig[]"++ - array of Horizontal Relay-routed Message Passing (HRMP) channel configurations. The `HrmpChannelsConfig` interface is defined as follows:
  ```js
  export interface HrmpChannelsConfig {
    sender: number;
    recipient: number;
    max_capacity: number;
    max_message_size: number;
  }
  ```
Each of the `HrmpChannelsConfig` keys are defined as follows:

- `sender` ++"number"++ - parachain ID of the sender
- `recipient` ++"number"++ - parachain ID of the recipient
- `max_capacity` ++"number"++ - maximum capacity of the HRMP channel
- `max_message_size` ++"number"++ - maximum message size allowed in the HRMP channel
