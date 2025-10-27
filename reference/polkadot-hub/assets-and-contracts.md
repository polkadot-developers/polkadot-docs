---
title: Polkadot Hub
description: Learn how Polkadot Hub enables smart contracts and asset management across the Polkadot network — including Wasm/ink! and EVM contract support, on-chain and foreign asset handling, and cross-chain transfers via XCM.
categories: Basics, Polkadot Protocol
---

# Assets & Contracts

## Assets

### Introduction

Polkadot Hubis Polkadot’s system parachain for issuing and managing on-chain assets. While the Relay Chain provides security, Polkadot Hub handles asset logic—minting, burning, transfers, and metadata—in a cost-efficient environment.

It’s worth noting that Polkadot Hub also supports EVM smart contracts. This means assets can be managed not only through the native Assets pallet, but also using familiar ERC-20 contract standards.

Built for interoperability, it enables cross-chain asset transfers with XCM and supports foreign asset registration from other parachains. This guide covers core asset operations, XCM transfers, and developer tooling such as [API Sidecar](#api-sidecar) and [`TxWrapper`](#txwrapper).

### Asset Basics

The Polkadot Relay Chain supports only its native token (DOT), so Polkadot Hub provides a standardized framework for creating and managing fungible and non-fungible assets. It enables projects to issue tokens, manage supply, and transfer assets across parachains.

Assets on Polkadot Hub support familiar operations such as minting, burning, transfers, and metadata management, similar to ERC-20 on Ethereum but built directly into Polkadot’s runtime for lower latency and fees.

#### Why use Polkadot Hub?

- **Custom asset creation**: Issue tokens or NFTs with configurable permissions and metadata.
- **Low fees**: Transactions cost roughly one-tenth of Relay Chain fees.
- **Lower deposits**: Minimal on-chain storage costs for asset data.
- **Pay fees in any asset**: Users don’t need DOT to transact; supported assets can cover fees.
- **Cross-chain ready**: Assets can be transferred to other parachains using XCM.

#### Asset structure

Each asset is identified by a unique ID and stores:

- Asset administrators
- Total supply and holder count
- Minimum balance configuration
- **Sufficiency** – Whether the asset can keep an account alive without DOT
- Metadata (name, symbol, decimals)

If a balance falls below the configured minimum, it may be removed as “dust.” This ensures efficient storage while giving developers control over asset economics.

### Assets Pallet

The Assets pallet in the Polkadot SDK provides the core logic behind fungible assets on Polkadot Hub. It enables developers to create and manage asset classes with configurable permissions. 

The pallet supports both permissioned and permissionless asset creation, making it suitable for simple tokens as well as governed assets controlled by teams or DAOs.

For full API details, see the [Assets Pallet Rust docs](https://paritytech.github.io/polkadot-sdk/master/pallet_assets/index.html){target=_blank}.

#### Key Features

The Assets pallet includes:

- **Asset issuance**: Create new assets and assign initial supply.
- **Transfers**: Move assets between accounts with balance tracking.
- **Freezing**: Lock an account’s balance to prevent transfers.
- **Burning**: Reduce total supply by destroying tokens.
- **Non-custodial transfers**: Approve transfers on behalf of another account without giving up custody.

!!! note "Main Functions"
    For the full list of supported extrinsics, see the  
    [pallet-assets dispatchable functions reference](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/enum.Call.html){target=_blank}.

#### Querying Functions

The Assets pallet also provides read-only functions to retrieve on-chain asset data, commonly used in dApps and backend services:

- **`balance(asset_id, account)`** – Retrieves the balance of a given asset for a specified account. Useful for checking the holdings of an asset class across different accounts.
- **`total_supply(asset_id)`** – RReturns the total supply of the asset identified by asset_id. Allows users to verify how much of the asset exists on-chain.

Additional queries include metadata lookups, account status, and asset details. See the full list in the [Pallet reference](https://docs.rs/pallet-assets/latest/pallet_assets/pallet/struct.Pallet.html){target=_blank}.

#### Permission Models and Roles

The Assets pallet uses role-based permissions to control who can manage different parts of an asset’s lifecycle:

- **Owner**: Has overarching control, including destroying an entire asset class. Owners can also set or update the Issuer, Freezer, and Admin roles.
- **Admin**: Can freeze (preventing transfers) and forcibly transfer assets between accounts. Admins also have the power to reduce the balance of an asset class across arbitrary accounts.
- **Issuer**: Responsible for minting new tokens. When new assets are created, the Issuer is the account that controls their distribution to other accounts.
- **Freezer**: Can lock the transfer of assets from an account, preventing the account holder from moving their balance.

These roles allow projects to enforce governance and security policies around their assets.

#### Asset Freezing

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

### Foreign Assets

Foreign assets are tokens that originate outside Polkadot Hub—either from other Polkadot parachains or from external networks like Ethereum via bridges. 

Once registered on Polkadot Hub by the originating chain’s root origin, these assets can be held, transferred, and used just like native assets within the Polkadot ecosystem.

#### Handling Foreign Assets

Foreign assets are managed by the **Foreign Assets pallet**, which functions similarly to the standard Assets pallet. Most operations—like transfers and balance queries—use the same API, but with a few key differences:

- **Asset Identifier**: Unlike native assets, foreign assets are identified using an XCM Multilocation rather than a simple numeric AssetId. This multilocation identifier represents the cross-chain location of the asset and provides a standardized way to reference it across different parachains and relay chains.
- **Transfers**: Once registered in the Polkadot Hub, foreign assets can be transferred between accounts, just like native assets. Users can also send these assets back to their originating blockchain if supported by the relevant cross-chain messaging mechanisms.

This unified interface makes it easy for dApps to handle both native and cross-chain assets.

### Assets & XCM 

Cross-chain asset transfers in Polkadot Hub use **XCM (Cross-Consensus Messaging)**. Monitoring these transfers is essential to verify asset movement between parachains and the Relay Chain.

### Monitoring Successful Transfers
- Watch for inbound asset events on the **Relay Chain or Polkadot Hub**.
- Key event: **`balances.minted`** – confirms assets were received.
- Track each block and filter for this event to detect deposits and verify the target account.

### Tracing Transfer Origins
To trace where a transfer came from:
1. Check the block where the `balances.minted` event was emitted.
2. Locate the **`messageQueue.Processed`** event.
3. Use the **message `Id`** from this event to correlate the XCM message across chains.

!!! note
    To learn more about **Asset Transfers with XCM**, please refer to the [XCM Get Started](/parachains/interoperability/get-started.md) page.

## Smart Contracts on Polkadot Hub

--8<-- 'text/smart-contracts/polkaVM-warning.md'

### Introduction

Polkadot’s Relay Chain does not support smart contracts directly, so developers build contract-based applications on parachains that provide execution environments. Polkadot Hub is one of those parachains, offering flexible smart contract capabilities alongside native asset management.

### Building a Smart Contract

Polkadot Hub supports multiple smart contract environments, giving developers the freedom to choose the workflow and tooling that best fits their project:

- **PolkaVM**: A next-generation virtual machine designed specifically for Polkadot. Built on a high-performance [RISC-V-based register architecture](https://en.wikipedia.org/wiki/RISC-V){target=_blank}, PolkaVM enables fast, scalable execution and is optimized for modern smart contract development.
- **REVM**: The [REVM backend](https://github.com/bluealloy/revm){target=_blank} brings a full Rust implementation of the EVM to Polkadot Hub. This allows developers to deploy existing Solidity contracts without modification, preserving compatibility with Ethereum tools and libraries.

Each of these environments is fully compatible with Polkadot Hub, giving teams the option to reuse Ethereum code, build with Rust security guarantees, or explore high-performance innovation with PolkaVM.

#### PolkaVM Contracts

PolkaVM is Polkadot Hub’s native, high-performance smart contract engine. Instead of emulating EVM bytecode, it executes contracts compiled to a RISC-V instruction set, giving tighter control over execution, metering, and parallelization while staying friendly to Ethereum-style development.

**What it enables for developers**
- **Ethereum-compatible development** – Write contracts in Solidity and use familiar tooling (e.g., Hardhat/Foundry workflows) with PolkaVM targets.
- **Fast, predictable execution** – RISC-V bytecode is designed for efficient interpretation and careful gas/weight metering within the Substrate runtime.
- **Better observability** – Substrate events + contract logs for clean indexing and debugging.

**How it works (at a glance)**

1. **Author & compile** – Your Solidity contract is compiled for PolkaVM (RISC-V target), producing bytecode plus ABI.
2. **Deploy** – Submit a signed extrinsic to Polkadot Hub; collators include it in a parachain block.
3. **Execute** – PolkaVM runs the contract code, mapping gas ↔ weight and persisting state via Substrate storage.
4. **Integrate** – Contracts can interact with Polkadot Hub pallets and send/receive XCM messages for cross-chain actions.
5. **Finalize & index** – The Relay Chain finalizes the block; events/logs are available to indexers and UIs.

**When to choose PolkaVM**

- You want **max performance** and tighter execution control than a traditional EVM.
- You plan to **compose with Substrate pallets** (assets, governance) and **XCM** frequently.
- You prefer a path that’s **Solidity-friendly** but optimized for Polkadot’s architecture.

#### REVM Contracts

REVM brings full EVM compatibility to Polkadot Hub through a fast, memory-safe Rust implementation of the Ethereum Virtual Machine. Unlike PolkaVM, which compiles contracts to RISC-V for native execution, REVM executes standard Ethereum bytecode directly—making it ideal for teams who want to migrate existing Solidity projects to Polkadot with minimal changes.

With REVM, developers can:

- Deploy existing Solidity contracts without rewriting them.
- Use familiar Ethereum tooling like Hardhat, Foundry, Remix, and MetaMask.
- Interact with other parachains and on-chain assets using XCM and Polkadot Hub features.

REVM builds on Rust’s safety guarantees and performance optimizations while retaining full opcode compatibility with the EVM. This provides a reliable path for Ethereum-native developers to access Polkadot’s cross-chain ecosystem.

For more details, explore the REVM integration in the Polkadot Hub smart contract documentation.

If you want to learn more about the dual virtual stack please go to the [DualVM Stack](polkadot-docs/smart-contracts/for-eth-devs/dual-vm-stack.md){target=_blank}.