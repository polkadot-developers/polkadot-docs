---
title: Spawn a Basic Network Using Zombienet
description: This tutorial gets you started with Zombienet by providing a minimal example of how to use Zombienet to spawn a basic network and run a simple test over it.
---

# Spawn a Basic Network

## Introduction

In this tutorial, you'll learn how to set up a basic network using Zombienet and run a simple test to validate its functionality. The example provided walks you through defining a minimal network configuration, spawning the network, and interacting with the nodes. By the end, you'll clearly understand how to use Zombienet to deploy and test ephemeral blockchain networks, setting the stage for more complex scenarios.

## Prerequisites

To follow this tutorial, first, you need to have Zombienet installed. If you haven't done so, please follow the instructions in the [Installation](../overview.md/#installation){target=\_blank} section.

## Defining the Network

As mentioned in the [Configuration Files](../overview.md/#configuration-files){target=\_blank} section, Zombienet uses a configuration file to define the ephemeral network that will be spawned. To follow this tutorial, create a file named `spawn-a-basic-network.toml` with the following content:

```toml
[settings]
timeout = 120

[relaychain]

[[relaychain.nodes]]
name = "alice"
validator = true

[[relaychain.nodes]]
name = "bob"
validator = true

[[parachains]]
id = 100

  [parachains.collator]
  name = "collator01"
```

This configuration file defines a network with a relaychain with two nodes, `alice` and `bob`, and a parachain with a collator named `collator01`. Also, it sets a timeout of 120 seconds for the network to be ready.

## Running the Network

To spawn the network, run the following command:

```bash
zombienet -p native spawn spawn-a-basic-network.toml
```

This command will spawn the network defined in the `spawn-a-basic-network.toml` configuration file. The `-p native` flag specifies that the network will be spawned using the native provider.

If successful, you will see the following output:

<div id="termynal" class="table-termynal" data-termynal>
    <span data-ty="input"><span class="file-path">zombienet -p native spawn spawn-a-basic-network.toml</span>
    <table>
        <thead>
            <tr>
                <th colspan="2" class="center-header">
                    Network launched 🚀🚀
                </th>
            </tr>
        </thead>
        <tr>
            <th class="left-header">Namespace</th>
            <td>zombie-75a01b93c92d571f6198a67bcb380fcd</td>
        </tr>
        <tr>
            <th class="left-header">Provider</th>
            <td>native</td>
        </tr>
            <tr>
                <th colspan="3" class="center-header">
                Node Information
                </th>
            </tr>
        <tr>
            <th class="left-header">Name</th>
            <td>alice</td>
        </tr>
        <tr>
            <th class="left-header">Direct Link</th>
            <td><a href="https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer">https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer</a></td>
        </tr>
        <tr>
            <th class="left-header">Prometheus Link</th>
            <td><a href="http://127.0.0.1:55310/metrics">http://127.0.0.1:55310/metrics</a></td>
        </tr>
        <tr>
            <th class="left-header">Log Cmd</th>
            <td>tail -f /var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/zombie-75a01b93c92d571f6198a67bcb380fcd_21724-2</td>
        </tr>
            <tr>
                <th colspan="3" class="center-header">
                Node Information
                </th>
            </tr>
        <tr>
            <th class="left-header">Name</th>
            <td>bob</td>
        </tr>
        <tr>
            <th class="left-header">Direct Link</th>
            <td><a href="https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:50312#explorer">https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55312#explorer</a></td>
        </tr>
        <tr>
            <th class="left-header">Prometheus Link</th>
            <td><a href="http://127.0.0.1:50634/metrics">http://127.0.0.1:50634/metrics</a></td>
        </tr>
        <tr>
            <th class="left-header">Log Cmd</th>
            <td>tail -f /var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/zombie-75a01b93c92d571f6198a67bcb380fcd_21724-2</td>
        </tr>
            <tr>
                <th colspan="3" class="center-header">
                Node Information
                </th>
            </tr>
        <tr>
            <th class="left-header">Name</th>
            <td>collator01</td>
        </tr>
        <tr>
            <th class="left-header">Direct Link</th>
            <td><a href="https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55316#explorer">https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55316#explorer</a></td>
        </tr>
        <tr>
            <th class="left-header">Prometheus Link</th>
            <td><a href="http://127.0.0.1:55318/metrics">http://127.0.0.1:55318/metrics</a></td>
        </tr>
        <tr>
            <th class="left-header">Log Cmd</th>
            <td>tail -f /var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/zombie-75a01b93c92d571f6198a67bcb380fcd_21724-2</td>
        </tr>
        <tr>
            <th class="left-header">Parachain ID</th>
            <td>100</td>
        </tr>
        <tr>
            <th class="left-header">ChainSpec Path</th>
            <td>/var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/zombie-75a01b93c92d571f6198a67bcb380fcd_21724-2</td>
        </tr>
    </table>
</div>

!!! note 
    If the IPs and ports are not explicitly defined in the configuration file, they may change each time the network is started, causing the links provided in the output to differ from the example.

## Interacting with the Spawned Network

### Connecting to the Nodes

After the network is launched, you can interact with it using [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}. To do so, open your browser and use the provided links listed by the output as `Direct Link`. For instance, in this particular case, as the ports may vary from spawning to spawning, to interact with the `alice` node, open [https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer](https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer){target=\_blank} as it is the link provided in the output for the `alice` node. Moreover, you can also do this for the `bob` and `collator01` nodes.

If you want to interact with the nodes more programmatically, you can also use the [Polkadot.js API](https://polkadot.js.org/api/){target=_blank}. For example, the following code snippet shows how to connect to the `alice` node using the Polkadot.js API and log some information about the chain and node:

```typescript
import { ApiPromise, WsProvider } from '@polkadot/api';

async function main() {
  const wsProvider = new WsProvider('ws://127.0.0.1:55308');
    const api = await ApiPromise.create({ provider: wsProvider });

    // Retrieve the chain & node information via rpc calls
    const [chain, nodeName, nodeVersion] = await Promise.all([
        api.rpc.system.chain(),
        api.rpc.system.name(),
        api.rpc.system.version()
    ]);

    console.log(`You are connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
}

main().catch(console.error).finally(() => process.exit());
```

Either way allows you to interact easily with the network and its nodes.

### Checking Metrics

You can also check the metrics of the nodes by accessing the provided links listed by the output as `Prometheus Link`. [Prometheus](https://prometheus.io/){target=_blank} is a monitoring and alerting toolkit that collects metrics from the nodes. By accessing the provided links, you can see the metrics of the nodes in a web interface. So, for example, the following image shows the Prometheus metrics for Bob’s node from the Zombienet test:

![Prometheus metrics for Bob’s node from the Zombienet test](/images/dev-tools/zombienet/tutorials/zombienet-tutorials-1.webp)

### Checking Logs

To check the nodes’ logs, you can use the provided command listed by the output as 'Log Cmd'. For instance, to check the logs of the `alice` node, you can open a new terminal and run the following command:

```bash
tail -f /var/folders/f4/7rdt2m9d7j361dm453cpggbm0000gn/T/zombie-75a01b93c92d571f6198a67bcb380fcd_21724-SEzfCidQ1za4/alice.log
```

After running this command, you will see the logs of the `alice` node in real-time, which can be useful for debugging purposes. The logs of the `bob` and `collator01` nodes can be checked similarly.

## Running a Test

To run a test against the spawned network, you can use the [Zombienet DSL](../testing.md) to define the test scenario. For example, you can create a file named `spawn-a-basic-network-test.zndsl` with the following content:

```toml
Description: Test the basic functionality of the network (minimal example)
Network: ./spawn-a-basic-network.toml
Creds: config

alice: is up
alice: parachain 100 is registered within 225 seconds
alice: parachain 100 block height is at least 10 within 250 seconds

bob: is up
bob: parachain 100 is registered within 225 seconds
bob: parachain 100 block height is at least 10 within 250 seconds

# metrics
alice: reports node_roles is 4
alice: reports sub_libp2p_is_major_syncing is 0

bob: reports node_roles is 4

collator01: reports node_roles is 4
```

This test scenario checks to verify the following:

- the nodes are running
- the parachain with ID 100 is registered within a certain timeframe (255 seconds in this example)
- the parachain block height is at least a certain number within a timeframe (in this case, 10 within 255 seconds)
- the nodes report metrics 

However, you can define any test scenario following the [Zombienet DSL](../testing.md) syntax.

To run the test, execute the following command:

```bash
zombienet -p native test spawn-a-basic-network-test.zndsl
```

This command will execute the test scenario defined in the `spawn-a-basic-network-test.zndsl` file on the network. If successful, the terminal will display the test output, indicating whether the test passed or failed.