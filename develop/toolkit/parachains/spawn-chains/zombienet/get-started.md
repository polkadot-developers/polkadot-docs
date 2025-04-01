---
title: Get Started 
description: Quickly install and configure Zombienet to deploy and test Polkadot-based blockchain networks with this comprehensive getting-started guide.
---

# Get Started

## Introduction

Zombienet is a robust testing framework designed for Polkadot SDK-based blockchain networks. It enables developers to efficiently deploy and test ephemeral blockchain environments on platforms like Kubernetes, Podman, and native setups. With its simple and versatile CLI, Zombienet provides an all-in-one solution for spawning networks, running tests, and validating performance.

This guide will outline the different installation methods for Zombienet, provide step-by-step instructions for setting up on various platforms, and highlight essential provider-specific features and requirements.

By following this guide, Zombienet will be up and running quickly, ready to streamline your blockchain testing and development workflows.

## Install Zombienet

Zombienet releases are available on the [Zombienet repository](https://github.com/paritytech/zombienet){target=\_blank}.

Multiple options are available for installing Zombienet, depending on the user's preferences and the environment where it will be used. The following section will guide you through the installation process for each option.

=== "Use the executable"
    Install Zombienet using executables by visiting the [latest release](https://github.com/paritytech/zombienet/releases){target=\_blank} page and selecting the appropriate asset for your operating system. You can download the executable and move it to a directory in your PATH. 

    Each release includes executables for Linux and macOS. Executables are generated using [pkg](https://github.com/vercel/pkg){target=\_blank}, which allows the Zombienet CLI to operate without requiring Node.js to be installed. 

    Then, ensure the downloaded file is executable:

    ```bash
    chmod +x zombienet-{{ dependencies.repositories.zombienet.architecture }}
    ```

    Finally, you can run the following command to check if the installation was successful. If so, it will display the version of the installed Zombienet:

    ```bash
    ./zombienet-{{ dependencies.repositories.zombienet.architecture }} version
    ```

    If you want to add the `zombienet` executable to your PATH, you can move it to a directory in your PATH, such as `/usr/local/bin`:

    ```bash
    mv zombienet-{{ dependencies.repositories.zombienet.architecture }} /usr/local/bin/zombienet
    ```

    Now you can refer to the `zombienet` executable directly.

    ```bash
    zombienet version
    ```

=== "Use Nix"
    For Nix users, the Zombienet repository provides a [`flake.nix`](https://github.com/paritytech/zombienet/blob/main/flake.nix){target=\_blank} file to install Zombienet making it easy to incorporate Zombienet into Nix-based projects.
    
    To install Zombienet utilizing Nix, users can run the following command, triggering the fetching of the flake and subsequently installing the Zombienet package:

    ```bash
    nix run github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION -- \
    spawn INSERT_ZOMBIENET_CONFIG_FILE_NAME.toml
    ```

    Replace the `INSERT_ZOMBIENET_VERSION` with the desired version of Zombienet and the `INSERT_ZOMBIENET_CONFIG_FILE_NAME` with the name of the configuration file you want to use.

    To run the command above, you need to have [Flakes](https://nixos.wiki/wiki/Flakes#Enable_flakes){target=\_blank} enabled.

    Alternatively, you can also include the Zombienet binary in the PATH for the current shell using the following command:
    
    ```bash
    nix shell github:paritytech/zombienet/INSERT_ZOMBIENET_VERSION
    ```

=== "Use Docker"
    Zombienet can also be run using Docker. The Zombienet repository provides a Docker image that can be used to run the Zombienet CLI. To run Zombienet using Docker, you can use the following command:

    ```bash
    docker run -it --rm \
    -v $(pwd):/home/nonroot/zombie-net/host-current-files \
    paritytech/zombienet
    ```

    The command above will run the Zombienet CLI inside a Docker container and mount the current directory to the `/home/nonroot/zombie-net/host-current-files` directory. This allows Zombienet to access the configuration file and other files in the current directory. If you want to mount a different directory, replace `$(pwd)` with the desired directory path.

    Inside the Docker container, you can run the Zombienet CLI commands. First, you need to set up Zombienet to download the necessary binaries:

    ```bash
    npm run zombie -- setup polkadot polkadot-parachain
    ```

    After that, you need to add those binaries to the PATH:

    ```bash
    export PATH=/home/nonroot/zombie-net:$PATH
    ```

    Finally, you can run the Zombienet CLI commands. For example, to spawn a network using a specific configuration file, you can run the following command:

    ```bash
    pm run zombie -- -p native spawn host-current-files/minimal.toml
    ```

    The command above mounts the current directory to the `/workspace` directory inside the Docker container, allowing Zombienet to access the configuration file and other files in the current directory. If you want to mount a different directory, replace `$(pwd)` with the desired directory path.

## Providers

Zombienet supports different backend providers for running the nodes. At this moment, [Kubernetes](https://kubernetes.io/){target=\_blank}, [Podman](https://podman.io/){target=\_blank}, and local providers are supported, which can be declared as `kubernetes`, `podman`, or `native`, respectively.

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

It's important to note that each provider has specific requirements and associated features. The following sections cover each provider's requirements and added features.

### Kubernetes

Kubernetes is a portable, extensible, open-source platform for managing containerized workloads and services. Zombienet is designed to be compatible with a variety of Kubernetes clusters, including: 

- [Google Kubernetes Engine (GKE)](https://cloud.google.com/kubernetes-engine){target=\_blank}
- [Docker Desktop](https://docs.docker.com/desktop/kubernetes/){target=\_blank}
- [kind](https://kind.sigs.k8s.io/){target=\_blank}

#### Requirements
    
To effectively interact with your cluster, you'll need to ensure that [`kubectl`](https://kubernetes.io/docs/reference/kubectl/){target=\_blank} is installed on your system. This Kubernetes command-line tool allows you to run commands against Kubernetes clusters. If you don't have `kubectl` installed, you can follow the instructions provided in the [Kubernetes documentation](https://kubernetes.io/docs/tasks/tools/#kubectl){target=\_blank}.

To create resources such as namespaces, pods, and CronJobs within the target cluster, you must grant your user or service account the appropriate permissions. These permissions are essential for managing and deploying applications effectively within Kubernetes.

#### Features
    
If available, Zombienet uses the Prometheus operator to oversee monitoring and visibility. This configuration ensures that only essential networking-related pods are deployed. Using the Prometheus operator, Zombienet improves its ability to monitor and manage network activities within the Kubernetes cluster efficiently.  

### Podman

Podman is a daemonless container engine for developing, managing, and running Open Container Initiative (OCI) containers and container images on Linux-based systems. Zombienet supports Podman rootless as a provider on Linux machines. Although Podman has support for macOS through an internal virtual machine (VM), the Zombienet provider code requires Podman to run natively on Linux.

#### Requirements
     
To use Podman as a provider, you need to have Podman installed on your system. You can install Podman by following the instructions provided on the [Podman website](https://podman.io/getting-started/installation){target=\_blank}.

#### Features
    
Using Podman, Zombienet deploys additional pods to enhance the monitoring and visibility of the active network. Specifically, pods for [Prometheus](https://prometheus.io/){target=\_blank}, [Tempo](https://grafana.com/docs/tempo/latest/operations/monitor/){target=\_blank}, and [Grafana](https://grafana.com/){target=\_blank} are included in the deployment. Grafana is configured with Prometheus and Tempo as data sources.

Upon launching Zombienet, access to these monitoring services is facilitated through specific URLs provided in the output:

- Prometheus - `http://127.0.0.1:34123`
- Tempo - `http://127.0.0.1:34125`
- Grafana - `http://127.0.0.1:41461`

It's important to note that Grafana is deployed with default administrator access. 
    
When network operations cease, either from halting a running spawn with the `Ctrl+C` command or test completion, Zombienet automatically removes all associated pods.

### Local Provider

The Zombienet local provider, also called native, enables you to run nodes as local processes in your environment.

#### Requirements
     
You must have the necessary binaries for your network (such as `polkadot` and `polkadot-parachain`). These binaries should be available in your PATH, allowing Zombienet to spawn the nodes as local processes.

To install the necessary binaries, you can use the Zombienet CLI command:

```bash
zombienet setup polkadot polkadot-parachain
```

This command will download and prepare the necessary binaries for Zombienet's use.

!!! warning
    The `polkadot` and `polkadot-parachain` binaries releases aren't compatible with macOS. As a result, macOS users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=\_blank}, build the Polkadot binary, and manually add it to their PATH for `polkadot` and `polkadot-parachain` to work.

If you need to use a custom binary, ensure the binary is available in your PATH. You can also specify the binary path in the network configuration file. The following example uses the custom [OpenZeppelin template](https://github.com/OpenZeppelin/polkadot-runtime-templates){target=\_blank}:

First, clone the OpenZeppelin template repository using the following command:

```bash
git clone https://github.com/OpenZeppelin/polkadot-runtime-templates \
&& cd polkadot-runtime-templates/generic-template
```

Next, run the command to build the custom binary:

```bash
cargo build --release
```

Finally, add the custom binary to your PATH as follows:

```bash
export PATH=$PATH:INSERT_PATH_TO_RUNTIME_TEMPLATES/parachain-template-node/target/release
```

Alternatively, you can specify the binary path in the network configuration file. The local provider exclusively utilizes the command configuration for nodes, which supports both relative and absolute paths. You can employ the `default_command` configuration to specify the binary for spawning all nodes in the relay chain.

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

#### Features

The local provider does not offer any additional features.

## Configure Zombienet

Effective network configuration is crucial for deploying and managing blockchain systems. Zombienet simplifies this process by offering versatile configuration options in both JSON and TOML formats. Whether setting up a simple test network or a complex multi-node system, Zombienet's tools provide the flexibility to customize every aspect of your network's setup.

The following sections will explore the structure and usage of Zombienet configuration files, explain key settings for network customization, and walk through CLI commands and flags to optimize your development workflow.

### Configuration Files

The network configuration file can be either JSON or TOML format. The Zombienet repository also provides a collection of [example configuration files](https://github.com/paritytech/zombienet/tree/main/examples){target=\_blank} that can be used as a reference.

Each section may include provider-specific keys that aren't recognized by other providers. For example, if you use the local provider, any references to images for nodes will be disregarded.

### CLI Usage

Zombienet provides a CLI that allows interaction with the tool. The CLI can receive commands and flags to perform different kinds of operations. These operations use the following syntax:

```bash
zombienet <arguments> <commands>
```

The following sections will guide you through the primary usage of the Zombienet CLI and the available commands and flags.

#### CLI Commands

- **`spawn <networkConfig>`** - spawn the network defined in the [configuration file](#configuration-files)

    !!! warning
        The Polkadot binary is currently not compatible with macOS. For the `spawn` command to work on macOS, users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=\_blank}, build the Polkadot binary, and manually add it to their PATH.

- **`test <testFile>`** - run tests on the spawned network using the assertions and tests defined in the [test file](/develop/toolkit/parachains/spawn-chains/zombienet/write-tests/#the-test-file){target=\_blank}


- **`setup <binaries>`** - set up the Zombienet development environment to download and use the `polkadot` or `polkadot-parachain` executable

- **`convert <filePath>`** - transforms a [polkadot-launch](https://github.com/paritytech/polkadot-launch){target=\_blank} configuration file with a `.js` or `.json` extension into a Zombienet configuration file

- **`version`** - prints Zombienet version

- **`help`** - prints help information

#### CLI Flags

You can use the following flags to customize the behavior of the CLI:

- **`-p`, `--provider`** - override the [provider](#providers) to use

- **`-d`, `--dir`** - specify a directory path for placing the network files instead of using the default temporary path

- **`-f`, `--force`** - force override all prompt commands

- **`-l`, `--logType`** - type of logging on the console. Defaults to `table`

- **`-m`, `--monitor`** - start as monitor and don't auto clean up network

- **`-c`, `--spawn-concurrency`** - number of concurrent spawning processes to launch. Defaults to `1`

- **`-h`, `--help`** - display help for command

### Settings

Through the keyword `settings`, it's possible to define the general settings for the network. The available keys are:

- **`global_volumes?`** ++"GlobalVolume[]"++ - a list of global volumes to use 

    ??? child "`GlobalVolume` interface definition"
        ```js
        export interface GlobalVolume {
          name: string;
          fs_type: string;
          mount_path: string;
        }
        ```

- **`bootnode`** ++"boolean"++ - add bootnode to network. Defaults to `true`
- **`bootnode_domain?`** ++"string"++ - domain to use for bootnode
- **`timeout`** ++"number"++ - global timeout to use for spawning the whole network
- **`node_spawn_timeout?`** ++"number"++ - timeout to spawn pod/process
- **`grafana?`** ++"boolean"++ - deploy an instance of Grafana
- **`prometheus?`** ++"boolean"++ - deploy an instance of Prometheus
- **`telemetry?`** ++"boolean"++ - enable telemetry for the network
- **`jaeger_agent?`** ++"string"++ - the Jaeger agent endpoint passed to the nodes. Only available on Kubernetes
- **`tracing_collator_url?`** ++"string"++ - the URL of the tracing collator used to query by the tracing assertion. Should be tempo query compatible
- **`tracing_collator_service_name?`** ++"string"++ - service name for tempo query frontend. Only available on Kubernetes. Defaults to `tempo-tempo-distributed-query-frontend`
- **`tracing_collator_service_namespace?`** ++"string"++ - namespace where tempo is running. Only available on Kubernetes. Defaults to `tempo`
- **`tracing_collator_service_port?`** ++"number"++ - port of the query instance of tempo. Only available on Kubernetes. Defaults to `3100`
- **`enable_tracing?`** ++"boolean"++ - enable the tracing system. Only available on Kubernetes. Defaults to `true`
- **`provider`** ++"string"++ - provider to use. Default is `kubernetes`"
- **`polkadot_introspector?`** ++"boolean"++ - deploy an instance of polkadot-introspector. Only available on Podman and Kubernetes. Defaults to `false`
- **`backchannel?`** ++"boolean"++ - deploy an instance of backchannel server. Only available on Kubernetes. Defaults to `false`
- **`image_pull_policy?`** ++"string"++ - image pull policy to use in the network. Possible values are `Always`, `IfNotPresent`, and `Never`
- **`local_ip?`** ++"string"++ - IP used for exposing local services (rpc/metrics/monitors). Defaults to `"127.0.0.1"`
- **`global_delay_network_global_settings?`** ++"number"++ - delay in seconds to apply to the network
- **`node_verifier?`** ++"string"++ - specify how to verify node readiness or deactivate by using `None`. Possible values are `None` and `Metric`. Defaults to `Metric`

For example, the following configuration file defines a minimal example for the settings:

=== "TOML"

    ```toml title="base-example.toml"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/base-example.toml'
    ```

=== "JSON"

    ```json title="base-example.json"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/base-example.json'
    ```

### Relay Chain Configuration

You can use the `relaychain` keyword to define further parameters for the relay chain at start-up. The available keys are:

- **`default_command?`** ++"string"++ - the default command to run. Defaults to `polkadot`
- **`default_image?`** ++"string"++ - the default Docker image to use
- **`default_resources?`** ++"Resources"++ - represents the resource limits/reservations the nodes need by default. Only available on Kubernetes

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

- **`default_db_snapshot?`** ++"string"++ - the default database snapshot to use
- **`default_prometheus_prefix`** ++"string"++ - a parameter for customizing the metric's prefix. Defaults to `substrate`
- **`default_substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`default_keystore_key_types?`** ++"string[]"++ - defines which keystore keys should be created 
- **`chain`** ++"string"++ - the chain name
- **`chain_spec_path?`** ++"string"++ - path to the chain spec file. Should be the plain version to allow customizations
- **`chain_spec_command?`** ++"string"++ - command to generate the chain spec. It can't be used in combination with `chain_spec_path`
- **`default_args?`** ++"string[]"++ - an array of arguments to use as default to pass to the command
- **`default_overrides?`** ++"Override[]"++ - an array of overrides to upload to the node

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        } 
        ```

- **`random_nominators_count?`** ++"number"++ - if set and the stacking pallet is enabled, Zombienet will generate the input quantity of nominators and inject them into the genesis
- **`max_nominations`** ++"number"++ - the max number of nominations allowed by a nominator. Should match the value set in the runtime. Defaults to `24`
- **`nodes?`** ++"Node[]"++ - an array of nodes to spawn. It is further defined in the [Node Configuration](#node-configuration) section
- **`node_groups?`** ++"NodeGroup[]"++ - an array of node groups to spawn. It is further defined in the [Node Group Configuration](#node-group-configuration) section
- **`total_node_in_group?`** ++"number"++ - the total number of nodes in the group. Defaults to `1`
- **`genesis`** ++"JSON"++ - the genesis configuration
- **`default_delay_network_settings?`** ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

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

- **`name`** ++"string"++ - name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
- **`image?`** ++"string"++ - override default Docker image to use for this node
- **`command?`** ++"string"++ - override default command to run
- **`command_with_args?`** ++"string"++ - override default command and arguments
- **`args?`** ++"string[]"++ - arguments to be passed to the command
- **`env?`** ++"envVars[]"++ - environment variables to set in the container

    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- **`db_snapshot?`** ++"string"++ - database snapshot to use
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++ - represent the resources limits/reservations needed by the node

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

- **`keystore_key_types?`** ++"string[]"++ - defines which keystore keys should be created
- **`validator`** ++"boolean"++ - pass the `--validator` flag to the command. Defaults to `true`
- **`invulnerable`** ++"boolean"++ - if true, add the node to invulnerables in the chain spec. Defaults to `false`
- **`balance`** ++"number"++ - balance to set in balances for node's account. Defaults to `2000000000000`
- **`bootnodes?`** ++"string[]"++ - array of bootnodes to use
- **`add_to_bootnodes?`** ++"boolean"++ - add this node to the bootnode list. Defaults to `false`
- **`ws_port?`** ++"number"++ - WS port to use
- **`rpc_port?`** ++"number"++ - RPC port to use
- **`prometheus_port?`** ++"number"++ - Prometheus port to use
- **`p2p_cert_hash?`** ++"string"++ - libp2p certhash to use with webRTC transport
- **`delay_network_settings?`** ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

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
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/relaychain-example-nodes.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-nodes.json"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/relaychain-example-nodes.json'
    ```

#### Node Group Configuration

The `node_groups` key defines further parameters for the node groups. The available keys are:

- **`name`** ++"string"++ - name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
- **`image?`** ++"string"++ - override default Docker image to use for this node
- **`command?`** ++"string"++ - override default command to run
- **`args?`** ++"string[]"++ - arguments to be passed to the command
- **`env?`** ++"envVars[]"++ - environment variables to set in the container
    
    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`overrides?`** ++"Override[]"++ - array of overrides definitions

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- **`db_snapshot?`** ++"string"++ - database snapshot to use
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++ - represent the resources limits/reservations needed by the node

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

- **`keystore_key_types?`** ++"string[]"++ - defines which keystore keys should be created
- **`count`** ++"number | string"++ - number of nodes to launch for this group
- **`delay_network_settings?`** ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

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
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/relaychain-example-node-groups.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-node-groups.json"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/relaychain-example-node-groups.json'
    ```

### Parachain Configuration

The `parachain` keyword defines further parameters for the parachain. The available keys are:

- **`id`** ++"number"++ - the id to assign to this parachain. Must be unique
- **`chain?`** ++"string"++ - the chain name
- **`force_decorator?`** ++"string"++ - force the use of a specific decorator
- **`genesis?`** ++"JSON"++ - the genesis configuration
- **`balance?`** ++"number"++ - balance to set in balances for parachain's account
- **`delay_network_settings?`** ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

- **`add_to_genesis?`** ++"boolean"++ - flag to add parachain to genesis or register in runtime. Defaults to `true`
- **`register_para?`** ++"boolean"++ - flag to specify whether the para should be registered. The `add_to_genesis` flag must be set to false for this flag to have any effect. Defaults to `true`
- **`onboard_as_parachain?`** ++"boolean"++ - flag to specify whether the para should be onboarded as a parachain, rather than remaining a parathread. Defaults to `true`
- **`genesis_wasm_path?`** ++"string"++ - path to the Wasm file to use
- **`genesis_wasm_generator?`** ++"string"++ - command to generate the Wasm file
- **`genesis_state_path?`** ++"string"++ - path to the state file to use
- **`genesis_state_generator?`** ++"string"++ - command to generate the state file
- **`chain_spec_path?`** ++"string"++ - path to the chain spec file
- **`chain_spec_command?`** ++"string"++ - command to generate the chain spec
- **`cumulus_based?`** ++"boolean"++ - flag to use cumulus command generation. Defaults to `true`
- **`bootnodes?`** ++"string[]"++ - array of bootnodes to use
- **`prometheus_prefix?`** ++"string"++ - parameter for customizing the metric's prefix for all parachain nodes/collators. Defaults to `substrate`
- **`collator?`** ++"Collator"++ - further defined in the [Collator Configuration](#collator-configuration) section
- **`collator_groups?`** ++"CollatorGroup[]"++ - an array of collator groups to spawn. It is further defined in the [Collator Groups Configuration](#collator-groups-configuration) section
 
For example, the following configuration file defines a minimal example for the parachain:

=== "TOML"

    ```toml title="parachain-example.toml"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/parachain-example.toml'
    ```

=== "JSON"

    ```json title="parachain-example.json"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/parachain-example.json'
    ```

#### Collator Configuration

One specific key capable of receiving more subkeys is the `collator` key. This key defines further parameters for the nodes. The available keys are:

- **`name`** ++"string"++ - name of the collator. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
- **`image?`** ++"string"++ - image to use for the collator
- **`command_with_args?`** ++"string"++ - overrides both command and arguments for the collator
- **`validator`** ++"boolean"++ - pass the `--validator` flag to the command. Defaults to `true`
- **`invulnerable`** ++"boolean"++ - if true, add the collator to invulnerables in the chain spec. Defaults to `false`
- **`balance`** ++"number"++ - balance to set in balances for collator's account. Defaults to `2000000000000`
- **`bootnodes?`** ++"string[]"++ - array of bootnodes to use
- **`add_to_bootnodes?`** ++"boolean"++ - add this collator to the bootnode list. Defaults to `false`
- **`ws_port?`** ++"number"++ - WS port to use
- **`rpc_port?`** ++"number"++ - RPC port to use
- **`prometheus_port?`** ++"number"++ - Prometheus port to use
- **`p2p_port?`** ++"number"++ - P2P port to use
- **`p2p_cert_hash?`** ++"string"++ - libp2p certhash to use with webRTC transport
- **`delay_network_settings?`** ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

    ??? child "`DelayNetworkSettings` interface definition"
        ```js
        export interface DelayNetworkSettings {
          latency: string;
          correlation?: string; // should be parsable as float by k8s
          jitter?: string;
        }
        ```

- **`command?`** ++"string"++ - override default command to run
- **`args?`** ++"string[]"++ - arguments to be passed to the command
- **`env?`** ++"envVars[]"++ - environment variables to set in the container

    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`overrides?`** ++"Override[]"++ - array of overrides definitions

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- **`db_snapshot?`** ++"string"++ - database snapshot to use
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++ - represent the resources limits/reservations needed by the node

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

- **`keystore_key_types?`** ++"string[]"++ - defines which keystore keys should be created

The configuration file below defines a minimal example for the collator:

=== "TOML"

    ```toml title="collator-example.toml"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/collator-example.toml'
    ```

=== "JSON"

    ```json title="collator-example.json"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/collator-example.json'
    ```

#### Collator Groups Configuration

The `collator_groups` key defines further parameters for the collator groups. The available keys are:

- **`name`** ++"string"++ - name of the node. Any whitespace will be replaced with a dash (for example, `new alice` will be converted to `new-alice`)
- **`image?`** ++"string"++ - override default Docker image to use for this node
- **`command?`** ++"string"++ - override default command to run
- **`args?`** ++"string[]"++ - arguments to be passed to the command
- **`env?`** ++"envVars[]"++ - environment variables to set in the container

    ??? child "`envVars` interface definition"
        ```js
        export interface EnvVars {
          name: string;
          value: string;
        }
        ```

- **`overrides?`** ++"Override[]"++ - array of overrides definitions

    ??? child "`Override` interface definition"
        ```js
        export interface Override {
          local_path: string;
          remote_name: string;
        }
        ```

- **`prometheus_prefix?`** ++"string"++ - customizes the metric's prefix for the specific node. Defaults to `substrate`
- **`db_snapshot?`** ++"string"++ - database snapshot to use
- **`substrate_cli_args_version?`** ++"SubstrateCliArgsVersion"++ - set the Substrate CLI arguments version directly to skip binary evaluation overhead

    ??? child "`SubstrateCliArgsVersion` enum definition"
        ```js
        export enum SubstrateCliArgsVersion {
          V0 = 0,
          V1 = 1,
          V2 = 2,
          V3 = 3,
        }
        ```

- **`resources?`** ++"Resources"++ - represent the resources limits/reservations needed by the node

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

- **`keystore_key_types?`** ++"string[]"++ - defines which keystore keys should be created
- **`count`** ++"number | string"++ - number of nodes to launch for this group
- **`delay_network_settings?`** ++"DelayNetworkSettings"++ - sets the expected configuration to delay the network

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
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/collator-groups-example.toml'
    ```

=== "JSON"

    ```json title="collator-groups-example.json"
    --8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/get-started/collator-groups-example.json'
    ```

### XCM Configuration

You can use the `hrmp_channels` keyword to define further parameters for the XCM channels at start-up. The available keys are:

- **`hrmp_channels`** ++"HrmpChannelsConfig[]"++ - array of Horizontal Relay-routed Message Passing (HRMP) channel configurations

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

        - `sender` ++"number"++ - parachain ID of the sender
        - `recipient` ++"number"++ - parachain ID of the recipient
        - `max_capacity` ++"number"++ - maximum capacity of the HRMP channel
        - `max_message_size` ++"number"++ - maximum message size allowed in the HRMP channel

## Where to Go Next

<div class="grid cards" markdown>

-  <span class="badge external">External</span> __Zombienet Support__

    ---

    [Parity Technologies](https://www.parity.io/){target=\_blank} has designed and developed this framework, now maintained by the Zombienet team. 

    For further support and information, refer to the following contact points:

    [:octicons-arrow-right-24: Zombienet repository](https://github.com/paritytech/zombienet){target=\_blank}

    [:octicons-arrow-right-24: Element public channel](https://matrix.to/#/!FWyuEyNvIFygLnWNMh:parity.io?via=parity.io&via=matrix.org&via=web3.foundation){target=\_blank}


-   <span class="badge tutorial">Tutorial</span> __Spawn a Basic Chain with Zombienet__

    ---

    Learn to spawn, connect to and monitor a basic blockchain network with Zombienet, using customizable configurations for streamlined development and debugging.

    [:octicons-arrow-right-24: Reference](/tutorials/polkadot-sdk/testing/spawn-basic-chain/)

</div>
