---
title: On-Chain Governance Overview
description: Discover Polkadot’s cutting-edge OpenGov system, enabling transparent, decentralized decision-making through direct democracy and flexible governance tracks.
---

# On-Chain Governance 

## Introduction

Polkadot’s governance system exemplifies decentralized decision-making, empowering its community of stakeholders to shape the network’s future through active participation. The latest evolution, OpenGov, builds on Polkadot’s foundation by providing a more inclusive and efficient governance model.

This guide will explain the principles and structure of OpenGov and walk you through its key components, such as Origins, Tracks, and Delegation. You will learn about improvements over earlier governance systems, including streamlined voting processes and enhanced stakeholder participation.

With OpenGov, Polkadot achieves a flexible, scalable, and democratic governance framework that allows multiple proposals to proceed simultaneously, ensuring the network evolves in alignment with its community's needs.

## Governance Evolution

Polkadot’s governance journey began with [Governance V1](https://wiki.polkadot.network/docs/learn/learn-governance#governance-summary){target=\_blank}, a system that proved effective in managing treasury funds and protocol upgrades. However, it faced limitations, such as:

- Slow voting cycles, causing delays in decision-making
- Inflexibility in handling multiple referendums, restricting scalability

To address these challenges, Polkadot introduced OpenGov, a governance model designed for greater inclusivity, efficiency, and scalability. OpenGov replaces the centralized structures of Governance V1, such as the Council and Technical Committee, with a fully decentralized and dynamic framework.

For a full comparison of the historic and current governance models, visit the [Gov1 vs. Polkadot OpenGov](https://wiki.polkadot.network/docs/learn-polkadot-opengov#gov1-vs-polkadot-opengov){target=\_blank} section of the Polkadot Wiki.

## OpenGov Key Features

OpenGov transforms Polkadot’s governance into a decentralized, stakeholder-driven model, eliminating centralized decision-making bodies like the Council. Key enhancements include:

- **Decentralization** - shifts all decision-making power to the public, ensuring a more democratic process
- **Enhanced delegation** - allows users to delegate their votes to trusted experts across specific governance tracks
- **Simultaneous referendums** - multiple proposals can progress at once, enabling faster decision-making
- **Polkadot Technical Fellowship** - a broad, community-driven group replacing the centralized Technical Committee

This new system ensures Polkadot governance remains agile and inclusive, even as the ecosystem grows.

## Origins and Tracks

In OpenGov, origins and tracks are central to managing proposals and votes.

- **Origin** - determines the authority level of a proposal (e.g., Treasury, Root) which decides the track of all referendums from that origin
- **Track** - define the procedural flow of a proposal, such as voting duration, approval thresholds, and enactment timelines

Developers must be aware that referendums from different origins and tracks will take varying amounts of time to reach approval and enactment. The [Polkadot Technical Fellowship](https://wiki.polkadot.network/docs/learn-polkadot-technical-fellowship){target=\_blank} has the option to shorten this timeline by whitelisting a proposal and allowing it to be enacted through the [Whitelist Caller](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins#whitelisted-caller){target=\_blank} origin.

Visit [Origins and Tracks Info](https://wiki.polkadot.network/docs/learn-polkadot-opengov#origins-and-tracks){target=\_blank} for details on current origins and tracks, associated terminology, and parameters.

## Referendums

In OpenGov, anyone can submit a referendum, fostering an open and participatory system. The timeline for a referendum depends on the privilege level of the origin with more significant changes offering more time for community voting and participation before enactment. 

The timeline for an individual referendum includes four distinct periods:

- **Lead-in** - a minimum amount of time to allow for community participation, available room in the origin, and payment of the decision deposit. Voting is open during this period
- **Decision** - voting continues
- **Confirmation** - referendum must meet [approval and support](https://wiki.polkadot.network/docs/learn-polkadot-opengov#approval-and-support){target=\_blank} criteria during entire period to avoid rejection
- **Enactment** - changes approved by the referendum are executed

### Vote on Referendums

Voters can vote with their tokens on each referendum. Polkadot uses a voluntary token locking mechanism, called conviction voting, as a way for voters to increase their voting power. A token holder signals they have a stronger preference for approving a proposal based upon their willingness to lock up tokens. Longer voluntary token locks are seen as a signal of continual approval and translate to increased voting weight.

See [Voting on a Referendum](https://wiki.polkadot.network/docs/learn-polkadot-opengov#voting-on-a-referendum){target=\_blank} for a deeper look at conviction voting and related token locks.

### Delegate Voting Power

The OpenGov system also supports multi-role delegations, allowing token holders to assign their voting power on different tracks to entities with expertise in those areas. 

For example, if a token holder lacks the technical knowledge to evaluate proposals on the [Root track](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins#root){target=\_blank}, they can delegate their voting power for that track to an expert they trust to vote in the best interest of the network. This ensures informed decision-making across tracks while maintaining flexibility for token holders.

Visit [Multirole Delegation](https://wiki.polkadot.network/docs/learn-polkadot-opengov#multirole-delegation){target=\_blank} for more details on delegating voting power.

### Cancel a Referendum

Polkadot OpenGov has two origins for rejecting ongoing referendums: 

- [**Referendum Canceller**](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins#referendum-canceller){target=\_blank} - cancels an active referendum when non-malicious errors occur and refunds the deposits to the originators
- [**Referendum Killer**](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins#referendum-killer){target=\_blank} - used for urgent, malicious cases this origin instantly terminates an active referendum and slashes deposits

See [Cancelling, Killing, and Blacklisting](https://wiki.polkadot.network/docs/learn-polkadot-opengov#cancelling-killing--blacklisting){target=\_blank} for additional information on rejecting referendums.

## Additional Resources

- [**Democracy pallet**](https://github.com/paritytech/polkadot-sdk/tree/{{dependencies.repositories.polkadot_sdk.version}}/substrate/frame/democracy/src){target=\_blank} - handles administration of general stakeholder voting
- [**Gov2: Polkadot’s Next Generation of Decentralised Governance**](https://medium.com/polkadot-network/gov2-polkadots-next-generation-of-decentralised-governance-4d9ef657d11b){target=\_blank} - Medium article by Gavin Wood
- [**Polkadot Direction**](https://matrix.to/#/#Polkadot-Direction:parity.io){target=\_blank} -  Matrix Element client
- [**Polkassembly**](https://polkadot.polkassembly.io/){target=\_blank} - OpenGov dashboard and UI
- [**Polkadot.js Apps Governance**](https://polkadot.js.org/apps/#/referenda){target=\_blank} - overview of active referendums