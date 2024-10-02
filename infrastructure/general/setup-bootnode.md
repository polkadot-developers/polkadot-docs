---
title: Set Up a Bootnode
description: Learn how to configure and run a bootnode for Polkadot, including P2P, WS, and secure WSS connections with network key management and proxies.
---

# Set Up a Bootnode

## Introduction

Bootnodes are essential for helping blockchain nodes discover peers and join the network. When a node starts, it needs to find other nodes, and bootnodes provide an initial point of contact. Once connected, a node can expand its peer connections and play its role in the network, like participating as a validator. This guide will walk you through setting up a Polkadot bootnode, configuring P2P, WebSocket (WS), and secure WSS connections, and managing network keys. You’ll also learn how to test your bootnode to ensure it is running correctly and accessible to other nodes.

## Prerequisites

Before you start, you need to have the following prerequisites:

<!-- TODO: What goes here? -->

## Accessing the Bootnode

To connect with other nodes in the network, bootnodes must be accessible through three key channels:

- **P2P** - a direct peer-to-peer connection, set by `--listen-addr /ip4/0.0.0.0/tcp/<port>`. This is not enabled by default on non-validator nodes like archive RPC nodes
- **P2P/WS** - a WebSocket (WS) connection, also configured via `--listen-addr`
- **P2P/WSS** - a secure WebSocket (WSS) connection using SSL, often required for light clients. An SSL proxy is needed, as the node itself cannot handle certificates

## Network Key

Starting a node creates its node key in the `chains/<chain>/network/secret_ed25519` file. You can
also create a node-key by `polkadot key generate-node-key` and use that node-key in the startup
command line.

It is essential you backup the node key, especially if it gets included in the `polkadot` binary
because it gets hardcoded in the binary and needs to be recompiled to change.

## Running the Bootnode

A boot node can be run as follows:

 ```
 polkadot --chain polkadot --name dot-bootnode --listen-addr /ip4/0.0.0.0/tcp/30310 --listen-addr /ip4/0.0.0.0/tcp/30311/ws
 ```

This would have the p2p on port 30310 and p2p/ws on port 30311. For the p2p/wss port, a proxy would need to set up, a DNS name, and a corresponding certificate. The following example is for the popular nginx server and enables p2p/wss on port 30312 by adding a proxy to the p2p/ws port 30311:

_/etc/nginx/sites-enabled/dot-bootnode_

```
server {
       listen       30312 ssl http2 default_server;
       server_name  dot-bootnode.stakeworld.io;
       root         /var/www/html;

       ssl_certificate "<your_cert";
       ssl_certificate_key "<your_key>";

       location / {
         proxy_buffers 16 4k;
         proxy_buffer_size 2k;
         proxy_pass http://localhost:30311;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection "Upgrade";
         proxy_set_header Host $host;
   }

}
```

## Testing Bootnode Connection

If the preceding node is running with DNS name `dot-bootnode.stakeworld.io`, which contains a proxy with a valid certificate and node-id `12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg` then the following commands should give you a: `syncing 1 peers`.

!!!tip
    You can add `-lsub-libp2p=trace` on the end to get libp2p trace logging for debugging purposes.

### P2P

```bash
polkadot --chain polkadot --base-path /tmp/node --name "Bootnode testnode" --reserved-only --reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30310/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" --no-hardware-benchmarks
```

### P2P/WS

```bash
polkadot --chain polkadot --base-path /tmp/node --name "Bootnode testnode" --reserved-only --reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30311/ws/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" --no-hardware-benchmarks
```

### P2P/WSS

```bash
polkadot --chain polkadot --base-path /tmp/node --name "Bootnode testnode" --reserved-only --reserved-nodes "/dns/dot-bootnode.stakeworld.io/tcp/30312/wss/p2p/12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg" --no-hardware-benchmarks
```