---
title: Multisigs Accounts
description: This section contains guides that explain how to manage multisignature accounts on the Polkadot network. Learn how to interact with the Polkadot network by doing different operations with your multisignature accounts.
---

# Multi-signature Accounts Guide

Multiple signature (multisig) accounts serve as an effective method to enhance security or share control over an account. A multisig account is composed of multiple signatory accounts and requires approval from some or all of these signatories to execute a transaction or operation.

## Creating a Multi-signature Account

To learn how to create a multisig account, you can refer to the [How to Create and Use a Multisig Account](https://support.polkadot.network/support/solutions/articles/65000181826-how-to-create-and-use-a-multisig-account#How-to-create-a-multisig-account){target=\_blank} guide on the Polkadot support page.

It is recommended that multi-signature accounts be tested on TestNet before being used on the main network.

## Multisig Transaction

### Using the Accounts Tab

After creating a multisig account, you can use the [Accounts tab](https://polkadot.js.org/apps/#/accounts){target=\_blank} to perform transactions easily through the Polkadot.js user interface.

For further information, refer to the [How to use a multisig account](https://support.polkadot.network/support/solutions/articles/65000181826-how-to-create-and-use-a-multisig-account#How-to-use-a-multisig-account){target=\_blank} section on the Polkadot support page. Also, you can watch the [Start using your Multisig Account with the Polkadot-JS UI](https://polkadot.js.org/apps/?rpc=ws%3A%2F%2Flocalhost%3A8000#/runtime){target=\_blank} video tutorial.

### Using the Extrinsics Tab

There are four types of actions you can take with a multisig account:

- Executing a call `asMulti`. This is used to begin or end a multisig transaction
- Approving a call `approveAsMulti`. This is used to approve an extrinsic and pass on to the next signatory
- Immediately dispatch a multi-signature call using a single approval from the caller `asMultiThreshold1`
- Cancelling a call `cancelAsMulti`

To check out this method, navigate to the [Extrinsics tab](https://polkadot.js.org/apps/#/extrinsics){target=\_blank} on the Polkadot.js user interface and choose the *multisig* pallet. You can then select the desired action from the dropdown menu.

![Multisig Extrinsics](/images/tutorials/accounts/multisig/multisig-accounts-1.webp)

For further information, watch the [Polkadot Bounties, Multisigs, & Proxies](https://www.youtube.com/watch?v=Qv_nJVcvQr8&t=2109s){target=\_blank} video tutorial. Also, you can refer to the source code of the [multisig pallet](https://github.com/paritytech/substrate/blob/master/frame/multisig/src/lib.rs){target=\_blank} or the [pallet_multisig](https://docs.openzeppelin.com/substrate-runtimes/1.0.0/pallets/multisig){target=\_blank} documentation on the [OpenZeppelin website](https://docs.openzeppelin.com/){target=\_blank}.

!!! note
    To execute a single approval from the caller, you can use the `asMultiThreshold1` function. This method can also be executed and tested through the [txwrapper-core](https://github.com/paritytech/txwrapper-core){target=\_blank} library. For further details, refer to the [Multisig example](https://github.com/paritytech/txwrapper-core/tree/main/packages/txwrapper-examples/multisig){target=\_blank} on the txwrapper-core GitHub repository.

## Decoding a Multisig Call Data