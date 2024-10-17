---
title: Blocks
description: TODO
---
<!--######This is a WIP page#######-->

<!--
# Blocks

## Introduction



## What is a Block?

In the Polkadot SDK, a block consists of a header and an array of transactions. The header contains the following properties:

- **Block height** - the number of blocks that have been created in the chain
- **Parent hash** - the hash of the previous block in the chain
- **Transaction root** - a cryptographic digest of the transactions in the block
- **State root** - a cryptographic digest of the state after executing the transactions
- **Digest** - a list of additional information that can be included in the block

All transactions are bundled together as a series to be executed as defined in the runtime. You'll learn more about transaction ordering in the [Transactions Lifecycle](/polkadot-protocol/protocol-components/transactions/transactions-lifecycle/){target=\_blank} documentation. The transaction root is a cryptographic digest of this series. This cryptographic digest serves two purposes:

- It prevents any alterations to the series of transactions after the header has been built and distributed
- It enables light clients to succinctly verify that any given transaction exists in a block given only knowledge of the header

## Where to Go Next

Now that you are familiar with the information that constitutes a block, you can explore the following topics to learn more:

- [**Block reference**](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/traits/trait.Block.html){target=\_blank} - learn more about the block structure in the Polkadot SDK runtime

-->