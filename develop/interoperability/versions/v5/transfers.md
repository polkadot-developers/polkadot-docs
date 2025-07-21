---
title: Transfers
description: How to do transfers in XCMv5.
---

# Transfers

As we've seen already, the `InitiateTransfer` instruction is the star of the show when it comes to cross-chain transfers.
In previous versions of XCM, we had instructions like `InitiateTeleport` and `InitiateReserveWithdraw` for different types of transfers.
`InitiateTransfer` unifies all of the transfer types and brings some extra functionalities not possible with previous versions.

??? note "On backwards compatibility"

    In previous versions, we had `InitiateTransfer`, `InitiateReserveWithdraw` and `DepositReserveAsset`.
    All of these instructions are still available in V5 for backwards compatibility.

```typescript
XcmV5Instruction.InitiateTransfer({
  destination: /* location of recipient */,
  remote_fees: /* fees for recipient */,
  preserve_origin: /* whether or not the original origin should be preserved */,
  assets: /* the assets being transferred and the type of transfer */,
  remote_xcm: /* xcm to be executed in the recipient after transferring the assets */,
})
```

## Transfer types

The `remote_fees` parameter only takes one asset, `assets` takes a list of many.
Both need to specify which transfer type they're using.
The developer to specify whether or not those assets are transferred via a `Teleport`, a `ReserveWithdraw` or a `ReserveDeposit`.
These correspond to the types of cross-chain transfers, as seen in [TODO: Section about cross-chain transfers generally](TODO).

For example, say we wanted to transfer 50 DOT, via a teleport, we would need to specify the fact that it's a teleport.
We also need to use an [asset filter](TODO:send-to-section-on-asset-filters).

Instead of this:
```typescript
const assets = [
  XcmV5AssetFilter.Definite([
    {
      id: DOT,
      fun: XcmV3MultiassetFungibility.Fungible(50n * DOT_UNITS),
    },
  ]),
];
```

We need to write this:
```typescript
const assets = [
  Enum(
    'Teleport',
    XcmV5AssetFilter.Definite([
      {
        id: DOT,
        fun: XcmV3MultiassetFungibility.Fungible(50n * DOT_UNITS),
      },
    ]),
  ),
];
```

This lets us specify multiple assets with multiple different transfer types.
It also lets us send the remote fees with a different transfer type.

For example:
```typescript
const remoteFees = Enum(
  'ReserveDeposit',
  XcmV5AssetFilter.Definite([
    {
      id: ETH,
      fun: ...,
    },
  ]),
);
const assets = [
  Enum(
    'Teleport',
    XcmV5AssetFilter.Definite([
      {
        id: DOT,
        fun: XcmV3MultiassetFungibility.Fungible(50n * DOT_UNITS),
      },
    ]),
  ),
  Enum(
    'ReserveDeposit',
    XcmV5AssetFilter.Definite([
      {
        id: USDT,
        fun: ...,
      },
      {
        id: USDC,
        fun: ...,
      },
    ]),
  ),
];
```

Note that `remoteFees` takes only one asset.

## Remote Fees

Paying fees on the remote chain is such a common operation that `InitiateTransfer` has a parameter for it.
Just by specifying the assets that go here, the XCM on the destination will include a `PayFees` instruction.
As mentioned before, you need to specify the transfer type.

??? note "Do I have to specify remote fees all the time?"

    Yes. Fees are important for decentralized systems to prevent spam.
    Although it is possible to not specify remote fees, this is most likely not what you want when developing
    applications.
    Omitting the remote fees will append an `UnpaidExecution` instruction to the remote XCM.
    This instruction is meant to signal to the destination system that there's a reason you're allowed to execute
    a message without paying for fees.
    This usually means you're a priviledged origin, like `Root` or the `Fellowship` origin.
    It's mostly used from the runtime of Polkadot SDK chains instead of from applications.

??? code "Teleport example"

    In this example, we create an XCM program that teleports some DOT from Asset Hub to People.
    This code was kickstarted from the getting started guide in [https://papi.how/getting-started].
    The setup for this script is installing papi and generating descriptors for Asset Hub:
    `bun papi add ahp -n polkadot_asset_hub`

    ```typescript
    --8<-- 'code/develop/interoperability/versions/v5/teleport.ts'
    ```

## Origin Preservation

In previous versions of XCM, doing cross-chain transfers meant losing the origin.
The XCM on the destination chain would have access to the transferred assets, but not to the origin.
This means any instruction which uses assets but not the origin could be executed, that's enough to
call `DepositAsset` for example and complete the transfer, but not to call `Transact` and execute a call.

In XCMv5, `InitiateTransfer` allows **preserving the origin**, enabling more use-cases such as executing a
call on the destination chain via `Transact`.
To enable this feature, the `preserve_origin` parameter must be set to `true`.

??? note "Why isn't preserving the origin the default?"

    Preserving the origin requires a specific configuration on the underlying chain executing the XCM.
    Some chains have the right configuration, for example all system chains, but not every chain has it.
    If you make a transfer with `preserve_origin: true` to a chain configured incorrectly, the transfer
    will fail.
    However, if you set `preserve_origin: false` then there is no problem.
    Because of this, origin preservation is not the default, and likely never will be.

??? code "Teleport and transact example"

    In this example, we create an XCM program that teleports some DOT from Asset Hub to People and executes a call there.
    The whole script is almost the same as the one for a simple teleport above, most changes are in the `remoteXcm` variable.
    The setup for this script is installing papi and generating descriptors for both Asset Hub and People:
    `bun papi add ahp -n polkadot_asset_hub && bun papi add people -n polkadot_people`

    ```typescript
    --8<-- 'code/develop/interoperability/versions/v5/teleport-and-transact.ts'
    ```
