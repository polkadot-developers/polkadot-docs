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

In Governance V1, network upgrade decisions were managed collaboratively by active token holders and the Council. 

Proposals, regardless of whether they originated from the public or the Council, ultimately required a referendum, allowing all token holders to participate in the decision-making process.

The Council acted as a representative body for the public, overseeing the treasury and initiating legislation. 

However, it was sometimes perceived as a centralized authority. To enhance decentralization, **OpenGov** introduces these primary changes:

- **Transferring all Council responsibilities to the public** through a direct democracy voting system.
- **Dissolving the Council** to eliminate the centralized decision-making body.
- **Expanding delegation options** so users can transfer voting power to trusted community members in various ways.
- **Replacing the Technical Committee** with the Polkadot Technical Fellowship, a broader, community-oriented group.

The diagram below provides an overview of the structure and changes introduced with Polkadot OpenGov.

![](/images/polkadot-protocol/onchain-governance/opengov-structure.webp)

