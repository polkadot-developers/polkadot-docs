---
title: Name Escrow and Deposits
description: How dotNS holds a name's refundable deposit in escrow, and the release, redeem, withdraw, and reclaim operations that return a name to circulation.
categories: Apps, Reference
---

# Escrow and Deposits

## Introduction

A name registered on the public path pays a refundable deposit. The deposit is not a purchase price, and no part of it is routed to a treasury: it sits in the escrow contract while the name is held, and it returns to the holder when the name is given up. See [PopRules and Pricing](/reference/apps/infrastructure/dotns/poprules-pricing/) for which names pay a deposit and what it costs.

Escrow is also the route by which a name leaves its holder and returns to circulation. This page documents that lifecycle, the two clocks that bound it, and what happens to the deposit when a name changes hands.

Only a name registered on the public path has an escrow position. A device or personhood name is issued through the personhood gateway, carries no deposit, and cannot be transferred, so none of the operations here apply to it.

## The Lifecycle

Four operations move a name and its deposit through escrow. The holder drives all of them except `reclaim`:

| Operation  | Caller                 | Available                                                            |
|:-----------|:-----------------------|:---------------------------------------------------------------------|
| `release`  | The current holder     | Any time                                                             |
| `redeem`   | The releasing holder   | During the redeem window, and only while the deposit is not withdrawn |
| `withdraw` | The releasing holder   | After the withdrawal cooldown                                        |
| `reclaim`  | The controller         | After the redeem window has elapsed                                  |

### Release

`release(tokenId)` moves the name into escrow custody. It starts two independent clocks: a withdrawal cooldown, which gates when the deposit can be taken back, and a redeem window, which gates how long the holder can change their mind.

Releasing is not a sale, and it costs nothing beyond gas. A transfer into or out of escrow is exempt from the transfer fee. See [Name Transfers](/reference/apps/infrastructure/dotns/transfer/).

### Redeem

`redeem(tokenId)` is the undo. While the redeem window is open, and only while the deposit has not been withdrawn, the releasing holder takes the name back. No value moves, because the deposit never left escrow.

Withdrawing forecloses this. Once `withdraw` has run, the name cannot be redeemed even if the redeem window is still open.

### Withdraw

`withdraw(tokenId)` credits the refundable deposit to the holder's pull-payment balance once the withdrawal cooldown has elapsed. It does not send funds. A second call, `claimWithdrawal()`, pulls the credited balance into the holder's account.

The two-step shape is the standard pull-payment pattern: crediting a balance cannot fail on the recipient's side, so a holder that cannot accept a direct transfer does not block the operation.

### Reclaim

`reclaim(tokenId, newOwner)` is the only operation a holder does not drive. The controller calls it once the redeem window has elapsed, handing the name to a new registrant and settling any outstanding deposit to the previous holder's balance.

A holder who releases a name and never returns therefore keeps the value: the deposit lands in their pull-payment balance whether or not they were present when the name recycled. Reclaim also resets the name's resolver pointer, so the new registrant does not inherit the previous holder's records.

<!-- TODO: state the withdrawal cooldown and redeem window durations, and whether governance can configure either. -->

## Deposits and Transfers

The deposit is bound to the name rather than to the account that paid it. On every transfer the escrow rebinds the refund recipient to the new holder, and nothing is refunded at transfer time. A buyer who later releases the name withdraws the deposit the seller originally paid.

A transfer therefore settles nothing between the two accounts. If the parties intend the buyer to compensate the seller for the deposit, that is a separate payment, and dotNS does not mediate it.

## Where to Go Next

<div class="grid cards" markdown>

- <span class="badge learn">Learn</span> **Name Transfers**

    ---

    Which names can move, the two conditions that trigger a transfer fee, and why an escrow move is always exempt.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/transfer/)

- <span class="badge learn">Learn</span> **PopRules and Pricing**

    ---

    Which names pay a deposit, what it costs, and the three routes by which a name reaches an owner.

    [:octicons-arrow-right-24: Reference](/reference/apps/infrastructure/dotns/poprules-pricing/)

</div>
