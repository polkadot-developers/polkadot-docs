---
title: Asset Hub
description: Learn about Asset Hub in Polkadot, managing on-chain assets, foreign asset integration, and using XCM for cross-chain asset transfers.
---

# Asset Hub

## Introduction

The Asset Hub is a critical component in the Polkadot ecosystem, enabling the management of fungible and non-fungible assets across the network. Since the relay chain focuses on maintaining security and consensus without direct asset management, Asset Hub provides a streamlined platform for creating, managing, and using on-chain assets in a fee-efficient manner. This guide outlines the core features of Asset Hub, including how it handles asset operations, cross-chain transfers, and asset integration using XCM, as well as essential tools like [API Sidecar](#api-sidecar) and [`TxWrapper`](#txwrapper) for developers working with on-chain assets.

## Assets Basics

In the Polkadot ecosystem, the relay chain does not natively support additional assets beyond its native token (DOT for Polkadot, KSM for Kusama). The Asset Hub parachain on Polkadot and Kusama provides a fungible and non-fungible assets framework. Asset Hub allows developers and users to create, manage, and use assets across the ecosystem.

Asset creators can use Asset Hub to track their asset issuance across multiple parachains and manage assets through operations such as minting, burning, and transferring. Projects that need a standardized method of handling on-chain assets will find this particularly useful. The fungible asset interface provided by Asset Hub closely resembles Ethereum's ERC-20 standard but is directly integrated into Polkadot's runtime, making it more efficient in terms of speed and transaction fees.

Integrating with Asset Hub offers several key benefits, particularly for infrastructure providers and users:

- **Support for non-native on-chain assets** - Asset Hub enables seamless asset creation and management, allowing projects to develop tokens or assets that can interact with the broader ecosystem
- **Lower transaction fees** - Asset Hub offers significantly lower transaction costs—approximately one-tenth of the fees on the relay chain, providing cost-efficiency for regular operations
- **Reduced deposit requirements** - depositing assets in Asset Hub is more accessible, with deposit requirements that are around one one-hundredth of those on the relay chain
- **Payment of transaction fees with non-native assets** - users can pay transaction fees in assets other than the native token (DOT or KSM), offering more flexibility for developers and users

Assets created on the Asset Hub are stored as part of a map, where each asset has a unique ID that links to information about the asset, including details like:

- The management team
- The total supply
- The number of accounts holding the asset
- Sufficiency for account existence - whether the asset alone is enough to maintain an account without a native token balance
- The metadata of the asset, including its name, symbol, and the number of decimals for representation

Some assets can be regarded as sufficient to maintain an account's existence, meaning that users can create accounts on the network without needing a native token balance (i.e., no existential deposit required). Developers can also set minimum balances for their assets. If an account's balance drops below the minimum, the balance is considered dust and may be cleared.

## Assets Pallet

The Polkadot SDK's Assets pallet is a powerful module designated for creating and managing fungible asset classes with a fixed supply. It offers a secure and flexible way to issue, transfer, freeze, and destroy assets. The pallet supports various operations and includes permissioned and non-permissioned functions to cater to simple and advanced use cases.

Visit the [Assets Pallet Rust docs](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=\_blank} for more in-depth information.

### Key Features

Key features of the Assets pallet include:

- **Asset issuance** - allows the creation of a new asset, where the total supply is assigned to the creator's account
- **Asset transfer** - enables transferring assets between accounts while maintaining a balance in both accounts
- **Asset freezing** - prevents transfers of a specific asset from one account, locking it from further transactions
- **Asset destruction** - allows accounts to burn or destroy their holdings, removing those assets from circulation
- **Non-custodial transfers** - a non-custodial mechanism to enable one account to approve a transfer of assets on behalf of another

### Main Functions

The Assets pallet provides a broad interface for managing fungible assets. Some of the main dispatchable functions include:

- **`create()`** - create a new asset class by placing a deposit, applicable when asset creation is permissionless
- **`issue()`** - mint a fixed supply of a new asset and assign it to the creator's account
- **`transfer()`** - transfer a specified amount of an asset between two accounts
- **`approve_transfer()`** - approve a non-custodial transfer, allowing a third party to move assets between accounts
- **`destroy()`** - destroy an entire asset class, removing it permanently from the chain
- **`freeze()` and `thaw()`** - administrators or privileged users can lock or unlock assets from being transferred

For a full list of dispatchable and privileged functions, see the [dispatchables Rust docs](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/enum.Call.html){target=\_blank}.

### Querying Functions

The Assets pallet exposes several key querying functions that developers can interact with programmatically. These functions allow you to query asset information and perform operations essential for managing assets across accounts. The two main querying functions are:

- **`balance(asset_id, account)`** - retrieves the balance of a given asset for a specified account. Useful for checking the holdings of an asset class across different accounts

- **`total_supply(asset_id)`** - returns the total supply of the asset identified by `asset_id`. Allows users to verify how much of the asset exists on-chain

In addition to these basic functions, other utility functions are available for querying asset metadata and performing asset transfers. You can view the complete list of querying functions in the [Struct Pallet Rust docs](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/struct.Pallet.html){target=\_blank}.

### Permission Models and Roles

The Assets pallet incorporates a robust permission model, enabling control over who can perform specific operations like minting, transferring, or freezing assets. The key roles within the permission model are:

- **Admin** - can freeze (preventing transfers) and forcibly transfer assets between accounts. Admins also have the power to reduce the balance of an asset class across arbitrary accounts. They manage the more sensitive and administrative aspects of the asset class
- **Issuer** - responsible for minting new tokens. When new assets are created, the Issuer is the account that controls their distribution to other accounts
- **Freezer** - can lock the transfer of assets from an account, preventing the account holder from moving their balance. This function is useful for freezing accounts involved in disputes or fraud
- **Owner** - has overarching control, including destroying an entire asset class. Owners can also set or update the Issuer, Freezer, and Admin roles

These permissions provide fine-grained control over assets, enabling developers and asset managers to ensure secure, controlled operations. Each of these roles is crucial for managing asset lifecycles and ensuring that assets are used appropriately across the network.

### Asset Freezing

The Assets pallet allows you to freeze assets. This feature prevents transfers or spending from a specific account, effectively locking the balance of an asset class until it is explicitly unfrozen. Asset freezing is beneficial when assets are restricted due to security concerns or disputes.

Freezing assets is controlled by the Freezer role, as mentioned earlier. Only the account with the Freezer privilege can perform these operations. Here are the key freezing functions:

- **`freeze(asset_id, account)`** - locks the specified asset of the account. While the asset is frozen, no transfers can be made from the frozen account
- **`thaw(asset_id, account)`** - corresponding function for unfreezing, allowing the asset to be transferred again

This approach enables secure and flexible asset management, providing administrators the tools to control asset movement in special circumstances.

### Non-Custodial Transfers (Approval API)

The Assets pallet also supports non-custodial transfers through the Approval API. This feature allows one account to approve another account to transfer a specific amount of its assets to a third-party recipient without granting full control over the account's balance. Non-custodial transfers enable secure transactions where trust is required between multiple parties.

Here's a brief overview of the key functions for non-custodial asset transfers:

- **`approve_transfer(asset_id, delegate, amount)`** - approves a delegate to transfer up to a certain amount of the asset on behalf of the original account holder
- **`cancel_approval(asset_id, delegate)`** - cancels a previous approval for the delegate. Once canceled, the delegate no longer has permission to transfer the approved amount
- **`transfer_approved(asset_id, owner, recipient, amount)`** - executes the approved asset transfer from the owner’s account to the recipient. The delegate account can call this function once approval is granted

These delegated operations make it easier to manage multi-step transactions and dApps that require complex asset flows between participants.

## Foreign Assets

Foreign assets in Asset Hub refer to assets originating from external blockchains or parachains that are registered in the Asset Hub. These assets are typically native tokens from other parachains within the Polkadot ecosystem or bridged tokens from external blockchains such as Ethereum.

Once a foreign asset is registered in the Asset Hub by its originating blockchain's root origin, users are able to send these tokens to the Asset Hub and interact with them as they would any other asset within the Polkadot ecosystem.

### Handling Foreign Assets

The Foreign Assets pallet, an instance of the Assets pallet, manages these assets. Since foreign assets are integrated into the same interface as native assets, developers can use the same functionalities, such as transferring and querying balances. However, there are important distinctions when dealing with foreign assets.

- **Asset identifier** - unlike native assets, foreign assets are identified using an XCM Multilocation rather than a simple numeric `AssetId`. This multilocation identifier represents the cross-chain location of the asset and provides a standardized way to reference it across different parachains and relay chains

- **Transfers** - once registered in the Asset Hub, foreign assets can be transferred between accounts, just like native assets. Users can also send these assets back to their originating blockchain if supported by the relevant cross-chain messaging mechanisms

## Integration

Asset Hub supports a variety of integration tools that make it easy for developers to manage assets and interact with the blockchain in their applications. The tools and libraries provided by Parity Technologies enable streamlined operations, such as querying asset information, building transactions, and monitoring cross-chain asset transfers.

Developers can integrate Asset Hub into their projects using these core tools:

### API Sidecar

[API Sidecar](https://github.com/paritytech/substrate-api-sidecar){target=\_blank} is a RESTful service that can be deployed alongside Polkadot and Kusama nodes. It provides endpoints to retrieve real-time blockchain data, including asset information. When used with Asset Hub, Sidecar allows querying:

- **Asset look-ups** - retrieve specific assets using `AssetId`
- **Asset balances** - view the balance of a particular asset on Asset Hub

Public instances of API Sidecar connected to Asset Hub are available, such as:

- [Polkadot Asset Hub Sidecar](https://polkadot-asset-hub-public-sidecar.parity-chains.parity.io/){target=\_blank}
- [Kusama Asset Hub Sidecar](https://kusama-asset-hub-public-sidecar.parity-chains.parity.io/){target=\_blank}

These public instances are primarily for ad-hoc testing and quick checks.

### TxWrapper

[`TxWrapper`](https://github.com/paritytech/txwrapper-core){target=\_blank} is a library that simplifies constructing and signing transactions for Polkadot SDK-based chains, including Polkadot and Kusama. This tool includes support for working with Asset Hub, enabling developers to:

- Construct offline transactions
- Leverage asset-specific functions such as minting, burning, and transferring assets

`TxWrapper` provides the flexibility needed to integrate asset operations into custom applications while maintaining the security and efficiency of Polkadot's transaction model.

### Asset Transfer API

[Asset Transfer API](https://github.com/paritytech/asset-transfer-api){target=\_blank} is a library focused on simplifying the construction of asset transfers for Polkadot SDK-based chains that involve system parachains like Asset Hub. It exposes a reduced set of methods that facilitate users sending transfers to other parachains or locally. Refer to the [cross-chain support table](https://github.com/paritytech/asset-transfer-api/tree/main#current-cross-chain-support){target=\_blank} for the current status of cross-chain support development.

Key features include:

- Support for cross-chain transfers between parachains
- Streamlined transaction construction with support for the necessary parachain metadata

The API supports various asset operations, such as paying transaction fees with non-native tokens and managing asset liquidity.

### Parachain Node

To fully leverage the Asset Hub's functionality, developers will need to run a system parachain node. Setting up an Asset Hub node allows users to interact with the parachain in real time, syncing data and participating in the broader Polkadot ecosystem. Guidelines for setting up an [Asset Hub node](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/cumulus#asset-hub-){target=\_blank} are available in the Parity documentation.

Using these integration tools, developers can manage assets seamlessly and integrate Asset Hub functionality into their applications, leveraging Polkadot's powerful infrastructure.

## XCM Transfer Monitoring

Since Asset Hub facilitates cross-chain asset transfers across the Polkadot ecosystem, XCM transfer monitoring becomes an essential practice for developers and infrastructure providers. This section outlines how to monitor the cross-chain movement of assets between parachains, the relay chain, and other systems.

### Monitor XCM Deposits

As assets move between chains, tracking the cross-chain transfers in real time is crucial. Whether assets are transferred via a teleport from system parachains or through a reserve-backed transfer from any other parachain, each transfer emits a relevant event (such as the `balances.minted` event).

To ensure accurate monitoring of these events:

- **Track XCM deposits** - query every new block created in the relay chain or Asset Hub, loop through the events array, and filter for any `balances.minted` events which confirm the asset was successfully transferred to the account
- **Track event origins** - each `balances.minted` event points to a specific address. By monitoring this, service providers can verify that assets have arrived in the correct account

### Track XCM Information Back to the Source

While the `balances.minted` event confirms the arrival of assets, there may be instances where you need to trace the origin of the cross-chain message that triggered the event. In such cases, you can:

1. Query the relevant chain at the block where the `balances.minted` event was emitted
2. Look for a `messageQueue(Processed)` event within that block's initialization. This event contains a parameter (`Id`) that identifies the cross-chain message received by the relay chain or Asset Hub. You can use this `Id` to trace the message back to its origin chain, offering full visibility of the asset transfer's journey

### Practical Monitoring Examples

The preceding sections outline the process of monitoring XCM deposits to specific accounts and then tracing back the origin of these deposits. The process of tracking an XCM transfer and the specific events to monitor may vary based on the direction of the XCM message. Here are some examples to showcase the slight differences:

- **Transfer from parachain to relay chain** - track `parachainsystem(UpwardMessageSent)` on the parachain and `messagequeue(Processed)` on the relay chain
- **Transfer from relay chain to parachain** - track `xcmPallet(sent)` on the relay chain and `dmpqueue(ExecutedDownward)` on the parachain
- **Transfer between parachains** - track `xcmpqueue(XcmpMessageSent)` on the system parachain and `xcmpqueue(Success)` on the destination parachain

### Monitor for Failed XCM Transfers

Sometimes, XCM transfers may fail due to liquidity or other errors. Failed transfers emit specific error events, which are key to resolving issues in asset transfers. Monitoring for these failure events helps catch issues before they affect asset balances.

- **Relay chain to system parachain** - look for the `dmpqueue(ExecutedDownward)` event on the parachain with an `Incomplete` outcome and an error type such as `UntrustedReserveLocation`
- **Parachain to parachain** - monitor for `xcmpqueue(Fail)` on the destination parachain with error types like `TooExpensive`

For detailed error management in XCM, see Gavin Wood's blog post on [XCM Execution and Error Management](https://www.polkadot.network/blog/xcm-part-three-execution-and-error-management){target=\_blank}.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge tutorial">Tutorial</span> __Register a Local Asset__

    ---

    Comprehensive guide to registering a local asset on the Asset Hub system parachain, including step-by-step instructions.

    [:octicons-arrow-right-24: Reference](/tutorials/polkadot-sdk/system-chains/asset-hub/register-local-asset/)

-   <span class="badge tutorial">Tutorial</span> __Register a Foreign Asset__

    ---

    An in-depth guide to registering a foreign asset on the Asset Hub parachain, providing clear, step-by-step instructions.

    [:octicons-arrow-right-24: Reference](/tutorials/polkadot-sdk/system-chains/asset-hub/register-foreign-asset/)

-   <span class="badge tutorial">Tutorial</span> __Convert Assets__

    ---

    A guide detailing the step-by-step process of converting assets on Asset Hub, helping users efficiently navigate asset management on the platform.

    [:octicons-arrow-right-24: Reference](/tutorials/polkadot-sdk/system-chains/asset-hub/asset-conversion/)

</div>