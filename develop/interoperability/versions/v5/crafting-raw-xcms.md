---
title: Raw XCMs
description: Learn how to craft raw XCMs and why that's the recommended way with XCMv5.
---

# Crafting raw XCMs

Before XCMv5, the recommended way of interacting with XCM was via dedicated extrinsics, either in [pallet-xcm](https://github.com/paritytech/polkadot-sdk/blob/35e6befc5dd61deb154ff0eb7c180a038e626d66/polkadot/xcm/pallet-xcm/src/lib.rs#L17) or [xtokens](https://github.com/open-web3-stack/open-runtime-module-library/blob/0b0bbadb8d0539bbd855eb7eeebcc95397a2a013/xtokens/README.md).
This includes extrinsics for doing teleports, reserve asset transfers, claiming trapped assets, among others.

With XCMv5 we are moving towards crafting raw XCMs and executing them directly via something like `pallet_xcm::execute()`.
In the last section we had an example XCM that when executed resulted in a teleport between two parachains.
Below we see how we can execute this XCM.

```typescript
// `PolkadotXcm` is the name given to `pallet_xcm` in system parachains.
const tx = api.tx.PolkadotXcm.execute({
  message: xcm, // From last section.
  max_weight: weight, // Some weight.
})
```

NOTE: We can calculate the weight with the [query_xcm_weight runtime API](/develop/interoperability/xcm-runtime-apis/#query-xcm-weight).

This move to raw XCMs and then `execute()` directly was motivated by the flexibility offered by XCM.
You have so much more control when you craft the XCM directly.
Only using dedicated extrinsics was very limiting, leading to more and more scenarios which required their own extrinsic.
This is seen in the [large number of extrinsics that had to be added to pallet-xcm](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/enum.Call.html#variants).

This extrinsics will still be supported for a long while, however, the recommended way of interacting with XCM from version 5 onwards is via crafting raw XCMs.
