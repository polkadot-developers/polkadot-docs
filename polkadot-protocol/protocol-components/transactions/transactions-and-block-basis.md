---
title: Transactions and Block Basis
description: Overview of transactions and blocks in Polkadot SDK-Based Chains, including signed, unsigned, and inherent transactions.
---

# Transactions and Block Basis

## Introduction

In this article, you'll learn about the different types of transactions you can create and how to use them in a runtime. Transactions determine the data that makes its way into the blocks in your blockchain. By learning how different transaction types are used, you'll be better prepared to select the appropriate type for your needs.

## What is a Transaction?

In general, transactions provide a mechanism for making changes to a state that can be included in a block. There are three distinct transaction types in Substrate:

- [Signed Transactions](./transactions-and-block-basis.md#signed-transactions)
- [Unsigned Transactions](./transactions-and-block-basis.md#unsigned-transactions)
- [Inherent Transactions](./transactions-and-block-basis.md#inherent-transactions)
     
In Substrate, all three transaction types are often more broadly referred to as extrinsic. The term extrinsic generally refers to any information that originates outside the runtime. While other blockchain platforms often label these as "transactions," Substrate deliberately opted for the broader term "extrinsics." This choice reflects the versatility of the concept, encompassing any type of data that could potentially be incorporated into a block.

However, for practical purposes, it is more beneficial to consider each transaction type independently and identify scenarios where each type would be most applicable.

### Signed Transactions

Signed transactions must include the signature of an account sending an inbound request to execute some runtime call. Typically, the request is signed using the private key for the account submitting it. In most cases, the account submitting the request also pays a transaction fee. However, transaction fees and other transaction processing elements depend on how the runtime logic is defined.

Signed transactions are the most common type of transaction. For example, assume you have an account with some tokens. If you want to transfer tokens to Alice, you can call the [`pallet_balances::Call::transfer_allow_death`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/balances/src/lib.rs#L592){target=\_blank} extrinsic in the Balances pallet. Because your account is used to make this call, your account key is used to sign the transaction. As the requester, you are responsible for paying a fee to process your request. Optionally, you could also tip the block author to prioritize your transaction.

### Unsigned Transactions

Unsigned transactions don't require a signature or include any information about who submitted the transaction.

With an unsigned transaction, there's no economic deterrent to prevent spam or replay attacks. You must define the conditions for validating unsigned transactions and the logic required to protect the network from misuse and attacks. Because unsigned transactions require custom validation, this transaction type consumes more resources than a signed transaction.

The [`pallet_im_online::Call::heartbeat`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/im-online/src/lib.rs#L392){target=\_blank} extrinsic uses unsigned transactions to enable validator nodes to send a signal to the network to indicate that they are online. This function can only be called by a node registered as a validator in the network. The function includes internal logic to verify that the node is a validator, allowing the node to call the function using an unsigned transaction to avoid paying fees.

### Inherent Transactions

Inherent transactions, sometimes referred to as inherent, are a particular type of unsigned transaction. With this type of transaction, block authoring nodes can add information directly to a block. Inherent transactions can only be inserted into a block by the block authoring node that calls them. Typically, this type of transaction is not gossiped to other nodes or stored in the transaction queue. The data inserted using an inherent transaction is assumed valid without requiring specific validation.

For example, if a block authoring node inserts a timestamp into a block, there is no way to prove that a timestamp is accurate. Instead, validators might accept or reject the block based on whether the timestamp is within some acceptable range of their system clocks.

As an example, the [`pallet_timestamp::Call::now`](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/timestamp/src/lib.rs){target=\_blank} extrinsic enables a block authoring node to insert a current timestamp in each block the node produces. Similarly, the [`paras_inherent::Call::enter`](https://github.com/paritytech/polkadot-sdk/blob/master/polkadot/runtime/parachains/src/paras_inherent/mod.rs#L247){target=\_blank} extrinsic enables a parachain collator node to send its relay chain the validation data the relay chain expects.

## What is a Block?

In Substrate, a block consists of a header and an array of transactions. The header contains the following properties:

- Block height - the number of blocks that have been created in the chain
- Parent hash - the hash of the previous block in the chain
- Transaction root - a cryptographic digest of the transactions in the block
- State root - a cryptographic digest of the state after executing the transactions
- Digest - a list of additional information that can be included in the block

All of the transactions are bundled together as a series to be executed as defined in the runtime. You'll learn more about transaction ordering in the [Transaction Lifecycle](TODO:update-path){target=\_blank} documentation. The transaction root is a cryptographic digest of this series. This cryptographic digest serves two purposes:

- It prevents any alterations to the series of transactions after the header has been built and distributed
- It enables light clients to succinctly verify that any given transaction exists in a block given only knowledge of the header

## Where to Go Next

Now that you are familiar with transaction types and the information that constitutes a block, explore the following topics to learn more.

- [Transaction lifecycle](TODO:update-path){target=\_blank} - learn how transactions are processed and included in blocks
- [State transitions and storage](TODO:update-path){target=\_blank} - understand how transactions change the state of the blockchain
- [Transactions, weights, and fees](TODO:update-path){target=\_blank} - learn how to calculate the cost of a transaction and how to set transaction fees
- [Transaction format](TODO:update-path){target=\_blank} - explore the structure of a transaction and how to decode it
- [Block reference](https://paritytech.github.io/polkadot-sdk/master/sp_runtime/traits/trait.Block.html){target=\_blank} - learn more about the block structure in the Substrate runtime