---
title: Overview of Asset Hub
description: Guide to learn and implement Asset Hub parachain on Polkadot, a decentralized platform for the issuance, management, and trading of digital assets.
---

# Asset Hub

## Introduction

Asset Hub is a [System Parachain](https://wiki.polkadot.network/docs/learn-system-chains){target=\_blank} designed to manage and operate assets within the Polkadot network. It specializes in creating, managing, and using assets. It is considered the primary hub for asset operations in the network. 

The native token for the Polkadot Asset Hub is DOT, and for the Kusama Asset Hub, it is KSM. Both cases maintain a trusted relationship with the relay chain.

You can refer to the [How to Teleport DOT or KSM to Asset Hub](https://support.polkadot.network/support/solutions/articles/65000181119){target=\_blank} guide to learn how to send native assets to Asset Hub.

Some common use cases for Asset Hub include:

- Creating and managing assets
- Transferring non-native tokens and creating NFTs
- Reducing transfer fees and [existential deposits](https://support.polkadot.network/support/solutions/articles/65000168651){target=\_blank}
- Meeting the existential deposit requirement for insufficient assets

## Assets

An asset on the blockchain is a digital representation of value, such as cryptocurrencies and tokens, that can be transferred and traded. Asset Hub stores assets as a map from an ID to information about the asset, including details about the management team, total supply, and other relevant information. 

The [Asset Pallet](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=\_blank} facilitates the management of these assets by providing essential functions for handling them.

Asset Hub acts as a management portal for asset creators, letting them mint and burn tokens and get an overview of the total issuance across the Polkadot network, including tokens sent elsewhere in the network.

### Local Assets

Instead of using custom contracts for each asset, Asset Hub incorporates built-in asset logic, treating them as primary primitives. All assets have identical functionality.

These assets, identified by claimable, integer-based asset IDs, are known as `local assets`. This approach simplifies asset management, as users can interact with them using the same set of functions.

The protocol ensures that each asset ID (an integer) is unique, enabling creators to assign metadata such as the asset symbol. Therefore, users should verify their assets to confirm they possess the correct ID. For instance, although anyone can label their asset as USDT, users will probably seek the one issued by [Tether](https://tether.to/en/){target=\_blank} (asset ID 1984).

You can read the [What is Asset Hub and How Do I Use it?](https://support.polkadot.network/support/solutions/articles/65000181800){target=\_blank} article for more information on verifying an asset's legitimacy on Asset Hub.

### Foreign Assets

Asset Hub considers assets originating from a different blockchain to be foreign assets. These assets can be native tokens from various parachains or other consensus systems like Ethereum. Once a foreign asset is added to Asset Hub, users can transfer this token from its original blockchain to Asset Hub and utilize it like any other asset.

A significant difference lies in the method used for their identification. Unlike the Assets pallet, foreign assets use [XCM Multilocation](https://wiki.polkadot.network/docs/learn/xcm/fundamentals/multilocation-summary){target=\_blank} instead of integers to identify assets, making asset identification much more versatile.

Foreign assets are implemented as an [instance of Assets pallet](https://github.com/paritytech/polkadot-sdk/blob/035211d707d0a74a2a768fd658160721f09d5b44/cumulus/parachains/runtimes/assets/asset-hub-rococo/src/lib.rs#L408){target=\_blank}, but with a specialized configuration that enables support for XCM operations.