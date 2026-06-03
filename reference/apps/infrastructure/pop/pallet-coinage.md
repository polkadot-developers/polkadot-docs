---
title: pallet-coinage Reference
description: The PoP pallet behind the Polkadot App's Coinage feature — personhood-aware peer-to-peer payments with privacy properties beyond a standard Balances transfer.
categories: Apps, Reference
---

# `pallet-coinage`

## Introduction

`pallet-coinage` is the on-chain pallet behind the [Polkadot App's Coinage feature](/reference/apps/hosts/polkadot-app/coinage/) — the peer-to-peer payment surface that lets a user send funds to another verified person, with privacy properties beyond what a standard `Balances.transfer_keep_alive` provides.

Two properties differentiate Coinage from a standard transfer at the pallet level:

- **Personhood-aware addressing**: Sends can target a recipient identified by their personhood identity rather than by their account address; the pallet resolves the address from the personhood claim.
- **Privacy-preserving by default**: Where appropriate, the pallet routes the transfer through alias / Ring-VRF surfaces so the on-chain trail does not directly link the sender's account to the recipient's account in the same way a public `Balances.transfer_keep_alive` does.

!!! info "Underlying asset: HOLLAR today, pUSD later"
    `pallet-coinage` is backed by a stablecoin on Asset Hub (configured via `UnderlyingAssetId`). Today that asset is HOLLAR; the system is designed to migrate to pUSD when pUSD lands. The pallet itself works today against HOLLAR — the underlying asset is loaded into recyclers via `load_recycler_with_external_asset` and unloaded via the corresponding `unload_recycler_into_external_asset` variants. The dispatch surface stays the same across the HOLLAR → pUSD transition.

!!! warning "Provisional"
    The complete enumeration of the `pallet-coinage` dispatch surface (every extrinsic, parameter shape, event, and error) is still being finalized. This page documents the conceptual model and the operation families; per-extrinsic specifics will be added once confirmed.

## Conceptual Surface

The pallet's operations cluster into four families:

- **Transfer**: A two-step "pull" mechanic. The sender shares the private key of the coin(s) being sent over an off-chain channel (typically the Polkadot App's encrypted chat). The receiver derives a fresh key from their own mnemonic and calls `transfer(to)` to move each coin to that new key. The coin's age increments by 1. Transfer is always free.
- **Split**: A user splits one coin into any combination of smaller coins whose values sum to the original. All output coins inherit `originalAge + 1`. Split is always free.
- **Recycle (load / unload)**: The privacy core. A user loads a coin (or equivalent stablecoin) into a recycler ring, waits for other entries to join, then unloads with a Ring-VRF proof — minting a fresh coin or withdrawing the backing stablecoin, with no on-chain link to the deposit. Loading is free; unloading is the only charged operation in the system.
- **Onboard / offboard**: Conversion between coins and the backing stablecoin. Onboarding loads stablecoin into a recycler and unloads anonymously into fresh coins. Offboarding does the reverse. A `direct_offboard_coin_into_external_asset` fast path skips the recycler for freshly-minted (age-0) coins that do not need anonymity.

## Relationship to Coinage in the App

The App's Coinage feature is the user-facing surface; `pallet-coinage` is the on-chain pallet that surface dispatches into. A Product developer who wants Coinage-style payments in their own Product invokes `pallet-coinage` via the standard signing surface (with the user approving each transaction on their App, as with all signed actions).

For the App-side feature reference see [Coinage in the Polkadot App](/reference/apps/hosts/polkadot-app/coinage/).

## Pallet Surface

The transfer, split, load, and unload extrinsics, the coin storage, and the recycler ring data are enumerated here.

!!! warning "Provisional"
    Parameter shapes, event names, and error variants are pending Parity confirmation. The operation set below reflects the design as documented in the briefing.

| Symbol                                                                                                                          | Kind        | Notes                                                                     |
|:--------------------------------------------------------------------------------------------------------------------------------|:------------|:--------------------------------------------------------------------------|
| `transfer`                                                                                                                      | Extrinsic   | Free; pull-mechanic — receiver moves the coin                             |
| `split`                                                                                                                         | Extrinsic   | Free; one coin into many summing to its value                             |
| `load_recycler_with_coin`                                                                                                       | Extrinsic   | Free; coin origin; deposits a coin into the recycler ring                 |
| `load_recycler_with_external_asset`                                                                                             | Extrinsic   | Free; signed origin; deposits backing stablecoin                          |
| `unload_recycler_into_coin`                                                                                                     | Extrinsic   | Ring-VRF proof; mint a fresh age-0 coin                                   |
| `unload_recycler_into_external_asset`                                                                                           | Extrinsic   | Ring-VRF proof; withdraw backing stablecoin                               |
| `unload_recycler_into_coins`                                                                                                    | Extrinsic   | Unload + split in one op; lifts power-of-two restriction                  |
| `unload_recycler_into_external_asset_non_anonymous`                                                                             | Extrinsic   | Signer pays fee directly; identity visible                                |
| `direct_offboard_coin_into_external_asset`                                                                                      | Extrinsic   | Fast path for age-0 coins; bypasses the recycler                          |
| `pay_for_recycler_unload_fee_token_with_coin`                                                                                   | Extrinsic   | Paid path for users out of free unload tokens                             |
| `pay_for_recycler_unload_fee_token_with_native`                                                                                 | Extrinsic   | Paid path; DOT                                                            |
| `pay_for_recycler_unload_fee_token_with_stable`                                                                                 | Extrinsic   | Paid path; stablecoin                                                     |
| `clean_recycler` / `clean_consumed_free_token` / `clean_paid_unload_token_ring` / `delete_expired_paid_unload_token_collection` | Extrinsic   | Offchain-worker-authorised cleanup                                        |
| `CoinsByOwner`                                                                                                                  | Storage map | Per-public-key coin record (storage is one entry per key)                 |
| `UnderlyingAssetId` / `UnderlyingAssetUnit`                                                                                     | Constant    | The backing stablecoin id and base unit ($0.01); HOLLAR today, pUSD later |
| `MinimumExponent` / `MaximumExponent`                                                                                           | Constant    | Valid coin denomination range (0–14 = $0.01–$163.84)                      |
| `MaximumAge` / `MinimumAgeForRecycling`                                                                                         | Constant    | Coin age limits before mandatory recycling                                |
| `UnloadTokenAllowancePerTimePeriodForPeople` / `…ForLitePeople`                                                                 | Constant    | Free unload-token budget per period                                       |
| `RecyclerExpirationTime`                                                                                                        | Constant    | Lifetime of a full recycler ring before cleanup                           |

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Coinage in the Polkadot App**

    ---

    The App-side feature reference — the user-visible surface that dispatches into this pallet.

    [:octicons-arrow-right-24: Reference](/reference/apps/hosts/polkadot-app/coinage/)

- <span class="badge guide">Guide</span> **Accept a Payment**

    ---

    The standard `Balances.transfer_keep_alive` flow for merchant-style payments — the alternative when Coinage's privacy properties are not the right fit.

    [:octicons-arrow-right-24: Get Started](/apps/build/accept-a-payment/)
</div>
