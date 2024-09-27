---
title: Account Balance Types
description: The Account Balances page provides a comprehensive overview of the various types of balances associated with accounts in the Polkadot ecosystem.
---

# Account Balance Types

In the Polkadot ecosystem, accounts have different types of balances based on their activity. These balance types determine whether your funds can be used for transfers, to pay fees, or must remain frozen due to specific on-chain requirements.

!!! note "A more efficient distribution of account balance types is in development"
    Soon, pallets in the Polkadot SDK will implement the [`fungible` trait](https://paritytech.github.io/polkadot-sdk/master/frame_support/traits/tokens/fungible/index.html){target=\_blank} (see the [tracking issue](https://github.com/paritytech/polkadot-sdk/issues/226){target=\_blank} for more details). 
    
    This update will enable more efficient use of account balances, allowing the free balance to be utilized for on-chain activities such as setting proxies and managing identities.

There are 5 types of account balances:

- **Free**: The balance available for on-chain activities such as staking and participating in governance, but not necessarily spendable or transferable.
- **Frozen**: The portion of the free balance that is locked for specific purposes like [staking](path to staking page), [governance](path to governance page), or [vesting](path to Vested Transfers subsection in Types of Txs) (also referred to as locked balance).
- **On Hold**: The balance reserved for [identities](path to Account Identities section), [proxies](path to Proxy Accounts page), [OpenGov preimages and deposits](path to OpenGov deposits page). It is no longer free and is sometimes called reserved balance.
- **Spendable**: The free balance that is fully available for spending or transferring.
- **Untouchable**: The part of the free balance that cannot be transferred or spent, but can still be used for other on-chain activities.

The spendable balance is calculated as follows:

```
spendable = free - max(frozen - on_hold, ED)
```

where `free`, `frozen` and `on_hold` are defined above. The `ED` is the the **existential deposit**.

!!! note
    Wallet providers may display only **spendable**, **locked**, and **reserved** balances.

## Locks

Locks are abstractions over an account's free balance, preventing it from being spent. Multiple locks can overlap on the same balance, rather than being stacked. 

Locks are automatically applied when an account participates in on-chain activities such as staking or voting, but they are not customizable by users.

Locks are included in the account's `frozen` balance, which represents funds that may be free but are non-transferable. This balance is tied up in activities such as [staking](path to staking page), [governance](path to governance page) and [vesting](path to Vested Transfers subsection in Types of Txs).

Locks can overlap in both amount and duration, following these general rules:

1. If multiple locks involve different amounts of tokens, the largest lock determines the total amount of locked tokens
2. If multiple locks involve the same amount of tokens, the lock with the longest duration dictates when those tokens can be unlocked

### Locks Example

Let's take, for example, 80 DOT as a frozen balance. These 80 DOT are currently used in staking and governance as follows:

- 80 DOT Staking (just unbonded) -> lock 28 days
- 24 DOT OpenGov 1x conviction (referendum just ended, winning side) -> lock 7 days
- 4 DOT OpenGov 6x conviction (referendum just ended, winning side) -> lock 224 days

![](/images/polkadot-protocol/protocol-components/accounts/locks-example-1.webp)

The 1 DOT ED represents the existential deposit. The total locked amount is 80 DOT, not 108 DOT - Because the largest lock determines the total amount of locked tokens.

However, these 80 DOT will become available for unlock at different times: 

1. First, you must remove the governance lock on 24 DOT after 7 days

2. Next, you can unlock the 80 DOT from staking after 28 days

3. Finally, after 224 days, you will be able to remove the second governance lock

![](/images/polkadot-protocol/protocol-components/accounts/locks-example-2.webp)

After 224 days, all 80 DOT (minus existential deposit) will be free and transferrable.

## Edge Cases for Locks

When you use different convictions while having ongoing locks, the longest period and the largest amount are taken into account.

Following the previous example, if you:

1. Undelegate a 1x conviction delegation of 24 DOT, you will incur a 7-day lock on that 24 DOT.
2. Delegate 4 DOT with a 6x conviction.
3. Undelegate again before the 7-day lock from the 1x conviction is removed.

You will get a 6x conviction for 24 DOT! 

!!!info
    Click [here](https://substrate.stackexchange.com/questions/5067/delegating-and-undelegating-during-the-lock-period-extends-it-for-the-initial-am){target=\_blank} for more information about this edge case.

## Balance Types on Polkadot-JS

The following example displays the different balance types on the Polkadot-JS UI (wallet) for a Kusama account. 

!!!note
    Balance types are the same for a Polkadot account.

![](/images/polkadot-protocol/protocol-components/accounts/account-balance-types-1.webp)

- The **total balance** represents the entire number of tokens in the account, but it doesn’t necessarily reflect the tokens you can transfer. In this example, the total balance is **0.6274 KSM**.

- The **transferrable balance** shows the number of tokens available for transfer. It is calculated by subtracting the locked and reserved tokens from the total balance. In the example, the transferrable balance is 0.0106 KSM.

- **Locked funds** refer to tokens used for staking, governance, or vested transfers (details below).

- The **vested balance** refers to tokens sent to the account that are released according to a specific time schedule. Although the account owns these tokens, they are locked and will only become transferable after a certain number of blocks. In this example, the vested balance is **0.25 KSM**.

- The **bonded balance** represents the number of tokens locked for on-chain activities such as staking. In this example, the bonded balance is **0.4 KSM**.

- The **democracy balance** represents the number of tokens locked for on-chain participation in governance activities, such as voting on referenda and council elections. In this example, the democracy balance is **0.4 KSM**.

- The **redeemable balance** shows the number of tokens that have completed the unbonding period and are ready to be unlocked, becoming transferable again. In this example, the redeemable balance is **0.1 KSM**.

- The **locked balance** represents the number of frozen tokens due to participation in staking, democracy, or vested transfers. **Locks do not stack**, meaning the total locked balance is determined by the largest lock, not the sum of individual locks.

- The **reserved balance** represents tokens frozen for on-chain activities other than staking, governance, or vested transfers. This can include actions like setting an identity or a proxy. Reserved funds are locked due to on-chain requirements but can typically be freed by taking specific on-chain actions. For instance, the "Identity" pallet reserves funds while an on-chain identity is registered, but by clearing the identity, those funds can be unreserved and made available again. The same applies to proxies, which reserve funds due to their memory usage on the network. In this example, a governance proxy was created, and the reserved balance is 0.0668 KSM.

