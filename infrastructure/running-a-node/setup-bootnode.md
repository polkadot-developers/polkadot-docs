---
title: Set Up a Bootnode
description: Learn how to configure and run a bootnode for Polkadot, including P2P, WS, and secure WSS connections with network key management and proxies.
---

# Set Up a Bootnode

## Introduction

Bootnodes are essential for helping blockchain nodes discover peers and join the network. When a node starts, it needs to find other nodes, and bootnodes provide an initial point of contact. Once connected, a node can expand its peer connections and play its role in the network, like participating as a validator.

This guide will walk you through setting up a Polkadot bootnode, configuring P2P, WebSocket (WS), secure WSS connections, and managing network keys. You'll also learn how to test your bootnode to ensure it is running correctly and accessible to other nodes.

## Prerequisites

Before you start, you need to have the following prerequisites:

- Verify a working Polkadot (`polkadot`) binary is available on your machine
- Ensure you have nginx installed. Please refer to the [Installation Guide](https://nginx.org/en/docs/install.html){target=\_blank} for help with installation if needed
- A VPS or other dedicated server setup

## Accessing the Bootnode

Bootnodes must be accessible through three key channels to connect with other nodes in the network:

- **P2P** - a direct peer-to-peer connection, set by:

    ```bash

    --listen-addr /ip4/0.0.0.0/tcp/INSERT_PORT

    ```
    
    This is not enabled by default on non-validator nodes like archive RPC nodes.

- **P2P/WS** - a WebSocket (WS) connection, also configured via `--listen-addr`
- **P2P/WSS** - a secure WebSocket (WSS) connection using SSL, often required for light clients. An SSL proxy is needed, as the node itself cannot handle certificates

## Node Key

A node key is the ED25519 key used by `libp2p` to assign your node an identity or peer ID. Generating a known node key for a bootnode is crucial, as it gives you a consistent key that can be placed in chain specifications as a known, reliable bootnode.

Starting a node creates its node key in the `chains/INSERT_CHAIN/network/secret_ed25519` file.

You can create a node key using:

 ``` bash
 polkadot key generate-node-key
 ``` 
 
This key can be used in the startup command line.

It is imperative that you backup the node key. If it is included in the `polkadot` binary, it is hardcoded into the binary, which must be recompiled to change the key.

## Running the Bootnode

A bootnode can be run as follows:

 ``` bash
 polkadot --chain polkadot \
 --name dot-bootnode \
 --listen-addr /ip4/0.0.0.0/tcp/30310 \
 --listen-addr /ip4/0.0.0.0/tcp/30311/ws
 ```

This assigns the p2p to port 30310 and p2p/ws to port 30311. For the p2p/wss port, a proxy must be set up with a DNS name and a corresponding certificate. The following example is for the popular nginx server and enables p2p/wss on port 30312 by adding a proxy to the p2p/ws port 30311:

``` conf title="/etc/nginx/sites-enabled/dot-bootnode"
--8<-- 'code/infrastructure/running-a-node/setup-bootnode/bootnode.conf'
```

## Testing Bootnode Connection

If the preceding node is running with DNS name `dot-bootnode.stakeworld.io`, which contains a proxy with a valid certificate and node-id `12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg` then the following commands should output `syncing 1 peers`.

!!!tip
    You can add `-lsub-libp2p=trace` on the end to get libp2p trace logging for debugging purposes.

### P2P

```bash
polkadot --chain polkadot \
--base-path /tmp/node \
--name "Bootnode testnode" \
--reserved-only \
--reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30310/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" \
--no-hardware-benchmarks
```

### P2P/WS

```bash
polkadot --chain polkadot \
--base-path /tmp/node \
--name "Bootnode testnode" \
--reserved-only \
--reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30311/ws/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" \
--no-hardware-benchmarks
```

### P2P/WSS

```bash
polkadot --chain polkadot \
--base-path /tmp/node \
--name "Bootnode testnode" \
--reserved-only \
--reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30312/wss/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" \
--no-hardware-benchmarks
```