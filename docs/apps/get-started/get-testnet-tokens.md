---
title: Get TestNet Tokens
description: Claim TestNet tokens from the Polkadot Faucet and unlock per-service allowances for Bulletin Chain, Statement Store, and dotNS.
categories: Apps
page_badges:
  tutorial_badge: Beginner
---

# Get TestNet Tokens

To build and test, your account needs two things on TestNet: a balance of [PAS](/reference/glossary/#pas) (the Paseo TestNet token, which pays transaction fees) and per-service _allowances_ for the infrastructure your Product uses.

## Prerequisites

Before getting started, ensure you have:

- Completed the [Install Polkadot Desktop and Pair](/apps/get-started/) guide so Polkadot Desktop is paired with your signer

## Get Tokens

The Polkadot Faucet distributes free PAS tokens to developers.

1. Open the [Polkadot Faucet](https://faucet.polkadot.io/) and select your target network from the **Network** drop-down.

    ![Polkadot TestNet Faucet showing the Network and Chain dropdowns, the Paseo Address input, the reCAPTCHA check, and the Get some PASs button.](/images/apps/get-started/get-testnet-tokens/get-testnet-tokens-01.webp){: .browser-extension}

2. Paste the address of the account paired with Polkadot Desktop into the address field.
3. Click **Get Some PASs** to request tokens. They arrive in your account shortly after the request is processed.

!!! warning "Provisional"
    The faucet's mapping to the current Paseo Next v2 chains is being confirmed. If your funds do not appear in Polkadot Desktop after a few minutes, contact the developer community for the current chain selection.

## Service Allowances

Some Polkadot infrastructure services use a separate allowance-based access model. These allowances are independent of your token balance; even with enough PAS to cover fees, a missing allowance will cause the service to reject your request.

??? note "Service Allowances: Bulletin Chain Storage"

    The [Bulletin Chain](/reference/apps/infrastructure/bulletin-chain/) has no token balance for storage. Every account needs an explicit authorization that grants a quota of transactions and bytes before it can store data on-chain. Without authorization, storage extrinsics are rejected.

    On TestNet, request your storage authorization directly from the [Bulletin Chain authorization page](https://paritytech.github.io/polkadot-bulletin-chain/authorizations). This is required before submitting any `store` extrinsic from your Product.

    After your authorization request is confirmed, you can verify the allocation on-chain by querying the `Authorizations` storage map of the `transaction-storage` pallet for your account.

??? note "Service Allowances: Statement Store"

    The [Statement Store](/reference/apps/infrastructure/statement-store/) lets accounts publish off-chain statements that are gossiped and persisted by the network. Access is controlled by an on-chain `StatementAllowance` record that specifies two limits per account: `max_count` (the maximum number of statements the account can publish) and `max_size` (the maximum total bytes across those statements).

    !!! warning "Provisional"
        The process for obtaining a Statement Store allowance on TestNet is not yet documented. Check back for updates, or ask in the developer community for available access paths.

??? note "Service Allowances: dotNS Names"

    [dotNS](/reference/apps/infrastructure/dotns/) (`.dot` name registration) uses a hybrid model. Open names (those that anyone can register) require a deposit paid in PAS. Names reserved for accounts with Proof of Personhood Full or PoP Lite status are free to register for eligible accounts, with no deposit required.

    See the [dotNS PopRules pricing reference](/reference/apps/infrastructure/dotns/poprules-pricing/) for full pricing and tier details.

## Where to Go Next

<div class="grid cards" markdown>

-   <span class="badge guide">Guide</span> **Build Your Product**

    ---

    Set up a local project, load it in Polkadot Desktop via the `localhost` bypass, and add capabilities guide by guide.

    [:octicons-arrow-right-24: Set Up Your Project](/apps/build/#set-up-your-project)

</div>
