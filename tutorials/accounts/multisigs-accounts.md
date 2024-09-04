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

#### Multisig Call Deposit

When you create a new multi-sig call, you will need to place a DOT deposit. The deposit stays locked until the call is executed. This deposit is to establish an economic cost on the storage space that the multisig call takes up in the chain state and discourage users from creating multisig calls that never get executed. The deposit will be reserved in the call initiator's account.

The deposit is dependent on the `threshold` parameter and is calculated as follows:

```
deposit = depositBase + threshold * depositFactor
```

Where `depositBase` and `depositFactor` are chain constants set in the runtime code. For example, in the Polkadot runtime, the `depositBase` is set to 20.088 DOT and the `depositFactor` is set to 0.032 DOT.

The other signatory accounts should have enough funds to pay for the transaction fees associated with approving the multisig call. The deposit is for the call; that is, other signatories will not need to place additional deposits. Once the multisig call is executed or rejected, the deposit is released on the account that initiated the call.

#### Example Using Multisig Call

![Multisig Example](/images/tutorials/accounts/multisig/multisig-accounts-2.webp)

Let's consider an example of a multisig on Polkadot with a threshold of 2 and 3 signers: Charlie, Dan, and Eleanor. First, Charlie will create the call on-chain by calling the `multisig.asMulti` extrinsic with the raw call, in this case, a balance transfer (`balances.transferKeepAlive` extrinsic) from multisig CDE to Frank's account. When doing this, Charlie will have to deposit `DepositBase + (2 * DepositFactor) = 20.152 DOT`. At the same time, he waits for either Dan or Eleanor to approve the balance transfer call using the `multisig.approveAsMulti` or the `multisig.asMulti` extrinsic.

If Dan submits the `multisig.approveAsMulti` extrinsic, he approves Charlie's call but passes on the final approval to Eleanor. So, although the multisig has threshold 2, in this case, all 3/3 of the signatories need to participate in the transaction approval. Eleanor must submit a `multisig.asMulti` or `multisig.approveAsMulti` extrinsic to transfer funds from CDE to Frank.

Alternatively, Dan or Eleanor can submit a `multisig.asMulti` extrinsic after Charlie transfers the funds. In this case, 2/3 of the signatories will participate in the transaction approval. The accounts approving Charlie's call will not need to place the deposit, and Charlie will receive his deposit back once the transfer is successful or canceled. Dan or Eleanor can use the multisig to cancel the transaction.cancelAsMulti extrinsic.

For further details on how to perform a multisig transaction, watch the [Use your Multisig Accounts like a Pro with the Polkadot-JS UI (Advanced Tutorial)](https://www.youtube.com/watch?v=T0vIuJcTJeQ){target=\_blank} video tutorial.

Note that multisigs are deterministic, which means that multisig addresses are generated from the addresses of signers and the threshold of the multisig wallet. No matter the order of the signatories' accounts, the multisig will always have the same address because accounts' addresses are sorted in ascending order.

When using the Extrinsic tab on the Polkadot-JS UI to perform multisig transactions, this has some implications. If the order of the other signatories is wrong, the transaction will fail. This does not happen if the multisig is executed directly from the Accounts tab (recommended).

## Decoding a Multisig Call Data

Before signing a transaction, knowing the exact specifics of what is being signed is important. Check the [How to use a multisig account](https://support.polkadot.network/support/solutions/articles/65000181826-how-to-create-and-use-a-multisig-account#How-to-use-a-multisig-account:~:text=7.%20Before%20signing,about%20to%20approve%3A){target=\_blank} section in the support docs on how to decode the multisig call data.