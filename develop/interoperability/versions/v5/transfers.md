---
title: Transfers
description: How to do transfers in XCMv5.
---

# Transfers

As we've seen already, the `InitiateTransfer` instruction is the star of the show when it comes to cross-chain transfers.
In previous versions of XCM, we had instructions like `InitiateTeleport` and `InitiateReserveWithdraw` for different types of transfers.
`InitiateTransfer` unifies both and brings some extra functionalities not possible with previous versions.

```typescript
XcmV5Instruction.InitiateTransfer({
  destination: /* location of recipient */,
  remote_fees: /* fees for recipient */,
  preserve_origin: /* whether or not the original origin should be preserved */,
  assets: /* the assets being transferred and the type of transfer */,
  remote_xcm: /* xcm to be executed in the recipient after transferring the assets */,
})
```
