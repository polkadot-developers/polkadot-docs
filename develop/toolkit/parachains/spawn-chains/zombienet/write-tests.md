---
title: Write Tests
description: Write and execute tests for blockchain networks with Zombienet's DSL. Learn to evaluate metrics, logs, events, and more for robust validation.
---
# Write Tests

## Introduction

Testing is a critical step in blockchain development, ensuring reliability, performance, and security. Zombienet simplifies this process with its intuitive Domain Specific Language (DSL), enabling developers to write natural-language test scripts tailored to their network needs.

This guide provides an in-depth look at how to create and execute test scenarios using Zombienet's flexible testing framework. You’ll learn how to define tests for metrics, logs, events, and more, allowing for comprehensive evaluation of your blockchain network’s behavior and performance.

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

For more details about the Zombienet DSL, see the [Testing DSL](https://paritytech.github.io/zombienet/cli/test-dsl-definition-spec.html){target=\_blank} specification.

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

        `node-name reports histogram metric_name has comparator target_value samples in buckets ["bucket","bucket",...] [within x seconds]`

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

        `node-name count of log lines (containing|matching) (regex|glob) "pattern" [within x seconds]`

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
--8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/write-tests/spawn-a-basic-chain-test.toml'
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
--8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/write-tests/small-network-test.toml'
```

And the second test file:

```toml title="big-network-test.zndsl"
--8<-- 'code/develop/toolkit/parachains/spawn-chains/zombienet/write-tests/big-network-test.toml'
```

