---
title: Rewards Payout
description: Learn how validator rewards work on the network, including era points, payout distribution, running multiple validators, and nominator payments.
---

# Rewards Payout

## Introduction

Understanding how rewards are distributed to validators and nominators is essential for network participants. In Polkadot and Kusama, validators earn rewards based on their era points, which are accrued through actions like block production and parachain validation.

This guide explains the payout scheme, factors influencing rewards, and how multiple validators affect returns. Validators can also share rewards with nominators, who contribute by staking behind them. By following the payout mechanics, validators can optimize their earnings and better engage with their nominators.

## Era Points

The Polkadot ecosystem measures its reward cycles in a unit called an era. Kusama eras are approximately 6 hours long, and Polkadot eras are 24 hours long. At the end of each era, validators are paid proportionally to the amount of [era points](https://wiki.polkadot.network/docs/maintain-guides-validator-payout#era-points){target=\_blank} they have collected. Era points are reward points earned for payable actions like:

- Issuing validity statements for [parachain blocks](/polkadot-protocol/basics/blocks-transactions-fees/blocks/){target=\_blank}
- Producing a non-uncle block in the relay chain
- Producing a reference to a previously unreferenced uncle block
- Producing a referenced uncle block

An uncle block is a relay chain block that is valid in every regard but has failed to become canonical. This can happen when two or more validators are block producers in a single slot, and the block produced by one validator reaches the next block producer before the others. The lagging blocks are called uncle blocks.

## Reward Variance

Rewards in Polkadot and Kusama staking systems can fluctuate due to differences in era points earned by para-validators and non-para-validators. Para-validators generally contribute more to the overall reward distribution due to their role in validating parachain blocks, thus influencing the variance in staking rewards.

To illustrate this relationship:

- Para-validator era points tend to have a higher impact on the expected value of staking rewards compared to non-para-validator points
- The variance in staking rewards increases as the total number of validators grows relative to the number of para-validators
- In simpler terms, when more validators are added to the active set without increasing the para-validator pool, the disparity in rewards between validators becomes more pronounced

However, despite this increased variance, rewards tend to even out over time due to the continuous rotation of para-validators across eras. The network's design ensures that over multiple eras, each validator has an equal opportunity to participate in para-validation, eventually leading to a balanced distribution of rewards.

??? interface "Probability in Staking Rewards"

    This should only serve as a high-level overview of the probabilistic nature for staking rewards.

    Let:

    - `pe` = para-validator era points
    - `ne` = non-para-validator era points
    - `EV` = expected value of staking rewards

    Then, `EV(pe)` has more influence on the `EV` than `EV(ne)`.

    Since `EV(pe)` has a more weighted probability on the `EV`, the increase in variance against the `EV` becomes apparent between the different validator pools (aka. validators in the active set and the ones chosen to para-validate).

    Also, let:

    - `v` = the variance of staking rewards
    - `p` = number of para-validators
    - `w` = number validators in the active set
    - `e` = era

    Then, `v` &#8593; if `w` &#8593;, as this reduces `p` : `w`, with respect to `e`.

    Increased `v` is expected, and initially keeping `p` &#8595; using the same para-validator set for all parachains ensures [availability](https://spec.polkadot.network/chapter-anv){target=\_blank} and [voting](https://wiki.polkadot.network/docs/learn-polkadot-opengov){target=\_blank}. In addition, despite `v` &#8593; on an `e` to `e` basis, over time, the amount of rewards each validator receives will equal out based on the continuous selection of para-validators.

    There are plans to scale the active para-validation set in the future.

## Payout Scheme

Validator rewards are distributed equally among all validators in the active set, regardless of the total stake behind each validator. However, individual payouts may differ based on the number of era points a validator has earned. Although factors like network connectivity can affect era points, well-performing validators should accumulate similar totals over time.

Validators can also receive tips from users, which incentivize them to include certain transactions in their blocks. Validators retain 100% of these tips.

Rewards are paid out in the network's native token (DOT for Polkadot and KSM for Kusama). 

The following example illustrates a four member validator set with their names, amount they have staked, and how payout of rewards is divided. This scenario assumes all validators earned the same amount of era points and no one received tips: 

``` mermaid
flowchart TD
    A["Alice (18 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    D["Dave (7 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> D
```

Note that this is different than most other Proof of Stake (PoS) systems. As long as a validator is in the validator set, it will receive the same block reward as every other validator. Validator Alice, who had 18 DOT staked, received the same 2 DOT reward in this era as Dave, who had only 7 DOT staked.

## Running Multiple Validators

Running multiple validators can offer a more favorable risk/reward ratio compared to running a single one. If you have sufficient DOT or nominators staking on your validators, maintaining multiple validators within the active set can yield higher rewards.

In the preceding section, with 18 DOT staked and no nominators, Alice earned 2 DOT in one era. This example uses DOT, but the same principles apply for KSM on the Kusama network. By managing stake across multiple validators, you can potentially increase overall returns. Recall the set of validators from the preceding section:

``` mermaid
flowchart TD
    A["Alice (18 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    D["Dave (7 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> D 
```

Now, assume Alice decides to split their stake and run two validators, each with a nine DOT stake. This validator set only has four spots and priority is given to validators with a larger stake. In this example, Dave has the smallest stake and loses his spot in the validator set. Now, Alice will earn two shares of the total payout each era as illustrated below:

``` mermaid
flowchart TD
    A["Alice (9 DOT)"]
    F["Alice (9 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> F 
```

With enough stake, you could run more than two validators. However, each validator must have enough stake behind it to maintain a spot in the validator set.

## Nominators and Validator Payments

A nominator's stake allows them to vote for validators and earn a share of the rewards without managing a validator node. Although staking rewards depend on validator activity during an era, validators themselves never control or own nominator rewards. To trigger payouts, anyone can call the `staking.payoutStakers` or `staking.payoutStakerByPage` methods, which mint and distribute rewards directly to the recipients. This trustless process ensures nominators receive their earned rewards.

Validators set a commission rate as a percentage of the block reward, affecting how rewards are shared with nominators. A 0% commission means the validator keeps only rewards from their self-stake, while a 100% commission means they retain all rewards, leaving none for nominators.

The following examples model splitting validator payments between nominator and validator using various commission percentages. For simplicity, these examples assume a Polkadot-SDK based relay chain that uses DOT as a native token and a single nominator per validator. Calculations of KSM reward payouts for Kusama follow the same formula. 

Start with the original validator set from the previous section: 

``` mermaid
flowchart TD
    A["Alice (18 DOT)"]
    B["Bob (9 DOT)"]
    C["Carol (8 DOT)"]
    D["Dave (7 DOT)"]
    E["Payout (8 DOT total)"]
    E --"2 DOT"--> A
    E --"2 DOT"--> B
    E --"2 DOT"--> C
    E --"2 DOT"--> D 
```

The preceding diagram shows each validator receiving a 2 DOT payout, but doesn't account for sharing rewards with nominators. The following diagram shows what nominator payout might look like for validator Alice. Alice has a 20% commission rate and holds 50% of the stake for their validator:

``` mermaid

flowchart TD
    A["Gross Rewards = 2 DOT"]
    E["Commission = 20%"]
    F["Alice Validator Payment = 0.4 DOT"]
    G["Total Stake Rewards = 1.6 DOT"]
    B["Alice Validator Stake = 18 DOT"]
    C["9 DOT Alice (50%)"]
    H["Alice Stake Reward = 0.8 DOT"]
    I["Total Alice Validator Reward = 1.2 DOT"]
    D["9 DOT Nominator (50%)"]
    J["Total Nominator Reward = 0.8 DOT"]
    
    A --> E
    E --(2 x 0.20)--> F
    F --(2 - 0.4)--> G
    B --> C
    B --> D
    C --(1.6 x 0.50)--> H
    H --(0.4 + 0.8)--> I
    D --(1.60 x 0.50)--> J
```

Notice the validator commission rate is applied against the gross amount of rewards for the era. The validator commission is subtracted from the total rewards. After the commission is paid to the validator, the remaining amount is split among stake owners according to their percentage of the total stake. A validator's total rewards for an era include their commission plus their piece of the stake rewards. 

Now, consider a different scenario for validator Bob where the commission rate is 40%, and Bob holds 33% of the stake for their validator:

``` mermaid

flowchart TD
    A["Gross Rewards = 2 DOT"]
    E["Commission = 40%"]
    F["Bob Validator Payment = 0.8 DOT"]
    G["Total Stake Rewards = 1.2 DOT"]
    B["Bob Validator Stake = 9 DOT"]
    C["3 DOT Bob (33%)"]
    H["Bob Stake Reward = 0.4 DOT"]
    I["Total Bob Validator Reward = 1.2 DOT"]
    D["6 DOT Nominator (67%)"]
    J["Total Nominator Reward = 0.8 DOT"]
    
    A --> E
    E --(2 x 0.4)--> F
    F --(2 - 0.8)--> G
    B --> C
    B --> D
    C --(1.2 x 0.33)--> H
    H --(0.8 + 0.4)--> I
    D --(1.2 x 0.67)--> J
```

Bob holds a smaller percentage of their node's total stake, making their stake reward smaller than Alice's. In this scenario, Bob makes up the difference by charging a 40% commission rate and ultimately ends up with the same total payment as Alice. Each validator will need to find their ideal balance between the amount of stake and commission rate to attract nominators while still making running a validator worthwhile.
