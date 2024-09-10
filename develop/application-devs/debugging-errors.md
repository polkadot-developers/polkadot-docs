---
title: Errors and How to Resolve Them
description: Common errors that are encountered across the runtime, tooling, and block explorers.
---

Errors in Substrate-based chains are usually accompanied by descriptive messages. However, to read
these messages, a tool parsing the blockchain data needs to request _chain metadata_ from a node.
That metadata explains how to read the messages. One such tool with a built-in parser for chain
metadata is the [Polkadot-JS Apps UI](https://polkadot.js.org/apps){target=\_blank}.

If this page doesn't answer your question, try searching for your problem at the
[Polkadot Knowledge Base](https://support.polkadot.network/){target=\_blank} for more information on troubleshooting
your issue.

## PolkadotJS Apps Explorer

Here's how to find out the detailed error description through Polkadot-JS Apps.

A typical failed transactions looks something like this:

![Error while sending a transaction](/images/errors/01.webp)

The image displays only the error name as defined in the code, not its error message.

In the [explorer tab](https://polkadot.js.org/apps/#/explorer){target=\_blank}, find the block in which this failure
occurred. Then, expand the `system.ExtrinsicFailed` frame:

![Error described](/images/errors/02.webp)

Notice how the `details` field contains a human-readable description of the error. Most errors will
have this, if looked up this way.

[This block](https://polkadot.js.org/apps/#/explorer/query/0xa10104ed21dfe409c7871a975155766c5dd97e1e2ac7faf3c90f1f8dca89104b){target=\_blank} is a live example of this scenario.

If the error can't be found, or there is no message in the `details` field, consult the table below.

## Subscan

The `ExtrinsicFailed` event indicates when a transaction doesn't succeed ([example](https://polkadot.subscan.io/extrinsic/19983878-2?event=19983878-53){target=\_blank}). This event provides the `error` and `index` (as seen in the table of the event, in the `dispatch_error` row) indices of the error but doesn't provide an informative message to understand what it means. The error can be identified in the codebase to understand what went wrong.

The `index` number is the index of the pallet in the runtime from which the error originated. The `error` is likewise the index of that pallet's errors which is the exact one that is referenced. Both of these indices start counting from 0.

For example, if `index` is 5 and `error` is 3, as in the preceding example, this indicates that it is fourth error (index 3) in the sixth pallet (index 5).

The pallet at index 5 is `Balances`. The Balances pallet's code which is hosted in the Polkadot SDK repository, and look for the fourth error in the `Error enum`. According to its source the error that referenced is `InsufficientBalance`, or in other words, "Balance too low to send value."

## Common Errors

The table below lists the most commonly encountered errors and ways to resolve them.

| Error              | Description                                                                                                  | Solution                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------ | ------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| BadOrigin          | You aren't allowed to do this operation, for example, trying to create a council motion with a non-council account. | Either switch to an account that has the necessary permissions, or check if the operation you're trying to execute is permitted at all (for example, calling `system.setCode` to do a runtime upgrade directly, without voting).                                                                                                                                                                  |
| BadProof           | The transaction's signature seems invalid.                                                                   | It's possible that the node you're connected to is following an obsolete fork - trying again after it catches up usually resolves the issue. To check for bigger problems, inspect the last finalized and current best block of the node you're connected to and compare the values to chain stats exposed by other nodes - are they in sync? If not, try connecting to a different node. |
| Future             | Transaction nonce too high, as in it's "from the future," **see note below**.                                 | Reduce the nonce to +1 of current nonce. Check current nonce by inspecting the address you're using to send the transaction.                                                                                                                                                                                                                                                              |
| Stale              | Transaction nonce too low.                                                                                   | Increase the nonce to +1 of current nonce. Check current nonce by inspecting the address you're using to send the transaction.                                                                                                                                                                                                                                                            |
| ExhaustsResources  | There aren't enough resources left in the current block to submit this transaction.                          | Try again in the next block.                                                                                                                                                                                                                                                                                                                                                              |
| Payment            | Unable to pay for transaction fee.                                                                                    | The account might not have enough free balance to cover the fee this transaction would incur.                                                                                                                                                                                                                                                                                                     |
| Temporarily banned | The transaction is temporarily banned.                                                                       | The transaction is already in pool. Either try on a different node, or wait to see if the initial transaction goes through.                                                                                                                                                                                                                                                                        |

!!!info Future Error

    This error will not cause the transaction to be discarded immediately. Instead, it will be sent to the future queue, where it
    will wait to be executed at the correct place in the nonce sequence or it will get discarded due to
    some other error (ex. the validity period expires).


## Runtime Errors

<!-- TODO: Add description of how to find error types via subscan and metadata, ideally link the metadata page or something  -->