---
title: Set Up an RPC Node
description: Learn how to securely configure, connect to, and maintain an RPC node for a Polkadot SDK-based blockchain in an archival or pruned state.
---

# Set Up an RPC Node

## Introduction

Setting up an RPC node is crucial for accessing and interacting with the Polkadot network. This tutorial will guide you through configuring, securing, and maintaining an RPC node in an archival or pruned state. An RPC node allows you to query blockchain data, interact with dApps, or manage network tasks remotely. You'll learn about the differences between archive and pruned nodes, how to secure the WebSocket connection, and the steps necessary to safely expose and maintain your node's RPC server for external access.

All Polkadot SDK node implementations include the RPC server, which are accessed over the WebSocket protocol and used to connect to the underlying network or validator node. By default, you can access your node's RPC server from `localhost` (for example, to rotate keys or do other maintenance). You should set up a secure proxy when accessing your RPC server from another server or [Polkadot.js](https://polkadot.js.org/apps){target=\_blank} and only enable access to the RPC node over an encrypted, SSL connection between the end user and the RPC server. Many browsers, such as Google Chrome, will block non-secure WS endpoints if they come from a different origin.

!!!warning
    Enabling remote access to your validator node shouldn't be necessary and isn't suggested, as it can often lead to security problems. Learn more about node security in [Secure Your Validator](todo:link).

## Set Up a Node

Setting up a Polkadot SDK-based node follows a straightforward process. By default, all nodes use port 9944 on localhost for the WebSocket connection. In this guide, you'll set up a Polkadot sync node on a Debian-based server (e.g., Ubuntu 22.04). You can either create a server with your preferred provider or set one up locally. Check out [Set up a Full Node](TODO: add path){target=\_blank} for detailed instructions on installation.

To make the node externally accessible as an archive or pruned RPC node, use the following commands:

For an externally accessible Polkadot archive RPC node:

```config
polkadot --chain polkadot \
--name INSERT_YOUR_NODE_NAME \
--state-pruning archive \
--blocks-pruning archive \
--rpc-cors all \
--rpc-methods safe 
```

For a Polkadot pruned RPC node:

```config
polkadot --chain polkadot \
--name INSERT_YOUR_NODE_NAME \
--state-pruning 1000 \
--blocks-pruning archive \
--rpc-cors all \
--rpc-methods safe
```

The options and flags will be explained in the following sections.

### Pruned Node vs. Archive Node

A pruned node only keeps a limited number of finalized blocks of the network, not its full history. State and block pruning are two ways of removing old blocks from a system. State pruning removes the states of old blocks while preserving block headers, allowing you to query against headers and hashes but not key-value pairs from the state trie. Block pruning removes the block bodies of old blocks while retaining block headers, allowing you to query against block headers and hashes but not the block body. You can complete many frequently required actions with a pruned node, such as displaying account balances, making transfers, setting up session keys, and staking. 

An archive node has the entire history, or database, of the network. You can query it in various ways, such as looking for historical information regarding transfers, balance histories, and more advanced queries involving past events. An archive node requires a lot more disk space than a pruned node. As of April 2023, Polkadot disk usage was 160 GB for a pruned node and 1 TB for an archive node. Disk usage needs can be expected to increase over time. An archive node requires including the options `--state-pruning archive --blocks-pruning archive` in your startup settings.

## Secure the RPC Server

The node startup settings allow you to choose what to expose, how many connections to expose and which systems should be granted access through the RPC server.

- You can limit the methods to use with `--rpc-methods`; an easy way to set this to a safe mode is `--rpc-methods safe`
- You can set your maximum connections through `--rpc-max-connections`, for example, `--rpc-max-connections 200`
- By default, localhost and Polkadot.js can access the RPC server. You can change this by setting `--rpc-cors`. To allow access from everywhere, you can use `--rpc-cors all`

## Secure the WebSocket Port

To securely access your WebSocket (WS) connection over an SSL-enabled connection (necessary for SSL-enabled developer consoles), you'll need to convert the WS connection to a secure WSS connection. You can complete this conversion using a proxy and an SSL certificate. For detailed steps on setting this up, refer to the [Setup Secure WebSockets](TODO: add path){target=_blank} guide.

## Connect to the Node

Open [Polkadot.js](https://polkadot.js.org/apps){target=\_blank} and click the logo in the top left to switch the node. Activate the **Development** toggle and input your node's domain or IP address. Remember to prefix with `wss://`, and if you're using the 443 port, append `:443` as follows:

```bash
`wss://example.com:443`
```

![A sync-in-progress chain connected to Polkadot.js](/images/infrastructure/general/maintain-wss.webp)