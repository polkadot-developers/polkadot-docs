---
title: Overview
description: TODO
---

# Governance Overview

Polkadot employs an advanced governance system designed to facilitate continuous, adaptable evolution directed by its community of stakeholders. 

This approach ensures that those holding the majority of stake retain control over the network’s direction.

At the core of Polkadot’s innovation are several novel mechanisms, including a flexible, on-chain state-transition function written in **WebAssembly** (a platform-agnostic language) and multiple on-chain voting methods, such as referenda and batch approval voting. 

Any protocol changes must gain approval through stake-weighted referenda, aligning network updates with the will of the community.

## Premise

Polkadot's initial governance system, **Governance V1**, consisted of three core components:

- **Technical Committee**: A technocratic body responsible for overseeing and managing the timelines for protocol upgrades.
- **Council**: An elected executive "government", chosen through approval voting, responsible for managing key parameters, administrative functions, and spending proposals.
- **Public**: Composed of all token holders, who participated directly in voting and referenda.

Over its initial years, **Governance V1** ensured responsible use of treasury funds and enabled timely protocol upgrades and fixes. Like many early-stage technologies, protocols must evolve as they mature to address limitations and align with modern advancements. 

**Governance V1**, however, had certain structural limitations: all referenda held equal weight, allowing only one to be voted on at a time (except in emergencies), and each voting period could extend over several weeks. 

Additionally, an alternating timetable permitted voting on either a public referendum or a council motion every 28 days (or 7 days on Kusama), which led to careful deliberation but limited the number of proposals considered.

**OpenGov** revises the mechanisms for day-to-day decision-making, enhancing the scope and agility of referenda outcomes. This change enables the system to handle a higher volume of collective decisions at any given time.

The following sections cover the key features of **OpenGov** and highlight its main distinctions from previous governance versions. 

!!!note
    Familiarity with [**Governance V1**](https://wiki.polkadot.network/docs/learn/learn-governance){target=\_blank} will provide valuable context for understanding the need for and direction of OpenGov. 

## OpenGov Summary

In **Governance V1**, network upgrade decisions were managed collaboratively by active token holders and the Council. 

Proposals, regardless of whether they originated from the public or the Council, ultimately required a referendum, allowing all token holders to participate in the decision-making process.

The Council acted as a representative body for the public, overseeing the treasury and initiating legislation. 

However, it was sometimes perceived as a centralized authority. To enhance decentralization, **OpenGov** introduces these primary changes:

- **Transferring all Council responsibilities to the public** through a direct democracy voting system.
- **Dissolving the Council** to eliminate the centralized decision-making body.
- **Expanding delegation options** so users can transfer voting power to trusted community members in various ways.
- **Replacing the Technical Committee** with the Polkadot Technical Fellowship, a broader, community-oriented group.

The diagram below provides an overview of the structure and changes introduced with Polkadot OpenGov.

![](/images/polkadot-protocol/onchain-governance/opengov-structure.webp)

### Origins and Tracks

In Polkadot OpenGov, **Origins** and **Tracks** are key components in the governance process:

An **Origin** defines the level of privilege or authorization a proposal has. It determines who can submit a proposal and what kind of proposal it is. For example, a proposal could come from a Treasury Origin for treasury-related requests, or from a Council Origin, which requires Council approval before voting.

A **Track** is the process or pipeline a proposal follows after submission. It outlines how the proposal is handled, including how long the voting period lasts and other procedural details. Each Origin is linked to a specific Track.

!!!note
    More on Tracks and Origins is explained on [this](link to Tracks and Origins page) page.

In Polkadot OpenGov, proposals are initiated by the public and enter a Lead-in period before following a specific **Track** with a dedicated **Origin**. There are [**15 Origins**](link to Origin & Tracks section), each with preset parameters that define the referendum’s duration and the number of simultaneous votes. 

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

![](/images/polkadot-protocol/onchain-governance/opengov-timeline.webp)

The figure above provides a summary view of the referenda timeline for Polkadot OpenGov.

### Lead-In Period

In **Lead-In Period**, a referendum opens for community voting as soon as it's created, but it cannot be finalized (with votes counted, approved, and enacted) until it passes a **Lead-in Period** and meets three criteria:

1. **Lead-in Period Duration:** Proposals must remain in the Lead-in Period for a minimum time to prevent "decision sniping," where a proposal could be rushed through by a party with significant voting power, limiting community participation.

2. **Origin Capacity:** Each origin has a limit on simultaneous proposals, with more powerful tracks allowing fewer. For instance, the Root level Origin only allows one proposal at a time.

3. **Decision Deposit:** While creating a referendum is low-cost, reviewing it requires a higher, refundable deposit to prevent spam and preserve limited queue space. Without this deposit, the referendum will timeout.

During the Lead-in Period, proposals remain undecided. Once all criteria are met, the referendum moves to the deciding state, and votes are counted toward the outcome.

### Decision Period

In **Decision Period** voting continues. To be approved, it must meet approval and support criteria throughout the **Confirmation Period**; otherwise, it is automatically rejected. Rejected proposals can be resubmitted indefinitely.

### Enactment Period

In Enactment Period approved proposals changes will be executed.

## Track Capacity

The length of the **Lead-in**, **Decision**, **Confirmation**, and **Enactment** periods varies by track, with the **Root Origin** track having longer periods than others. Additionally, each track has different limits on the number of referenda, with the **Root Origin track** accepting only one proposal at a time.

![](/images/polkadot-protocol/onchain-governance/opengov-track-capacityt.webp)

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
