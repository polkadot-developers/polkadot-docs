---
title: v4 to v5 migration guide
description: A guide on how to migrate from XCMv4 to XCMv5
---

# Migration guide (v4 -> v5)

This guide helps you migrate existing code that uses XCM from v4 to v5.
Most v4 code continues to work, but v5 introduces powerful new patterns that improve flexibility and developer experience.

??? note "About the usage of PAPI"

    This guide uses PAPI for the code snippets, but also applies to XCM being used with the Polkadot SDK.

## When to migrate

Migrating to v5 provides significant benefits, so migration is recommended as soon as possible.

Whether you can or can't migrate depends mainly on if the chain(s) you connect to have already upgraded to v5 or not.

To know whether a chain supports v5, you can:
- Read the changelog
- Explore the metadata with PAPI's descriptors
- Explore the metadata with a tool like [subwasm](https://github.com/chevdor/subwasm)

For example, when generating PAPI descriptors for a chain:

```bash
npx papi add myChain -w <rpc-web-socket-endpoint>
```

Then check if the `XcmVersionedXcm` known type has the V5 variant.

Go to [the PAPI developer console](https://dev.papi.how/explorer){target=\_blank}, connect to the chain and under extrinsics choose `PolkadotXcm -> execute` and check for the V5 variant:

![](/images/develop/interoperability/checking-for-v5.webp)

## Changes

### From Dedicated Extrinsics to Raw XCMs

**Before (v4 approach)**:

```typescript
// Multiple extrinsics for different scenarios
api.tx.xcmPallet.teleportAssets(...)
api.tx.xcmPallet.limitedReserveTransferAssets(...)
api.tx.xcmPallet.limitedTeleportAssets(...)
```

**After (v5 approach)**:

```typescript
// Single pattern: craft XCM + execute
const xcm = XcmVersionedXcm.V5([
  XcmV5Instruction.WithdrawAsset([...]),
  XcmV5Instruction.PayFees({...}),
  XcmV5Instruction.InitiateTransfer({...}),
]);
const weight = api.apis.XcmPaymentApi.query_xcm_weight(xcm);

api.tx.PolkadotXcm.execute({
  message: xcm,
  max_weight: weight.value,
});
```

Migration Impact:

- More verbose but significantly more flexible
- Need to calculate weights using runtime APIs
- Better control over execution flow

??? note "Is this `execute` new?"

    The XCM pallet has always had it, however, in previous versions of XCM (2 and below) it wasn't safe
    to have it enabled for anyone to use. That's why some chains might have it disabled. If that's the
    case, reach out! The ecosystem is moving towards this pattern now that it's safe since it offers much more control.

This approach adds more flexbility but clearly requires the developer to know how to build XCMs.
If XCM construction is unfamiliar, this approach enables other developers to build SDKs that handle these complexities.
For example, the Paraspell SDK allows you to continue doing cross-chain transfers (and much more!) with a very simple API.
The following example transfers 10 DOT from Asset Hub Polkadot to Hydration chain using the ParaSpell SDK's builder pattern.

```typescript
import { Builder } from '@paraspell/sdk';

const tx = await Builder()
    .from('AssetHubPolkadot')
    .to('Hydration')
    .currency({ symbol: 'DOT', amount: '10000000000' })
    .address(beneficiary)
    .build();
const result = await tx.signAndSubmit(signer);
```

Make sure to check out their [docs](https://paraspell.github.io/docs/sdk/getting-started.html){target=\_blank}.

??? note "Are the extrinsics going away?"

    No! The extrinsics will continue to be supported in the XCM pallet for an undefined period of time.
    Although it is expected that as more chains support v5 and more dApp developers use [execute](https://paritytech.github.io/polkadot-sdk/master/pallet_xcm/pallet/struct.Pallet.html#method.execute){target=\_blank},
    they'll reap the benefits and not require the extrinsics anymore.

### Unified Transfer Instructions

Beyond the shift to direct XCM execution, XCMv5 also consolidates transfer operations into a single, more powerful instruction.

**Before (v4)**:

```typescript
// Different instructions for different transfer types
XcmV4Instruction.InitiateTeleport({
  assets,
  dest: destination,
  xcm: remoteXcm,
})

XcmV4Instruction.InitiateReserveWithdraw({
  assets,
  reserve: reserveLocation,
  xcm: remoteXcm,
})
```

**After (v5)**:

```typescript
// Single instruction with transfer type specified per asset.
XcmV5Instruction.InitiateTransfer({
  destination: destination,
  remote_fees: Enum('Teleport', feeAssets),
  assets: [
    Enum('Teleport', teleportAssets),
    Enum('ReserveWithdraw', reserveAssets),
  ],
  remote_xcm: remoteXcm,
  preserve_origin: false,
})
```

Migration Benefits:

- Mix different transfer types in single operation
- Clearer fee handling
- Origin preservation option

### Predictable fee payment

**Before (v4)**:

```typescript
// Fees embedded in transfer instructions.
// Limited control over fee allocation.
api.tx.xcmPallet.limitedTeleportAssets({
  dest: destination,
  beneficiary: beneficiary,
  assets: assets,
  fee_asset_item: 0, // Index-based fee selection.
  weight_limit: weightLimit,
})
```

**After (v5)**:
```typescript
// Explicit fee management.
XcmV5Instruction.PayFees({
  asset: {
    id: feeAssetId,
    fun: XcmV3MultiassetFungibility.Fungible(feeAmount),
  },
}),
// Remote fees handled in InitiateTransfer
XcmV5Instruction.InitiateTransfer({
  ...,
  remote_fees: Enum('Teleport', remoteFeeAssets),
  ...,
});
```

Migration Benefits:

- Precise fee control
- Multi-hop fee planning
- Better fee estimation support

The old `BuyExecution` instruction looks like this:

```typescript
XcmV4Instruction.BuyExecution({
    fees: {
        id: feeAssetId,
        fun: XcmV3MultiassetFungibility.Fungible(feeAmount),
    },
    weight_limit: XcmV3WeightLimit.Unlimited(),
});
```

The new `PayFees` instruction just has the asset for fee payment.
The `weight_limit` parameter has historically mostly been set to `Unlimited` because of the difficulty to estimate
weight and the fees being sufficient for limiting the max execution that you're willing to pay for.

There is another key difference between `PayFees` and `BuyExecution`.
With `BuyExecution`, if too much was supplied for fees, the leftover after paying for execution would be returned
to the [holding register](https://paritytech.github.io/polkadot-sdk/master/staging_xcm_executor/struct.XcmExecutor.html#method.holding) to be used in the rest of the XCM.
With `PayFees`, the full amount put into `assets` is stored in the fees register, nothing is returned to the holding
register.
This means you have to put the amount you plan to dedicate entirely for fee payment.
This makes it much more predictable.
If you withdraw 11 DOT, 1 DOT you put in `PayFees` and the rest you send, you know you've sent exactly 10.

The reason for this is the introduction of **delivery fees**, which are charged in addition to **execution fees**.
Delivery fees are charged the moment an instruction is encountered which results in sending a new XCM.
That's why fees can't be returned to the holding register as before; they need to be kept in the new fees register.

??? note "Is BuyExecution going away?"

    No! As with many things in v5, the old instruction is kept for backwards compatibility.
    However, it is planned for removal in future versions, once enough time has passed.

## Migration Examples

These practical examples demonstrate how to convert existing v4 code to the new v5 patterns.

### Simple Teleport

This example shows the basic migration from v4's `limitedTeleportAssets` extrinsic to v5's manual XCM construction using `PayFees` and `InitiateTransfer`.

**v4 Code**:
```typescript
const tx = api.tx.xcmPallet.limitedTeleportAssets({
  dest: XcmVersionedLocation.V4({ parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(1000))}),
  beneficiary: XcmVersionedLocation.V4({
    parents: 0,
    interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({ id: beneficiaryId, network: undefined })),
  }),
  assets: XcmVersionedAssets.V4([{ 
    id: { parents: 1, interior: XcmV3Junctions.Here() },
    fun: XcmV3MultiassetFungibility.Fungible(amount),
  ]),
  fee_asset_item: 0,
  weight_limit: XcmV3WeightLimit.Unlimited(),
});
```

**v5 Equivalent**:
```typescript
const xcm = XcmVersionedXcm.V5([
  XcmV5Instruction.WithdrawAsset([{
    id: { parents: 1, interior: XcmV3Junctions.Here() },
    fun: XcmV3MultiassetFungibility.Fungible(amount),
  }]),
  XcmV5Instruction.PayFees({
    asset: {
      id: { parents: 1, interior: XcmV3Junctions.Here() },
      fun: XcmV3MultiassetFungibility.Fungible(feeAmount),
    },
  }),
  XcmV5Instruction.InitiateTransfer({
    destination: { parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(1000)) },
    remote_fees: Enum('Teleport', XcmV5AssetFilter.Definite([{
      id: { parents: 1, interior: XcmV3Junctions.Here() },
      fun: XcmV3MultiassetFungibility.Fungible(remoteFeeAmount),
    }])),
    preserve_origin: false,
    assets: [Enum('Teleport', XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)))],
    remote_xcm: [
      XcmV5Instruction.DepositAsset({
        assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
        beneficiary: {
          parents: 0,
          interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({
            id: beneficiaryId,
            network: undefined,
          })),
        },
      }),
    ],
  }),
]);

const tx = api.tx.PolkadotXcm.execute({
  message: xcm,
  max_weight: calculatedWeight,
});
```

### Example 2: Multi-Asset Transfer and a Transact

This example shows how XCMv5 enables combining multiple asset transfers with different transfer types while executing calls on the destination chain.

**New in v5 - No v4 equivalent**:
```typescript
// This pattern wasn't possible in v4
XcmV5Instruction.InitiateTransfer({
  destination: destination,
  remote_fees: Enum('ReserveDeposit', ethFees), // Fee with different transfer type
  assets: [
    Enum('Teleport', dotAssets),           // Teleport DOT
    Enum('ReserveDeposit', usdtAssets),    // Reserve transfer USDT
    Enum('ReserveDeposit', usdcAssets),    // Reserve transfer USDC
  ],
  preserve_origin: true, // Enable cross-chain calls
  remote_xcm: [
    // Can now call functions on destination!
    XcmV5Instruction.Transact({
      origin_kind: XcmV2OriginKind.SovereignAccount(),
      call: encodedCall,
      fallback_max_weight: ...,
    }),
  ],
})
```

## 🚨 Breaking changes to watch out for

### `fallback_max_weight` in `Transact`

The `Transact` instruction has changed in v5 to reduce chances of bugs when executing calls on remote chains.

The `Transact` instruction looked like this in v4:

**v4:**

```typescript
XcmV4Instruction.Transact({
  call: encodedCall,
  origin_kind: XcmV2OriginKind.SovereignAccount(),
  require_weight_at_most: { ref_time: 1_000_000_000, proof_size: 100_000 }, // Required.
});
```

**v5:**

```typescript
XcmV5Instruction.Transact({
    call: encodedCall,
    origin_kind: XcmV2OriginKind.SovereignAccount(),
    fallback_max_weight: { ref_time: 1_000_000_000, proof_size: 100_000 }, // Optional.
});
```

The old `require_weight_at_most` parameter caused frequent failures:
- Runtime upgrades broke XCMs: When destination chains updated their runtime weights, existing XCMs would fail
- Hard to estimate correctly: Developers had to guess call weights for remote chains
- Maintenance burden: Weight values needed constant updates across chain upgrades

New behavior:
- Automatic weight calculation: XCMv5-compatible chains calculate call weights automatically when decoding the message
- Fallback compatibility: The optional `fallback_max_weight` is only used when the destination chain hasn't upgraded to v5 yet
- Fail-safe design: If weight calculation fails, the fallback value is used

This change makes Transact more reliable and reduces the maintenance burden of keeping weight values current across runtime upgrades.

### Network IDs cleanup

This change affects how testnet networks are referenced in XCM.

The network IDs, used in the `GlobalConsensus` junction, for `Rococo` and `Westend` were removed.
Instead, the generic `ByGenesis` network ID should be used for referencing testnets.
This change was made because testnets come and go, as was shown by the [removal of Rococo](https://forum.polkadot.network/t/rococo-to-be-deprecated-in-october/8702) and [appearance of Paseo](https://forum.polkadot.network/t/the-new-polkadot-community-testnet/4956).
From now on, only mainnets will have an explicit network ID, testnets should always be referenced with `ByGenesis`.

If you were storing these network IDs, make sure to migrate them to `ByGenesis`.
These are the genesis hashes for the migration:
- Westend: 0xe143f23803ac50e8f6f8e62695d1ce9e4e1d68aa36c1cd2cfd15340213f3423e
- Rococo: 0x6408de7737c59c238890533af25896a2c20608d8b380bb01029acb392781063e

## Getting help

- Technical questions: [Substrate Stack Exchange](https://substrate.stackexchange.com/){target=\_blank}
- Bug reports: [Polkadot SDK Issues](https://github.com/paritytech/polkadot-sdk/issues){target=\_blank}

## Next steps

Once migrated, you can enjoy unique XCMv5 features:
- Origin preservation
- Transferring multiple assets
- Better asset claiming
