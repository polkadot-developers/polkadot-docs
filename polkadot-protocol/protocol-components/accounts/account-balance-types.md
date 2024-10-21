---
title: Account Balance Types
description: Learn about the different types of balances based on usage and activity, with practical examples to understand how the balances are calculated.
---

# Account Balance Types

In the Polkadot ecosystem, account balances are categorized into different types based on usage and activity. These balance types determine how your funds can be used—whether they are available for transfers, paying fees, or locked due to specific on-chain requirements.

!!! note "A more efficient distribution of account balance types is in development"
    Soon, pallets in the Polkadot SDK will implement the [`fungible` trait](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/tokens/fungible/index.html){target=\_blank} (see the [tracking issue](https://github.com/paritytech/polkadot-sdk/issues/226){target=\_blank} for more details). This update will enable more efficient use of account balances, allowing the free balance to be utilized for on-chain activities such as setting proxies and managing identities.

## Balance Types

There are five types of account balances:

- **Free** - the balance available for on-chain activities such as staking and participating in governance, but not necessarily spendable or transferable
- **Locked** - the portion of the free balance that is locked for specific purposes like [staking](https://wiki.polkadot.network/docs/learn-staking#nominating-validators){target=\_blank}, [governance](https://wiki.polkadot.network/docs/learn-polkadot-opengov#voting-on-a-referendum){target=\_blank}, or [vesting](TODO: path to Vested Transfers subsection in Types of Txs) (also referred to as locked balance)
- **Reserved** - the balance reserved for [identities](https://wiki.polkadot.network/docs/learn-identity){target=\_blank}, [proxies](https://wiki.polkadot.network/docs/learn-proxies){target=\_blank}, [OpenGov preimages and deposits](https://wiki.polkadot.network/docs/learn-guides-polkadot-opengov#claiming-opengov-deposits){target=\_blank}
- **Spendable** - the free balance that is fully available for spending or transferring
- **Untouchable** - the part of the free balance that cannot be transferred or spent but can still be used for other on-chain activities

The spendable balance is calculated as follows:

```text
spendable = free - max(locked - reserved, ED)
```

Here, `free`, `locked`, and `reserved` are defined above. The `ED` represents the [existential deposit](https://wiki.polkadot.network/docs/learn-accounts#existential-deposit-and-reaping){target=\_blank}.

!!! note
    Wallet providers may display only **spendable**, **locked**, and **reserved** balances.

## Locks

Locks are abstractions over an account's free balance, preventing it from being spent. Multiple locks can overlap on the same balance rather than being stacked.

Locks are automatically applied when an account participates in on-chain activities such as staking or voting, but users cannot customize them.

Locks are included in the account's `locked` balance, representing funds that may be free but are non-transferable. This balance is tied up in activities such as [staking](https://wiki.polkadot.network/docs/learn-staking#nominating-validators){target=\_blank}, [governance](https://wiki.polkadot.network/docs/learn-polkadot-opengov#voting-on-a-referendum){target=\_blank}, and [vesting](TODO: path to Vested Transfers subsection in Types of Txs).

Locks can overlap in both amount and duration, following these general rules:

- If multiple locks involve different amounts of tokens, the largest lock determines the total amount of locked tokens
- If multiple locks involve the same amount of tokens, the lock with the longest duration dictates when those tokens can be unlocked

### Locks Example

In the following example, there is a locked balance of 80 DOT, which is allocated for both staking and governance activities:

- 80 DOT staked (just unbonded) -> 28-day lock period
- 24 DOT in Polkadot OpenGov with 1x conviction (referendum just ended, winning side) -> 7-day lock period
- 4 DOT in Polkadot OpenGov with 6x conviction (referendum just ended, winning side) -> 224-day lock period

There is a 1 DOT existential deposit (ED) in this case. The total locked amount is 80 DOT, not 108 DOT, because only the largest lock governs the total number of locked tokens.

![](/images/polkadot-protocol/protocol-components/accounts/locks-example-1.webp)

However, these 80 DOT will become available for unlock at different times:

1. First, you must remove the governance lock on 24 DOT after seven days
2. Next, you can unlock the 80 DOT from staking after 28 days
3. Finally, after 224 days, you will be able to remove the second governance lock

After 224 days, all 80 DOT (minus the existential deposit) will be free and transferrable.

![](/images/polkadot-protocol/protocol-components/accounts/locks-example-2.webp)

## Edge Cases for Locks

When you use different convictions while having ongoing locks, the longest period and the largest amount are taken into account.

Following the previous example, if you:

1. Undelegate a 1x conviction delegation of 24 DOT, you will incur a 7-day lock on that 24 DOT
2. Delegate 4 DOT with a 6x conviction
3. Undelegate again before the 7-day lock from the 1x conviction is removed

You will get a 6x conviction for 24 DOT.

!!!note
    Check out a [Stack Exchange](https://substrate.stackexchange.com/questions/5067/delegating-and-undelegating-during-the-lock-period-extends-it-for-the-initial-am){target=\_blank} post on extending the lock duration for more information about this edge case.

## Balance Types on Polkadot.js

The following example displays the different balance types on the Polkadot.js Apps for a Kusama account.

!!!note
    Balance types are the same for a Polkadot account.

![](/images/polkadot-protocol/protocol-components/accounts/account-balance-types-1.webp)

- **Total balance** - represents the entire number of tokens in the account, but it doesn't necessarily reflect the tokens you can transfer. In this example, the total balance is **0.6274 KSM**

- **Transferrable balance** - shows the number of tokens available for transfer. It is calculated by subtracting the locked and reserved tokens from the total balance. In the example, the transferrable balance is **0.0106 KSM**

- **Vested balance** - refers to tokens sent to the account that are released according to a specific schedule. Although the account owns these tokens, they are locked and will only become transferable after a certain number of blocks. In this example, the vested balance is **0.2500 KSM**

- **Locked balance** - refers to tokens used for staking, governance, or vested transfers (details below). **Locks do not stack**, meaning the total locked balance is determined by the largest lock, not the sum of individual locks. In this example, the locked balance is **0.5500 KSM**

- **Reserved balance** - represents tokens locked for on-chain activities other than staking, governance, or vested transfers. This can include actions like setting an identity or a proxy. Reserved funds are locked due to on-chain requirements but can typically be freed by taking specific on-chain actions. For instance, the Identity pallet reserves funds while an on-chain identity is registered, but by clearing the identity, those funds can be unreserved and made available again. The same applies to proxies, which reserve funds due to their memory usage on the network. In this example, a governance proxy was created, and the reserved balance is **0.0668 KSM**

- **Bonded balance** - represents the number of tokens locked for on-chain activities such as staking. In this example, the bonded balance is **0.4000 KSM**

- **Redeemable balance** - shows the number of tokens that have completed the unbonding period and are ready to be unlocked, becoming transferable again. In this example, the redeemable balance is **0.1000 KSM**

- **Democracy balance** - represents the number of tokens locked for on-chain participation in governance activities, such as voting on referenda and council elections. In this example, the democracy balance is **0.5500 KSM**
