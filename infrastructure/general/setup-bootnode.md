---
title: Set up a Boot Node
description: Instructions on setting up, testing, maintaining, and testing a boot node.
---

!!!note
    When you first start a node, it has to find a way to find other nodes in the network. For that
    purpose, you need "bootnodes". After the first bootnode is found, it can use that node’s connections
    to continue expanding and play its role in the network, like participating as a validator.

<!-- TODO: link wss guide wherever applicable. -->

## Accessing the Bootnode

The consensus is that bootnodes have to be accessible in three ways:

- **P2P**: the p2p port, which can be set by `--listen-addr /ip4/0.0.0.0/tcp/<port>`. This port is
  not automatically set on a non-validator node (for example, an archive RPC node)
- **P2P/WS**: the websocket version, which can be set by `--listen-addr /ip4/0.0.0.0/tcp/<port>/ws`
- **P2P/WSS**: the _secure_ websocket version. An SSL-secured connection to the p2p/ws port must be
  achieved by a proxy since the node cannot include certificates. It is needed for light clients.

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

This would have the p2p on port 30310 and p2p/ws on port 30311. For the p2p/wss port, a proxy would need to
set up, a DNS name, and a corresponding certificate. The following example is for the popular nginx server and enables p2p/wss on port 30312 by adding a proxy to the p2p/ws port 30311:

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

If the preceding node is running with DNS name `dot-bootnode.stakeworld.io`, which contains a proxy with a valid
certificate and node-id `12D3KooWAb5MyC1UJiEQJk4Hg4B2Vi3AJdqSUhTGYUqSnEqCFMFg` then the following
commands should give you a: `syncing 1 peers`.

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