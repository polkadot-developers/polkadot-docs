---
title: Fees
description: How to handle fees in XCM.
---

# Fees

In blockchain systems, fees are crucial.
They prevent malicious actors from exhausting the results of the network, making such attacks expensive.
The XCM subsystem has its own way of dealing with fees, flexible enough to allow feeless execution in situations that warrant it.
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
    fun: // Fungibility. You specify the amount if it's fungible or the instance if it's an NFT.
  },
})
```

This mechanism is simple and flexible.
The user requires no knowledge of the different types of fees.
New fees might arise in the future and they'll be taken using this same mechanism, without the need for any modification.

## Estimations

The entirety of the asset passed to `PayFees` will be taken from the effective assets and used only for fees.
This means if you overestimate the fees required, you'll be losing efficiency.

It's necessary to have a mechanism to accurately estimate the fee needed so it can be put into `PayFees`.
This is more complicated than it sounds since we're dealing with execution and delivery fees, potentially in multiple hops.

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

NOTE: paying fees on a remote system is so common that the `InitiateTransfer` instruction doesn't
require putting the instruction in `remote_xcm`, you only need to put them in `remote_fees`.

<!-- TODO: Fee estimation tutorial? -->
The solution is to use the [runtime APIs](/develop/interoperability/xcm-runtime-apis/) to estimate fees.
