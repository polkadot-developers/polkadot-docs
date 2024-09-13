---
title: Interacting with Asset Hub
description: A general page which describes what Asset Hub is, its capabilities, and how it can be utilized in the context of building on the wider Polkadot ecosystem.
---

The relay chain doesn't natively support assets beyond its native token, such as DOT.  This functionality exists in parachains. On both Polkadot and Kusama, this parachain is called *Asset Hub*.

The Asset Hub provides a first-class interface for creating, managing, and using fungible and
non-fungible assets. The fungible interface is similar to Ethereum's ERC-20 standard. However, the
data structures and stateful operations are encoded directly into the chain's runtime, making
operations fast and fee-efficient.

Beyond merely supporting assets, integrating an Asset Hub into your systems has several benefits for
infrastructure providers and users:

- Support for on-chain assets
- Significantly lower transaction fees (about 1/10) than the relay chain
- Significantly lower deposits (1/100) than the relay chain. This includes the existential deposit
  and deposits for proxy/multisig operations
- Ability to pay transaction fees in certain assets. As in, accounts would **not** need DOT to exist
  on-chain or pay fees

The Asset Hub will use DOT as its native currency. Users can transfer DOT from the relay chain into
the Asset Hub and use it natively. The relay chain will also accept DOT transfers from the Asset Hub
back to the relay chain for staking, governance, or any other activity.

Using the Asset Hub for DOT/KSM balance transfers will be much more efficient than the relay chain
and is highly recommended. Until domain-specific parachains are built, the relay chain will still
need to be used for staking and governance.

## Assets Basics

See the [assets pallet](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/assets){target=\_blank} for
the most up-to-date info and reference documentation.

Assets are stored as a map from an ID to information about the asset, including a management team,
total supply, total number of accounts, its sufficiency for account existence, and more.
Additionally, the asset owner can register metadata like the name, symbol, and number of decimals
for representation.

Some assets, as determined by on-chain governance, are regarded as “sufficient”. Sufficiency means
that the asset balance is enough to create the account on-chain, with no need for the DOT/KSM
existential deposit. Likewise, you cannot send a non-sufficient asset to an account that doesn't
exist. Sufficient assets can be used to pay transaction fees, meaning there is no need to hold DOT/KSM
on the account.

Assets do have a minimum balance (set by the creator), and if an account drops below that balance,
the dust is lost.

### Asset Operations

The assets pallet has an interface for dealing with assets. See the [Integration](#integration)
section below for how to fetch information and construct transactions.

The main functions you will probably interact with are [`transfer`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/pallet/dispatchables/fn.transfer.html){target=\_blank} and [`transfer_keep_alive`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/pallet/dispatchables/fn.transfer_keep_alive.html){target=\_blank}. These functions transfer some `amount` (balance) of an [`AssetId`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/pallet/trait.Config.html#associatedtype.AssetId){target=\_blank} (a `u32`, not a contract address) to another account.

The assets pallet also provides an [`approve_transfer`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/pallet/dispatchables/fn.approve_transfer.html){target=\_blank}, [`cancel_approval`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/pallet/dispatchables/fn.cancel_approval.html){target=\_blank}, and [`transfer_approved`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/pallet/dispatchables/fn.transfer_approved.html){target=\_blank} interface for non-custodial operations.

Asset transfers will result in an [`assets.transferred`](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/pallet/enum.Event.html#variant.Transferred){target=\_blank} event. 

<!-- TODO: would be nice to link a page on how to properly track and index events eventually -->

Note that you can use the same addresses (except [pure proxies](https://wiki.polkadot.network/docs/learn-proxies-pure)) on the Asset Hub that
you use on the relay chain. The SS58 encodings are the same; only the chain information (genesis hash, etc.) will change on transaction construction.

#### Paying Transaction Fees in Another Asset

Users in the Asset Hub can pay the fees of their transactions with assets other than DOT. The only
requirement is that a liquidity pool of the relevant asset against DOT should already exist as a
storage entry of [the Asset Conversion pallet](https://wiki.polkadot.network/docs/learn-asset-conversion-assethub){target=\_blank}.

Technically speaking, this is enabled by [the `ChargeAssetTxPayment` signed-extension](https://github.com/polkadot-fellows/runtimes/blob/bb52c327360d1098d3b3d36f4eafb40a74636e80/system-parachains/asset-hubs/asset-hub-polkadot/src/lib.rs#L1016){target=\_blank} implemented in the Asset Hub runtime. This signed-extension extends transactions to include an optional `AssetId` that specifies the asset to be used for payment of both the execution fees and the optional tip. It defaults to the native token when it is set to `None`. In case it is given, this `AssetId` has to be an [XCM `Multilocation`](https://wiki.polkadot.network/docs/learn/xcm/fundamentals/multilocation-summary){target=\_blank}. Once the transaction is executed in the block, it will emit an `AssetTxFeePaid` event, informing of the account paying the fees, the amount in the asset paid as fee, the tip (if any), and the asset ID of the asset paying the fees.

#### Handling Pools with Low Liquidity

Wallets and user interfaces enabling this functionality should ensure that the user is prompted with the
necessary warnings, such that they do not accidentally spend all of their funds to perform a swap on
a pool with little to no liquidity.

##### How to Build Transactions Paying Fees with Other Assets

- [This repository](https://github.com/bee344/asset-conversion-example/tree/main){target=\_blank} contains the
  complete workflow on how to create a liquidity pool for a given asset, add liquidity to it and
  then build a transaction to pays fees with this asset (including fees estimation)
- [Example using Asset Transfer API](https://github.com/paritytech/asset-transfer-api/blob/main/examples/polkadot/assetHub/paysWithFeeOriginTransfers/dotToHydrationPaysWithGLMR.ts){target=\_blank} to do a cross-chain transfer in Polkadot Asset Hub paying fees with GLMR
- [A simple script](https://github.com/bee344/asset-hub-examples/blob/main/polkadot-js-example/src/foreignAssetTransferWithFee.ts){target=\_blank}
  using Polkadot.js API to do a local transfer of bridged KSM in Polkadot Asset Hub paying fees with USDT

### Foreign Assets

Foreign assets are those assets in Asset Hub whose native blockchain is not Asset Hub. These are
mainly native tokens from other parachains or bridged tokens from other consensus systems (such as
Ethereum). Once a foreign asset has been registered in Asset Hub (by its root origin), users are
enabled to send this token from its native blockchain to Asset Hub and operate with it as if it were
any other asset.

Practically speaking, foreign assets are handled by the `foreign-assets` pallet in Asset Hub, which
is an instance of the Assets pallet. Hence, this pallet exposes the same interface to users and
other pallets as the Assets pallet.

The main difference to take into account for foreign assets is their identifier. Instead of using
integers as identifiers like in the Assets pallet, assets stored in the `foreign-assets` pallet are
identified by [its respective XCM multilocation](https://wiki.polkadot.network/docs/learn/xcm/fundamentals/multilocation-summary){target=\_blank}.

## Integration

The Asset Hub will come with the same tooling suite that Parity Technologies provides for the relay chain, namely [API Sidecar](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} and
[TxWrapper Polkadot](https://github.com/paritytech/txwrapper-core/tree/main/packages/txwrapper-polkadot){target=\_blank},
as well as the [Asset Transfer API](https://github.com/paritytech/asset-transfer-api){target=\_blank}. If you have a
technical question or issue about how to use one of the integration tools, please file a GitHub
issue so a developer can help.

### Parachain Node

Using the Asset Hub will require running a system parachain node to sync the chain. You can follow [these guidelines](https://github.com/paritytech/polkadot-sdk/tree/master/cumulus#asset-hub-) to set up an Asset Hub node.

### Asset Transfer API

Asset transfer API is a library focused on simplifying the construction of asset transfers for Substrate-based chains that involve system parachains like Asset Hub (Polkadot and Kusama). It exposes a reduced set of methods that facilitate users to send transfers to other (para) chains or locally. You can refer to [this table](https://github.com/paritytech/asset-transfer-api/tree/main#current-cross-chain-support) for the current cross-chain support and [here](https://paritytech.github.io/asset-transfer-api/) for the complete documentation, including installation guide and usage examples.

### Sidecar

[API Sidecar](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} is a REST service for relay chain and parachain nodes. It comes with endpoints to query information about assets and asset balances on the Asset Hub.

- Asset look-ups always use the `AssetId` to refer to an asset class. On-chain metadata is subject to
  change and thus unsuitable as a canonical index.
- Please refer to [docs](https://paritytech.github.io/substrate-api-sidecar/dist/) for full usage
  information. Details on options like how to make a historical query are not included here.

Here are the available public instances:

- [Sidecar connected to Polkadot Asset Hub](https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io){target=\_blank} 
  and
- [Sidecar connected to Kusama Asset Hub](https://kusama-asset-hub-public-sidecar.parity-chains.parity.io){target=\_blank} 

The purpose of these instances is to allow anyone to check and get a quick overview of the info that
the asset-related endpoints provide.

!!!warning
    These instances should only be used for ad-hoc checks or tests and not for production, heavy testing
    or any other critical purpose.

### TxWrapper

[TxWrapper](https://github.com/paritytech/txwrapper-core){target=\_blank} is a library designed to facilitate transaction construction and signing in
offline environments. It comes with asset-specific functions to use on the Asset Hub. When constructing parachain transactions, you can use `txwrapper-polkadot` exactly as on the relay chain, but construct transactions with the appropriate parachain metadata like genesis hash, spec version, and type registry.

### XCM Transfer Monitoring

#### Monitoring of XCM deposits

Due to the fact that DOT/KSM can exist across several blockchains, which means the providers need to monitor cross-chain transfers on top of local transfers and corresponding `balances.transfer` events.

Currently can be sent and received in the relay chain and in the Asset Hub either with a [Teleport](https://wiki.polkadot.network/docs/learn-teleport{target=\_blank}) from [system parachains](https://wiki.polkadot.network/docs/learn-system-chains){target=\_blank} or with a [Reserve Backed Transfer](https://wiki.polkadot.network/docs/learn-xcm-pallet#transfer-reserve-vs-teleport){target=\_blank} from any other parachain. In both cases, the event emitted when processing the transfer is the `balances.minted` event. Hence, providers should listen to these events, pointing to an address in their system. For this, the service provider must query every new block created, loop through the events array, filter for any `balances.minted` event, and apply the appropriate business logic.

#### Tracking back XCM information

What has been mentioned earlier should be sufficient to confirm that has arrived in a given account via XCM. However, in some cases, it may be interesting to identify the cross-chain message that emitted the relevant `balances.minted` event. This can be done as follows:

1. Query the relevant chain `at` the block the `balances.minted` event was emitted
2. Filter for a `messageQueue(Processed)` event, also emitted during block initialization. This
   event has a parameter `Id`. The value of `Id` identifies the cross-chain message received in the
   relay chain or in the Asset Hub. It can be used to track back the message in the origin parachain
   if needed. Note that a block may contain several `messageQueue(Processed)` events corresponding
   to several cross-chain messages processed for this block

#### Additional Examples of Monitoring XCM Transfers

The two previous sections outline the process of monitoring XCM deposits to specific accounts and
then tracing back the origin of these deposits. However, the process of tracking an XCM transfer
(hence the events to look for) may vary based on the direction of the XCM message. Here are some
examples to showcase the slight differences:

1. For an XCM transfer from a parachain to a relay chain
   _([example](https://polkadot.subscan.io/xcm_message/polkadot-3effaf637dd2a3ac5a644ccc693cbf58a6957d84){target=\_blank})_:

   - The [event](https://hydradx.subscan.io/extrinsic/5136464-2?event=5136464-7){target=\_blank} to look for in the
     parachain side is called `parachainsystem (UpwardMessageSent)`, and the parameter
     `message_hash` in this event identifies the XCM transfer.
   - The [event](https://polkadot.subscan.io/block/20810935?tab=event&&event=20810935-4){target=\_blank} to track in
     the relay chain side is called `messagequeue (Processed)`, and the parameter `id` of the event
     should be the same as the `message_hash` found in the parachain event.

2. For an XCM transfer from a relay chain to a parachain
   _([example](https://polkadot.subscan.io/xcm_message/polkadot-b2f455ed6ca1b4fdea746dfe8d150c10ec74440e){target=\_blank})_:

   - The [event](https://polkadot.subscan.io/extrinsic/20810793-2?event=20810793-53){target=\_blank} to look for in
     the relay chain side is called `xcmPallet (sent)`, and the parameter `message_id` in this event
     identifies the XCM transfer.
   - The [event](https://moonbeam.subscan.io/extrinsic/6174523-0?event=6174523-5){target=\_blank} to look for in the
     parachain side is called `dmpqueue (ExecutedDownward)`, and the parameter that identifies the
     XCM message is either called `message_hash` or `message_id`.

3. For an XCM transfer from a system parachain to a parachain
   _([example](https://polkadot.subscan.io/xcm_message/polkadot-72ed4496d1cb793e10084170548d5caf622ea338){target=\_blank})_:

   - The [event](https://assethub-polkadot.subscan.io/extrinsic/6275027-4?event=6275027-22){target=\_blank} to look
     for in the system parachain side is called `xcmpqueue (XcmpMessageSent)`, and again the
     `message_hash` is one of the parameters of the event.
   - The corresponding [event](https://hydradx.subscan.io/extrinsic/5135860-1?event=5135860-6){target=\_blank} in
     the parachain side is the `xcmpqueue (Success)` and the `message_hash` found in that event
     should have the same value as the one in the system parachain.

#### Monitoring of Failed XCM Transfers

If an XCM transfer fails, events/errors will be emitted accordingly. Below are some examples:

1. From a relay chain to a system parachain
   _([example](https://polkadot.subscan.io/xcm_message/polkadot-c8d7186edb43a592d65b3b5a87c4ecaac38c5aa2){target=\_blank})_:

   - The [event](https://assethub-polkadot.subscan.io/extrinsic/4671081-0?event=4671081-1){target=\_blank}
     `dmpqueue (ExecutedDownward)` in the system parachain side with the following parameters:
     - `outcome` with value `Incomplete` and with the type of error which in this example is
       [UntrustedReserveLocation](https://github.com/paritytech/polkadot-sdk/blob/c54ea64af43b522d23bfabb8d917a490c0f23217/polkadot/xcm/src/v2/traits.rs#L43){target=\_blank}
     - `message_id` which shows the hash of the XCM Transfer

2. From a parachain to another parachain
   _([example](https://polkadot.subscan.io/xcm_message/polkadot-3e74e95204faa6ecf3c81f5129b85f498b89cff2){target=\_blank})_:

   - The [event](https://interlay.subscan.io/extrinsic/3627057-1?event=3627057-8){target=\_blank}
     `xcmpqueue (Fail)` in the destination parachain with the following parameters:
     - `error` which in this example is
       [TooExpensive](https://github.com/paritytech/polkadot-sdk/blob/c54ea64af43b522d23bfabb8d917a490c0f23217/polkadot/xcm/src/v2/traits.rs#L98){target=\_blank}.
     - `message_hash` which identifies the XCM Transfer.
   - **Note**: there might be another
     [event](https://interlay.subscan.io/extrinsic/3627057-1?event=3627057-7){target=\_blank} called
     `polkadotxcm (AssetsTrapped)` which indicates that some assets have been trapped (and hence can
     be claimed).

Learn more about Error Management in XCM is the Polkadot blog post from Gavin Wood, [XCM Part III: Execution and Error Management](https://www.polkadot.network/blog/xcm-part-three-execution-and-error-management){target=\_blank}.