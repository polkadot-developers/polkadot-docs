---
title: Spawn Chains for Testing with Zombienet
description: Learn how to deploy, configure, and test Polkadot SDK-based blockchain networks using Zombienet with Kubernetes, Podman, or local setups.
---

# Spawn Chains for Testing with Zombienet

## Introduction

Zombienet is a versatile testing framework tailored for Polkadot SDK-based blockchain networks. This guide consolidates essential tasks for deploying and testing ephemeral blockchain environments across various platforms, including Kubernetes, Podman, and native setups. With its simple CLI, developers can spawn relay chains, parachains, and run comprehensive tests to validate network performance. 

From installation to advanced testing scenarios, you’ll explore how Zombienet leverages metrics, logs, and custom scripts to ensure robust blockchain development. Whether you're new to blockchain testing or refining your setup, this guide offers the tools and insights needed for efficient testing.

??? interface "Additional support resources"
    [Parity Technologies](https://www.parity.io/){target=_blank} has designed and developed this framework, now maintained by the Zombienet team. 

    For further support and information, refer to the following contact points:

    - [Zombienet repository](https://github.com/paritytech/zombienet){target=_blank}
    - [Element public channel](https://matrix.to/#/!FWyuEyNvIFygLnWNMh:parity.io?via=parity.io&via=matrix.org&via=web3.foundation){target=_blank}

## Install Zombienet

Zombienet releases are available on the [Zombienet repository](https://github.com/paritytech/zombienet){target=_blank}.

To install Zombienet, there are multiple options available, depending on the user's preferences and the environment where it will be used. The following section will guide you through the installation process for each of the available options.

=== "Using the Executable"

    Zombienet executables can be downloaded using the latest release uploaded on the [Zombienet repository](https://github.com/paritytech/zombienet/releases){target=_blank}. You can download the executable for your operating system and architecture and then move it to a directory in your PATH. Each release includes executables for Linux and macOS, which are generated using [pkg](https://github.com/vercel/pkg){target=_blank}. This allows the Zombienet CLI to operate without requiring Node.js to be installed. 

    Alternatively, you can also download the executable using either `curl` or `wget`:

    === "curl"

        ```bash
        curl -LO \
        https://github.com/paritytech/zombienet/releases/download/INSERT_ZOMBIENET_VERSION/INSERT_ZOMBIENET_EXECUTABLE
        ```

    === "wget"

        ```bash
        wget \
        https://github.com/paritytech/zombienet/releases/download/INSERT_ZOMBIENET_VERSION/INSERT_ZOMBIENET_EXECUTABLE
        ```

    !!! note
        - Replace `INSERT_ZOMBIENET_VERSION` with the URL that you want to download
        - Replace `INSERT_ZOMBIENET_EXECUTABLE` with the name of the executable file that matches your operating system and architecture 
        - This guide uses `v{{ dependencies.zombienet.version }}` and `zombienet-{{ dependencies.zombienet.architecture }}`

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

    For Nix users, the Zombienet repository provides a [`flake.nix`](https://github.com/paritytech/zombienet/blob/main/flake.nix){target=\_blank} file that can be used to install Zombienet. This means that users can easily incorporate Zombienet into their Nix-based projects. 
    
    To install Zombienet utilizing Nix, users can run the following command, triggering the fetching of the flake and subsequently installing the Zombienet package:

    ```bash
    nix run github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION -- \
    spawn INSERT_ZOMBIENET_CONFIG_FILE_NAME.toml
    ```

    !!! note
        - Replace the `INSERT_ZOMBIENET_VERSION` with the desired version of Zombienet
        - Replace the `INSERT_ZOMBIENET_CONFIG_FILE_NAME` with the name of the configuration file you want to use

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

Zombienet supports different backend providers for running the nodes. At this moment, [Kubernetes](https://kubernetes.io/){target=_blank}, [Podman](https://podman.io/){target=_blank}, and local providers are supported, which can be declared as `kubernetes`, `podman`, or `native`, respectively.

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

It's important to note that each provider has specific requirements and associated features. The subsequent sections will guide you through the installation process for each provider and the requirements and features each provider offers.

### Kubernetes

=== "Requirements"
    Zombienet is designed to be compatible with a variety of Kubernetes clusters including: 

    - [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine){target=_blank}
    - [Docker Desktop](https://docs.docker.com/desktop/kubernetes/){target=_blank}
    - [kind](https://kind.sigs.k8s.io/){target=_blank}

    To effectively interact with your cluster, you'll need to ensure that [`kubectl`](https://kubernetes.io/docs/reference/kubectl/){target=_blank} is installed on your system, which is the Kubernetes command-line tool that allows you to run commands against Kubernetes clusters. If you don't have `kubectl` installed, you can follow the instructions provided on the [Kubernetes website](https://kubernetes.io/docs/tasks/tools/#kubectl){target=_blank}.

    To create resources such as namespaces, pods, and CronJobs within the target cluster, you must have the appropriate permissions granted to your user or service account. These permissions are essential for managing and deploying applications effectively within Kubernetes.

=== "Features"
    In Kubernetes, Zombienet uses the Prometheus operator (if available) to oversee monitoring and visibility. This configuration ensures that only essential networking-related pods are deployed. Using the Prometheus operator, Zombienet improves its ability to efficiently monitor and manage network activities within the Kubernetes cluster. 

### Podman

=== "Requirements"
    Zombienet supports Podman rootless as a provider. To use Podman as a provider, you need to have Podman installed on your system. Podman is a daemonless container engine for developing, managing, and running Open Container Initiative (OCI) containers and container images on Linux-based systems. You can install Podman by following the instructions provided on the [Podman website](https://podman.io/getting-started/installation){target=_blank}.

=== "Features"
    Using Podman, Zombienet deploys additional pods to enhance the monitoring and visibility of the active network. Specifically, pods for [Prometheus](https://prometheus.io/){target=_blank}, [Tempo](https://grafana.com/docs/tempo/latest/operations/monitor/){target=_blank}, and [Grafana](https://grafana.com/){target=_blank} are included in the deployment. Grafana is configured with Prometheus and Tempo as data sources.

    Upon launching Zombienet, access to these monitoring services is facilitated through specific URLs provided in the output:

    - Prometheus - [http://127.0.0.1:34123](http://127.0.0.1:34123){target=_blank}
    - Tempo - [http://127.0.0.1:34125](http://127.0.0.1:34125){target=_blank}
    - Grafana - [http://127.0.0.1:41461](http://127.0.0.1:41461){target=_blank}

    It's important to note that Grafana is deployed with default administrator access. 
    
    When network operations cease, either by halting a running spawn with `Ctrl+C` or upon completion of the test, Zombienet automatically removes all associated pods.

!!! warning
    Currently, Podman can only be used with Zombienet on Linux machines. Although Podman has support for macOS through an internal VM, the Zombienet provider code requires Podman to run natively on Linux.

### Local

=== "Requirements"
    The Zombienet local provider, also referred to as native, enables you to run nodes as local processes in your environment. You must have the necessary binaries for your network (such as `polkadot` and `polkadot-parachain`). These binaries should be available in your PATH, allowing Zombienet to spawn the nodes as local processes.

    To install the necessary binaries, you can use the Zombienet CLI command:

    ```bash
    zombienet setup polkadot polkadot-parachain
    ```

    This command will download and prepare the necessary binaries for Zombienet’s use.

    !!! warning
        The `polkadot` and `polkadot-parachain` binaries releases aren't compatible with macOS. As a result, macOS users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=_blank}, build the Polkadot binary, and manually add it to their PATH for `polkadot` and `polkadot-parachain` to work.

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

=== "Features"
    Currently, the local provider doesn't execute any additional layers or processes.

## CLI Usage

Zombienet provides a CLI that allows interaction with the tool. The CLI can receive commands and flags to perform different kinds of operations. These operations can be initiated using the following syntax:

```bash
zombienet <arguments> <commands>
```

The following sections will guide you through the primary usage of the Zombienet CLI and the available commands and flags.

### CLI Commands

??? interface "`spawn` - spawn the network defined in the configuration file"

    === "Argument"

        - `<networkConfig>` - a file that declares the desired network to be spawned in `.toml` or `.json` format. For further information, check out the [Configuration Files](#configuration-files) section

    !!! warning
        For the `spawn` command to work on macOS, users need to be aware that the Polkadot binary is currently not compatible with macOS. As a result, macOS users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=_blank}, build Polkadot binary, and manually add it to their PATH.

??? interface "`test` - run test on the network spawned"

    === "Argument"

        - `<testFile>` - a file that defines assertions and tests against the spawned network, using natural language expressions to evaluate metrics, logs, and built-in functions

??? interface "`setup` - set up the Zombienet development environment"

    === "Argument"

        - `<binaries>` - executables that will be downloaded and prepared to be used by Zombienet. Options: `polkadot`, `polkadot-parachain`

??? interface "`convert` - transforms a (now deprecated) polkadot-launch configuration file to a Zombienet configuration file"

    === "Argument"

        - `<filePath>` - path to a [polkadot-launch](https://github.com/paritytech/polkadot-launch){target=_blank} configuration file with a `.js` or `.json` extension defined by [the `LaunchConfig` interface](https://github.com/paritytech/polkadot-launch/blob/295a6870dd363b0b0108e745887f51e7141d7b5f/src/types.d.ts#L10){target=_blank}

??? interface "`version` - prints Zombienet version"

    === "Argument"

        None 

??? interface "`help` - prints help information"

    === "Argument"

        None 

### CLI Flags

You can use the following flags to customize the behavior of the CLI:

??? interface "`-p`, `--provider` - override provider to use. Defaults to `kubernetes`"

    === "Argument"

        - `<provider>` - the provider to use. Options: `podman`, `kubernetes`, `native`

??? interface "`-d`, `--dir` - directory path for placing the network files instead of random temp one"

    === "Argument"

        - `<path>` - desired path for network files  

    === "Example"

        ```zombienet -d /home/user/my-zombienet```

??? interface "`-f`, `--force` - force override all prompt commands"

    === "Argument"

        None

??? interface "`-l`, `--logType` - type of logging on the console. Defaults to `table`"

    === "Argument"

        - `<logType>` desired type of logging. Options: `table`, `text`, `silent`

??? interface "`-m`, `--monitor` - start as monitor, don't auto clean up network"

    === "Argument"

        None

??? interface "`-c`, `--spawn-concurrency` - number of concurrent spawning processes to launch. Defaults to `1`"

    === "Argument"

        - `<concurrency>` - desired quantity of processes

??? interface "`-h`, `--help` - display help for command"

    === "Argument"

        None

## Configuration Files

The network configuration can be given in either JSON or TOML format. The Zombienet repository also provides a collection of [example configuration files](https://github.com/paritytech/zombienet/tree/main/examples){target=_blank} that can be used as a reference.

!!! note
    Each section may include provider-specific keys that aren't recognized by other providers. For example, if you use the local provider, any references to images for nodes will be disregarded.

### Settings

Through the keyword `settings`, it's possible to define the general settings for the network. The available keys are:

- `global_volumes?` ++"GlobalVolume[]"++ - a list of global volumes to use 

    ??? interface "`GlobalVolume` interface definition"
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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/base-example.toml'
    ```

=== "JSON"

    ```json title="base-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/base-example.json'
    ```

### Relay Chain Configuration

You can use the `relaychain` keyword to define further parameters for the relay chain at start-up. The available keys are:

- `default_command?` ++"string"++ - the default command to run. Defaults to `polkadot`
- `default_image?` ++"string"++ - the default Docker image to use
- `default_resources?` ++"Resources"++ - represents the resources limits/reservations needed by the nodes by default. Only available on Kubernetes 

    ??? interface "`Resources` interface definition"
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
- `default_substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version

    ??? interface "`SubstrateCliArgsVersion` enum definition"
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
- `default_overrides?` ++"Override[]"++ - an array of overrides to upload to the node

    ??? interface "`Override` interface definition"
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
- `default_delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? interface "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
            latency: string;
            correlation?: string; // should be parsable as float by k8s
            jitter?: string;
        }
        ```

#### Node Configuration

There is one specific key capable of receiving more subkeys: the `nodes` key. This key is used to define further parameters for the nodes. The available keys:

- `name` ++"string"++ - name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
- `image?` ++"string"++ - override default Docker image to use for this node
- `command?` ++"string"++ - override default command to run
- `command_with_args?` ++"string"++ - override default command and arguments
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container

    ??? interface "`envVars` interface definition"
        ```js
        export interface EnvVars {
            name: string;
            value: string;
        }
        ```

- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? interface "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
            V0 = 0,
            V1 = 1,
            V2 = 2,
            V3 = 3,
        }
        ```

- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node

    ??? interface "`Resources` interface definition"
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
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? interface "`DelayNetworkSettings` interface definition"
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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-nodes.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-nodes.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-nodes.json'
    ```

#### Node Group Configuration

The `node_groups` key is used to define further parameters for the node groups. The available keys are:

- `name` ++"string"++ - name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
- `image?` ++"string"++ - override default Docker image to use for this node
- `command?` ++"string"++ - override default command to run
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container
    
    ??? interface "`envVars` interface definition"
        ```js
        export interface EnvVars {
            name: string;
            value: string;
        }
        ```

- `overrides?` ++"Override[]"++ - array of overrides definitions

    ??? interface "`Override` interface definition"
        ```js
        export interface Override {
            local_path: string;
            remote_name: string;
        }
        ```

- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? interface "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
            V0 = 0,
            V1 = 1,
            V2 = 2,
            V3 = 3,
        }
        ```

- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node

    ??? interface "`Resources` interface definition"
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
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? interface "`DelayNetworkSettings` interface definition"
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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-node-groups.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-node-groups.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-node-groups.json'
    ```

### Parachain Configuration

The `parachain` keyword is used to define further parameters for the parachain. The available keys are:

- `id` ++"number"++ - the id to assign to this parachain. Must be unique
- `chain?` ++"string"++ - the chain name
- `force_decorator?` ++"string"++ - force the use of a specific decorator
- `genesis?` ++"JSON"++ - the genesis configuration
- `balance?` ++"number"++ - balance to set in balances for parachain's account
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? interface "`DelayNetworkSettings` interface definition"
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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/parachain-example.toml'
    ```

=== "JSON"

    ```json title="parachain-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/parachain-example.json'
    ```

#### Collator Configuration

One specific key capable of receiving more subkeys is the `collator` key. This key is used to define further parameters for the nodes. The available keys are:

- `name` ++"string"++ - name of the collator. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
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
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? interface "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
            latency: string;
            correlation?: string; // should be parsable as float by k8s
            jitter?: string;
        }
        ```

- `command?` ++"string"++ - override default command to run
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container

    ??? interface "`envVars` interface definition"
        ```js
        export interface EnvVars {
            name: string;
            value: string;
        }
        ```

- `overrides?` ++"Override[]"++ - array of overrides definitions

    ??? interface "`Override` interface definition"
        ```js
        export interface Override {
            local_path: string;
            remote_name: string;
        }
        ```

- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? interface "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
            V0 = 0,
            V1 = 1,
            V2 = 2,
            V3 = 3,
        }
        ```

- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node

    ??? interface "`Resources` interface definition"
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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-example.toml'
    ```

=== "JSON"

    ```json title="collator-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-example.json'
    ```

#### Collator Groups

The `collator_groups` key is used to define further parameters for the collator groups. The available keys are:

- `name` ++"string"++ - name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
- `image?` ++"string"++ - override default Docker image to use for this node
- `command?` ++"string"++ - override default command to run
- `args?` ++"string[]"++ - arguments to be passed to the command
- `env?` ++"envVars[]"++ - environment variables to set in the container

    ??? interface "`envVars` interface definition"
        ```js
        export interface EnvVars {
            name: string;
            value: string;
        }
        ```

- `overrides?` ++"Override[]"++ - array of overrides definitions

    ??? interface "`Override` interface definition"
        ```js
        export interface Override {
            local_path: string;
            remote_name: string;
        }
        ```

- `prometheus_prefix?` ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- `db_snapshot?` ++"string"++ - database snapshot to use
- `substrate_cli_args_version?` ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? interface "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
            V0 = 0,
            V1 = 1,
            V2 = 2,
            V3 = 3,
        }
        ```

- `resources?` ++"Resources"++ - represent the resources limits/reservations needed by the node

    ??? interface "`Resources` interface definition"
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
- `delay_network_settings?` ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? interface "`DelayNetworkSettings` interface definition"
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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-groups-example.toml'
    ```

=== "JSON"

    ```json title="collator-groups-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-groups-example.json'
    ```

### XCM Configuration

You can use the `hrmp_channels` keyword to define further parameters for the XCM channels at start-up. The available keys are:

- `hrmp_channels` ++"HrmpChannelsConfig[]"++ - array of Horizontal Relay-routed Message Passing (HRMP) channel configurations

    ??? interface "`HrmpChannelsConfig` interface definition"
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

## Spawn a Basic Network

In following sections, you'll learn how to set up a basic network using Zombienet and run a simple test to validate its functionality. The example provided walks you through defining a minimal network configuration, spawning the network, and interacting with the nodes. By the end, you'll clearly understand how to use Zombienet to deploy and test ephemeral blockchain networks, setting the stage for more complex scenarios.

### Prerequisites

To follow this tutorial, first, you need to have Zombienet installed. If you haven't done so, please follow the instructions in the [Installation](#install-zombienet) section.

### Define the Network

As mentioned in the [Configuration Files](#configuration-files) section, Zombienet uses a configuration file to define the ephemeral network that will be spawned. To follow this tutorial, create a file named `spawn-a-basic-network.toml` with the following content:

```toml title="spawn-a-basic-network.toml"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/spawn-a-basic-network.toml'
```

This configuration file defines a network with a relaychain with two nodes, `alice` and `bob`, and a parachain with a collator named `collator01`. Also, it sets a timeout of 120 seconds for the network to be ready.

### Run the Network

To spawn the network, run the following command:

```bash
zombienet -p native spawn spawn-a-basic-network.toml
```

This command will spawn the network defined in the `spawn-a-basic-network.toml` configuration file. The `-p native` flag specifies that the network will be spawned using the native provider.

If successful, you will see the following output:

--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/spawn-network-terminal-01.html'

!!! note 
    If the IPs and ports aren't explicitly defined in the configuration file, they may change each time the network is started, causing the links provided in the output to differ from the example.

### Interact with the Spawned Network

After the network is launched, you can interact with it using [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}. To do so, open your browser and use the provided links listed by the output as `Direct Link`.

#### Connect to the Nodes

In this particular case, as the ports may vary from spawning to spawning, to interact with the `alice` node, open [https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer](https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer){target=\_blank} as it is the link provided in the output for the `alice` node. Moreover, you can also do this for the `bob` and `collator01` nodes.

If you want to interact with the nodes more programmatically, you can also use the [Polkadot.js API](https://polkadot.js.org/api/){target=\_blank}. For example, the following code snippet shows how to connect to the `alice` node using the Polkadot.js API and log some information about the chain and node:

```typescript
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/connect-to-alice-01.js'
```

Either way allows you to interact easily with the network and its nodes.

#### Checking Metrics

You can also check the metrics of the nodes by accessing the provided links listed by the output as `Prometheus Link`. [Prometheus](https://prometheus.io/){target=_blank} is a monitoring and alerting toolkit that collects metrics from the nodes. By accessing the provided links, you can see the metrics of the nodes in a web interface. So, for example, the following image shows the Prometheus metrics for Bob’s node from the Zombienet test:

![Prometheus metrics for Bob’s node from the Zombienet test](/images/develop/toolkit/blockchain/spawn-testing-chain/zombienet-tutorials-1.webp)

#### Checking Logs

To check the nodes’ logs, you can use the provided command listed by the output as 'Log Cmd'. For instance, to check the logs of the `alice` node, you can open a new terminal and run the following command:

```bash
tail -f /var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/zombie-75a01b93c92d571f6198a67bcb380fcd_21724-SEzfCidQ1za4/alice.log
```

After running this command, you will see the logs of the `alice` node in real-time, which can be useful for debugging purposes. The logs of the `bob` and `collator01` nodes can be checked similarly.

### Testing DSL

Zombienet provides a Domain Specific Language (DSL) for writing tests. The DSL is designed to be human-readable and allows you to write tests using natural language expressions. You can define assertions and tests against the spawned network using this DSL. This way, users can evaluate different metrics, such as:

- **On-chain storage** - the storage of each of the chains running via Zombienet
- **Metrics** - the metrics provided by the nodes
- **Histograms** - visual representations of metrics data
- **Logs** - detailed records of system activities and events
- **System events** - notifications of significant occurrences within the network
- **Tracing** - detailed analysis of execution paths and operations
- **Custom API calls (through Polkadot.js)** - personalized interfaces for interacting with the network
- **Commands** - instructions or directives executed by the network

These abstractions are expressed by sentences defined in a natural language style. Therefore, each test line will be mapped to a test to run. Also, the test file (`*.zndsl`) includes pre-defined header fields used to define information about the suite, such as network configuration and credentials location.

### The Test File

The test file is a text file with the extension `.zndsl`. It is divided into two parts: the header and the body. The header contains the network configuration and the credentials to use, while the body contains the tests to run.

The header is defined by the following fields:

- `description` ++"string"++ - long description of the test suite (optional)
- `network` ++"string"++ - path to the network definition file, supported in both `.json` and `.toml` formats
- `creds` ++"string"++ - credentials filename or path to use (available only with Kubernetes provider). Looks in the current directory or `$HOME/.kube/` if a filename is passed

The body contains the tests to run. Each test is defined by a sentence in the DSL, which is mapped to a test to run. Each test line defines an assertion or a command to be executed against the spawned network.

#### Name

The test name in Zombienet is derived from the filename by removing any leading numeric characters before the first hyphen. For example, a file named `0001-zombienet-test.zndsl` will result in a test name of `zombienet-test`, which will be displayed in the test report output of the runner.

#### Assertions

Assertions are defined by sentences in the DSL that evaluate different metrics, such as on-chain storage, metrics, histograms, logs, system events, tracing, and custom API calls. Each assertion is defined by a sentence in the DSL, which is mapped to a test to run.

??? interface "`Well known functions` - already mapped test function"

    === "Syntax"

        - `node-name well-known_defined_test [within x seconds]`

    === "Examples"

        ```bash

        alice: is up
        alice: parachain 100 is registered within 225 seconds
        alice: parachain 100 block height is at least 10 within 250 seconds
        
        ```

??? interface "`Histogram` - get metrics from Prometheus, calculate the histogram and, assert on the target value/s"

    === "Syntax"

        - `node-name reports histogram memtric_name has comparator target_value samples in buckets ["bucket","bucket",...] [within x seconds]`

    === "Example"

        ```bash

        alice: reports histogram polkadot_pvf_execution_time has at least 2 samples in buckets ["0.1", "0.25", "0.5", "+Inf"] within 100 seconds
        
        ```

??? interface "`Metric` - get metric from Prometheus and assert on the target value"

    === "Syntax"

        - `node-name reports metric_name comparator target_value (e.g "is at least x", "is greater than x") [within x seconds]`

    === "Examples"

        ```bash

        alice: reports node_roles is 4
        alice: reports sub_libp2p_is_major_syncing is 0
        
        ```

??? interface "`Log line` - get logs from nodes and assert on the matching pattern"

    === "Syntax"

        - `node-name log line (contains|matches) (regex|glob) "pattern" [within x seconds]`

    === "Example"

        ```bash

        alice: log line matches glob "rted #1" within 10 seconds
        
        ```

??? interface "`Count of log lines` - get logs from nodes and assert on the number of lines matching pattern"

    === "Syntax"

        - `node-name count of log lines (containing|matcheing) (regex|glob) "pattern" [within x seconds]`

    === "Example"

        ```bash
        alice: count of log lines matching glob "rted #1" within 10 seconds
        ```

??? interface "`System events` - find a system event from subscription by matching a pattern"

    === "Syntax"

        - `node-name system event (contains|matches)(regex| glob) "pattern" [within x seconds]`

    === "Example"

        ```bash
        alice: system event matches ""paraId":[0-9]+" within 10 seconds
        ```

??? interface "`Tracing` - match an array of span names from the supplied traceID"

    === "Syntax"

        - `node-name trace with traceID contains ["name", "name2",...]`

    === "Example"

        ```bash
        alice: trace with traceID 94c1501a78a0d83c498cc92deec264d9 contains ["answer-chunk-request", "answer-chunk-request"]
        ```

??? interface "`Custom JS scripts` - run a custom JS script and assert on the return value"

    === "Syntax"

        - `node-name js-script script_relative_path [return is comparator target_value] [within x seconds]`

    === "Example"

        ```bash
        alice: js-script ./0008-custom.js return is greater than 1 within 200 seconds
        ```

??? interface "`Custom TS scripts` - run a custom TS script and assert on the return value"

    === "Syntax"

        - `node-name ts-script script_relative_path [return is comparator target_value] [within x seconds]`

    === "Example"

        ```bash
        alice: ts-script ./0008-custom-ts.ts return is greater than 1 within 200 seconds
        ```

??? interface "`Backchannel` - wait for a value and register to use"

    === "Syntax"

        - `node-name wait for var name and use as X [within x seconds]`

    === "Example"

        ```bash
        alice: wait for name and use as X within 30 seconds
        ```

#### Commands

Commands allow interaction with the nodes and can run pre-defined commands or an arbitrary command in the node.

??? interface "`restart` - stop the process and start again after the `X` amount of seconds or immediately"

    === "Syntax"

        - `node-name restart [after x seconds]`

??? interface "`pause` - pause (SIGSTOP) the process"

    === "Syntax"

        - `node-name pause`

??? interface "`resume` - resume (SIGCONT) the process"

    === "Syntax"

        - `node-name resume`

??? interface "`sleep` - sleep the test-runner for `x` amount of seconds"

    === "Syntax"

        - `sleep x`

### Running a Test

To run a test against the spawned network, you can use the [Zombienet DSL](#testing-dsl) to define the test scenario. 

For example, you can create a file named `spawn-a-basic-network-test.zndsl` with the following content:

```toml title="spawn-a-basic-network-test.zndsl"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/spawn-a-basic-network-test-zndsl.toml'
```

This test scenario checks to verify the following:

- the nodes are running
- the parachain with ID 100 is registered within a certain timeframe (255 seconds in this example)
- the parachain block height is at least a certain number within a timeframe (in this case, 10 within 255 seconds)
- the nodes report metrics 

However, you can define any test scenario following the Zombienet DSL syntax.

To run the test, execute the following command:

```bash
zombienet -p native test spawn-a-basic-network-test.zndsl
```

This command will execute the test scenario defined in the `spawn-a-basic-network-test.zndsl` file on the network. If successful, the terminal will display the test output, indicating whether the test passed or failed.

### Example Test Files

The following example test files define two tests, a small network test and a big network test. Each test defines a network configuration file and credentials to use.

The tests define assertions to evaluate the network’s metrics and logs. The assertions are defined by sentences in the DSL, which are mapped to tests to run.

```toml title="small-network-test.zndsl"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/example-test-01.toml'
```

And the second test file:

```toml title="big-network-test.zndsl"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/example-test-02.toml'
```

