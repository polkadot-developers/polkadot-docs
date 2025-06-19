---
title: XCMv5
description: Learn about XCM version 5.
---

# XCMv5

The latest iteration of XCM is version 5.
Changes to the standard are managed by the [Polkadot Technical Fellowship RFCs](https://github.com/polkadot-fellows/RFCs/).
The main RFCs defining the changes in version 5 are the following:

- [Legacy #37 - SetAssetClaimer](https://github.com/polkadot-fellows/xcm-format/blob/master/proposals/0037-custom-asset-claimer.md)

- [Legacy #38 - ExecuteWithOrigin](https://github.com/polkadot-fellows/xcm-format/blob/master/proposals/0038-execute-with-origin.md)

- [#100 - InitiateTransfer instruction](https://github.com/polkadot-fellows/RFCs/pull/100)

- [#101 - Remove weight from Transact](https://github.com/polkadot-fellows/RFCs/pull/101)

- [#105 - Improved fee mechanism](https://github.com/polkadot-fellows/RFCs/pull/105)

- [#107 - Execution hints](https://github.com/polkadot-fellows/RFCs/pull/107)

- [#108 - Remove testnet network ids](https://github.com/polkadot-fellows/RFCs/pull/108)

- [#122 - InitiateTransfer origin preservation](https://github.com/polkadot-fellows/RFCs/pull/122)

??? note "What are legacy RFCs?"

    The first two RFCs are legacy ones from when XCM RFCs were separate from the Polkadot Technical Fellowship RFCs.
    As part of the XCMv5 specification, these two were combined since the Polkadot Technical Fellowship Manifesto
    specifies XCM as part of its mandate.

Version 5 of XCM achieves a couple of things:

- Improves the situation with fee payment

- Simplify cross-chain transfers

- Improve claiming assets

This section on XCMv5 aims to give you all the knowledge you need to make the most of the latest
and greatest in cross-chain interactions.

We'll be using [Polkadot-API (PAPI)](/develop/toolkit/api-libraries/papi) throughout these docs to write XCMs.
This is a low-level library that can interact with Polkadot SDK chains via the JSON-RPC protocol and read its
metadata to provide a type-safe API for developers.

??? code "Example"

    Below is an example of a teleport between two parachains.

    ```typescript
    const xcm = XcmVersionedXcm.V5([
      XcmV5Instruction.WithdrawAsset([
        {
          id: { parents: 1, interior: XcmV5Junctions.Here() },
          // WND, the native token of Westend, has 12 decimals.
          // Here we are withdrawing 1 WND.
          fun: XcmV3MultiassetFungibility.Fungible(1_000_000_000_000n),
        },
      ]),
      XcmV5Instruction.PayFees({
        asset: {
          id: { parents: 1, interior: XcmV5Junctions.Here() },
          // We dedicate 0.1 WND to fees.
          fun: XcmV3MultiassetFungibility.Fungible(100_000_000_000n),
        },
      }),
      XcmV5Instruction.InitiateTransfer({
        destination: { parents: 1, interior: XcmV5Junctions.X1(XcmV5Junction.Parachain(1001)) },
        remote_fees: Enum(
          'Teleport',
          XcmV5AssetFilter.Definite([
            {
              id: { parents: 1, interior: XcmV5Junctions.Here() },
              // We dedicate 0.1 WND for fees on the remote chain.
              fun: XcmV3MultiassetFungibility.Fungible(100_000_000_000n)
            },
          ])
        ),
        preserve_origin: false,
        assets: [
          Enum(
            'Teleport',
            // All the rest is sent across as assets...
            XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
          ),
        ],
        remote_xcm: [
          // ...and deposited to `beneficiary`.
          XcmV5Instruction.DepositAsset({
            assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
            beneficiary: {
              parents: 0,
              interior: XcmV5Junctions.X1(XcmV5Junction.AccountId32({
                id: beneficiary,
                network: undefined,
              })),
            },
          }),
        ],
      }),
    ]);
    ```
