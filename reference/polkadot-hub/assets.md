---
title: Asset Hub
description: Learn about Asset Hub in Polkadot, managing on-chain assets, foreign asset integration, and using XCM for cross-chain asset transfers.
categories: Polkadot Protocol
---

# Assets

## Introduction

Asset Hub is Polkadot’s system parachain for issuing and managing on-chain assets. While the Relay Chain provides security, Asset Hub handles asset logic—minting, burning, transfers, and metadata—in a cost-efficient environment.

It’s worth noting that Asset Hub also supports EVM smart contracts. This means assets can be managed not only through the native Assets pallet, but also using familiar ERC-20 contract standards.

Built for interoperability, it enables cross-chain asset transfers with XCM and supports foreign asset registration from other parachains. This guide covers core asset operations, XCM transfers, and developer tooling such as [API Sidecar](#api-sidecar) and [`TxWrapper`](#txwrapper).

## Asset Basics

The Polkadot Relay Chain supports only its native token (DOT), so Asset Hub provides a standardized framework for creating and managing fungible and non-fungible assets. It enables projects to issue tokens, manage supply, and transfer assets across parachains.

Assets on Asset Hub support familiar operations such as minting, burning, transfers, and metadata management, similar to ERC-20 on Ethereum but built directly into Polkadot’s runtime for lower latency and fees.

### Why use Asset Hub?

- **Custom asset creation**: Issue tokens or NFTs with configurable permissions and metadata.
- **Low fees**: Transactions cost roughly one-tenth of Relay Chain fees.
- **Lower deposits**: Minimal on-chain storage costs for asset data.
- **Pay fees in any asset**: Users don’t need DOT to transact; supported assets can cover fees.
- **Cross-chain ready**: Assets can be transferred to other parachains using XCM.

### Asset structure

Each asset is identified by a unique ID and stores:

- Asset administrators
- Total supply and holder count
- Minimum balance configuration
- **Sufficiency** – Whether the asset can keep an account alive without DOT
- Metadata (name, symbol, decimals)

If a balance falls below the configured minimum, it may be removed as “dust.” This ensures efficient storage while giving developers control over asset economics.

## Assets Pallet

The Assets pallet in the Polkadot SDK provides the core logic behind fungible assets on Asset Hub. It enables developers to create and manage asset classes with configurable permissions. 

The pallet supports both permissioned and permissionless asset creation, making it suitable for simple tokens as well as governed assets controlled by teams or DAOs.

For full API details, see the [Assets Pallet Rust docs](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=_blank}.

### Key Features

The Assets pallet includes:

- **Asset issuance**: Create new assets and assign initial supply.
- **Transfers**: Move assets between accounts with balance tracking.
- **Freezing**: Lock an account’s balance to prevent transfers.
- **Burning**: Reduce total supply by destroying tokens.
- **Non-custodial transfers**: Approve transfers on behalf of another account without giving up custody.

### Main Functions

The Assets pallet exposes a set of dispatchable functions for managing asset lifecycles:

- **`create()`**: Register a new asset class (with a deposit when creation is permissionless).
- **`issue()`**: Mint an initial supply of a new asset.
- **`transfer()`**: Send assets between accounts.
- **`approve_transfer()`**: Authorize a third party to transfer assets on your behalf.
- **`destroy()`**: Remove an entire asset class from the chain.
- **`freeze()` / `thaw()`**: Restrict or restore an account’s ability to transfer assets.

See the full API in the [dispatchable functions reference](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/enum.Call.html){target=_blank}.

### Querying Functions

The Assets pallet also provides read-only functions to retrieve on-chain asset data, commonly used in dApps and backend services:

- **`balance(asset_id, account)`** – Retrieves the balance of a given asset for a specified account. Useful for checking the holdings of an asset class across different accounts.
- **`total_supply(asset_id)`** – Returns the total supply of the asset identified by asset_id. Allows users to verify how much of the asset exists on-chain.

Additional queries include metadata lookups, account status, and asset details. See the full list in the [Pallet reference](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/struct.Pallet.html){target=_blank}.

### Permission Models and Roles

The Assets pallet uses role-based permissions to control who can manage different parts of an asset’s lifecycle:

- **Owner**: Has overarching control, including destroying an entire asset class. Owners can also set or update the Issuer, Freezer, and Admin roles.
- **Admin**: Can freeze (preventing transfers) and forcibly transfer assets between accounts. Admins also have the power to reduce the balance of an asset class across arbitrary accounts.
- **Issuer**: Responsible for minting new tokens. When new assets are created, the Issuer is the account that controls their distribution to other accounts.
- **Freezer**: Can lock the transfer of assets from an account, preventing the account holder from moving their balance.

These roles allow projects to enforce governance and security policies around their assets.

### Asset Freezing

Assets can be temporarily locked to prevent transfers from specific accounts. This is useful for dispute resolution, fraud prevention, or compliance controls.

Only the **Freezer** role can perform freezing actions:

- **`freeze(asset_id, account)`**: Locks the specified asset of the account. While the asset is frozen, no transfers can be made from the frozen account.
- **`thaw(asset_id, account)`**: Corresponding function for unfreezing, allowing the asset to be transferred again.

Freezing does not burn or remove assets. It simply pauses their movement until re-enabled.

### Non-Custodial Transfers (Approval API)

The Assets pallet supports delegated transfers using an Approval API. This lets one account authorize another to transfer a limited amount of its assets—without handing over full control. It’s useful for escrow logic, automated payments, and multi-party dApps.

Key functions:

- **`approve_transfer(asset_id, delegate, amount)`**: Approves a delegate to transfer up to a certain amount of the asset on behalf of the original account holder.
- **`cancel_approval(asset_id, delegate)`**: Cancels a previous approval for the delegate. Once canceled, the delegate no longer has permission to transfer the approved amount.
- **`transfer_approved(asset_id, owner, recipient, amount)`**: Executes the approved asset transfer from the owner’s account to the recipient. The delegate account can call this function once approval is granted.

These delegated operations make it easier to manage multi-step transactions and dApps that require complex asset flows between participants.

## Foreign Assets

Foreign assets are tokens that originate outside Asset Hub—either from other Polkadot parachains or from external networks like Ethereum via bridges. 

Once registered on Asset Hub by the originating chain’s root origin, these assets can be held, transferred, and used just like native assets within the Polkadot ecosystem.

### Handling Foreign Assets

Foreign assets are managed by the **Foreign Assets pallet**, which functions similarly to the standard Assets pallet. Most operations—like transfers and balance queries—use the same API, but with a few key differences:

- **Asset Identifier**: Unlike native assets, foreign assets are identified using an XCM Multilocation rather than a simple numeric AssetId. This multilocation identifier represents the cross-chain location of the asset and provides a standardized way to reference it across different parachains and relay chains.
- **Transfers**: Once registered in the Asset Hub, foreign assets can be transferred between accounts, just like native assets. Users can also send these assets back to their originating blockchain if supported by the relevant cross-chain messaging mechanisms.

This unified interface makes it easy for dApps to handle both native and cross-chain assets.

## Integration

Asset Hub provides developer tools and libraries for querying assets, submitting transactions, and handling cross-chain transfers in applications. These integrations make it easy to build wallets, dApps, and backend services on top of Asset Hub.

Core tools include:

### API Sidecar

[API Sidecar](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} is a RESTful service that can be deployed alongside Polkadot and Kusama nodes. It provides endpoints to retrieve real-time blockchain data, including asset information. When used with Asset Hub, Sidecar allows querying:

- **Asset look-ups**: Retrieve specific assets using `AssetId`.
- **Asset balances**: View the balance of a particular asset on Asset Hub.

Public instances of API Sidecar connected to Asset Hub are available, such as:

- [Polkadot Asset Hub Sidecar](https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/){target=\_blank}
- [Kusama Asset Hub Sidecar](https://kusama-asset-hub-public-sidecar.parity-chains.parity.io/){target=\_blank}

These public instances are primarily for ad-hoc testing and quick checks.

### TxWrapper

[`TxWrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank} is a library that simplifies constructing and signing transactions for Polkadot SDK-based chains, including Polkadot and Kusama. This tool includes support for working with Asset Hub, enabling developers to:

- Construct offline transactions.
- Leverage asset-specific functions such as minting, burning, and transferring assets.

`TxWrapper` provides the flexibility needed to integrate asset operations into custom applications while maintaining the security and efficiency of Polkadot's transaction model.

### ParaSpell

[ParaSpell](https://paraspell.xyz/){target=\_blank} is a collection of open-source XCM tools designed to streamline cross-chain asset transfers and interactions within the Polkadot and Kusama ecosystems. It equips developers with an intuitive interface to manage and optimize XCM-based functionalities. Some key points included by ParaSpell are:

- **[XCM SDK](https://paraspell.xyz/#xcm-sdk){target=\_blank}**: Provides a unified layer to incorporate XCM into decentralized applications, simplifying complex cross-chain interactions.
- **[XCM API](https://paraspell.xyz/#xcm-api){target=\_blank}**: Offers an efficient, package-free approach to integrating XCM functionality while offloading heavy computing tasks, minimizing costs, and improving application performance. This lightweight hosted API enables XCM execution without the need to run your own infrastructure.
- **[XCM router](https://paraspell.xyz/#xcm-router){target=\_blank}**: Enables cross-chain asset swaps in a single command, allowing developers to send one asset type and receive a different asset on another chain.
- **[XCM analyser](https://paraspell.xyz/#xcm-analyser){target=\_blank}**: Decodes and translates complex XCM multilocation data into readable information, supporting easier troubleshooting and debugging.
- **[XCM visualizator](https://paraspell.xyz/#xcm-visualizator){target=\_blank}**: A tool designed to give developers a clear, interactive view of XCM activity across the Polkadot ecosystem, providing insights into cross-chain communication flow.

ParaSpell lets developers build cross-chain features without deep XCM expertise. Its utilities for message composition, decoding, and parachain routing make it especially useful for testing, debugging, and optimizing cross-chain transfers.

### Parachain Node

To fully use Asset Hub features, developers may also run a local system parachain node. This enables real-time interaction, full RPC access, and custom testing. Setup instructions are available in the Parity docs:  
[Run an Asset Hub node](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/cumulus#asset-hub-){target=_blank}.

With the tools above, developers can integrate Asset Hub into wallets, services, and dApps while taking advantage of Polkadot’s cross-chain infrastructure.

## XCM Transfer Monitoring

Since Asset Hub enables cross-chain transfers, monitoring XCM messages is essential for tracking asset movement between parachains and the Relay Chain. This section explains how to observe and verify XCM transfer status during cross-chain operations.

### Monitor XCM Deposits

As assets move between chains, tracking the cross-chain transfers in real time is crucial. Whether assets are transferred via a teleport from system parachains or through a reserve-backed transfer from any other parachain, each transfer emits a relevant event (such as the `balances.minted` event).

To ensure accurate monitoring of these events:

- **Track XCM deposits**: Query every new block created in the relay chain or Asset Hub, loop through the events array, and filter for any `balances.minted` events which confirm the asset was successfully transferred to the account.
- **Track event origins**: Each `balances.minted` event points to a specific address. By monitoring this, service providers can verify that assets have arrived in the correct account.

### Track XCM Information Back to the Source

While the `balances.minted` event confirms the arrival of assets, there may be instances where you need to trace the origin of the cross-chain message that triggered the event. In such cases, you can:

1. Query the relevant chain at the block where the `balances.minted` event was emitted.
2. Look for the `messageQueue.Processed` event during the block’s initialization. It includes an `Id` that uniquely identifies the inbound XCM message to the Relay Chain or Asset Hub. Use this `Id` to correlate events across chains and trace the transfer back to its origin (and any intermediate hops) for end-to-end visibility.

### Practical Monitoring Examples

The preceding sections outline the process of monitoring XCM deposits to specific accounts and then tracing back the origin of these deposits. The process of tracking an XCM transfer and the specific events to monitor may vary based on the direction of the XCM message. Here are some examples to showcase the slight differences:

- **Transfer from parachain to relay chain**: Track `parachainsystem(UpwardMessageSent)` on the parachain and `messagequeue(Processed)` on the relay chain.
- **Transfer from relay chain to parachain**: Track `xcmPallet(sent)` on the relay chain and `dmpqueue(ExecutedDownward)` on the parachain.
- **Transfer between parachains**: Track `xcmpqueue(XcmpMessageSent)` on the system parachain and `xcmpqueue(Success)` on the destination parachain.

### Monitor for Failed XCM Transfers

Sometimes, XCM transfers may fail due to liquidity or other errors. Failed transfers emit specific error events, which are key to resolving issues in asset transfers. Monitoring for these failure events helps catch issues before they affect asset balances.

- **Relay chain to system parachain**: Look for the `dmpqueue(ExecutedDownward)` event on the parachain with an `Incomplete` outcome and an error type such as `UntrustedReserveLocation`.
- **Parachain to parachain**: Monitor for `xcmpqueue(Fail)` on the destination parachain with error types like `TooExpensive`.

For detailed error management in XCM, see Gavin Wood's blog post on [XCM Execution and Error Management](https://polkadot.com/blog/xcm-part-three-execution-and-error-management/){target=\_blank}.
