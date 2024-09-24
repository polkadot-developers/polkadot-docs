---
title: Errors and How to Resolve Them
description: This page provides an overview of frequently encountered errors and essential tools, like Polkadot.js Apps, to help you identify and resolve common issues.
---

# Troubleshooting Common Errors

Errors in Substrate-based chains are typically accompanied by descriptive messages. To interpret these messages, tools that parse blockchain data must request _chain metadata_ from a node, which provides the necessary information to decode them. One such tool is the [Polkadot.js Apps UI](https://polkadot.js.org/apps){target=\_blank}, which includes a built-in parser for chain metadata that allows error messages to be displayed in a human-readable format.

This page provides an overview of essential tools, like Polkadot.js Apps, to help you identify and resolve common issues and offers practical solutions for frequently encountered errors.

If this page doesn't answer your question, try searching for your problem at the [Polkadot Knowledge Base](https://support.polkadot.network/){target=\_blank} for more information on troubleshooting.

## Polkadot.js Apps Explorer

If a transaction submitted through Polkadot.js Apps fails, notifications will temporarily appear in the top-right corner of the screen. These notifications will inform you that the transaction has been included in a block, that it has failed, and will display any events emitted during the failed execution. The `ExtrinsicFailed` event indicates when a transaction doesn't succeed.

Refer to the image below to see examples of these notifications:

![Error while sending a transaction](/images/develop/applications-devs/debugging-errors/errors-1.webp){style="margin: auto; width: 50%; display: flex;"}

The image displays only the error name defined in the code without the full error message. To access the error message, you must first identify the block containing your transaction. The easiest way to do this is by using [Subscan](https://polkadot.subscan.io/){target=\_blank} to check your account activity.

Once you have the block number, query it from the [Polkadot.js Apps Explorer](https://polkadot.js.org/apps/#/explorer){target=\_blank}. Alternatively, you can view the error details directly on Subscan (see the [following section](#subscan) for instructions).

After querying the block, you'll see a list of extrinsics. Scroll through the list to find the call you made. Look for the associated **system.ExtrinsicFailed** event and expand it to review the detailed error information.

![Error described](/images/develop/applications-devs/debugging-errors/errors-2.webp){style="margin: auto; width: 75%; display: flex;"}

!!! note
    You can view [the block on Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss://polkadot.api.onfinality.io/public-ws#/explorer/query/19983878){target=\_blank} containing the failed extrinsic in the preceding image. You'll need to scroll down to the **staking.nominate** extrinsic and expand the **system.ExtrinsicFailed** event to see the error details.

Notice how the **details** field contains a human-readable description of the error. Most errors will have this if looked up this way.

If the error isn't listed or the **details** field is empty, refer to the table in the [Common Errors](#common-errors) section. You can also look up the **index** and **error**, as shown in the **dispatchError** section, in the codebase using the steps in the [Runtime Errors](#runtime-errors) section to diagnose the issue.

## Subscan

In addition to Polkadot.js Apps, the [Subscan](https://polkadot.subscan.io/){target=\_blank} block explorer is another powerful tool for accessing and interpreting error messages on Substrate-based chains.

Whenever an extrinsic fails, an `ExtrinsicFailed` event will be emitted. If you're unsure of the block or extrinsic hash of the failed extrinsic, you can query your account's address, and it'll be listed under the **Extrinsics** tab on your account page. On the extrinsic detail page, you can scroll down to the **Events** tab towards the bottom and expand the **system(ExtrinsicFailed)** event to view the error details.

![View the extrinsic failed event](/images/develop/applications-devs/debugging-errors/errors-3.webp)

!!!note
    To view the preceding example directly in Subscan, head to the [extrinsic page for 19983862-2](https://polkadot.subscan.io/extrinsic/19983878-2?event=19983878-53){target=\_blank}.

This event contains a human-readable description of the error in the **doc** row. Most errors will have this if looked up this way.

If the error isn't listed or the **doc** field is empty, refer to the table in the [Common Errors](#common-errors) section. You can also look up the **index** and **error** in the codebase using the steps in the [Runtime Errors](#runtime-errors) section to diagnose the issue.

## Common Errors

The table below lists the most commonly encountered errors and ways to resolve them.

| Error               | Description                                                                                                        | Solution                                                                                                                                                                                                                                                                                                                                                                   |
|---------------------|--------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `BadOrigin`         | You aren't allowed to do this operation, for example, trying to create a council motion with a non-council account | Either switch to an account that has the necessary permissions or check if the operation you're trying to execute is permitted at all (for example, calling `system.setCode` to do a runtime upgrade directly, without voting)                                                                                                                                             |
| `BadProof`          | The transaction's signature seems invalid                                                                          | The node you're connected to may be following an obsolete fork - trying again after it catches up usually resolves the issue. To check for bigger problems, inspect the last finalized and current best block of the node you're connected to and compare the values to chain stats exposed by other nodes - are they in sync? If not, try connecting to a different node. |
| `Future`            | Transaction nonce too high, as in it's "from the future" (see note below)                                          | Reduce the nonce to +1 of the current nonce. Check current nonce by inspecting the address you're using to send the transaction                                                                                                                                                                                                                                            |
| `Stale`             | Transaction nonce too low                                                                                          | Increase the nonce to +1 of current nonce. Check current nonce by inspecting the address you're using to send the transaction                                                                                                                                                                                                                                              |
| `ExhaustsResources` | There aren't enough resources left in the current block to submit this transaction                                 | Try again in the next block                                                                                                                                                                                                                                                                                                                                                |
| `Payment`           | Unable to pay for transaction fee                                                                                  | The account might not have enough free balance to cover the fee this transaction would incur                                                                                                                                                                                                                                                                               |
| `TemporarilyBanned` | The transaction is temporarily banned                                                                              | The transaction is already in the pool. Either try on a different node or wait to see if the initial transaction goes through                                                                                                                                                                                                                                              |

!!!note "Future Error"

    This error will not cause the transaction to be discarded immediately. Instead, it will be sent to the future queue, where it will wait to be executed at the correct place in the nonce sequence, or it will be discarded due to some other error (e.g., the validity period expires).

## Runtime Errors

Runtime errors in Substrate-based chains provide valuable insights into issues encountered during transaction execution. Understanding these errors is essential for diagnosing problems effectively. This section outlines how to view error details for specific pallets, as well as how to decipher dispatch errors to identify the source pallet and the error of the issue.

### View Error Details

The runtime errors for a particular pallet can be viewed in one of several ways:

1. Referring to the [`polkadot_sdk_docs`](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/index.html){target=\_blank} for that pallet, where the errors can be found, for example, [`pallet_balances`](https://paritytech.github.io/polkadot-sdk/master/pallet_balances/pallet/enum.Error.html#variants){target=\_blank}
2. Referring to [Subscan's runtime section](https://polkadot.subscan.io/runtime){target=\_blank}, where the pallet can be selected and viewed

### Deciphering Dispatch Errors

If you receive a dispatch error, it will include the index of the pallet from which the error originated and the specific index of the error within that pallet's error definitions. Both of these indices start counting from zero.

Runtime errors can be located by examining the runtime's codebase. For Polkadot, this involves checking the [Polkadot Fellows Runtime repository](https://github.com/polkadot-fellows/runtimes/){target=\_blank} and the [Polkadot SDK](https://github.com/paritytech/polkadot-sdk){target=\_blank} repository.

As an example, consider the following dispatch error:

```js
{
  Module: {
    index: 7
    error: 0x07000000
  }
}
```

You can see that the module index number is `7`, but the error is a hex string that you must convert to a decimal. The first byte, `07`, represents the index of the error. You'll need to convert `0x07` to a decimal, which ends up being `7`. So now you know that `7` is the index of the pallet, and `7` is the index of the error for that pallet in this example.

You can view a list of the runtime's pallets and associated indices in the Polkadot Fellows Runtimes repository in the [`relay/polkadot/src/lib.rs` file](https://github.com/polkadot-fellows/runtimes/blob/main/relay/polkadot/src/lib.rs){target=\_blank}. You'll look in this file for `pub enum Runtime`, which is where you'll see each pallet and its associated index. You'll find that the Staking pallet is at index `7`.

Now that you know the error occurred in the Staking pallet, you can look at the Staking pallet's code, located in the [`substrate/frame/staking/` directory](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/staking/){target=\_blank} of the Polkadot SDK repository. The errors are defined in the [`substrate/fram/staking/src/pallet/mod.rs` file](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/staking/src/pallet/mod.rs){target=\_blank} for the Staking pallet specifically. If you look for `pub enum Error` and look at the eighth error, which corresponds to the seventh index, you'll see `InsufficientBond`. So, now you know that the error you're seeing is an insufficient bond error being emitted from the Staking pallet.

!!! note
    The error enum isn't defined in the same exact location for every pallet. In some pallets, you'll find that the error enum is defined in the `src/lib.rs` file.
