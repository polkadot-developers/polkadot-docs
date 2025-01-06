---
title: Running a Node
description: Learn how to run and connect to a Polkadot node, including setup, configuration, and best practices for connectivity and security.
template: index-page.html
---

# Running a Node

Running a node on the Polkadot network enables you to access blockchain data, interact with the network, and support decentralized applications (dApps). This guide will walk you through the process of setting up and connecting to a Polkadot node, including essential configuration steps for ensuring connectivity and security.

## Full Nodes vs Bootnodes

Full nodes and bootnodes serve different roles within the network, each contributing in unique ways to connectivity and data access:

- **Full node** - stores blockchain data, validates transactions, and can serve as a source for querying data
- **Bootnode** - assists new nodes in discovering peers and connecting to the network, but doesn’t store blockchain data

The following sections describe the different types of full nodes—pruned, archive, and light nodes—and the unique features of each for various use cases.

## Types of Full Nodes

The three main types of nodes are as follows:

- **Pruned node** - prunes historical states of all finalized block states older than a specified number except for the genesis block's state
- **Archive node** - preserves all the past blocks and their states, making it convenient to query the past state of the chain at any given time. Archive nodes use a lot of disk space, which means they should be limited to use cases that require easy access to past on-chain data, such as block explorers
- **Light node** - has only the runtime and the current state but doesn't store past blocks, making them useful for resource-restricted devices

Each node type can be configured to provide remote access to blockchain data via RPC endpoints, allowing external clients, like dApps or developers, to submit transactions, query data, and interact with the blockchain remotely.

!!!tip
    On [Stakeworld](https://stakeworld.io/docs/dbsize){target=\_blank}, you can find a list of the database sizes of Polkadot and Kusama nodes.

### State vs. Block Pruning

A pruned node retains only a subset of finalized blocks, discarding older data. The two main types of pruning are:

- **State pruning** - removes the states of old blocks while retaining block headers
- **Block pruning** - removes both the full content of old blocks and their associated states, but keeps the block headers

Despite these deletions, pruned nodes are still capable of performing many essential functions, such as displaying account balances, making transfers, setting up session keys, and participating in staking.

## In This Section

:::INSERT_IN_THIS_SECTION:::
