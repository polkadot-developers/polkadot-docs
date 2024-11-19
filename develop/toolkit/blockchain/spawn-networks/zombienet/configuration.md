---
title: Configuration
description: TODO
---

# Configuration

## Introduction

## Configuration Files

The network configuration can be given in either JSON or TOML format. The Zombienet repository also provides a collection of [example configuration files](https://github.com/paritytech/zombienet/tree/main/examples){target=\_blank} that can be used as a reference.

!!! note
    Each section may include provider-specific keys that aren't recognized by other providers. For example, if you use the local provider, any references to images for nodes will be disregarded.

## CLI Usage

Zombienet provides a CLI that allows interaction with the tool. The CLI can receive commands and flags to perform different kinds of operations. These operations can be initiated using the following syntax:

```bash
zombienet <arguments> <commands>
```

The following sections will guide you through the primary usage of the Zombienet CLI and the available commands and flags.

### CLI Commands

- **`spawn <networkConfig>`** - spawn the network defined in the [configuration file](#configuration-files)

    !!! warning
        The Polkadot binary is currently not compatible with macOS. For the `spawn` command to work on macOS, users will need to clone the [Polkadot repository](https://github.com/paritytech/polkadot-sdk){target=\_blank}, build the Polkadot binary, and manually add it to their PATH.

- **`test <testFile>`** - run tests on the spawned network using the assertions and tests defined in the [test file](/develop/toolkit/blockchain/spawn-networks/zombienet/spawn-basic-network/#the-test-file){target=\_blank}


- **`setup <binaries>`** - set up the Zombienet development environment to download and use the `polkadot` or `polkadot-parachain` executable

- **`convert <filePath>`** - transforms a [polkadot-launch](https://github.com/paritytech/polkadot-launch){target=\_blank} configuration file with a `.js` or `.json` extension into a Zombienet configuration file

- **`version`** - prints Zombienet version

- **`help`** - prints help information

### CLI Flags

You can use the following flags to customize the behavior of the CLI:

- **`-p`, `--provider`** - override the [provider](/develop/toolkit/blockchain/spawn-networks/zombienet/installation/#providers){target=\_blank} to use

- **`-d`, `--dir`** - specify directory path for placing the network files instead of using the default temporary path

- **`-f`, `--force`** - force override all prompt commands

- **`-l`, `--logType`** - type of logging on the console. Defaults to `table`

- **`-m`, `--monitor**`** - start as monitor and don't auto clean up network

- **`-c`, `--spawn-concurrency`** - number of concurrent spawning processes to launch. Defaults to `1`

- **`-h`, `--help`** - display help for command

## Settings

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

- **`bootnode`** ++"boolean"++ - add bootnode to network. Default is `true`
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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/base-example.toml'
    ```

=== "JSON"

    ```json title="base-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/base-example.json'
    ```

## Relay Chain Configuration

You can use the `relaychain` keyword to define further parameters for the relay chain at start-up. The available keys are:

- **`default_command?`** ++"string"++ - the default command to run. Defaults to `polkadot`
- **`default_image?`** ++"string"++ - the default Docker image to use
- **`default_resources?`** ++"Resources"++ - represents the resources limits/reservations needed by the nodes by default. Only available on Kubernetes 

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
- **`nodes?`** ++"Node[]"++ - an array of nodes to spawn. It is further defined on the [Node Configuration](#node-configuration) section
- **`node_groups?`** ++"NodeGroup[]"++ - an array of node groups to spawn. It is further defined on the [Node Group Configuration](#node-group-configuration) section
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

### Node Configuration

There is one specific key capable of receiving more subkeys: the `nodes` key. This key is used to define further parameters for the nodes. The available keys:

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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-nodes.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-nodes.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-nodes.json'
    ```

### Node Group Configuration

The `node_groups` key is used to define further parameters for the node groups. The available keys are:

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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-node-groups.toml'
    ```

=== "JSON"

    ```json title="relaychain-example-node-groups.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/relaychain-example-node-groups.json'
    ```

## Parachain Configuration

The `parachain` keyword is used to define further parameters for the parachain. The available keys are:

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
- **`collator?`** ++"Collator"++ - further defined on the [Collator Configuration](#collator-configuration) section
- **`collators?`** ++"Collator[]"++ - an array of collators to spawn. It is further defined on the [Collator Configuration](#collator-configuration) section
- **`collator_groups?`** ++"CollatorGroup[]"++ - an array of collator groups to spawn. It is further defined on the [Collator Groups](#collator-groups) section
 
For example, the following configuration file defines a minimal example for the parachain:

=== "TOML"

    ```toml title="parachain-example.toml"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/parachain-example.toml'
    ```

=== "JSON"

    ```json title="parachain-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/parachain-example.json'
    ```

### Collator Configuration

One specific key capable of receiving more subkeys is the `collator` key. This key is used to define further parameters for the nodes. The available keys are:

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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-example.toml'
    ```

=== "JSON"

    ```json title="collator-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-example.json'
    ```

### Collator Groups

The `collator_groups` key is used to define further parameters for the collator groups. The available keys are:

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
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-groups-example.toml'
    ```

=== "JSON"

    ```json title="collator-groups-example.json"
    --8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/collator-groups-example.json'
    ```

## XCM Configuration

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




