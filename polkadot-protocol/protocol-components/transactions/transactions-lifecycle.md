---
title: Transactions Lifecycle
description: Learn about the lifecycle of transactions in Polkadot SDK-based chians, including how they are validated and executed in the runtime.
---

# Transactions Lifecycle

## Introduction

In the Polkadot SDK, transactions contain data to be included in a block. Because the data in transactions originates outside of the runtime, transactions are sometimes more broadly referred to as extrinsic data. However, the most common extrinsic are signed transactions. Therefore, this discussion of the transaction lifecycle focuses on how signed transactions are validated and executed.

You've already learned that signed transactions include the signature of the account sending the request to execute some runtime call. Typically, the request is signed using the private key for the account that is submitting the request. In most cases, the account submitting the request also pays a transaction fee. However, transaction fees and other transaction processing elements depend on how the runtime logic is defined.

## Where Transactions are Defined

As discussed in [Runtime Development](TODO:update-path){target=\_blank}, the Polkadot SDK runtime contains the business logic that defines transaction properties, including:

- What constitutes a valid transaction
- Whether the transactions are sent as signed or unsigned
- How transactions change the state of the chain

Typically, you use pallets to compose the runtime functions and implement the transactions you want your chain to support. After you compile the runtime, users interact with the blockchain to submit requests processed as transactions. For example, a user might submit a request to transfer funds from one account to another. The request becomes a signed transaction containing the signature for that user account. If sufficient funds are in the user's account to pay for the transaction, the transaction executes successfully, and the transfer is made.

## How Transactions are Processed on a Block Authoring Node

Depending on your network's configuration, you might have a combination of nodes authorized to author blocks and nodes not authorized for block authoring. If a Polkadot SDK node is authorized to produce blocks, it can process the signed and unsigned transactions it receives. The following diagram illustrates the lifecycle of a transaction that's submitted to a network and processed by an authoring node.

![](/images/polkadot-protocol/polkadot-components/transactions/transactions-lifecycles/transaction-lifecycle-1.webp)

Any signed or unsigned transaction sent to a non-authoring node is gossiped to other nodes in the network and enters their transaction pool until an authoring node receives it.

## Validating and Queuing Transactions

As discussed in the [Consensus](TODO:update-path){target=\_blank} section, most nodes in the network must agree on the order of transactions in a block to decide on the state of the blockchain and to continue securely adding blocks. To reach a consensus, two-thirds of the nodes must agree on the order of the transactions executed and the resulting state change. To prepare for consensus, transactions are first validated and queued on the local node in a transaction pool.

### Validating Transactions in the Transaction Pool

Using rules defined in the runtime, the transaction pool checks the validity of each transaction. The checks ensure that only valid transactions that meet specific conditions are queued to be included in a block. For example, the transaction pool might perform the following checks to determine whether a transaction is valid:

- Is the transaction index—also called the transaction nonce—correct?
- Does the account used to sign the transaction have enough funds to pay the associated fees?
- Is the signature used to sign the transaction valid?

After the initial validity check, the transaction pool periodically checks whether existing transactions are valid. If a transaction is found to be invalid or has expired, it is dropped from the pool.

The transaction pool only deals with the validity of the transaction and the ordering of valid transactions placed in a transaction queue. Specific details on how the validation mechanism works—including handling fees, accounts, or signatures—can be found in the [`validate_transaction`](https://paritytech.github.io/polkadot-sdk/master/sp_transaction_pool/runtime_api/trait.TaggedTransactionQueue.html#method.validate_transaction){target=\_blank} method.

### Adding Valid Transactions to a Transaction Queue

If a transaction is identified as valid, the transaction pool moves the transaction into a transaction queue. There are two queues for valid transactions:

- The ready queue contains transactions that can be included in a new pending block. If the runtime is built with FRAME, transactions must be placed in the exact order in which they are placed in the ready queue

- The future queue contains transactions that might become valid in the future. For example, if a transaction has a nonce that is too high for its account, it can wait in the future queue until the appropriate number of transactions for the account have been included in the chain

### Invalid Transaction Handling

If a transaction is invalid—for example, because it is too large or doesn't contain a valid signature—it is rejected and won't be added to a block. A transaction might be rejected for any of the following reasons:

- The transaction has already been included in a block and dropped from the verifying queue
- The transaction's signature is invalid, so it is immediately rejected
- The transaction is too large to fit in the current block and is returned to a queue for a new verification round

## Transaction Ordered by Priority

If a node is the next block author, the node uses a priority system to order the transactions for the next block. The transactions are ordered from high to low priority until the block reaches the maximum weight or length.

Transaction priority is calculated in the runtime and provided to the outer node as a tag on the transaction. In a FRAME runtime, a special pallet is used to calculate priority based on the weights and fees associated with the transaction. This priority calculation applies to all types of transactions except inherent. Inherents are always placed first using the [`EnsureInherentsAreFirst`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.EnsureInherentsAreFirst.html){target=\_blank} trait.

### Account-based Transaction Ordering

If your runtime is built with FRAME, every signed transaction contains a nonce incremented every time a specific account makes a new transaction. For example, the first transaction from a new account has `nonce = 0`, and the second transaction for the same account has `nonce = 1`. The block authoring node can use the nonce when ordering the transactions to include in a block.

For transactions with dependencies, the ordering considers the fees that the transaction pays and any dependency on other transactions it contains. For example:

- If there is an unsigned transaction with `TransactionPriority::max_value()` and another signed transaction, the unsigned transaction is placed first in the queue
- If there are two transactions from different senders, the `priority` determines which transaction is more important and should be included in the block first
- If there are two transactions from the same sender with an identical `nonce`, only one transaction can be included in the block, so only the transaction with the higher fee is included in the queue

## Executing transactions and producing blocks

After valid transactions are placed in the transaction queue, a separate executive module orchestrates how transactions are executed to produce a block. The executive module calls functions in the runtime modules and executes those functions in specific order.

As a runtime developer, it's important to understand how the executive module interacts with the system pallet and the other pallets that compose the business logic for your blockchain because you can insert logic for the executive module to perform as part of the following operations:

- Initializing a block
- Executing the transactions to be included in a block
- Finalizing block building

### Initialize a Block

The executive module calls the [`on_initialize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_initialize){target=\_blank} hook in the system pallet and all other runtime pallets to initialize a block. The [`on_initialize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_initialize){target=\_blank} function lets you define business logic that should be completed before transactions are executed. The system pallet [`on_initialize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_initialize){target=\_blank} function is always executed first. The remaining pallets are called in the order defined in the [frame_support::runtime](https://paritytech.github.io/polkadot-sdk/master/frame_support/attr.runtime.html){target=\_blank} macro.

After all the [`on_initialize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_initialize){target=\_blank} functions have been executed, the executive module checks the parent hash in the block header and the trie root to verify the correct information.

### Executing Transactions

After the block is initialized, each valid transaction is executed in order of priority. It is important to remember that the state is not cached before execution. Instead, state changes are written directly to storage during execution. If a transaction were to fail mid-execution, any state changes that took place before the failure would not be reverted, leaving the block in an unrecoverable state. Before committing any state changes to storage, the runtime logic should perform all necessary checks to ensure the extrinsic will succeed.

Note that [events](TODO:update-path){target=\_blank} are also written to storage. Therefore, the runtime logic should not emit an event before performing the complementary actions. If a transaction fails after an event is emitted, the event is not reverted.

### Finalizing Block

After all queued transactions have been executed, the executive module calls into each pallet's [`on_idle`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_idle){target=\_blank} and [`on_finalize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_finalize){target=\_blank} functions to perform any final business logic that should occur at the block's end. The modules are again executed in the order defined in the `frame_support::runtime` macro, but in this case, the [`on_finalize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_finalize){target=\_blank} function in the system pallet is executed last.

After all of the [`on_finalize`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_finalize){target=\_blank} functions have been executed, the executive module checks that the digest and storage root in the block header match what was calculated when the block was initialized.
The [`on_idle`](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/trait.Hooks.html#method.on_idle){target=\_blank} function also passes through the remaining weight of the block to allow for execution based on the blockchain’s usage.

## Block Authoring and Block Imports

So far, you have seen how transactions are included in a block produced by the local node. If the local node is authorized to produce blocks, the transaction lifecycle follows these steps:

1. The local node listens for transactions on the network
2. Each transaction is verified
3. Valid transactions are placed in the transaction pool
4. The transaction pool orders the valid transactions in the appropriate transaction queue, and the executive module calls into the runtime to begin the next block
5. Transactions are executed, and state changes are stored in local memory
6. The constructed block is published to the network

After the block is published to the network, it is available for other nodes to import. The block import queue is part of the outer node in every Polkadot SDK node. The block import queue listens for incoming blocks and consensus-related messages and adds them to a pool. In the pool, incoming information is checked for validity and discarded if it isn't valid. After verifying that a block or message is valid, the block import queue imports the incoming information into the local node's state and adds it to the database of blocks that the node knows about.

In most cases, you don't need to know details about how transactions are gossiped or how other nodes on the network import blocks. However, if you plan to write any custom consensus logic or want to know more about implementing the block import queue, then the following traits are relevant:

- [**`ImportQueue`**](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/import_queue/trait.ImportQueue.html){target=\_blank} - the trait that defines the block import queue
- [**`Link`**](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/import_queue/trait.Link.html){target=\_blank} - the trait that defines the link between the block import queue and the network
- [**`BasicQueue`**](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/import_queue/struct.BasicQueue.html){target=\_blank} - a basic implementation of the block import queue
- [**`Verifier`**](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/import_queue/trait.Verifier.html){target=\_blank} - the trait that defines the block verifier
- [**`BlockImport`**](https://paritytech.github.io/polkadot-sdk/master/sc_consensus/block_import/trait.BlockImport.html){target=\_blank} - the trait that defines the block import process

## Where to Go Next

- [Seminar: Lifecycle of a transaction](https://www.youtube.com/watch?v=3pfM0GOp02c){target=\_blank}
- [Accounts, addresses, and keys](TODO:update-path){target=\_blank}