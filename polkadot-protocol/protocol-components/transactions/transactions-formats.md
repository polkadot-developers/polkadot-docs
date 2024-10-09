---
title: Transactions Formats
description: Overview of the data structure of signed and unsigned transactions in Polkadot SDK-based chains, and how they are constructed.
---

# Transactions Formats

## Introduction

This article describes the data structure of signed and unsigned transactions in Polkadot SDK-based chains. Data structure information is particularly useful for understanding how the transaction pool checks incoming transactions. Parachain builders will find this helpful in customizing how their transactions are formatted and writing client applications that must adhere to a chosen format.

Extrinsics normally contain a signature, some data to describe whether the extrinsic has passed some validity checks, and a reference to the pallet and call that it is intended for. This format provides a way for applications to ensure that the requirements for an extrinsic are met and correctly constructed.

- [**Unchecked**](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/runtime/src/generic/unchecked_extrinsic.rs#L70){target=\_blank} - signed transactions requiring some validation check before being accepted in the transaction pool. Any unchecked extrinsic contains the signature for the sent data and some extra data
- [**Checked**](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/runtime/src/generic/checked_extrinsic.rs#L35){target=\_blank} - inherent extrinsics, which, by definition, don't require signature verification. Instead, they carry information on where the extrinsic comes from and some extra data
- [**Opaque**](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/runtime/src/lib.rs#L915){target=\_blank} - used for cases when an extrinsic hasn't yet been committed to a format but can still be decoded

!!! note
    Inherents are unique, unsigned transactions created by block producers. They contain essential data for block construction, such as time stamps, storage verification proofs, and information about uncle blocks.

Extra data can be any additional information helpful to attach to a transaction or inherent. For example, the nonce of the transaction, the tip for the block author, or how long the extrinsic is valid. This information is provided by a specialized extensions that help determine the validity and ordering of extrinsics before they get included in a block.

A signed transaction might be constructed like so:

```rust
--8<-- "code/polkadot-protocol/transactions/transactions-formats/signed-tx-example.rs"
```

## How Transactions are Constructed

Polkadot SDK defines its transaction formats generically, allowing developers to implement custom ways to define valid transactions. In a runtime built with FRAME, however (assuming transaction version 4), a transaction must be constructed by submitting the following encoded data:

`<signing account ID> + <signature> + <additional data>`

When submitting a signed transaction, the signature is constructed by signing:

- The actual call is composed of the following:
    - The index of the pallet
    - The index of the function call in the pallet
    - The parameters required by the function call being targeted

- Some extra information, verified by the signed extensions of the transaction:
    - What's the era for this transaction? How long should this call last in the transaction pool before it gets discarded?
    - The nonce. How many prior transactions have occurred from this account? This check helps protect against replay attacks or accidental double-submissions
    - The tip amount paid to the block producer to help incentivize it to include this transaction in the block

Then, some additional data that's not part of what gets signed is required, which includes:

- The spec version and the transaction version ensure that the transaction is submitted to a [compatible runtime](TODO:update-path){target=\_blank}
- The genesis hash, which ensures that the transaction is valid for the correct chain
- The block hash, that corresponds to the hash of the checkpoint block, enables the signature to verify that the transaction doesn't execute on the wrong fork by checking against the block number provided by the era information

This process can be broken down into the following steps:

1. Construct the unsigned payload
2. Create a signing payload
3. Sign the payload
4. Serialize the signed payload
5. Submit the serialized transaction

An extrinsic is encoded into the following sequence of bytes just before being hex-encoded:

`[ 1 ] + [ 2 ] + [ 3 ] + [ 4 ]`

Where:

- `[1]` contains the compact encoded length in bytes of all of the following data. Learn how compact encoding works using [SCALE](https://github.com/paritytech/parity-scale-codec){target=\_blank}
- `[2]` is a u8 containing 1 byte to indicate whether the transaction is signed or unsigned (1 bit) and the encoded transaction version ID (7 bits)
- `[3]` if a signature is present, this field contains an account ID, an SR25519 signature, and some extra data. If unsigned, this field contains 0 bytes
- `[4]` is the encoded call data. This comprises 1 byte denoting the pallet to call into, 1 byte denoting the call to make in that pallet, and as many bytes as needed to encode the arguments expected by that call

The metadata interface provides the way applications know how to construct a transaction correctly. An application will learn how to correctly encode a transaction using metadata types and transaction format. If a call doesn't need to be signed, then the first bit in `[2]` will be 0, so an application will know not to try decoding a signature.

## Signed Extensions

The Polkadot SDK provides the concept of [signed extensions](https://paritytech.github.io/polkadot-sdk/master/polkadot_sdk_docs/reference_docs/signed_extensions/index.html){target=\_blank}, which extend an extrinsic with additional data, through the [`SignedExtension`](https://paritytech.github.io/try-runtime-cli/sp_runtime/traits/trait.SignedExtension.html){target=\_blank} trait.

The transaction queue regularly calls signed extensions to check that a transaction is valid before it gets put in the ready queue. This is a useful safeguard for verifying that transactions won't fail in a block. Signed extensions are commonly used to enforce validation logic to protect the transaction pool from spam and replay attacks.

In FRAME, a signed extension can hold any of the following types by default:

- [**`AccountId`**](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/runtime/src/traits.rs#L1489){target=\_blank} - to encode the sender's identity
- [**`Call`**](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/runtime/src/traits.rs#L1492){target=\_blank} - to encode the pallet call to be dispatched. This data is used to calculate transaction fees
- [**`AdditionalSigned`**](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/runtime/src/traits.rs#L1496){target=\_blank} - to handle any additional data to go into the signed payload. This allows you to attach any custom logic prior to dispatching a transaction
- [**`Pre`**](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/primitives/runtime/src/traits.rs#L1499){target=\_blank} - to encode the information that can be passed from before a call is dispatched to after it gets dispatched

FRAME's system pallet provides a [useful `SignedExtension` set](https://github.com/paritytech/polkadot-sdk/blob/master/substrate/frame/system/src/lib.rs#L79){target=\_blank} out of the box.

### Example

An important signed extension for validating transactions is `CheckSpecVersion`. The sender can provide the spec version as a signed payload attached to the transaction. Since the spec version is already known in the runtime, the signed extension can perform a simple check to verify that the spec versions match. The transaction fails before being put in the pool if they don't.

Other examples include the signed extensions used to calculate transaction priority. These are:

- [`CheckWeight`](https://paritytech.github.io/polkadot-sdk/master/frame_system/struct.CheckWeight.html){target=\_blank} - sets the value for priority to 0 for all dispatch classes
- [`ChargeTransactionPayment`](https://paritytech.github.io/polkadot-sdk/master/pallet_transaction_payment/struct.ChargeTransactionPayment.html){target=\_blank} - calculates the overall priority, modifying the priority value accordingly

The priority depends on the dispatch class and the amount of tip-per-weight or tip-per-length (whatever is more limiting) the sender is willing to pay. Transactions without a tip use a minimal tip value of `1` for priority calculations to ensure that not all transactions have a priority of `0`. The consequence of this is that smaller transactions are preferred over larger ones.

## Where to Go Next

Now that you have seen how transactions are constructed, you should review how they progress from the transaction pool to the runtime and get added to blocks or how to use tools that enable you to submit transactions offline or using a REST API.

- [Transaction lifecycle](TODO:update-path){target=\_blank}
- [Transactions, weights, and fees](TODO:update-path){target=\_blank}
- [`txwrapper-core`](https://github.com/paritytech/txwrapper-core){target=\_blank} - for offline transactions
- [`@substrate/api-sidecar`](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} - for REST-based transactions