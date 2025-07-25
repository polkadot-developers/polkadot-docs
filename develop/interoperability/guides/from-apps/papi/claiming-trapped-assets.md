---
title: Claiming trapped assets
description: How to claim assets that become trapped during failed XCM execution.
---

# Claiming trapped assets

When XCM execution fails or succeeds, leftover assets become "trapped" on the destination chain.
These assets are held by the system but not accessible through normal means.
XCM provides mechanisms to claim these trapped assets and recover them.

## What causes trapped assets

Assets become trapped whenever execution halts and there are leftover assets.
This can happen for example if:

- An XCM execution throws an error in any instruction when assets are in holding
  - `DepositAsset` can't deposit because the account doesn't exist
  - `Transact` can't execute the call because it doesn't exist
  - `PayFees` not enough funds or not paying enough for execution
  - or others...
- XCM execution finishes successfully but not all assets were deposited
  - Funds were withdrawn but some were not deposited
  - `Transact` overestimated the weight and `RefundSurplus` got some funds into holding that were never deposited
  - Fees in `PayFees` were overestimated and some were kept there until the end

## The ClaimAsset instruction

The `ClaimAsset` instruction allows retriving assets trapped on a chain:

```typescript
XcmV5Instruction.ClaimAsset({
  assets: /* Exact assets to claim, these must match those in the `AssetsTrapped` event */,
  ticket: /* Additional information about the trapped assets, e.g. the XCM version that was in use at the time */
});
```

### Parameters

- **`assets`**: The trapped assets that want to be claimed. These must be exactly the same as the ones that appear
in the `AssetsTrapped` event.

- **`ticket`**: Additional information about the trapped assets.
  - Currently only specifies the XCM version used when the assets got trapped.
    Must be of the form `{ parents: 0, interior: XcmV5Junctions.X1(XcmV5Junction.GeneralIndex(<xcm-version-here>)) }`.

### Basic claiming process

When assets are trapped you'll see the `AssetsTrapped` event:

![AssetsTrapped event on Subscan](../../../images/develop/interoperability/assets-trapped-event.png)

To claim these assets, a message like the following needs to be sent from the origin:

```typescript
const claimAssetsXcm = XcmVersionedXcm.V5([
  // Claim trapped DOT.
  XcmV5Instruction.ClaimAsset({
    assets: [{
      // USDC.
      id: {
        parents: 0,
        interior: XcmV5Junctions.X2([
          XcmV5Junction.PalletInstance(50),
          XcmV5Junction.GeneralIndex(1337n),
        ]),
      },
      fun: XcmV3MultiassetFungibility.Fungible(49_334n) // 0.049334 units.
    }],
    // Version 5.
    ticket: { parents: 0, interior: XcmV5Junctions.X1(XcmV5Junction.GeneralIndex(5n)) }
  }),
  XcmV5Instruction.PayFees(/* Pay for fees */),
  XcmV5Instruction.DepositAsset(/* Deposit everything to an account */),
]);
```

In this case, the origin is a local account so the `execute()` transaction needs to be submitted by that same account.
The origin could be another chain, in which case the governance of that chain would need to get involved, or an account on another chain,
in which case the `execute()` transaction would need to be submitted on that other chain and a message sent to the chain with trapped funds.

Multiple assets can be claimed with the same message. This is useful when governance needs to get involved.

```typescript
const claimAssetsXcm = XcmVersionedXcm.V5([
  // Claim trapped DOT.
  XcmV5Instruction.ClaimAsset(/* ... */),
  XcmV5Instruction.PayFees(/* Pay for fees */),
  XcmV5Instruction.ClaimAsset(/* ... */),
  XcmV5Instruction.ClaimAsset(/* ... */),
  XcmV5Instruction.ClaimAsset(/* ... */),
  XcmV5Instruction.DepositAsset(/* Deposit everything to an account */),
]);
```

## The AssetClaimer hint

The `AssetClaimer` execution hint allows setting a specific location that can claim trapped assets, making the claiming process easier.
This is set after withdrawing assets and before anything else.

```typescript
const failingXcm = XcmVersionedXcm.V5([
  // Withdraw 1 DOT (10 decimals).
  XcmV5Instruction.WithdrawAsset([
    {
      id: { parents: 1, interior: XcmV5Junctions.Here() },
      fun: XcmV3MultiassetFungibility.Fungible(10_000_000_000n),
    },
  ]),
  // Set the asset claimer.
  XcmV5Instruction.SetHints({
    hints: [
      Enum(
        'AssetClaimer',
        {
          location: {
            parents: 0,
            interior: XcmV5Junctions.X1(XcmV5Junction.AccountId32({
              id: FixedSizeBinary.fromAccountId32(SS58_ACCOUNT),
              network: undefined,
            })),
          }
        }
      )
    ]
  }),
  // Pay fees.
  XcmV5Instruction.PayFees({
    asset: {
      id: { parents: 1, interior: XcmV5Junctions.Here() },
      fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000n),
    },
  }),
  // Explicitly trap. We could also not do anything and the assets would still get trapped.
  XcmV5Instruction.Trap(0n),
]);
```

This allows this other `SS58_ACCOUNT` to claim the trapped assets.
This could also be done before a transfer.

??? code "Teleport with custom asset claimer example"

    ```typescript
    const setAssetClaimerRemotely = XcmVersionedXcm.V5([
      // Withdraw 1 DOT (10 decimals).
      XcmV5Instruction.WithdrawAsset([
        {
          id: { parents: 1, interior: XcmV5Junctions.Here() },
          fun: XcmV3MultiassetFungibility.Fungible(10_000_000_000n),
        },
      ]),
      // Pay fees.
      XcmV5Instruction.PayFees({
        asset: {
          id: { parents: 1, interior: XcmV5Junctions.Here() },
          fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000n),
        },
      }),
      // Cross-chain transfer.
      XcmV5Instruction.InitiateTransfer({
        destination: { parents: 1, interior: XcmV5Junctions.X1(XcmV5Junction.Parachain(1000)) },
        remote_fees: Enum(
          'Teleport',
          XcmV5AssetFilter.Definite([
            {
              id: { parents: 1, interior: XcmV5Junctions.Here() },
              fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000n),
            },
          ])
        ),
        preserve_origin: false,
        assets: [
          Enum(
            'Teleport',
            XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1))
          ),
        ],
        remote_xcm: [
          // Set the asset claimer on the destination chain.
          // If any asset gets trapped, this account will be able to claim them.
          XcmV5Instruction.SetHints({
            hints: [
              Enum(
                'AssetClaimer',
                {
                  location: {
                    parents: 0,
                    interior: XcmV5Junctions.X1(XcmV5Junction.AccountId32({
                      id: FixedSizeBinary.fromAccountId32(SS58_ACCOUNT),
                      network: undefined,
                    })),
                  }
                }
              )
            ]
          }),
          XcmV5Instruction.DepositAsset({
            assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
            beneficiary: {
              parents: 1, interior: XcmV5Junctions.X1(XcmV5Junction.AccountId32({
                id: FixedSizeBinary.fromAccountId32(SS58_ACCOUNT),
                network: undefined,
              })),
            }
          }),
        ],
      }),
    ]);
    ```

## Best practices

1. **Always set a claimer**: Include `SetAssetClaimer` in XCMs with valuable assets
2. **Use accessible locations**: Ensure the claimer location is controlled by someone who can act
3. **Monitor for failures**: Track XCM execution to detect when claiming is needed
4. **Test claiming flows**: Verify your claiming logic works in test environments
5. **Document recovery procedures**: Maintain clear instructions for asset recovery

Setting a custom asset claimer is a good practice for recovering trapped assets without the need for governance intervention.
