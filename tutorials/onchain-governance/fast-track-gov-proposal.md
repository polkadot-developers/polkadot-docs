---
title: Fast Track a Governance Proposal
description: Learn how to fast track governance proposals in Polkadot's OpenGov using Chopsticks. Simulate, test, and execute proposals confidently.
---

# Fast Track a Governance Proposal

## Introduction

Polkadot's [OpenGov](/polkadot-protocol/onchain-governance/overview){target=\_blank} is a sophisticated governance mechanism designed to allow the network to evolve gracefully over time, guided by its stakeholders. This system features multiple [tracks](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins#origins-and-tracks-info){target=\_blank} for different types of proposals, each with its own parameters for approval, support, and confirmation period. While this flexibility is powerful, it also introduces complexity that can lead to failed proposals or unexpected outcomes.

Testing governance proposals before submission is crucial for the ecosystem. This process enhances efficiency by reducing the need for repeated submissions, improves security by identifying potential risks, and allows for proposal optimization based on simulated outcomes. It also serves as an educational tool, providing stakeholders with a safe environment to understand the impacts of different voting scenarios. 

By leveraging simulation tools like [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks){target=\_blank}, developers can:

- Simulate the entire lifecycle of a proposal
- Test the voting outcomes by varying the support and approval levels
- Analyze the effects of successfully executed proposal on the network's state
- Identify and troubleshoot potential issues or unexpected consequences before submitting the proposals

This tutorial will guide you through the process of using Chopsticks to thoroughly test OpenGov proposals, ensuring that when you submit a proposal to the live network, you can do so with confidence in its effects and viability.

## Prerequisites

Before proceeding, ensure the following prerequisites are met:

- **Chopsticks installation** - if you have not installed Chopsticks yet, refer to the [Install Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#install-chopsticks){target=\_blank} guide for detailed instructions
- **Familiarity with key concepts** - you should have a basic understanding of the following:
    - [Polkadot.js](/develop/toolkit/api-libraries/polkadot-js-api){target=\_blank} 
    - [OpenGov](/polkadot-protocol/onchain-governance/overview){target=\_blank}

## Setting Up the Project

Before testing OpenGov proposals, you need to set up your development environment. 
You'll set up a TypeScript project and install the required dependencies to simulate and evaluate proposals. You'll use Chopsticks to fork the Polkadot network and simulate the proposal lifecycle, while Polkadot.js will be your interface for interacting with the forked network and submitting proposals.

Follow these steps to set up your project:

1. Create a new project directory and navigate into it:
    ```bash
    mkdir opengov-chopsticks && cd opengov-chopsticks
    ```

2. Initialize a new TypeScript project:
    ```bash
    npm init -y \
    && npm install typescript ts-node @types/node --save-dev \
    && npx tsc --init
    ```

3. Install the required dependencies:
    ```bash
    npm install @polkadot/api @acala-network/chopsticks
    ```

4. Create a new TypeScript file for your script:
    ```bash
    touch test-proposal.ts
    ```

    !!!note
        The `test-proposal.ts` file is where you'll write your code to simulate and test OpenGov proposals.

5. Open the `tsconfig.json` file and ensure it includes these compiler options:
    ```json
    --8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/tsconfig.json'
    ```

## Submitting and Executing a Proposal Using Chopsticks

It's important to note that you should identify the right track and origin for your proposal. For example, if you're requesting funds from the treasury, select the appropriate treasury track based on the spend limits. For more detailed information, refer to [Polkadot OpenGov Origins](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins){target=\_blank}.

!!!note
    In this tutorial, the focus will be on the main steps and core logic within the main function. For clarity and conciseness, the implementation details of individual functions will be available in expandable tabs below each section. At the end of the tutorial, you'll find the complete code for reference.

### Spin Up the Polkadot Fork

To set up your Polkadot fork using Chopsticks, open a new terminal window and run the following command:

```bash
npx @acala-network/chopsticks --config=polkadot
```

This command will start a local fork of the Polkadot network accesible at `ws://localhost:8000`. Keep this terminal window open and running throughout your testing process.

Once your forked network is up and running, you can proceed with the following steps.

### Set Up Dependencies and Structure

Begin by adding the necessary imports and a basic structure to the `test-proposal.ts` file:

```typescript
--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:imports'

const main = async () => {
    // The code will be added here

    process.exit(0);
}

--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:try-catch-block'
```

This structure provides the foundation for your script. It imports all the necessary dependencies and sets up a main function that will contain the core logic of your proposal submission process.

### Connect to the Forked Chain

Inside your `main` function, add the code to connect to your local Polkadot fork:

```typescript hl_lines="2-3"
--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:main'
```

???+ function "**connectToFork** ()"

    ```typescript
    --8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:connectToFork'
    ```

### Create and Submit the Proposal

In this step, you will perform the following actions:

1. Define the call you want to execute and its origin

2. Register a [preimage](/polkadot-protocol/glossary#preimage){target=\_blank} using the selected call

    !!!note
        The preimage hash is simply the hash of the proposal to be enacted. The on-chain proposals do not require the entire image of extrinsics and data (for instance the Wasm code, in case of upgrades) to be submitted, but would rather just need that image's hash. That preimage can be submitted and stored on-chain against the hash later, upon the proposal's dispatch.

3. Submit the proposal. It uses the preimage hash (obtained from the call) as part of the proposal submission process. The proposal is submitted with the selected origin

4. Place decision deposit. This deposit is required to move the referendum from the preparing phase to the deciding phase

```typescript hl_lines="5-14"
--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:main'
```

!!!note
    The [`setCodeWithoutChecks`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.set_code_without_checks){target=\_blank} extrinsic used in this example is for demonstration purposes only. Replace it with the specific extrinsic that matches your governance proposal's intended functionality. Ensure the call matches the runtime requirements and governance process of your target Polkadot SDK-based network.

???+ function "**generateProposal** (api, call, origin)"

    The `generateProposal` function accomplishes these tasks using a batched transaction, which combines multiple operations into a single transaction:

    1. `preimage.notePreimage` - this submits the preimage of the proposal
    2. `referenda.submit` - submits the actual proposal to the referenda system
    3. `referenda.placeDecisionDeposit` - places the required decision deposit for the referendum
   
    ```typescript
    --8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:generateProposal'
    ```

### Force Proposal Execution

After submitting your proposal, you may want to test its execution without waiting for the standard voting and enactment periods. Chopsticks allows you to force the execution of a proposal by manipulating the chain state and the scheduler.

```typescript hl_lines="16-17"
--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:main'
```

???+ function "**forceProposalExecution** (api, call, origin)"

    The `forceProposalExecution` function does the following:

    1. It overwrites the chain storage, modifying the parameters of the proposal to set the approvals and support to the required values for the proposal to pass
    2. It then forces the scheduler to execute the actual call in the next block, instead of waiting for the original scheduled execution time

    ```typescript
    --8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:forceProposalExecution'
    ```

    !!! note
        This function depends on the `moveScheduledCallTo` utility function, which is crucial for manipulating the scheduler in a forked chain by moving a specific scheduled call to a desired block.

    ??? function "moveScheduledCallTo (api, blockCounts, verifier)"

        ```typescript
        --8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:moveScheduledCallTo'
        ```

## Executing the Proposal Script

To run the proposal execution script, use the following command in your terminal:

```bash
npx ts-node test-proposal.ts
```

When executing the script, you should expect the following key actions and outputs:

- **Chain forking** - the script connects to a forked version of the Polkadot network, allowing safe manipulation of chain state without affecting the live network.

- **Proposal generation** - a new governance proposal is created using the specified extrinsic (in this example, `setCodeWithoutChecks`)

- **State manipulation** - the referendum's storage is modified to simulate immediate approval by adjusting tally and support values to force proposal passing. Scheduled calls are then redirected to ensure immediate execution

- **Execution** - the script advances the chain to trigger the scheduled call execution. The specified call (e.g., `setCodeWithoutChecks`) is processed

## Summary

In this tutorial, you've learned how to use Chopsticks to test OpenGov proposals on a local fork of the Polkadot network. You've set up a TypeScript project, connected to a local fork, submitted a proposal, and forced its execution for testing purposes. This process allows you to:

- Safely experiment with different types of proposals
- Test the effects of proposals without affecting the live network
- Rapidly iterate and debug your governance ideas

By using these techniques, you can develop and refine your proposals before submitting them to the actual Polkadot network, ensuring they're well-tested and likely to achieve their intended effects.

## Full Code

Here's the complete code for the `test-proposal.ts` file, incorporating all the steps we've covered:

```typescript
--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:imports'

--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:connectToFork'

--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:generateProposal'

--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:moveScheduledCallTo'

--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:forceProposalExecution'

--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:main'

--8<-- 'code/tutorials/onchain-governance/fast-track-gov-proposal/test-proposal.ts:try-catch-block'
```