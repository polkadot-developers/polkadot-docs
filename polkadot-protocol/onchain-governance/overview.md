---
title: On-Chain Governance Overview
description: Explore Polkadot’s advanced governance model, OpenGov, where direct democracy, flexible voting options, and stakeholder participation drive network evolution.
---

# On-Chain Governance 

## Introduction

Polkadot employs an advanced governance system designed to facilitate continuous, adaptable evolution directed by its community of stakeholders. 

This approach ensures that those holding the majority of stake retain control over the network’s direction.

The Polkadot blockchain incorporates a powerful on-chain governance mechanism, empowering the community to actively participate in decision-making and shape the network's future through decentralized, on-chain processes.

Any protocol changes must gain approval through stake-weighted referenda, aligning network updates with the will of the community.

## Premise

Polkadot's initial governance system, **Governance V1**, successfully managed treasury funds and protocol upgrades through its **Technical Committee**, **Council**, and **Public**, but it faced structural limitations. 

These included slow voting cycles and the inability to handle multiple referenda simultaneously, restricting the system's flexibility and scalability.

!!!note
    You can find detailed information about Polkadot's first governance system on the [Governance V1 Wiki](https://wiki.polkadot.network/docs/learn/learn-governance){target=\_blank} page. 

## OpenGov

**OpenGov** is an improved governance model that prioritizes openness and active participation from stakeholders, making decision-making more democratic and effective.

It updates the decision-making process to improve how referenda outcomes are managed, making them more flexible and efficient. This allows the system to handle more decisions collectively and simultaneously.

The following sections cover the key features of **OpenGov** and highlight its main distinctions from previous governance versions. 

### OpenGov Summary

**OpenGov** improves on its predecesor by introducing these changes:

- **Transferring all Council responsibilities to the public** through a direct democracy voting system
- **Dissolving the Council** to eliminate the centralized decision-making body.
- **Expanding delegation options** so users can transfer voting power to trusted community members in various ways
- **Replacing the Technical Committee** with the Polkadot Technical Fellowship, a broader, community-oriented group

The diagram below provides an overview of the structure and changes introduced with Polkadot OpenGov.

![](/images/polkadot-protocol/onchan-governance/opengov-structure.webp)

### Origins and Tracks

In Polkadot OpenGov, **Origins** and **Tracks** are key components in the governance process:

- **Origin** defines the privilege level or authorization of a proposal. It determines who can submit a proposal and what kind of proposal it is. For example, a proposal could come from a `Treasury Origin` for treasury-related requests or from a `Council Origin`, which requires `Council` approval before voting
- **Track** - process that a proposal follows after submission. It outlines how the proposal is handled, including how long the voting period lasts and other procedural details. Each `Origin` is linked to a specific `Track`

!!!note
    More on Tracks and Origins is explained on [this](TODO:update-path) page.

In Polkadot OpenGov, proposals are initiated by the public and enter a Lead-in period before following a specific **Track** with a dedicated **Origin**. There are [**15 Origins**](TODO:update-path), each with preset parameters that define the referendum’s duration and the number of simultaneous votes. 

For example, treasury proposals are submitted to different tracks based on the amount requested. A proposal for a small tip will need to be submitted to the Small Tipper track, while a proposal requiring substantial funds will need to be submitted to the Medium or Big Spender track.

The [**Polkadot Technical Fellowship**](https://wiki.polkadot.network/docs/learn-polkadot-technical-fellowship){target=\_blank} can choose to whitelist a proposal, allowing it to be enacted through the **Whitelist Caller** origin. Proposals under this origin benefit from shorter **Lead-in, Confirmation, and Enactment** periods compared to those using the **Root Origin** track.

Each Track has its own preset **Approval** and **Support** curves, which depend on the privileges of the origin. 

When both **Approval** and **Support** criteria are met for a specific time (the confirmation period), the referendum passes and will be executed after the enactment period.

### Voting Power Delegation

In Polkadot OpenGov, referenda across all tracks can be voted on simultaneously, as long as the track's maximum capacity is not reached.

The system also supports **multi-role delegations**, allowing token holders to assign their voting power on different tracks to entities with expertise in those areas. 

For example, if a token holder lacks the technical knowledge to evaluate proposals on the **Root Track**, they can delegate their voting power for that track to a trusted expert who will vote in the best interest of the network. 

This allows token holders to participate in governance without needing to stay up-to-date on all matters, as their votes can still count through their delegates.

## Referenda

**In Polkadot OpenGov, all referenda are public**, and anyone can submit a referendum at any time, as often as they wish. 

Key features have been expanded and improved, particularly **Origins** and **Tracks**, which streamline the processing and flow of proposals. Additionally, the **Technical Fellowship** has the option to whitelist certain referenda, allowing them to be proposed in the track associated with the **Whitelist Caller** origin.

### Referenda Timeline

![](/images/polkadot-protocol/onchan-governance/opengov-timeline.webp)

The figure above provides a summary view of the referenda timeline for Polkadot OpenGov.

### Lead-In Period

In **Lead-In Period**, a referendum opens for community voting as soon as it's created, but it cannot be finalized (with votes counted, approved, and enacted) until it passes a **Lead-in Period** and meets three criteria:

1. **Lead-in Period Duration** - proposals must remain in the Lead-in Period for a minimum time to prevent "decision sniping," where a proposal could be rushed through by a party with significant voting power, limiting community participation.

2. **Origin Capacity** - each origin has a limit on simultaneous proposals, with more powerful tracks allowing fewer. For instance, the Root level Origin only allows one proposal at a time

3. **Decision Deposit** - while creating a referendum is low-cost, reviewing it requires a higher, refundable deposit to prevent spam and preserve limited queue space. Without this deposit, the referendum will timeout

During the Lead-in Period, proposals remain undecided. Once all criteria are met, the referendum moves to the deciding state, and votes are counted toward the outcome.

### Decision Period

In **Decision Period** voting continues. To be approved, it must meet approval and support criteria throughout the **Confirmation Period**; otherwise, it is automatically rejected. Rejected proposals can be resubmitted indefinitely.

### Enactment Period

In Enactment Period approved proposals changes will be executed.

## Track Capacity

The length of the **Lead-in**, **Decision**, **Confirmation**, and **Enactment** periods varies by track, with the **Root Origin** track having longer periods than others. Additionally, each track has different limits on the number of referenda, with the **Root Origin track** accepting only one proposal at a time.

![](/images/polkadot-protocol/onchan-governance/opengov-track-capacityt.webp)

This impacts the number of proposals that can be voted on and executed simultaneously. The **Small Tipper track** allows many proposals at once, while the **Root track** only allows one. 

Once a track’s capacity is reached, additional proposals in the **Lead-in Period** will queue until space becomes available to enter the **Decision Period**.

## Voluntary Locking (Conviction Voting)

Polkadot uses voluntary locking, enabling token holders to increase their voting power by declaring how long they are willing to lock up their tokens. The number of votes for each holder is then calculated using the following formula:

`votes = tokens * conviction_multiplier`

The conviction multiplier increases the vote multiplier by one every time the number of lock periods double.

| Lock Periods | Vote Multiplier | Length in Days |
|--------------|-----------------|----------------|
| 0            | 0.1             |                |
| 1            | 1               |                |
| 2            | 2               |                |
| 4            | 3               |                |
| 8            | 4               |                |
| 16           | 5               |                |
| 32           | 6               |                |

!!!note
    The maximum lock period "doubling" is capped at 6, resulting in a maximum of 32 lock periods. For more on governance event timelines, see the governance section on the [Polkadot Parameters page](https://wiki.polkadot.network/docs/maintain-polkadot-parameters#governance){target=\_blank}.

Votes are always counted at the end of the voting period, regardless of lock duration.

Here’s an example of voluntary locking in action: 

- Peter: Votes "**No**" with **10 DOT** locked for **32 weeks → 10 x 6 = 60 votes**
- Logan: Votes "**Yes**" with **20 DOT** locked for **1 week → 20 x 1 = 20 votes**
- Kevin: Votes "**Yes**" with **15 DOT** locked for **2 weeks → 15 x 2 = 30 votes**

Even though both **Logan** and **Kevin** vote with more DOT than **Peter**, the lock period for both of them is less than Peter’s. Longer lock period gives Peter greater voting power.

!!!note "Staked tokens can be used in governance"
    While the tokens are locked, you can still use them for **voting** and **staking**. You are only prohibited from transferring these tokens to another account. See the section about [OpenGov locks](#link to subsection), and learn more about locks on the Balances page.

## Approval and Support

The figure below summarizes the approval and support system during the **Decision Period**.

![](/images/polkadot-protocol/onchan-governance/opengov-curves-pass.webp)

Once a proposal exits the **Lead-in Period** and enters the **Voting Period**, it must meet both **`approval`** and **`support thresholds`** for the **Confirmation Period** to pass.

**Approval:** The percentage of conviction-weighted **"aye"** votes against the total of conviction-weighted "aye" and "nay" votes.

**Support:** The proportion of **"aye"** and **"abstain"** votes (unweighted by conviction) against the total possible votes (active issuance). In cases of split votes, only **"aye"** and **"abstain"** are counted.

**Example:** Suppose total active issuance is 100 DOT:

- Account A votes "Aye" with 10 DOT at 4x conviction

- Account B votes "Nay" with 5 DOT at 2x conviction

- Account C votes "Abstain" with 20 DOT (no conviction applies to abstain)

With only 35 DOT participating, the values are calculated as follows:

`Approval = Aye' / (Aye' + Nay’) = (10 × 4) / (10 × 4 + 5 × 2) = 40 / 50 = 80%`

`Support = (Aye + Abstain) / (Total Active Issuance) = (10 + 20) / 100 = 30%`

!!!note "Nay votes are not counted towards Support"
    Support reflects voters who voted **"aye"** or chose to **"abstain"** excluding **"nay"** votes to avoid unintended outcomes. 
    
    This setup ensures that a **"nay"** vote cannot inadvertently push a referendum into the confirming state by raising support above the threshold without lowering approval.

The figure illustrates the following points:

1. A proposal enters the confirmation period only when both approval and support thresholds are met. Even if approval is above the approval curve, the proposal will wait until support also surpasses the support curve

2. If a referendum holds the approval and support thresholds for the entire confirmation period, it’s approved and scheduled for enactment. Tracks like Root enforce longer Enactment Periods to allow time for network adjustments, although proposers can opt for a longer enactment period

3. The confirmation clock resets if the referendum exits the confirmation period (e.g., due to new "nay" votes). For instance, if it exits after 5 minutes in a 20-minute confirmation period, it must complete a fresh 20-minute confirmation upon re-entry

4. Should a referendum meet thresholds at the end of the decision period, it can still pass if confirmed through the entire track-specific confirmation period. Otherwise, it’s rejected if it exits confirmation after the decision period ends

5. The approval curve starts at 100%, decreasing to a minimum of 50%. For a proposal to pass, weighted support must stay above 50%, assuming all tokens are actively voted

Tracks for different **Origins** have unique **Confirmation Periods** and distinct approval and support requirements.

Proposals using lower-privilege origins can often reach the required support more easily, while higher-privilege origins, like `Root`, maintain stricter support requirements.

## Enactment

In Polkadot OpenGov, the proposer suggests the enactment period, but there is also a minimum set for each Origin Track. 

For example, `Root` origin approvals require an extended period because of the importance of the changes they bring to the network.

## Cancelling, Killing & Blacklisting

Polkadot OpenGov has two origins for rejecting ongoing referenda: 

1. [Referendum Canceller](link to Tracks and Origins page)

2. [Referendum Killer](link to Tracks and Origins page)

**Referendum Canceller** cancels an active referendum, refunding the **Submission** and **Decision Deposits** to the originators. This is useful when non-malicious errors occur, like mistakes in the preimage. With a lower **Decision Period**, it requires less stringent **Approval** and **Support** criteria to enable quick action.

**Referendum Killer** instantly terminates an active referendum, **slashing** both **Submission** and **Decision** deposits. This option is used for urgent, malicious cases—such as when a referendum on the `Root` track could disrupt the network’s runtime. Its high **Decision Deposit** deters misuse, ensuring only critical actions take place. A second Referendum Killer referendum can also be used to terminate a prior Referendum Killer.

## Voting on Referendum

As a voter, you’ll use your tokens to vote on each referendum individually.

In Polkadot OpenGov, you can **"abstain"** or use vote splitting, allowing you to allocate portions of your tokens to **"aye"**, **"nay"**, and **"abstain"** simultaneously. 

Conviction voting is not available when abstaining or splitting votes.

!!!note "Only the last vote counts"
    If you vote a second time, it replaces your original vote. For example, if you first vote with 10 DOT, then submit a second vote with 5 DOT, only the latest vote counts, meaning you’re now voting with 5 DOT, not 10 DOT.

Note that to successfully cast votes you need to have the [existential deposit](add link to Existential deposit in Accounts section) and some additional funds to pay for transaction fees.

In general, you can remove your vote:

- While a referendum is ongoing (your vote does not count)
- After a referendum ended (your vote counts)

If you voted without conviction, there's no conviction lock in either case. If you voted with conviction, you only get a conviction lock if the referendum ended and you voted with the winning side.

Check diagram below for more information:

![](/images/polkadot-protocol/onchan-governance/voting-locks.webp)

### Voting Without Conviction

If you vote without conviction and the referendum is still ongoing, you can remove your vote and immediately unlock your tokens. 

If the referendum has ended, you can also remove your vote and unlock your tokens right away, regardless of whether you supported the winning or losing side. 

The governance app or interface you used to participate in Polkadot OpenGov will provide an option to unlock your tokens.

### Voting With Conviction

If you vote with conviction, the following applies:

- **Referendum is ongoing** - you can remove your vote and unlock your tokens immediately
- **Referendum ended (losing side)** - you can remove your vote and unlock your tokens immediately
- **Referendum ended (winning side)** - a conviction lock will be applied

Conviction locks are calculated from when the referendum ends but applied when you remove your vote. 

For example, if you voted with 10 DOT at 1x conviction and are on the winning side, your tokens will be locked for 7 days after the referendum ends. If you remove your vote 3 days after the referendum ends, your tokens will be locked for an additional 4 days. If you remove your vote on the 8th day, your tokens are unlocked immediately.

If you voted on multiple referenda and were on the winning side of all of them, you’ll accumulate multiple conviction locks. However, the locks do not stack—only the longest lock applies. 

So, if you used the same conviction and the same number of tokens, once the latest conviction lock expires, you can unlock all your tokens, even if earlier locks have expired in the meantime.

![](/images/polkadot-protocol/onchan-governance/voting-locks-2.webp)

### Multirole Delegation

When you delegate your votes, the locking mechanism differs slightly.

Voters in Polkadot OpenGov can delegate their voting power to others using multirole delegation, allowing them to assign different delegates for each class of referendum. 

Delegation can be set per track, so a voter might choose one delegate for less impactful referenda and another for more important ones, while retaining full voting power for other classes.

Unlike solo voting, conviction locks are applied as soon as you undelegate, even if your delegated votes were not used. 

If your votes were used in any ongoing referenda, they are removed from those referenda when you undelegate. After undelegating, you can delegate to a new person or modify your delegation, with wallets and extensions providing an interface to do this seamlessly.

If you delegate without conviction, you can immediately unlock your tokens once you undelegate. You can also modify your delegation at any time after undelegating.

See figure below:

![](/images/polkadot-protocol/onchan-governance/delegation-locks-1.webp)

If you delegate with 1x conviction, then undelegate and re-delegate with 2x conviction, you will create two conviction locks: 

1. One for the 1x conviction
2. One for the 2x conviction 

If you later undelegate again after re-delegating with 1x conviction, you will receive a second 1x conviction lock. 

However, the 2x conviction lock will determine when your tokens can be unlocked, as it has the longest lock duration. 

The most recent conviction lock will always govern the unlock time, regardless of previous conviction locks.

![](/images/polkadot-protocol/onchan-governance/delegation-locks-2.webp)

!!!note "Before delegating a specific track, you must remove any vote on that track"
    If the account delegated votes to different delegates using different convictions, then after undelegating those delegates, there will be different unlocking periods with lengths dependent on the conviction multipliers.

It’s important to note that **delegating voting power does not give the delegate control over the delegator’s funds**. 

The delegate can only vote on the specified tracks using the delegator's voting power, but they cannot transfer balances, change validator nominations, or execute any actions other than voting.

The purpose of delegations is to ensure that proposals meet the required support for enactment while maintaining a censorship-free design. 

Delegations also help voters who may lack the technical expertise to evaluate certain referenda or simply don’t have the time to engage with all the proposals. By delegating their voting power to trusted entities, voters can participate in OpenGov in a more hands-off manner.

## Resources

- [Democracy pallet](https://github.com/paritytech/polkadot-sdk/tree/master/substrate/frame/democracy/src){about=|_blank}
- [Governance v2](https://medium.com/polkadot-network/gov2-polkadots-next-generation-of-decentralised-governance-4d9ef657d11b){about=|_blank}
- [Polkadot Direction](https://matrix.to/#/#Polkadot-Direction:parity.io){about=|_blank}
- [PolkAssembly](https://polkadot.polkassembly.io/){about=|_blank}
- [PolkadotJS Governance](https://polkadot.js.org/apps/#/referenda){about=|_blank}