---
title: Polkadot Hub Assets
description: Learn about asset management on Polkadot Hub, including on-chain assets, foreign asset integration, and XCM for cross-chain asset transfers.
categories: Polkadot Protocol
url: https://docs.polkadot.com/reference/polkadot-hub/assets/
---

# Assets on Polkadot Hub

## Introduction

Polkadot Hub is Polkadot’s system parachain that provides core functionality for the network, including issuing and managing on-chain assets. While the relay chain provides security, Polkadot Hub handles asset logic—minting, burning, transfers, and metadata—efficiently and cost-effectively.

Polkadot Hub supports native assets issued on the parachain and foreign assets from other chains, both of which can move seamlessly across the network via XCM.

This guide explains how assets are created, managed, and moved across chains, including key operations, roles, and the differences between native and foreign assets.

## Why Use Polkadot Hub?

Polkadot Hub provides a standardized framework for creating and managing fungible and non-fungible assets. Projects can issue tokens, manage supply, and transfer assets across parachains, extending the functionality of the Polkadot relay chain, which only supports its native token (DOT).

**Key features**:

- **Built-in asset operations**: Mint, burn, and transfer like ERC-20 on Ethereum, but native to Polkadot's runtime.
- **Custom asset creation**: Issue tokens or NFTs with configurable permissions and metadata.
- **Low fees**: Transactions cost roughly one-tenth of relay chain fees.
- **Lower deposits**: Minimal on-chain storage costs for asset data.
- **Pay fees in any asset**: Users don’t need DOT to transact; supported assets can cover fees.
- **Cross-chain ready**: Assets can be transferred to other parachains using XCM.

## Types of Assets

Polkadot Hub supports two types of assets:

- **Native assets**: Tokens and NFTs issued directly on Polkadot Hub using the Assets pallet. These assets benefit from the platform's custom features, such as configurable permissions and low fees
- **Foreign assets**: Tokens originating from other Polkadot parachains or external networks (like Ethereum, via bridges). Once registered on Polkadot Hub, they are treated similarly to native assets.

## Asset Structure

Each asset is identified by a unique ID and stores:

- Asset administrators
- Total supply and holder count
- Minimum balance configuration
- Sufficiency–whether the asset can keep an account alive without DOT
- Metadata (name, symbol, decimals)

If a balance falls below the configured minimum, called the [existential deposit](/reference/glossary/#existential-deposit){target=\_blank}, it may be removed as “dust.” This ensures efficient storage while giving developers control over asset economics.

## How Native Assets Work

Native assets on Polkadot Hub are created and managed via the Assets pallet from the Polkadot SDK. This pallet defines the runtime logic for issuing, configuring, and administering fungible assets with customizable permissions.

It supports both permissioned and permissionless asset creation, enabling everything from simple user-issued tokens to governed assets controlled by teams or DAOs.

For implementation details, see the [Assets Pallet Rust docs](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=\_blank}.

### Asset Operations

The Assets pallet provides both state-changing operations and read-only queries for full lifecycle management of assets.

Core operations include:

- **Asset issuance**: Create new assets and assign initial supply.
- **Transfers**: Move assets between accounts with balance tracking.
- **Burning**: Reduce total supply by destroying tokens.
- **Delegated transfers**: Approve transfers on behalf of another account without giving up custody.
- **Freezing and thawing**: Temporarily lock and unlock an account's balance.

For a complete list of extrinsics, see the [`pallet-assets` dispatchable functions reference](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/enum.Call.html){target=\_blank}.

Data queries make it possible to:

- Check account balances and total supply.
- Retrieve asset metadata and configuration details.
- Inspect account and asset status on-chain.

For a full list of queries, see the [Pallet reference](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/struct.Pallet.html){target=\_blank}.

### Roles and Permissions

The Assets pallet uses role-based permissions to control who can manage different parts of an asset’s lifecycle:

- **Owner**: Overarching control, including destroying an asset class; can set or update Issuer, Freezer, and Admin roles.
- **Admin**: Can freeze assets and forcibly transfer balances between accounts. Admins can also reduce the balance of an asset class across arbitrary accounts.
- **Issuer**: Responsible for minting new tokens. When new assets are created, the Issuer is the account that controls their distribution to other accounts.
- **Freezer**: Can lock the transfer of assets from an account, preventing the account holder from moving their balance.

These roles allow projects to enforce governance and security policies around their assets.

### Freezing Assets

Assets can be temporarily locked to prevent transfers from specific accounts. This is useful for dispute resolution, fraud prevention, or compliance controls.

**How it works**:

- Only authorized parties can freeze or unfreeze (thaw) assets.
- Freezing pauses the movement of the asset without burning or removing it.
- Once thawed, the asset can be transferred normally.

Freezing provides a safe way to control asset flow while maintaining full ownership.

**Key functions**: `freeze` and `thaw`.

### Delegated Transfers

Polkadot Hub supports delegated asset transfers, allowing one account to authorize another to move a limited amount of its assets—without giving up full control. This is useful for escrow logic, automated payments, and multi-party applications.

**How it works**:

- An account can grant permission to another account to transfer a specific amount of its assets.
- Permissions can be revoked at any time, preventing further transfers.
- Authorized accounts can execute transfers on behalf of the original owner within the approved limits.

Delegated transfers simplify multi-step transactions and enable complex asset flows.

**Key functions**: `approve_transfer`, `cancel_approval`, and `transfer_approved`.

## How Foreign Assets Work

Foreign assets are assets originating from other chains and are managed on Polkadot Hub via an instance of the Assets pallet that is configured specifically for foreign assets. It enables transfers, balance checks, and other standard asset operations, while handling foreign-asset specifics such as:

- **Asset identifiers**: Foreign assets use an XCM multilocation as their identifier, rather than a numeric AssetId. This ensures assets from different chains can be referenced and moved safely across parachains.

- **Transfers**: Once registered on Polkadot Hub, foreign assets can be transferred between accounts just like native assets. If supported, they can also be returned to their original blockchain using cross-chain messaging.

This unified interface makes it easy for dApps to handle both native and cross-chain assets.

## Moving Assets Across Chains

Polkadot Hub enables assets to move safely between parachains and the relay chain using XCM (Cross-Consensus Messaging). XCM ensures assets can move securely between chains while preserving ownership and traceability

To learn more about asset transfers with XCM, please refer to the [Introduction to XCM](/parachains/interoperability/get-started/) page.

## Where to Go Next

<div class="grid cards" markdown>

-  <span class="badge guide">Guide</span> __Register a Foreign Asset__

    ---

    Learn step-by-step how to register a foreign asset on Polkadot Hub.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/token-operations/register-foreign-asset/)

-  <span class="badge guide">Guide</span> __Register a Local Asset__

    ---

    Learn step-by-step how to register a local asset on Polkadot Hub.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/token-operations/register-local-asset/)

-  <span class="badge guide">Guide</span> __Convert Assets__

    ---

    Learn how to convert and manage assets on Asset Hub, including creating liquidity pools, adding liquidity, swapping assets, and withdrawing liquidity.

    [:octicons-arrow-right-24: Get Started](/chain-interactions/token-operations/convert-assets/)

</div>
