---
title: Rewards Payout
description: Learn how validator rewards work on the network, including era points, payout distribution, running multiple validators, and nominator payments.
categories: Infrastructure
---

# Rewards Payout

## Introduction

Understanding how rewards are distributed to validators and nominators is essential for network participants. In Polkadot and Kusama, validators earn rewards based on their era points, which are accrued through actions like block production and parachain validation.

This guide explains the payout scheme, factors influencing rewards, and how multiple validators affect returns. Validators can also share rewards with nominators, who contribute by staking behind them. By following the payout mechanics, validators can optimize their earnings and better engage with their nominators.

## Era Points

The Polkadot ecosystem measures its reward cycles in a unit called an era. Kusama eras are approximately 6 hours long, and Polkadot eras are 24 hours long. At the end of each era, validators are paid proportionally to the amount of era points they have collected. Era points are reward points earned for payable actions like:

- Issuing validity statements for [parachain blocks](/reference/parachains/blocks-transactions-fees/blocks/){target=\_blank}.
- Producing a non-uncle block in the relay chain.
- Producing a reference to a previously unreferenced uncle block.
- Producing a referenced uncle block.

An uncle block is a relay chain block that is valid in every regard but has failed to become canonical. This can happen when two or more validators are block producers in a single slot, and the block produced by one validator reaches the next block producer before the others. The lagging blocks are called uncle blocks.

## Reward Variance

Rewards in Polkadot and Kusama staking systems can fluctuate due to differences in era points earned by para-validators and non-para-validators. Para-validators generally contribute more to the overall reward distribution due to their role in validating parachain blocks, thus influencing the variance in staking rewards.

To illustrate this relationship:

- Para-validator era points tend to have a higher impact on the expected value of staking rewards compared to non-para-validator points.
- The variance in staking rewards increases as the total number of validators grows relative to the number of para-validators.
- In simpler terms, when more validators are added to the active set without increasing the para-validator pool, the disparity in rewards between validators becomes more pronounced.

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

    Increased `v` is expected, and initially keeping `p` &#8595; using the same para-validator set for all parachains ensures availability and [voting](https://wiki.polkadot.com/learn/learn-polkadot-opengov/){target=\_blank}. In addition, despite `v` &#8593; on an `e` to `e` basis, over time, the amount of rewards each validator receives will equal out based on the continuous selection of para-validators.

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

This equal split applies to the era point reward pool shown above. Since Referendum [1909](https://polkadot.subsquare.io/referenda/1909){target=\_blank}, validators also receive a separate self-stake based payout that is not split equally. See [Types of Validator Payouts](#types-of-validator-payouts) for details.

## Types of Validator Payouts

Since Referendum [1909](https://polkadot.subsquare.io/referenda/1909){target=\_blank}, a validator's total reward for an era is made up of two separate payouts, each recorded as a distinct on chain event:

- **`Staking(Rewarded)`**: the validator's share of the era point reward pool described in the Payout Scheme section above. This pool is still split equally across all active validators, regardless of stake. Because validators no longer take a rate-based cut of this pool (see [Nominators and Validator Payments](#nominators-and-validator-payments)), a validator's own cut of this event depends only on the proportion of self-stake to total stake (self-stake plus nominator stake) backing their validator, the same as any nominator.
- **`Staking(ValidatorIncentivePaid)`**: a separate payout from the self-stake incentive portion of the [Dynamic Allocation Pool (DAP)](https://forum.polkadot.network/t/proposal-dynamic-allocation-pool-dap/15878){target=\_blank} budget. This payout is not part of the era point reward pool and does not depend on era points earned. Instead, it is distributed to validators proportionally to a weight derived from each validator's self-stake, so increasing self-stake increases this payout directly. See [Validator Self-Stake Incentive](#validator-self-stake-incentive) for details.

## Validator Self-Stake Incentive

Until Referendum [1890](https://polkadot.subsquare.io/referenda/1890){target=\_blank}, validators had no self-stake requirement, so the protocol did not require a minimum level of skin in the game from every validator. Referendum 1890 addressed this by introducing a 10,000 DOT minimum self-stake requirement for validators, described in [Minimum Validator Self-Stake](/node-infrastructure/run-a-validator/requirements/#minimum-validator-self-stake){target=\_blank}.

Referendum [1909](https://polkadot.subsquare.io/referenda/1909){target=\_blank} builds on that foundation by allocating part of the [Dynamic Allocation Pool (DAP)](https://forum.polkadot.network/t/proposal-dynamic-allocation-pool-dap/15878){target=\_blank} budget specifically to reward validators for self-stake. The DAP budget is split as follows:

- **45.2%** to staker rewards
- **22.6%** to the validator self-stake incentive
- **32.2%** held as a buffer

All active validators compete for the fixed self-stake incentive allocation (22.6% of the DAP budget), distributed proportionally to a weight derived from each validator's self-stake. The weight function is concave, meaning each additional DOT of self-stake adds a smaller amount of weight than the DOT before it. This prevents the incentive budget from being captured by a small number of validators with very large self-stakes, and keeps the incentive meaningful for validators closer to the 10,000 DOT minimum.

This incentive payout appears on chain as the `Staking(ValidatorIncentivePaid)` event, separate from the era point based `Staking(Rewarded)` payout described in [Types of Validator Payouts](#types-of-validator-payouts).

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

Splitting stake across multiple validators also affects the self-stake incentive payout described in [Validator Self-Stake Incentive](#validator-self-stake-incentive). Because the incentive weight function is concave, the combined weight of two validators with, for example, 9,000 DOT self-stake each is not simply equal to the weight of one validator with 18,000 DOT self-stake. Factor this into your decision when choosing how many validators to run and how to split self-stake between them.

## Nominators and Validator Payments

A nominator's stake allows them to vote for validators and earn a share of the rewards without managing a validator node. Although staking rewards depend on validator activity during an era, validators themselves never control or own nominator rewards. To trigger payouts, anyone can call the `staking.payoutStakers` or `staking.payoutStakerByPage` methods, which mint and distribute rewards directly to the recipients. This trustless process ensures nominators receive their earned rewards.

!!! note
    Following Referendum [1909](https://polkadot.subsquare.io/referenda/1909){target=\_blank}, validators no longer take a rate-based cut of nominator rewards. Any such rate is fixed on chain at **0%**, and the maximum allowed value was updated to match. See [Validator Compensation](/node-infrastructure/run-a-validator/requirements/#validator-compensation){target=\_blank} for details.

Because validators no longer take a rate-based cut, the era point reward pool is split with nominators purely by stake proportion. The following examples model how validator payments split between nominator and validator based only on stake proportion. For simplicity, these examples assume a Polkadot-SDK based relay chain that uses DOT as a native token and a single nominator per validator, and cover the `Staking(Rewarded)` payout only, not the separate self-stake incentive payout described in [Validator Self-Stake Incentive](#validator-self-stake-incentive). Calculations of KSM reward payouts for Kusama follow the same formula. 

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

The preceding diagram shows each validator receiving a 2 DOT payout, but doesn't account for sharing rewards with nominators. The following diagram shows what nominator payout might look like for validator Alice. Alice holds 50% of the stake for their validator:

``` mermaid

flowchart TD
    A["Gross Rewards = 2 DOT"]
    B["Alice Validator Stake = 18 DOT"]
    C["9 DOT Alice (50%)"]
    D["9 DOT Nominator (50%)"]
    H["Alice Stake Reward = 1 DOT"]
    J["Total Nominator Reward = 1 DOT"]

    A --> B
    B --> C
    B --> D
    C --(2 x 0.50)--> H
    D --(2 x 0.50)--> J
```

Notice the gross reward for the era is split directly among stake owners according to their percentage of the total stake, since no rate-based cut is taken out first. Alice's total reward for the era is this 1 DOT stake reward plus any separate self-stake incentive payout she earns, which is not shared with her nominator.

Now, consider a different scenario for validator Bob, who holds only 33% of the stake for their validator:

``` mermaid

flowchart TD
    A["Gross Rewards = 2 DOT"]
    B["Bob Validator Stake = 9 DOT"]
    C["3 DOT Bob (33%)"]
    D["6 DOT Nominator (67%)"]
    H["Bob Stake Reward = 0.67 DOT"]
    J["Total Nominator Reward = 1.33 DOT"]

    A --> B
    B --> C
    B --> D
    C --(2 x 0.33)--> H
    D --(2 x 0.67)--> J
```

Bob holds a smaller percentage of their node's total stake, so their stake reward is smaller than Alice's. Since there is no rate-based cut left to adjust, Bob cannot make up the difference that way. The only way for Bob to earn a larger total reward is to increase self-stake, which raises both the stake reward share shown here and the separate self-stake incentive payout described in [Validator Self-Stake Incentive](#validator-self-stake-incentive).
