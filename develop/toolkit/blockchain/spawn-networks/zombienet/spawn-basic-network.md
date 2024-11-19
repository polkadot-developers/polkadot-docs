---
title: Spawn Testing Networks with Zombienet
description: Learn how to use Zombienet to spawn Polkadot SDK-based blockchain networks for testing.
---

# Spawn Testing Networks with Zombienet

## Introduction

In following sections, you'll learn how to set up a basic network using Zombienet and run a simple test to validate its functionality. The example provided walks you through defining a minimal network configuration, spawning the network, and interacting with the nodes. By the end, you'll clearly understand how to use Zombienet to deploy and test ephemeral blockchain networks, setting the stage for more complex scenarios.

## Prerequisites

To successfully complete this tutorial, you must ensure you've first:

- [Installed Zombienet](/develop/toolkit/blockchain/spawn-networks/zombienet/installation.md){target=\_blank}
- Reviewed the information in [Configuration](/develop/toolkit/blockchain/spawn-networks/zombienet/configuration.md){target=\_blank} and understand how to customize a Zombienet spawned network

## Define the Network

As mentioned in the [Configuration Files](/develop/toolkit/blockchain/spawn-networks/zombienet/configuration/#configuration-files){target=\_blank} section, Zombienet uses a configuration file to define the ephemeral network that will be spawned. Follow these steps to create and define the configuration file:

1. Create a file named `spawn-a-basic-network.toml`
```bash
touch spawn-a-basic-network.toml
```
2. Add the following code to the file you just created:
```toml title="spawn-a-basic-network.toml"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/spawn-a-basic-network.toml'
```

This configuration file defines a network with the following chains:

- **relaychain** - with two nodes named `alice` and `bob` 
- **parachain** - with a collator named `collator01` 

Settings also defines a timeout of 120 seconds for the network to be ready.

## Spawn the Network

To spawn the network, run the following command:

```bash
zombienet -p native spawn spawn-a-basic-network.toml
```

This command will spawn the network defined in the `spawn-a-basic-network.toml` configuration file. The `-p native` flag specifies that the network will be spawned using the native provider.

If successful, you will see the following output:

--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/spawn-network-terminal-01.html'

!!! note 
    If the IPs and ports aren't explicitly defined in the configuration file, they may change each time the network is started, causing the links provided in the output to differ from the example.

## Interact with the Spawned Network

After the network is launched, you can interact with it using [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}. To do so, open your browser and use the provided links listed by the output as `Direct Link`.

### Connect to the Nodes

Use this [port address](https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer) to interact with the same `alice` node used for this tutorial. Ports can change from spawn to spawn so be sure to locate the link in the output when spawning your own node to ensure you are accessing the correct port.

If you want to interact with the nodes more programmatically, you can also use the [Polkadot.js API](https://polkadot.js.org/api/){target=\_blank}. For example, the following code snippet shows how to connect to the `alice` node using the Polkadot.js API and log some information about the chain and node:

```typescript
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/connect-to-alice-01.js'
```

Both methods allow you to interact easily with the network and its nodes.

### Check Metrics

You can also check the metrics of the nodes by accessing the links provided in the output as `Prometheus Link`. [Prometheus](https://prometheus.io/){target=\_blank} is a monitoring and alerting toolkit that collects metrics from the nodes. By accessing the provided links, you can see the metrics of the nodes in a web interface. So, for example, the following image shows the Prometheus metrics for Bob’s node from the Zombienet test:

![Prometheus metrics for Bob’s node from the Zombienet test](/images/develop/toolkit/blockchain/spawn-testing-chain/zombienet-tutorials-1.webp)

### Check Logs

To check node logs, you can use the command listed in the output as `Log Cmd`. For instance, to check the logs of the `alice` node, you can open a new terminal and run the following command:

```bash
tail -f /var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/zombie-75a01b93c92d571f6198a67bcb380fcd_21724-SEzfCidQ1za4/alice.log
```

After running this command, you will see the logs of the `alice` node in real-time, which can be useful for debugging purposes. The logs of the `bob` and `collator01` nodes can be checked similarly.

## Testing DSL

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

## The Test File

The test file is a text file with the extension `.zndsl`. It is divided into two parts: the header and the body. The header contains the network configuration and the credentials to use, while the body contains the tests to run.

The header is defined by the following fields:

- **`description`** ++"string"++ - long description of the test suite (optional)
- **`network`** ++"string"++ - path to the network definition file, supported in both `.json` and `.toml` formats
- **`creds`** ++"string"++ - credentials filename or path to use (available only with Kubernetes provider). Looks in the current directory or `$HOME/.kube/` if a filename is passed

The body contains the tests to run. Each test is defined by a sentence in the DSL, which is mapped to a test to run. Each test line defines an assertion or a command to be executed against the spawned network.

### Name

The test name in Zombienet is derived from the filename by removing any leading numeric characters before the first hyphen. For example, a file named `0001-zombienet-test.zndsl` will result in a test name of `zombienet-test`, which will be displayed in the test report output of the runner.

### Assertions

Assertions are defined by sentences in the DSL that evaluate different metrics, such as on-chain storage, metrics, histograms, logs, system events, tracing, and custom API calls. Each assertion is defined by a sentence in the DSL, which is mapped to a test to run.

- **`Well known functions`** - already mapped test function

    === "Syntax"

        `node-name well-known_defined_test [within x seconds]`

    === "Examples"

        ```bash

        alice: is up
        alice: parachain 100 is registered within 225 seconds
        alice: parachain 100 block height is at least 10 within 250 seconds
        
        ```

- **`Histogram`** - get metrics from Prometheus, calculate the histogram, and assert on the target value

    === "Syntax"

        `node-name reports histogram memtric_name has comparator target_value samples in buckets ["bucket","bucket",...] [within x seconds]`

    === "Example"

        ```bash

        alice: reports histogram polkadot_pvf_execution_time has at least 2 samples in buckets ["0.1", "0.25", "0.5", "+Inf"] within 100 seconds
        
        ```

- **`Metric`** - get metric from Prometheus and assert on the target value

    === "Syntax"

        `node-name reports metric_name comparator target_value (e.g "is at least x", "is greater than x") [within x seconds]`

    === "Examples"

        ```bash

        alice: reports node_roles is 4
        alice: reports sub_libp2p_is_major_syncing is 0
        
        ```

- **`Log line`** - get logs from nodes and assert on the matching pattern

    === "Syntax"

        `node-name log line (contains|matches) (regex|glob) "pattern" [within x seconds]`

    === "Example"

        ```bash

        alice: log line matches glob "rted #1" within 10 seconds
        
        ```

- **`Count of log lines`** - get logs from nodes and assert on the number of lines matching pattern

    === "Syntax"

        `node-name count of log lines (containing|matcheing) (regex|glob) "pattern" [within x seconds]`

    === "Example"

        ```bash
        alice: count of log lines matching glob "rted #1" within 10 seconds
        ```

- **`System events`** - find a system event from subscription by matching a pattern

    === "Syntax"

        `node-name system event (contains|matches)(regex| glob) "pattern" [within x seconds]`

    === "Example"

        ```bash
        alice: system event matches ""paraId":[0-9]+" within 10 seconds
        ```

- **`Tracing`** - match an array of span names from the supplied `traceID`

    === "Syntax"

        `node-name trace with traceID contains ["name", "name2",...]`

    === "Example"

        ```bash
        alice: trace with traceID 94c1501a78a0d83c498cc92deec264d9 contains ["answer-chunk-request", "answer-chunk-request"]
        ```

- **`Custom JS scripts`** - run a custom JavaScript script and assert on the return value

    === "Syntax"

        `node-name js-script script_relative_path [return is comparator target_value] [within x seconds]`

    === "Example"

        ```bash
        alice: js-script ./0008-custom.js return is greater than 1 within 200 seconds
        ```

- **`Custom TS scripts`** - run a custom TypeScript script and assert on the return value

    === "Syntax"

        `node-name ts-script script_relative_path [return is comparator target_value] [within x seconds]`

    === "Example"

        ```bash
        alice: ts-script ./0008-custom-ts.ts return is greater than 1 within 200 seconds
        ```

- **`Backchannel`** - wait for a value and register to use

    === "Syntax"

        `node-name wait for var name and use as X [within x seconds]`

    === "Example"

        ```bash
        alice: wait for name and use as X within 30 seconds
        ```

### Commands

Commands allow interaction with the nodes and can run pre-defined commands or an arbitrary command in the node. Commonly used commands are as follows:

- **`restart`** - stop the process and start again after the `X` amount of seconds or immediately

- **`pause`** - pause (SIGSTOP) the process

- **`resume`** - resume (SIGCONT) the process

- **`sleep`** - sleep the test-runner for `x` amount of seconds

## Running a Test

To run a test against the spawned network, you can use the [Zombienet DSL](#testing-dsl) to define the test scenario. Follow these steps to create an example test:

1. Create a file named `spawn-a-basic-network-test.zndsl` 
```bash
touch spawn-a-basic-network-test.zndsl
```

2. Add the following code to the file you just created.
```toml title="spawn-a-basic-network-test.zndsl"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/spawn-a-basic-network-test-zndsl.toml'
```

This test scenario checks to verify the following:

- Nodes are running
- The parachain with ID 100 is registered within a certain timeframe (255 seconds in this example)
- Parachain block height is at least a certain number within a timeframe (in this case, 10 within 255 seconds)
- Nodes are reporting metrics 

You can define any test scenario you need following the Zombienet DSL syntax.

To run the test, execute the following command:

```bash
zombienet -p native test spawn-a-basic-network-test.zndsl
```

This command will execute the test scenario defined in the `spawn-a-basic-network-test.zndsl` file on the network. If successful, the terminal will display the test output, indicating whether the test passed or failed.

## Example Test Files

The following example test files define two tests, a small network test and a big network test. Each test defines a network configuration file and credentials to use.

The tests define assertions to evaluate the network’s metrics and logs. The assertions are defined by sentences in the DSL, which are mapped to tests to run.

```toml title="small-network-test.zndsl"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/example-test-01.toml'
```

And the second test file:

```toml title="big-network-test.zndsl"
--8<-- 'code/develop/toolkit/blockchain/spawn-testing-chain/example-test-02.toml'
```

