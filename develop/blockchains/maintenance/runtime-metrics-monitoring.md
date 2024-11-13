---
title: Runtime Metrics and Monitoring
description: TODO
---

# Runtime Metrics and Monitoring

## Introduction

To maintain a stable, secure, and efficient network, constant monitoring is essential. Polkadot SDK-based nodes are equipped with built-in telemetry components that automatically collect and transmit detailed data about node performance in real time. This telemetry system is an integral part of the Substrate framework, which allows you to monitor and track network health without needing to set up complex tools.

[Substrate's client telemetry](https://paritytech.github.io/polkadot-sdk/master/sc_telemetry/index.html){target=\_blank} enables the ingestion of real-time data into a client—this could be something as simple as a front-end dashboard. The telemetry process uses tracing and logging to gather operational data, which is then captured by a tracing layer. This data is sent asynchronously through a channel to a background task known as the [TelemetryWorker](https://paritytech.github.io/polkadot-sdk/master/sc_telemetry/struct.TelemetryWorker.html){target=\_blank}, which handles sending this information to the configured remote telemetry servers.

When multiple Substrate nodes are running within the same process, the telemetry system uses a `tracing::Span` to identify which node is sending the data. This makes it easy to keep track of data from different nodes that might be running in parallel, with each task spawned by the sc-service's [TaskManager](https://paritytech.github.io/polkadot-sdk/master/sc_service/struct.TaskManager.html){target=\_blank} inheriting the span for consistency.

As a developer or node operator, you don’t need to worry about the technical details of how telemetry data is collected. The system takes care of the heavy lifting, and the collected data is automatically sent to a default telemetry server, where it is aggregated and displayed on a user-friendly dashboard. This makes it easy to monitor your network’s performance, diagnose potential issues, and ensure that everything is running smoothly.

## Visual Monitoring

The [Polkadot telemetry](){target=\_blank} dashboard provides a real-time view of how currently online nodes are performing. This dashboard, allows users to select the network you need to check on, and also the information you want to display by turning visible columns on and off from the list of columns available. The monitoring dashboard provides the following indicators and metrics:

- Validator - identifies whether the node is a validator node or not
- Location - displays the geographical location of the node
- Implementation - shows the version of the software running on the node
- Network ID - displays the public network identifier for the node
- Peer count - indicates the number of peers connected to the node
- Transactions in queue - shows the number of transactions waiting in the [Ready queue](https://paritytech.github.io/polkadot-sdk/master/sc_transaction_pool_api/enum.TransactionStatus.html#variant.Ready){target=\_blank} for a block author
- Upload bandwidth - graphs the node's recent upload activity in MB/s
- Download Bandwidth - graphs the node's recent download activity in MB/s
- State Cache Size - graphs the size of the node's state cache in MB
- Block - displays the current best block number to ensure synchronization with peers
- Block Hash - shows the block hash for the current best block number
- Finalized Block - displays the most recently finalized block number to ensure synchronization with peers
- Finalized block hash - shows the block hash for the most recently finalized block
- Block time - indicates the time between block executions
- Block propagation time - displays the time it took to import the most recent block
- Last block time - shows the time it took to author the most recent block
- Node uptime - indicates the number of days the node has been online without restarting

## Displaying Network-wide Statistics

In addition to the details available for individual nodes, you can view statistics that provide insights into the broader network. The network statistics provide detailed information about the hardware and software configurations of the nodes in the network, including:

- Software version
- Operating system
- CPU architecture and model
- Number of physical CPU cores
- Total memory
- Whether the node is a virtual machine
- Linux distribution and kernel version
- CPU and memory speed
- Disk speed

