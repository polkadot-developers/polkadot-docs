---
title: Get TestNet Funds
description: Request TestNet tokens and per-service allowances for Bulletin Chain, Statement Store, and dotNS to build and test your Polkadot Products.
categories: Apps
---

# Get TestNet Funds

## Introduction

This guide assumes you are using Paseo Next — the default environment selected on the Polkadot Desktop login screen. If you selected Preview or Stable instead, see [Choose a Network](/apps/set-up/choose-a-network/){target=\_blank} for environment-specific guidance.

PAS is the test token for Paseo Next. It pays transaction fees for any extrinsic you submit while developing your Product, similar to gas on EVM networks.

Some Polkadot infrastructure services use a separate allowance-based access model. An allowance is a permissioned quota that authorizes your account to consume a specific service — for example, how much data it can store on the Bulletin Chain, how many statements it can publish to the Statement Store, or whether it can register a `.dot` name. This quota is independent of your token balance: even with enough PAS to cover fees, a missing allowance will cause the service to reject your request.

By the end of this page, your account will have a PAS balance and the allowances needed to store data, publish statements, and register `.dot` names on TestNet.

## Prerequisites

Before requesting funds and allowances, ensure you have:

- Complete the [Install and Pair](/apps/set-up/install-and-pair/){target=\_blank} setup so Polkadot Desktop is paired with your signer.
- Complete [identity verification](/apps/set-up/verify-your-identity/){target=\_blank} so your account has a Proof of Personhood status.

## Get Tokens

TestNet tokens (PAS) are the unit of account on Polkadot TestNet. You need a balance to pay transaction fees for any extrinsic you submit while developing your Product.

!!! warning "Provisional"
    The faucet distributes PAS without a Proof of Personhood check. Personhood-gated faucet access is forthcoming — once live, you will need a verified identity to request tokens.

The Polkadot Faucet distributes free PAS tokens to developers. To request tokens:

1. Open the [Polkadot Faucet](https://faucet.polkadot.io/){target=\_blank} and select your target network from the **Network** drop-down.
2. Paste the address of the account paired with Polkadot Desktop into the address field.
3. Click **Get Some PASs** to request tokens. They arrive in your account shortly after the request is processed.

![Polkadot Faucet](/images/smart-contracts/faucet/faucet-01.gif)

For more details on the faucet — including rate limiting and supported networks — see the full [Faucet](/smart-contracts/faucet/){target=\_blank} page.

## Get Service Allowances

Some Polkadot infrastructure services use an allowance-based access model that is independent of your token balance. Allowances control _what_ your account can do — for example, how much data it can store or how many statements it can publish — rather than whether it can pay for the transaction. Provisioning the right allowance for each service your Product uses is a one-time setup step on TestNet.

### Bulletin Chain Storage

The Bulletin Chain has no token balance for storage — every account needs an explicit authorization that grants a quota of transactions and bytes before it can store data on-chain. Without authorization, storage extrinsics will be rejected.

On TestNet, you provision this authorization through the faucet built into the Bulletin Chain Console. Follow the [Get Authorization](/chain-interactions/store-data/bulletin-chain/#get-authorization){target=\_blank} steps in the Bulletin Chain tutorial to request your storage quota.

![Bulletin Chain Console authorization request form](/images/chain-interactions/store-data/bulletin-chain/bulletin-chain-2.webp)

After your authorization request is confirmed, you can verify the allocation on-chain by querying the `Authorizations` storage map of the `transaction-storage` pallet for your account. The returned record shows your remaining transactions, remaining bytes, and the block at which the authorization expires.

!!! note
    Authorizations have an expiration block. Unused capacity is not refunded once an authorization expires — you will need to request a new one to continue storing data.

### Statement Store

The Statement Store lets accounts publish off-chain statements that are gossiped and persisted by the network. Access is controlled by an on-chain `StatementAllowance` record that specifies two limits per account: `max_count` (the maximum number of statements the account can publish) and `max_size` (the maximum total bytes across those statements).

On TestNet, allowances are provisioned by calling the `increase_allowance_by` extrinsic — typically via governance or sudo, since this is a privileged operation. Once the call is included, your account can publish statements up to the configured `max_count` and `max_size` limits.

!!! warning "Provisional"
    The process for obtaining a Statement Store allowance on TestNet is not yet documented. Check back for updates, or ask in the developer community for available access paths.

### dotNS Names

dotNS (`.dot` name registration) uses a hybrid model. Open names — those that anyone can register — require a deposit paid in PAS. Names reserved for accounts with Proof of Personhood Full or PoP Lite status are free to register for eligible accounts, with no deposit required.

!!! note "Personhood-Gated Quotas"
    Several allowances on Polkadot TestNet are tied to your Proof of Personhood status. Accounts that have completed [identity verification](/apps/set-up/verify-your-identity/){target=\_blank} may receive higher quotas, lower deposits, or access to PoP-gated name spaces. If your allowances look smaller than expected, confirm your account's PoP status before requesting more capacity.

## Gas Mechanism

A new gas mechanism will be applied to facilitate the transactions and operations of Polkadot Products. Gas mechanisms abstract the complexity of fee calculation away from individual users and applications, providing a consistent and predictable cost model that supports smooth product experiences while ensuring the long-term sustainability of the underlying services. This mechanism will govern how computational and storage costs are measured and charged across Polkadot's infrastructure services. Details on specific parameters and configuration will be published once the mechanism is finalized.

!!! warning "Provisional"
    The gas mechanism parameters and configuration are not yet finalized. This section will be updated once details are confirmed.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Choose a Network**

    ---

    Pick the right Polkadot TestNet for your Product and point Polkadot Desktop at it before you start building.

    [:octicons-arrow-right-24: Get Started](/apps/set-up/choose-a-network/){target=\_blank}

</div>
