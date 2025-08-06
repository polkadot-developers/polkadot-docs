---
title: Fees
description: How to handle fees in XCM.
---

# Fees

In blockchain systems, fees are crucial.
They prevent malicious actors from exhausting the results of the network, making such attacks expensive.
The XCM subsystem has its own way of dealing with fees, flexible enough to allow feeless execution in situations that warrant it.

It's important to distinguish between **transaction fees** and **XCM fees**. Transaction fees are paid when submitting extrinsics to a blockchain. XCM fees, on the other hand, are charged for processing XCM instructions and consist of execution fees (computational costs) and delivery fees (message transport costs). While a transaction can include XCM fees, as happens with `palletXcm.execute()`, they are separate fee systems. When a chain receives and processes an XCM message, it charges XCM fees but no transaction fees, since no extrinsic is being submitted.

There are two main types of fees in XCM: **execution** and **delivery**.

## Execution

All XCMs have a weight associated to them.
Each XCM instruction is benchmarked for a particular system (blockchain), which assigns them a weight.
The weight of an XCM is the sum of the weight of all instructions.
It's important to correctly benchmark this with the worst case so that your system is safe from Denial-of-Service attacks.

This generated weight represents how much time, and space, is needed for executing the XCM.
It directly translates to **execution fees**.

## Delivery

XCMs, although capable of performing tasks locally, are meant to be sent to other consensus systems, i.e. blockchains.
**Delivery fees** are charged when a message is sent to a destination.
The delivery fee amount depends on the size of the message, in bytes, and the destination.

## PayFees

In order to keep things simpler, these two fees are dealt in the same way.
The user is asked to input the maximum amount they want to dedicate for fees.
This amount is used **only** for fees.

The amount is specified using the `PayFees` instruction:

```typescript
XcmV5Instruction.PayFees({
  asset: {
    id: // Asset id.
    fun: // Fungibility. Specify the amount if fungible or the instance if NFT.
  },
})
```

This mechanism is simple and flexible.
The user requires no knowledge of the different types of fees.
New fees might arise in the future and they'll be taken using this same mechanism, without the need for any modification.

Which assets can be used for fee payment depends on the destination chain's configuration. For example, on Asset Hub, fees can be paid with any asset that has a liquidity pool with DOT, allowing the chain to automatically convert the fee asset to DOT for actual fee payment. Other chains may have different fee payment policies, so it's important to understand the specific requirements of the destination chain before selecting fee assets.

??? note "Sufficient assets vs fee payment assets"

    It's important to distinguish between "sufficient" assets and assets eligible for fee payment. Sufficient assets can be used to satisfy the Existential Deposit requirement for account creation and maintenance, but this doesn't automatically make them eligible for fee payment. While sufficient assets are generally also usable for fee payment, this isn't guaranteed and depends on the chain's specific configuration. The terms are related but serve different purposes in system.

## Estimations

The entirety of the asset passed to `PayFees` will be taken from the effective assets and used only for fees.
This means if you overestimate the fees required, you'll be losing efficiency.

It's necessary to have a mechanism to accurately estimate the fee needed so it can be put into `PayFees`.
This is more complicated than it sounds since the process involves execution and delivery fees, potentially in multiple hops.

Imagine a scenario where parachain A sends a message to B which forwards another message to C.

``` mermaid
flowchart LR
  A(A) --> B(B)
  B --> C(C)
```

Execution fees need to be paid on A.
Delivery fees from A to B.
Execution on B.
Delivery from B to C.
Finally, execution on C.

An XCM that does this might look like so.

```typescript
const xcm = XcmVersionedXcm.V5([
  XcmV5Instruction.WithdrawAsset(/* some assets */),
  XcmV5Instruction.PayFees(/* execution + delivery on A */),
  XcmV5Instruction.InitiateTransfer({
    // ...
    remote_fees: /* execution + delivery on B */,
    remote_xcm: [
      XcmV5Instruction.InitiateTransfer({
        // ...
        remote_fees: /* execution on C */,
        // ...
      }),
    ],
    // ...
  }),
])
```

Paying fees on a remote system is so common that the `InitiateTransfer` instruction provides the `remote_fees` parameter for this purpose. When `remote_fees` is specified, it automatically generates a `PayFees` instruction on the destination chain using the specified fees, eliminating the need to manually add `PayFees` to the `remote_xcm` parameter.

<!-- TODO: Fee estimation tutorial? -->
The solution is to use the [runtime APIs](/develop/interoperability/xcm-runtime-apis/) as shown in [the fee estimation tutorial]().
