---
title: Transfers
description: Learn how to perform cross-chain asset transfers using XCM, including teleport, reserve transfers, and handling different asset types across parachains.
url: https://docs.polkadot.com/develop/interoperability/xcm-guides/from-apps/transfers/
---

# Transfers

## Introduction

The [`InitiateTransfer`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.InitiateTransfer){target=\_blank} instruction is the primary mechanism for cross-chain transfers in XCM. It provides a unified interface for different types of transfers and brings additional functionalities not possible with previous instruction versions.

```typescript
XcmV5Instruction.InitiateTransfer({
  destination: /* location of recipient */,
  remote_fees: /* fees for recipient */,
  preserve_origin: /* whether or not the original origin should be preserved */,
  assets: /* the assets being transferred and the type of transfer */,
  remote_xcm: /* xcm to be executed in the recipient after transferring the assets */,
})
```

## Transfer Types

The `remote_fees` parameter only takes one asset, while `assets` can list multiple. Both must specify a **transfer type** — either:

- [**Teleport**](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.AssetTransferFilter.html#variant.Teleport){target=\_blank} – Moves assets by effectively "destroying" them on the source chain and "creating" them on the destination. Useful when both chains trust each other for that asset.
- [**Reserve Deposit**](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.AssetTransferFilter.html#variant.ReserveDeposit){target=\_blank} – A reserve transfer where _your chain is the reserve_ for the asset. The asset stays locked on your chain, and a representation is minted on the destination.
- [**Reserve Withdraw**](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.AssetTransferFilter.html#variant.ReserveWithdraw){target=\_blank} – A reserve transfer where _the destination chain is the reserve_. Assets are withdrawn from their reserve location and credited to the recipient.

These types come from the [`AssetTransferFilter`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.AssetTransferFilter.html){target=\_blank} enum in XCM.

For example, to transfer 50 DOT via a teleport, the transfer type must be specified as a teleport. This also requires using an [Asset Filter](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.AssetFilter.html){target=\_blank}.

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

The correct approach is:

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

This allows specifying multiple assets with multiple different transfer types. It also allows sending the remote fees with a different transfer type. For example:

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

Paying fees on the remote chain is such a common operation that [`InitiateTransfer`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.InitiateTransfer){target=\_blank} has a parameter for it.
Just by specifying the assets that go here, the XCM on the destination will include a `PayFees` instruction.
As mentioned before, you need to specify the transfer type.

!!! note "Do I have to specify remote fees all the time?"

    Yes. Fees are important for decentralized systems to prevent spam. Although it is possible to not specify remote fees, this is most likely not what you want when developing applications. Omitting the remote fees will append an [`UnpaidExecution`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.UnpaidExecution){target=\_blank} instruction to the remote XCM. This instruction signals to the destination system that there is a reason execution is allowed a message without paying for fees.

    This usually means you're a privileged origin, like `Root` or the `Fellowship` origin. It's mostly used from the runtime of the Polkadot SDK-based chains instead of from applications.

??? code "Teleport Example"

    This example creates an XCM program that teleports DOT from Asset Hub to People. The following code uses the PAPI library, check out the [PAPI guide](/develop/toolkit/api-libraries/papi/){target=\_blank} for more information.

    The setup for this script is [installing PAPI](/develop/toolkit/api-libraries/papi#get-started){target=\_blank} and generating descriptors for Asset Hub:
    `bun papi add ahp -n polkadot_asset_hub`

    ```typescript title="teleport-example.ts"
    // `ahp` is the name given to `npx papi add`
import {
  ahp,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetFungibility,
  XcmV5AssetFilter,
  XcmV5Instruction,
  XcmV5Junction,
  XcmV5Junctions,
  XcmV5WildAsset,
  XcmVersionedXcm,
} from '@polkadot-api/descriptors';
import { createClient, Enum, FixedSizeBinary } from 'polkadot-api';
// import from "polkadot-api/ws-provider/node"
// if running in a NodeJS environment
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';

const entropy = mnemonicToEntropy(DEV_PHRASE);
const miniSecret = entropyToMiniSecret(entropy);
const derive = sr25519CreateDerive(miniSecret);
const keyPair = derive('//Alice');

const polkadotSigner = getPolkadotSigner(
  keyPair.publicKey,
  'Sr25519',
  keyPair.sign
);

// Connect to Polkadot Asset Hub.
// Pointing to localhost since this example uses chopsticks.
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('ws://localhost:8000'))
);

// Get the typed API, a typesafe API for interacting with the chain.
const ahpApi = client.getTypedApi(ahp);

const PEOPLE_PARA_ID = 1004;
// The identifier for DOT is the location of the Polkadot Relay Chain,
// which is 1 up relative to any parachain.
const DOT = {
  parents: 1,
  interior: XcmV3Junctions.Here(),
};
// DOT has 10 decimals.
const DOT_UNITS = 10_000_000_000n;

// The DOT to withdraw for both fees and transfer.
const dotToWithdraw = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(10n * DOT_UNITS),
};
// The DOT to use for local fee payment.
const dotToPayFees = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
};
// The location of the People Chain from Asset Hub.
const destination = {
  parents: 1,
  interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(PEOPLE_PARA_ID)),
};
// Pay for fees on the People Chain with teleported DOT.
// This is specified independently of the transferred assets since they're used
// exclusively for fees. Also because fees can be paid in a different
// asset from the transferred assets.
const remoteFees = Enum(
  'Teleport',
  XcmV5AssetFilter.Definite([
    {
      id: DOT,
      fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
    },
  ])
);
// No need to preserve origin for this example.
const preserveOrigin = false;
// The assets to transfer are whatever remains in the
// holding register at the time of executing the `InitiateTransfer`
// instruction. DOT in this case, teleported.
const assets = [
  Enum('Teleport', XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1))),
];
// The beneficiary is the same account but on the People Chain.
// This is a very common pattern for one public/private key pair
// to hold assets on multiple chains.
const beneficiary = FixedSizeBinary.fromBytes(keyPair.publicKey);
// The XCM to be executed on the destination chain.
// It's basically depositing everything to the beneficiary.
const remoteXcm = [
  XcmV5Instruction.DepositAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
    beneficiary: {
      parents: 0,
      interior: XcmV5Junctions.X1(
        XcmV5Junction.AccountId32({
          id: beneficiary,
          network: undefined,
        })
      ),
    },
  }),
];

// The message assembles all the previously defined parameters.
const xcm = XcmVersionedXcm.V5([
  XcmV5Instruction.WithdrawAsset([dotToWithdraw]),
  XcmV5Instruction.PayFees({ asset: dotToPayFees }),
  XcmV5Instruction.InitiateTransfer({
    destination,
    remote_fees: remoteFees,
    preserve_origin: preserveOrigin,
    assets,
    remote_xcm: remoteXcm,
  }),
  // Return any leftover fees from the fees register back to holding.
  XcmV5Instruction.RefundSurplus(),
  // Deposit remaining assets (refunded fees) to the originating account.
  // Using AllCounted(1) since only one asset type (DOT) remains - a minor optimization.
  XcmV5Instruction.DepositAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
    beneficiary: {
      parents: 0,
      interior: XcmV5Junctions.X1(
        XcmV5Junction.AccountId32({
          id: beneficiary, // The originating account.
          network: undefined,
        })
      ),
    },
  }),
]);

// The XCM weight is needed to set the `max_weight` parameter
// on the actual `PolkadotXcm.execute()` call.
const weightResult = await ahpApi.apis.XcmPaymentApi.query_xcm_weight(xcm);

if (weightResult.success) {
  const weight = weightResult.success
    ? weightResult.value
    : { ref_time: 0n, proof_size: 0n };

  console.dir(weight);

  // The actual transaction to submit.
  // This tells Asset Hub to execute the XCM.
  const tx = ahpApi.tx.PolkadotXcm.execute({
    message: xcm,
    max_weight: weight,
  });

  // Sign and propagate to the network.
  const result = await tx.signAndSubmit(polkadotSigner);
  console.log(stringify(result));
}

client.destroy();

// A helper function to print numbers inside of the result.
function stringify(obj: any) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === 'bigint' ? v.toString() : v),
    2
  );
}

    ```

## Origin Preservation

In previous versions of XCM, doing cross-chain transfers meant losing the origin. The XCM on the destination chain would have access to the transferred assets, but not to the origin. This means any instruction which uses assets but not the origin could be executed, that's enough to call [`DepositAsset`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.DepositAsset){target=\_blank} for example and complete the transfer, but not to call [`Transact`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.Transact){target=\_blank} and execute a call.

In XCMv5, [`InitiateTransfer`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.InitiateTransfer){target=\_blank} allows **preserving the origin**, enabling more use-cases such as executing a call on the destination chain via [`Transact`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.Transact){target=\_blank}.
To enable this feature, the [`preserve_origin`](https://paritytech.github.io/polkadot-sdk/master/staging_xcm/v5/enum.Instruction.html#variant.InitiateTransfer.field.preserve_origin){target=\_blank} parameter must be set to `true`.

!!! note "Why isn't preserving the origin the default?"

    Preserving the origin requires a specific configuration on the underlying chain executing the XCM. Some chains have the right configuration, for example all system chains, but not every chain has it. If you make a transfer with `preserve_origin: true` to a chain configured incorrectly, the transfer will fail.

    However, if you set `preserve_origin: false` then there is no problem. Because of this, origin preservation is not the default, and likely never will be.

??? code "Teleport and Transact Example"

    This example creates an XCM program that teleports DOT from Asset Hub to People and executes a call there. The whole script is almost the same as the one for a simple teleport above, most changes are in the `remoteXcm` variable.

    The setup for this script is [installing PAPI](/develop/toolkit/api-libraries/papi#get-started){target=\_blank} and generating descriptors for both Asset Hub and People:
    `bun papi add ahp -n polkadot_asset_hub && bun papi add people -n polkadot_people`

    ```typescript title="teleport-and-transact.ts"
    // `ahp` is the name given to `npx papi add`
import {
  ahp,
  people,
  XcmV2OriginKind,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetFungibility,
  XcmV5AssetFilter,
  XcmV5Instruction,
  XcmV5Junction,
  XcmV5Junctions,
  XcmV5WildAsset,
  XcmVersionedXcm,
} from '@polkadot-api/descriptors';
import { Binary, createClient, Enum, FixedSizeBinary } from 'polkadot-api';
// import from "polkadot-api/ws-provider/node"
// if running in a NodeJS environment
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';

const entropy = mnemonicToEntropy(DEV_PHRASE);
const miniSecret = entropyToMiniSecret(entropy);
const derive = sr25519CreateDerive(miniSecret);
const keyPair = derive('//Alice');

const polkadotSigner = getPolkadotSigner(
  keyPair.publicKey,
  'Sr25519',
  keyPair.sign
);

// Connect to Polkadot Asset Hub.
// Pointing to localhost since this example uses chopsticks.
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('ws://localhost:8000'))
);

// Get the typed API, a typesafe API for interacting with the chain.
const ahpApi = client.getTypedApi(ahp);

const PEOPLE_PARA_ID = 1004;
// The identifier for DOT is the location of the Polkadot Relay Chain,
// which is 1 up relative to any parachain.
const DOT = {
  parents: 1,
  interior: XcmV3Junctions.Here(),
};
// DOT has 10 decimals.
const DOT_UNITS = 10_000_000_000n;

// The DOT to withdraw for both fees and transfer.
const dotToWithdraw = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(10n * DOT_UNITS),
};
// The DOT to use for local fee payment.
const dotToPayFees = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
};
// The location of the People Chain from Asset Hub.
const destination = {
  parents: 1,
  interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(PEOPLE_PARA_ID)),
};
// Pay for fees on the People Chain with teleported DOT.
// This is specified independently of the transferred assets since they're used
// exclusively for fees. Also because fees can be paid in a different
// asset from the transferred assets.
const remoteFees = Enum(
  'Teleport',
  XcmV5AssetFilter.Definite([
    {
      id: DOT,
      fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
    },
  ])
);
// No need to preserve origin for this example.
const preserveOrigin = false;
// The assets to transfer are whatever remains in the
// holding register at the time of executing the `InitiateTransfer`
// instruction. DOT in this case, teleported.
const assets = [
  Enum('Teleport', XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1))),
];
// The beneficiary is the same account but on the People Chain.
// This is a very common pattern for one public/private key pair
// to hold assets on multiple chains.
const beneficiary = FixedSizeBinary.fromBytes(keyPair.publicKey);
// The call to be executed on the destination chain.
// It's a simple remark with an event.
// Create the call on Asset Hub since the system pallet is present in
// every runtime, but if using any other pallet, connect to
// the destination chain and create the call there.
const remark = Binary.fromText('Hello, cross-chain!');
const call = await ahpApi.tx.System.remark_with_event({
  remark,
}).getEncodedData();
// The XCM to be executed on the destination chain.
// It's basically depositing everything to the beneficiary.
const remoteXcm = [
  XcmV5Instruction.Transact({
    origin_kind: XcmV2OriginKind.SovereignAccount(),
    fallback_max_weight: undefined,
    call,
  }),
  XcmV5Instruction.RefundSurplus(),
  XcmV5Instruction.DepositAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
    beneficiary: {
      parents: 0,
      interior: XcmV5Junctions.X1(
        XcmV5Junction.AccountId32({
          id: beneficiary,
          network: undefined,
        })
      ),
    },
  }),
];

// The message assembles all the previously defined parameters.
const xcm = XcmVersionedXcm.V5([
  XcmV5Instruction.WithdrawAsset([dotToWithdraw]),
  XcmV5Instruction.PayFees({ asset: dotToPayFees }),
  XcmV5Instruction.InitiateTransfer({
    destination,
    remote_fees: remoteFees,
    preserve_origin: preserveOrigin,
    assets,
    remote_xcm: remoteXcm,
  }),
  // Return any leftover fees from the fees register back to holding.
  XcmV5Instruction.RefundSurplus(),
  // Deposit remaining assets (refunded fees) to the originating account.
  // Using AllCounted(1) since only one asset type (DOT) remains - a minor optimization.
  XcmV5Instruction.DepositAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
    beneficiary: {
      parents: 0,
      interior: XcmV5Junctions.X1(
        XcmV5Junction.AccountId32({
          id: beneficiary, // The originating account.
          network: undefined,
        })
      ),
    },
  }),
]);

// The XCM weight is needed to set the `max_weight` parameter
// on the actual `PolkadotXcm.execute()` call.
const weightResult = await ahpApi.apis.XcmPaymentApi.query_xcm_weight(xcm);

if (weightResult.success) {
  const weight = weightResult.success
    ? weightResult.value
    : { ref_time: 0n, proof_size: 0n };

  console.dir(weight);

  // The actual transaction to submit.
  // This tells Asset Hub to execute the XCM.
  const tx = ahpApi.tx.PolkadotXcm.execute({
    message: xcm,
    max_weight: weight,
  });

  // Sign and propagate to the network.
  const result = await tx.signAndSubmit(polkadotSigner);
  console.log(stringify(result));
}

client.destroy();

// A helper function to print numbers inside of the result.
function stringify(obj: any) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === 'bigint' ? v.toString() : v),
    2
  );
}

    ```
