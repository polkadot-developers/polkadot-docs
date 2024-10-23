---
title: Offenses and Slashes
description: Learn about the types of offenses, slashes, and "punishments" that apply when running a validator and how to avoid them.
---

# Offenses and Slashes

## Introduction

In Polkadot's Nominated Proof-of-Stake (NPoS) system, validator misconduct is deterred through a combination of slashing, disabling, and reputation penalties. Validators and nominators who stake tokens face consequences for validator misbehavior, which range from token slashes to restrictions on network participation.

This page outlines the types of offenses recognized by Polkadot, including block equivocations and invalid votes, as well as the corresponding penalties. While some parachains may implement their own economic slashing mechanisms, the focus in this guide is on the offenses tied to staking within the Polkadot ecosystem.

!!! info
    The disabling mechanism is triggered when validators commit serious infractions, such as backing invalid blocks or engaging in equivocations. This system has evolved, and the material in this guide reflects the changes introduced in Stage 2. For more details, refer to the [State of Disabling issue](https://github.com/paritytech/polkadot-sdk/issues/4359){target=\_blank} on GitHub.

## Overview of Offenses and Punishments

Polkadot is a public permissionless network. As such, it has a mechanism to disincentivize offenses and incentivize good behavior. Below, you can find a summary of punishments for specific offenses:

|               Offense                | [Slash (%)](#slashing) | [On-Chain Disabling](#disabling) | [Off-Chain Disabling](#disabling) | [Reputational Changes](#reputation-changes) |
|:------------------------------------:|:----------------------:|:--------------------------------:|:---------------------------------:|:-------------------------------------------:|
|           Backing Invalid            |          100%          |               Yes                |        Yes (High Priority)        |                     No                      |
|           ForInvalid Vote            |           -            |                No                |        Yes (Mid Priority)         |                     No                      |
|          AgainstValid Vote           |           -            |                No                |        Yes (Low Priority)         |                     No                      |
| GRANDPA / BABE / BEEFY Equivocations |       0.01-100%        |               Yes                |                No                 |                     No                      |
|    Seconded + Valid Equivocation     |           -            |                No                |                No                 |                     No                      |
|     Double Seconded Equivocation     |           -            |                No                |                No                 |                     Yes                     |

## Offenses

!!! tip
    To better understand the terminology used for offenses, getting familiar with the [parachain protocol](https://wiki.polkadot.network/docs/learn-parachains-protocol#parachain-protocol){target=\_blank} is recommended.

On Polkadot, there are six main validator offenses, as shown below:

- **Backing invalid** - a para-validator backs an invalid block
- **`ForInvalid` vote** - a validator (secondary checker) votes in favor of an invalid block
- **`AgainstValid` vote** - a validator (secondary checker) votes against a valid block, wasting network resources
- **Equivocation** - a validator produces two or more identical blocks or votes
- **GRANDPA and BEEFY equivocation** - a validator signs two or more votes in the same round on different chains
- **BABE equivocation** - a validator produces two or more blocks on the relay chain in the same time slot
- **Double seconded equivocation** - in a backing group of five para-validators, five backed parablocks are possible. Each parablock requires one seconded vote and at least two valid votes from the five potential backers, establishing an upper limit on the number of parablocks the system can manage while providing some flexibility for relay chain block authors. Backers must choose one parablock to second; seconding more than one incurs punishment. [Asynchronous backing](https://wiki.polkadot.network/docs/learn-async-backing){target=\_blank} complicates this by allowing backers to support blocks "into the future" optimistically rather than being restricted to one candidate per relay chain block. See the documentation on [Seconding Limit](https://paritytech.github.io/polkadot-sdk/book/node/backing/statement-distribution.html#seconding-limit){target=\_blank} for more information
- **Seconded and valid equivocation** - a malicious node seconds a vote, taking absolute responsibility for it, and then falsely claims it is correct after someone else has taken responsibility. Once conflicting votes are detected by the system, the offense is reported

### Equivocation

Equivocation occurs when a validator produces statements that conflict with each other. For instance, as a block author appointed by BABE, only a single block should be authored for the given slot, and if two or more are authored, they conflict with each other. This would be a BABE equivocation offense.

In BEEFY and GRANDPA, validators are expected to cast a single vote for the block they believe is the best. However, if they are found with two or more votes for different blocks, it means they tried to confuse the network with conflicting statements, and when this is discovered, it will be a BEEFY/GRANDPA equivocation offense.

Equivocations usually occur when duplicate signing keys reside on the validator host. If keys are never duplicated, the probability of an honest equivocation slash decreases to near zero.

## Punishments

On Polkadot, offenses to the network can be punished depending on severity. There are three main punishments: slashing, disabling, and reputation changes.

### Slashing

Slashing will happen if a validator misbehaves in the network. They and their nominators will get slashed and lose a percentage of their staked DOT/KSM, from as little as 0.01% up to 100%.

Any slashed DOT/KSM will be added to the [Treasury](https://wiki.polkadot.network/docs/learn-polkadot-opengov-treasury){target=\_blank}. The rationale for this (rather than burning or distributing them as rewards) is that slashes may be reverted by simply paying out from the Treasury. This would be useful in situations such as faulty slashes. In the case of legitimate slashing, tokens are moved away from malicious validators to those building the ecosystem through the normal Treasury process.

Slashing only occurs for active validations for a given nominator, and it isn't mitigated by other inactive or waiting nominations or by the validator operator running separate nodes. Each node is considered its own entity for slashing purposes.

!!! info "Multiple Active Nominations"
    In rare instances, with very large bonds, a nominator may actively nominate several validators in a single era. In this case, the slash is proportionate to the amount staked to that specific validator. Note that you cannot control the percentage of stake allocated to each validator or choose who your active validator will be (except in the trivial case of nominating a single validator). The [Phragmén algorithm](https://wiki.polkadot.network/docs/learn-phragmen#understanding-phragm%C3%A9n){target=\_blank} controls staking allocations.

Once a validator gets slashed, it goes into the state as an "unapplied slash." You can check this via [Polkadot.js Apps UI](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Frpc.polkadot.io#/staking/slashes){target=\_blank}. The UI shows it per validator, followed by all the affected nominators and the amounts. While unapplied, a governance proposal can be made to reverse it during a 27-day grace period, after which the slashes are applied.

A slash may occur under the circumstances below:

- **Equivocations** – a slash of 0.01% is applied with as little as a single evocation. The slashed amount increases to 100% incrementally as more validators also equivocate
- **Disputes** – may result from a validator trying to represent block's content falsely. Slashing penalties of 100% may apply

#### Slash for Equivocation

The following offense levels are defined in the [Slashing Mechanisms](https://research.web3.foundation/Polkadot/security/slashing/amounts){target=\_blank} page of the Web3 Foundation research repository.

These particular levels aren't implemented or referred to in the code or the system. They are meant as guidelines for different levels of severity for offenses.

- **Level 1** - isolated equivocation slashes a minimal amount of the stake
- **Level 2** - misconducts that are unlikely accidental but don't harm the network's security to any large extent. Examples include concurrent equivocation or isolated cases of unjustified voting in [GRANDPA](https://wiki.polkadot.network/docs/learn-consensus#finality-gadget-grandpa){target=\_blank}. Slashes a moderately small amount of the stake
- **Level 3** - misconduct that poses severe security or monetary risk to the system or mass collusion. Slashes all or most of the stake behind the validator

The following are scenarios that build towards slashes under equivocation:

- **Server cloning** - avoid cloning servers (copying all contents) when migrating to new hardware. If an image is needed, create it before generating keys
- **High Availability (HA) systems** – equivocation may occur if concurrent operations happen—such as when a failed server restarts or two servers are falsely online simultaneously. HA systems should be used with extreme caution and are generally not recommended
- **Keystore folder duplication** - copying the keystore folder when moving a database between instances can cause equivocation. Even brief use of duplicated keystores can result in slashing, leading to a loss of nominators and funds, removal from the Thousand Validator Programme, and reputational damage

See the next section to understand how slash amounts for equivocations are calculated. If you want to know more details about slashing, please look at the research page on [Slashing mechanisms](https://research.web3.foundation/Polkadot/security/slashing/amounts){target=\_blank}.

#### Slash Calculation for Equivocation

The slashing penalty for GRANDPA, BABE, and BEEFY equivocations is calculated using the formula below, where `x` represents the number of offenders and `n` is the total number of validators in the active set:

```text
min((3 * x / n )^2, 1)
```

For example, assume that there are 100 validators in the active set, and one equivocates in a slot (it doesn't matter whether it was a BABE or GRANDPA equivocation). This is unlikely to be an attack on the network but much more likely to be a misconfiguration of a validator. The penalty would be min(3 \* 1 / 100)^2, 1) = 0.0009, or a 0.09% slash for that validator (the stake held by the validator and its nominators).

Now, assume that a group is running several validators, and they all have an issue in the same slot. The penalty would be min((3 \* 5 / 100)^2, 1) = 0.0225, or a 2.25% slash. If 20 validators equivocate, this is a much more serious offense, possibly indicating a coordinated attack on the network. So, the slash will be much greater - min((3 \* 20 / 100)^2, 1) = 0.36, or a 36% slash on all these validators and their nominators. All slashed validators will also be chilled.

The example above shows the risk of nominating or running many validators in the active set. While rewards grow linearly (two validators will get you approximately twice as many staking rewards as one), slashing grows exponentially. A single validator equivocating causes a 0.09% slash, and two validators equivocating doesn't cause a 0.09 \* 2 = 0.18% slash, but rather a 0.36% slash - 4x as much as the single validator.

Validators may run their nodes on multiple machines to ensure they can still perform validation work if one of their nodes goes down. Still, validator operators should be cautious when setting these up. Equivocation is possible if they don't coordinate well in managing signing machines.

#### Good Practices to Avoid Slashing

The following are advised to node operators to ensure that they obtain pristine binaries or source code and to ensure the security of their node:

- Always download either source files or binaries from the official Parity repository
- Verify the hash of downloaded files
- Use the W3F secure validator setup or adhere to its principles
- Ensure essential security items are checked, use a firewall, manage user access, use SSH certificates
- Avoid using your server as a general-purpose system. Hosting a validator on your workstation or one that hosts other services increases the risk of maleficence

Below are some examples of small equivocations that happened in the past:

| Network  | Era  | Event Type         | Details                                                                                                                                                                                                                                                                                                                                                             | Action Taken                                                                                                                      |
|----------|------|--------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------|
| Polkadot | 774  | Small Equivocation | [The validator](https://matrix.to/#/!NZrbtteFeqYKCUGQtr:matrix.parity.io/$165562246360408hKCfC:matrix.org?via=matrix.parity.io&via=corepaper.org&via=matrix.org){target=\_blank} migrated servers and cloned the keystore folder. The on-chain event can be viewed on [Subscan](https://polkadot.subscan.io/extrinsic/11190109-0?event=11190109-5){target=\_blank}. | The validator didn't submit a request for the slash to be canceled.                                                               |
| Kusama   | 3329 | Small Equivocation | The validator operated a test machine with cloned keys. The test machine was online simultaneously as the primary, which resulted in a slash. Details can be found on [Polkassembly](https://kusama.polkassembly.io/post/1343){target=\_blank}.                                                                                                                   | The validator requested a slash cancellation, but the council declined.                                                           |
| Kusama   | 3995 | Small Equivocation | The validator noticed several errors, after which the client crashed, and a slash was applied. The validator recorded all events and opened GitHub issues to allow for technical opinions to be shared. Details can be found on [Polkassembly](https://kusama.polkassembly.io/post/1733){target=\_blank}.                                                           | The validator requested to cancel the slash. The council approved the request as they believed the error wasn't operator-related. |

#### Slashing Across Eras

There are three main difficulties to account for with slashing in NPoS:

- A nominator can nominate multiple validators and be slashed via any of them
- Until slashed, the stake is reused from era to era. Nominating with N coins for E eras in a row doesn't mean you have N\*E coins to be slashed - you've only ever had N
- Slashable offenses can be found after the fact and out of order

To balance this, the system applies only the maximum slash a participant can receive in a given time period rather than the sum. This ensures protection from overslashing.

### Disabling

Disabling stops validators from performing specific actions after they have committed an offense. Disabling is further divided into:

- **On-chain disabling** - lasts for a whole era and stops validators from authoring blocks, backing, and initiating a dispute
- **Off-chain disabling** - lasts for a session, is caused by losing a dispute, and stops validators from initiating a dispute

Off-chain disabling is always a lower priority than on-chain disabling. Off-chain disabling prioritizes disabling first backers and then approval checkers.

### Reputation Changes

Some minor offenses often connected to spamming are only punished by Networking Reputation Changes. When validators connect to each other, they use a reputation metric for each of their peers. If peers provide valuable data and behave appropriately, the system adds reputation. If they provide faulty or spam data, the system reduces their reputation. A validator can lose enough reputation so that the peers will temporarily close their channels. This helps in fighting against DoS (Denial of Service) attacks. The consequences of closing channels may vary. In general, performing validator tasks under reduced reputation will be harder, resulting in lower validator rewards.
