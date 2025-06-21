---
title: Claiming trapped assets
description: How to set an asset claimer and claim assets.
---

# Claiming trapped assets

XCMv5 and features like the `DryRunApi` aim to reduce the chance of cross-chain transfers failing.
However, sometimes a transfer might fail, mainly because of the XCM execution failing on the destination.
In this case, assets are not lost, they are **trapped**.

## Making sure trapped assets are easily claimable.

### Origin preservation

When the origin is preserved, the trapped assets are stored alongside the original origin,
which makes them easy to be claimed by a new XCM.

### AssetClaimer hint

If origin preservation can't be used, or if you want to give another account permission to claim
the trapped assets, the `AssetClaimer` hint can be used.

This hint must be put at the start of the XCM like so:

```typescript
const xcm = [
  XcmV5Instruction.SetHints({ hints: [Enum('AssetClaimer', someLocation)] }),
  ...
];
```

You'd usually add it as the first instruction of the remote xcm when doing a cross-chain transfer.

This is very useful for setting a local account on the destination chain as the claimer for the
transferred assets.
That way, the assets can be claimed without the need for another cross-chain transfer from the original
origin or anyone else on the source chain.
