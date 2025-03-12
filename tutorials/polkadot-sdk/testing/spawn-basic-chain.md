---
title: Spawn a Basic Chain with Zombienet
description: Learn to spawn, connect to and monitor a basic blockchain network with Zombienet, using customizable configurations for streamlined development and debugging.
---

# Spawn a Basic Chain with Zombienet

## Introduction

Zombienet simplifies blockchain development by enabling developers to create temporary, customizable networks for testing and validation. These ephemeral chains are ideal for experimenting with configurations, debugging applications, and validating functionality in a controlled environment.

In this guide, you'll learn how to define a basic network configuration file, spawn a blockchain network using Zombienet's CLI, and interact with nodes and monitor network activity using tools like Polkadot.js Apps and Prometheus

By the end of this tutorial, you'll be equipped to deploy and test your own blockchain networks, paving the way for more advanced setups and use cases.

## Prerequisites

To successfully complete this tutorial, you must ensure you've first:

- [Installed Zombienet](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/#install-zombienet){target=\_blank}. This tutorial requires Zombienet version `{{ dependencies.repositories.zombienet.version }}`. Verify that you're using the specified version to ensure compatibility with the instructions.
- Reviewed the information in [Configure Zombienet](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/#configure-zombienet){target=\_blank} and understand how to customize a spawned network

## Define the Network

Zombienet uses a [configuration file](/develop/toolkit/parachains/spawn-chains/zombienet/get-started/#configuration-files){target=\_blank} to define the ephemeral network that will be spawned. Follow these steps to create and define the configuration file:

1. Create a file named `spawn-a-basic-network.toml`
```bash
touch spawn-a-basic-network.toml
```
2. Add the following code to the file you just created:
```toml title="spawn-a-basic-network.toml"
--8<-- 'code/tutorials/polkadot-sdk/testing/spawn-basic-chain/spawn-a-basic-network.toml'
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

--8<-- 'code/tutorials/polkadot-sdk/testing/spawn-basic-chain/spawn-network-terminal-01.html'

!!! note 
    If the IPs and ports aren't explicitly defined in the configuration file, they may change each time the network is started, causing the links provided in the output to differ from the example.

## Interact with the Spawned Network

After the network is launched, you can interact with it using [Polkadot.js Apps](https://polkadot.js.org/apps/){target=\_blank}. To do so, open your browser and use the provided links listed by the output as `Direct Link`.

### Connect to the Nodes

Use the [55308 port address](https://polkadot.js.org/apps/?rpc=ws://127.0.0.1:55308#explorer){target=\_blank} to interact with the same `alice` node used for this tutorial. Ports can change from spawn to spawn so be sure to locate the link in the output when spawning your own node to ensure you are accessing the correct port.

If you want to interact with the nodes more programmatically, you can also use the [Polkadot.js API](https://polkadot.js.org/docs/api/){target=\_blank}. For example, the following code snippet shows how to connect to the `alice` node using the Polkadot.js API and log some information about the chain and node:

```typescript
--8<-- 'code/tutorials/polkadot-sdk/testing/spawn-basic-chain/connect-to-alice-01.js'
```

Both methods allow you to interact easily with the network and its nodes.

### Check Metrics

You can also check the metrics of the nodes by accessing the links provided in the output as `Prometheus Link`. [Prometheus](https://prometheus.io/){target=\_blank} is a monitoring and alerting toolkit that collects metrics from the nodes. By accessing the provided links, you can see the metrics of the nodes in a web interface. So, for example, the following image shows the Prometheus metrics for Bob's node from the Zombienet test:

![](/images/tutorials/polkadot-sdk/testing/spawn-basic-chain/spawn-basic-network-01.webp)

### Check Logs

To view individual node logs, locate the `Log Cmd` command in Zombienet's startup output. For example, to see what the alice node is doing, find the log command that references `alice.log` in its file path. Note that Zombienet will show you the correct path for your instance when it starts up, so use that path rather than copying from the below example:

```bash
tail -f  /tmp/zombie-794af21178672e1ff32c612c3c7408dc_-2397036-6717MXDxcS55/alice.log
```

After running this command, you will see the logs of the `alice` node in real-time, which can be useful for debugging purposes. The logs of the `bob` and `collator01` nodes can be checked similarly.

