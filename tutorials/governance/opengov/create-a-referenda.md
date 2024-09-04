---
title: Create a Referenda
description: Learn how to create and submit referenda on the Polkadot network, including using the Whitelisted Caller track for time-sensitive or technical proposals.
---

# Create a Referenda

## Introduction

This guide outlines the process of proposing public referenda using the Referenda module, also known as OpenGov. Before submitting a referendum, it's crucial to identify the appropriate track and origin for your proposal. To ensure you select the most suitable ones for your referendum, refer to [Origins and Tracks](https://wiki.polkadot.network/docs/learn-polkadot-opengov#origins-and-tracks){target=\_blank}.

## Submit a Preimage

The process of creating a proposal is separate from submitting its [preimage](https://wiki.polkadot.network/docs/glossary#preimage){target=\_blank}. This separation is crucial due to large preimages' potentially high storage costs. Allowing preimage submission as a separate transaction makes it possible for another account to submit the preimage on your behalf and cover the associated fees.

The example below demonstrates the creation of a preimage to propose and approve the spending of treasury funds.

To submit a preimage, follow these steps:

1. Visit [Polkadot.js Apps](https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fpolkadot.api.onfinality.io%2Fpublic-ws#/explorer), navigate to the **Governance** dropdown and select the **Preimages** option
   
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-1.webp)

2. Click on the **+ Add preimage** button
   
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-2.webp)

3. Construct the extrinsic you want to execute and submit the preimage:
    1. Select the **treasury** pallet
    2. Choose the **spendLocal** extrinsic
    3. Fill in the parameters:
        - **amount** - amount to be transferred from the treasury to the `beneficiary`
        - **beneficiary** - destination account for the transfer
    4. Copy the preimage hash -
    the preimage hash for this example is `0x0e634ee7f6adf6e7cfb7e2fa6c77454c3d0ce46f64287df0c1da8d079d9633a2`
    5. Click the **+ Submit preimage** button
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-3.webp)

## Submit a Proposal

Submitting a proposal requires you to bond a specified amount of tokens. The bond value depends on the configuration settings of the chain you use.

Before submitting the proposal, you must first provide the preimage hash. The preimage hash is a cryptographic hash of the full proposal details you intend to enact.

To submit a proposal, follow these steps:

1. Navigate to the **Governance** dropdown and select **Referenda**
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-4.webp)
2. Click on the **+ Submit proposal** button
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-5.webp)
3. Fill in the parameters and submit the proposal:
    1. Select the account from which the proposal will be registered. The balance lock will be applied to this account
    2. Choose your proposal's origin (and, by extension, the track). Each track has different durations, privileges, and acceptance criteria
    3. Enter the preimage hash obtained in the previous steps. The preimage length field will be automatically populated
    4. Select the enactment delay. This can be specified either as a block number or as a specific number of blocks after the referendum is approved
    5. Click the **Submit proposal** button
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-6.webp)
4. After submitting, you should see a `referenda.Submitted` event with your proposal in the explorer section. The proposal number will be displayed in the **index** field
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-7.webp)

## Submit a Referendum on the Whitelisted Caller Track

Operations deemed safe or time-sensitive by the Polkadot Technical Fellowship can be processed through the Whitelisted Caller track. This specialized track allows proposals to pass more quickly by requiring less voter turnout during the early stages of the decision period. It is primarily used for technical, neutral proposals, such as runtime upgrades or adjustments to the system’s parachain validation configuration. However, unlike other tracks, the Whitelisted Caller track requires a different approach. Instead of voting directly on the proposal, the vote is to dispatch the proposal via the Whitelist pallet.

Before submitting a referendum on this track, it’s crucial to secure a positive signal from the Fellowship that they will whitelist the proposal. Without this endorsement, it won’t be executed even if the referendum passes.

For instance, if you want to increase the number of validators in the parachain consensus, you could submit a preimage with a call to set the number of validators to 1,000 and propose it directly through the Root track. However, this would require a significant decision deposit and face conservative passing criteria, likely needing the entire 28-day voting period to succeed.

To submit a proposal on the Whitelisted Caller track, follow these steps:

1. Construct the extrinsic you want to execute and submit the preimage:
    1. Select the **whitelist** pallet
    2. Choose the **dispatchWhitelistedCallWithPreimage** extrinsic
    3. Build the `call` you want to execute and fill the parameters - this example uses `configuration.setMaxValidators(1000)`
    4. Copy the preimage hash -
    the preimage hash for this example is `0xb2dc8750d1736510a329cf9f7e74cd58376d451d33109807a2909ae30e8a72cf`
    5. Click the **+ Submit preimage** button
    ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-10.webp)

2. Follow the steps in section [Submit a Proposal](#submit-a-proposal) to submit your proposal using the preimage hash you obtained in the previous step. Ensure that you select the `Whitelisted Caller` track
   
For this proposal to succeed, the Polkadot Fellowship must initiate a Fellowship referendum to whitelist the call using the `whitelist.whitelistCall(callHash)` extrinsic.

To obtain the  call hash for the `call` you want to execute:

1. Navigate to the **Developer** dropdown and select the **Extrinsics** option
  ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-8.webp)
2. Choose the appropriate pallet and extrinsic, fill in the required parameters for the call, and copy the **encoded call hash**
  ![](/images/tutorials/governance/opengov/create-a-referenda/create-a-referenda-9.webp)

Afterward, the public votes on the referendum. If passed and the call has been whitelisted by the Fellowship, it will be successfully enacted.