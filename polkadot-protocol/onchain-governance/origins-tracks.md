---
title: Origins and Tracks
description: Learn about the Origins and Tracks in Polkadot's OpenGov, explaining the privilege levels and decision-making processes.
---

# Origins and Tracks

## Introduction

In Polkadot's OpenGov system, as outlined in the [OpenGov Overview](/polkadot-protocol/onchain-governance/overview/){target=\_blank}, an `Origin` represents a specific level of privilege, guiding the decision-making process for all referenda associated with it. Each `Origin` dictates the `Track` through which proposals are processed—tracks that operate independently of one another, ensuring that decisions are handled according to the unique needs of each proposal. 

Proposers choose the appropriate `Origin` based on the nature and requirements of their proposal, ensuring that the governance process remains efficient and structured.

## Track Parameters

While the Track structure is consistent across all `Origins`, the parameters for each `Track` can vary. These parameters include:

1. **Maximum deciding capacity** - defines the limit on the number of referenda that can be decided simultaneously, corresponding to the number of tracks within each origin
2. **Decision deposit** - specifies the funds required to be deposited for a proposal to enter the decision period (additional requirements must also be met to proceed)
3. **Preparation period** - represents the minimum voting duration required before a proposal can enter the decision period, provided capacity and deposit conditions are satisfied
4. **Decision period** - the time frame during which the outcome of a proposal is determined
5. **Confirmation period** - denotes the minimum duration during which approval and support thresholds must be sustained for a proposal to proceed to the enactment period. The confirmation period should begin before the decision period ends
6. **Voting period** - encompasses the entire duration during which voting is permitted on a referendum, including the preparation, decision, and confirmation periods
7. **Minimum enactment period** - establishes the minimum wait time before the approved changes are implemented
8. **Approval curve** - illustrates the minimum percentage of aye votes required over time within the decision period. The approval percentage is calculated as the proportion of aye votes (adjusted for conviction) relative to the total votes (`aye`, `nay`, and `abstained`)
9. **Support curve** - depicts the minimum percentage of total votes in favor of a proposal over time during the decision period. Support percentage is defined as the proportion of aye and abstained votes (without conviction) relative to the system's total possible votes (i.e., the active issuance)

For instance, a runtime upgrade (requiring a [`set_code`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/dispatchables/fn.set_code.html){target=\_blank} call) has far-reaching implications for the ecosystem compared to the approval of a treasury tip (via a [`report_awesome`](https://paritytech.github.io/polkadot-sdk/master/pallet_tips/pallet/dispatchables/fn.report_awesome.html){target=\_blank} call). As a result, distinct `Origins` are assigned for these actions, each with predefined parameters such as deposits, support, approval thresholds, and minimum enactment periods tailored to their specific requirements.

!!!note
    More information about terminology and parameters can be found on the [OpenGov Origins Wiki](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins){target=\_blanck} page.

In the table below you can find all `Origins` and its `Tracks` on the Polkadot chain:

| **ID** | **Origin**               | Max Deciding | Decision Deposit | Prepare Period | Decision Period | Confirm Period | Min Enactment Period | Min Approval      | Min Support       |
|--------|--------------------------|--------------|------------------|----------------|-----------------|----------------|----------------------|-------------------|-------------------|
| **0**  | **Root**                 | 1            | 100000 DOT       | 2 Hours        | 28 Days         | 1 Day          | 1 Day                | Reciprocal        | Linear Decreasing |
| **1**  | **Whitelisted Caller**   | 100          | 10000 DOT        | 30 Minutes     | 28 Days         | 10 Minutes     | 10 Minutes           | Reciprocal        | Reciprocal        |
| **2**  | **Wish For Change**      | 10           | 20000 DOT        | 2 Hours        | 28 Days         | 1 Day          | 10 Minutes           | Reciprocal        | Linear Decreasing |
| **10** | **Staking Admin**        | 10           | 5000 DOT         | 2 Hours        | 28 Days         | 3 Hours        | 10 Minutes           | Linear Decreasing | Reciprocal        |
| **11** | **Treasurer**            | 10           | 1000 DOT         | 2 Hours        | 28 Days         | 7 Days         | 1 Day                | Reciprocal        | Linear Decreasing |
| **12** | **Lease Admin**          | 10           | 5000 DOT         | 2 Hours        | 28 Days         | 3 Hours        | 10 Minutes           | Linear Decreasing | Reciprocal        |
| **13** | **Fellowship Admin**     | 10           | 5000 DOT         | 2 Hours        | 28 Days         | 3 Hours        | 10 Minutes           | Linear Decreasing | Reciprocal        |
| **14** | **General Admin**        | 10           | 5000 DOT         | 2 Hours        | 28 Days         | 3 Hours        | 10 Minutes           | Reciprocal        | Reciprocal        |
| **15** | **Auction Admin**        | 10           | 5000 DOT         | 2 Hours        | 28 Days         | 3 Hours        | 10 Minutes           | Reciprocal        | Reciprocal        |
| **20** | **Referendum Canceller** | 1,000        | 10000 DOT        | 2 Hours        | 7 Days          | 3 Hours        | 10 Minutes           | Linear Decreasing | Reciprocal        |
| **21** | **Referendum Killer**    | 1,000        | 50000 DOT        | 2 Hours        | 28 Days         | 3 Hours        | 10 Minutes           | Linear Decreasing | Reciprocal        |
| **30** | **Small Tipper**         | 200          | 1 DOT            | 1 Minute       | 7 Days          | 10 Minutes     | 1 Minute             | Linear Decreasing | Reciprocal        |
| **31** | **Big Tipper**           | 100          | 10 DOT           | 10 Minutes     | 7 Days          | 1 Hour         | 10 Minutes           | Linear Decreasing | Reciprocal        |
| **32** | **Small Spender**        | 50           | 100 DOT          | 4 Hours        | 28 Days         | 2 Days         | 1 Day                | Linear Decreasing | Reciprocal        |
| **33** | **Medium Spender**       | 50           | 200 DOT          | 4 Hours        | 28 Days         | 4 Days         | 1 Day                | Linear Decreasing | Reciprocal        |
| **34** | **Big Spender**          | 50           | 400 DOT          | 4 Hours        | 28 Days         | 7 Days         | 1 Day                | Linear Decreasing | Reciprocal        |

## Origins

`Origin` is a key feature in Polkadot's OpenGov system, designed to organize and manage how decisions are made on the network. It ensures that every type of proposal, big or small, follows the right process, balancing the need for security with inclusivity and efficiency.

An `Origin` is a classification system that determines the rules for handling different types of proposals. Think of an `Origin` as a “decision category” where each has its own set of rules, privileges, and workflows. These rules govern how a proposal moves through the decision-making process, from submission to implementation.

For example:

- **High-privilege Origins** - like the `Root Origin`, are used for critical proposals that could significantly affect the entire network, such as upgrading the blockchain's core software
- **Lower-privilege Origins** - like `Treasury Origins`, deal with smaller decisions like funding a community project or tipping a contributor

Each `Origin` has a corresponding `Track`, which acts as a pathway for proposals to progress through the governance process. `Tracks` are independent, allowing decisions in one track to move forward without interfering with others.

### How Origin Works

The `Origin` system streamlines governance by categorizing proposals based on their significance, assigning each proposal to an appropriate `Origin` that sets the privilege level and procedural rules.

Each `Origin` corresponds to a distinct `Track`, guiding proposals through various stages—such as submission, voting, and enactment—while ensuring these processes remain independent of each other.

With customized parameters, each `Origin` defines key aspects of the proposal process, such as the maximum number of concurrent proposals (capacity), required deposits, and specific timeframes for preparation, voting, and confirmation.

Dynamic `Approval` and `Support` thresholds adapt based on the nature of the proposal, maintaining a fair and secure process. High-privilege `Origins`, like `Root`, impose stricter approval conditions and longer timelines due to their greater impact. On the other hand, lower-privilege `Origins`, such as `Treasury`, are designed for quicker decisions with fewer requirements, striking a balance between efficiency, inclusivity, and security for the entire network.

!!!note 'Examples of Origins in OpenGov'
    The [Polkadot OpenGov Origins Wiki](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins){target=\_blanck} page provides a comprehensive explanation of each **Origin**.


## Tracks

Track is a system that organizes and manages proposals (referenda) in the OpenGov framework. It defines the stages and rules that each proposal follows, ensuring a clear and structured process from submission to enactment.

### Key Features of OpenGov Tracks

1. **Independent Tracks for each Origin** - every `Origin` (such as different groups or roles) has its own `Track`, meaning proposals from different `Origins` follow separate paths and are handled independently

2. **Track stages** - each `Track` consists of several stages:
    - **Preparation Period** - time for discussion before voting
    - **Voting Period** - active voting time
    - **Decision Period** - final decision-making on the proposal
    - **Confirmation Period** - verifying support before enactment
    - **Enactment Period** - final waiting period before the proposal takes effect
    - **Configurable Parameters** - each `Track` has specific settings, like voting durations, deposit requirements, and approval thresholds, customized for the type of proposal

3. **Separate from other Tracks** - `Tracks` operate independently, meaning proposals from different Origins are processed without interference, ensuring focused governance for each proposal
