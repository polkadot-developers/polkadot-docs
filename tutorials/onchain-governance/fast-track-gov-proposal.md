---
title: How to Fast Track a Governance Proposal
description: TODO
---

# How to Fast Track a Governance Proposal

## Introduction

Polkadot's [OpenGov](/polkadot-protocol/onchain-governance/overview){target=\_blank} is a sophisticated governance mechanism designed to allow the network to evolve gracefully over time, guided by its stakeholders. This system features multiple [tracks](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins#origins-and-tracks-info){target=\_blank} for different types of proposals, each with its own parameters for approval, support, and timing. While this flexibility is powerful, it also introduces complexity that can lead to failed proposals or unexpected outcomes.

Testing governance proposals before submission is crucial for the ecosystem. This process enhances efficiency by reducing the need for repeated submissions, improves security by identifying potential risks, and allows for proposal optimization based on simulated outcomes. It also serves as an educational tool, providing stakeholders with a safe environment to understand the impacts of different voting scenarios. By leveraging simulation tools like [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks){target=\_blank}, proposers can refine their ideas, anticipate potential issues, and increase the likelihood of successful implementation, ultimately leading to more effective and informed governance decisions.

By using Chopsticks, developers and governance participants can:

- Simulate the entire lifecycle of a proposal
- Test various voting outcomes and participation levels
- Analyze the effects of successful proposals on the network state
- Identify potential issues or unexpected consequences before real-world implementation

This tutorial will guide you through the process of using Chopsticks to thoroughly test OpenGov proposals, ensuring that when you submit a proposal to the live network, you can do so with confidence in its effects and viability.

## Prerequisites

- Chopsticks installed. If you still need to do so, see the [Install Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#install-chopsticks){target=\_blank} guide for assistance

- Basic understanding of [Polkadot.js](/develop/toolkit/api-libraries/polkadot-js-api){target=\_blank} and [OpenGov](/polkadot-protocol/onchain-governance/overview){target=\_blank}

## Setting Up the Project

Before diving into testing OpenGov proposals, you need to set up your development environment. You'll create a TypeScript project and install the necessary dependencies. You'll use Chopsticks to fork the Polkadot network and simulate the proposal lifecycle, while PolkadotJS will be your interface for interacting with the forked network and submitting proposals.

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
   {
      "compilerOptions": {
        "module": "CommonJS",
        "esModuleInterop": true,
        "target": "esnext",
        "moduleResolution": "node",
        "declaration": true,
        "sourceMap": true,
        "skipLibCheck": true,
        "outDir": "dist",
        "composite": true
      }
    }
   ```

## Submitting and Executing a Proposal Using Chopsticks

It's important to note that you should identify the right track and origin for your proposal. For example, if you're requesting funds from the treasury, select the appropriate treasury track based on the spend limits. For more detailed information, refer to [Polkadot OpenGov Origins](https://wiki.polkadot.network/docs/learn-polkadot-opengov-origins){target=_blank}.

!!!note
	In this tutorial, the focus will be on the main steps and core logic within the main function. For clarity and conciseness, the implementation details of individual functions will be available in expandable tabs below each section. At the end of the tutorial, you'll find the complete code for reference.

### Spin Up the Polkadot Fork

Before you can interact with the forked network, you need to start it using Chopsticks. Open a new terminal window and run the following command:

```
npx @acala-network/chopsticks --config=polkadot
```

This command will start a local fork of the Polkadot network accesible at `ws://localhost:8000`. Keep this terminal window open and running throughout your testing process.
Once your forked network is up and running, you can proceed with the following steps.

### Set Up Dependencies and Structure

Begin by adding the necessary imports and a basic structure:

```typescript
import "@polkadot/api-augment/polkadot"
import { FrameSupportPreimagesBounded } from "@polkadot/types/lookup"
import { blake2AsHex } from "@polkadot/util-crypto"
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api"
import { type SubmittableExtrinsic } from "@polkadot/api/types"
import { ISubmittableResult } from "@polkadot/types/types"

const main = async () => {
	// We'll add our code here

	process.exit(0)
}

try {
    main()
} catch (e) {
    console.log(e)
    process.exit(1)
}
```

This structure provides the foundation for your script. It imports all the necessary dependencies and sets up a main function that will contain the core logic of your proposal submission process.

### Connect to the Forked Chain

Inside your `main` function, add the code to connect to your local Polkadot fork:

```typescript
const main = async () => {
	// Connect to the forked chain
	const api = await connectToFork();

	process.exit(0)
}
```

???+ function "**connectToFork** ()"

	```typescript
	async function connectToFork(): Promise<ApiPromise> {
		const wsProvider = new WsProvider("ws://127.0.0.1:8000");
		const api = await ApiPromise.create({ provider: wsProvider });
		await api.isReady;
		console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
		return api;
	}
	```

### Create and Submit the Proposal

In this step, you will perform the following actions:

1. Define the call you want to execute and its origin
2. Create a preimage using the selected call
3. Submit the proposal. It uses the preimage hash (obtained from the call) as part of the proposal submission. The proposal is submitted with the selected origin
4. Place decision deposit. This deposit is required to move the referendum from the preparing phase to the deciding phase

```typescript
const main = async () => {
	// ... [previous code for connecting to fork]

	// Select the call to execute
    const call = api.tx.parachainStaking.setCode("0x1234")

    // Select the origin
    const origin = {
        System: "Root",
    }

    // Submit preimage, submit proposal, and place decision deposit
    const proposalIndex = await generateProposal(api, call, origin)

	// ... [rest of the code]
}
```

???+ function "**generateProposal** (api, call, origin)"

	The `generateProposal` function accomplishes these tasks using a batched transaction, which combines multiple operations into a single transaction:

    1. `preimage.notePreimage` - this submits the preimage of the proposal
    2. `referenda.submit` - submits the actual proposal to the referenda system
    3. `referenda.placeDecisionDeposit` - places the required decision deposit for the referendum
   
	```typescript
	async function generateProposal(
		api: ApiPromise,
		call: SubmittableExtrinsic<"promise", ISubmittableResult>,
		origin: any
	): Promise<number> {
		const keyring = new Keyring({ type: "sr25519" })
		const alice = keyring.addFromUri("//Alice")

		const proposalIndex = (
			await api.query.referenda.referendumCount()
		).toNumber()

		await new Promise<void>(async (resolve) => {
			const unsub = await api.tx.utility
				.batch([
					api.tx.preimage.notePreimage(call.method.toHex()),
					api.tx.referenda.submit(
						origin as any,
						{
							Lookup: {
								Hash: call.method.hash.toHex(),
								len: call.method.encodedLength,
							},
						},
						{ At: 0 }
					),
					api.tx.referenda.placeDecisionDeposit(proposalIndex),
				])
				.signAndSend(alice, (status: any) => {
					if (status.blockNumber) {
						unsub()
						resolve()
					}
				})
		})
		return proposalIndex
	}
	```

### Force Proposal Execution

After submitting your proposal, you may want to test its execution without waiting for the standard voting and enactment periods. Chopsticks allows you to force the execution of a proposal by manipulating the chain state and the scheduler.

```typescript
const main = async () => {
    // ... [previous code for connecting and submitting proposal]

    // Force the proposal to be executed
    await forceProposalExecution(api, proposalIndex)

    process.exit(0)
}
```

???+ function "**forceProposalExecution** (api, call, origin)"

	The `forceProposalExecution` function does the following:

	1. It overwrites the chain storage, modifying the parameters of the proposal to set the approvals and support to the required values for the proposal to pass
	2. It then forces the scheduler to execute the actual call in the next block, instead of waiting for the original scheduled execution time.

	```typescript
	async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
		const referendumData = await api.query.referenda.referendumInfoFor(
			proposalIndex
		)
		const referendumKey =
			api.query.referenda.referendumInfoFor.key(proposalIndex)
		if (!referendumData.isSome) {
			throw new Error(`Referendum ${proposalIndex} not found`)
		}
		const referendumInfo = referendumData.unwrap()
		if (!referendumInfo.isOngoing) {
			throw new Error(`Referendum ${proposalIndex} is not ongoing`)
		}

		const ongoingData = referendumInfo.asOngoing
		const ongoingJson = ongoingData.toJSON()
		// Support Lookup, Inline or Legacy
		const callHash = ongoingData.proposal.isLookup
			? ongoingData.proposal.asLookup.toHex()
			: ongoingData.proposal.isInline
			? blake2AsHex(ongoingData.proposal.asInline.toHex())
			: ongoingData.proposal.asLegacy.toHex()

		const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt()

		const proposalBlockTarget = (
			await api.rpc.chain.getHeader()
		).number.toNumber()
		const fastProposalData = {
			ongoing: {
				...ongoingJson,
				enactment: { after: 0 },
				deciding: {
					since: proposalBlockTarget - 1,
					confirming: proposalBlockTarget - 1,
				},
				tally: {
					ayes: totalIssuance - 1n,
					nays: 0,
					support: totalIssuance - 1n,
				},
				alarm: [proposalBlockTarget + 1, [proposalBlockTarget + 1, 0]],
			},
		}

		let fastProposal
		try {
			fastProposal = api.registry.createType(
				`Option<PalletReferendaReferendumInfo>`,
				fastProposalData
			)
		} catch {
			fastProposal = api.registry.createType(
				`Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
				fastProposalData
			)
		}

		const result = await api.rpc("dev_setStorage", [
			[referendumKey, fastProposal.toHex()],
		])

		// Fast forward the nudge referendum to the next block to get the refendum to be scheduled
		await moveScheduledCallTo(api, 1, (call) => {
			if (!call.isInline) {
				return false
			}
			const callData = api.createType("Call", call.asInline.toHex())
			return (
				callData.method == "nudgeReferendum" &&
				(callData.args[0] as any).toNumber() == proposalIndex
			)
		})

		await api.rpc("dev_newBlock", { count: 1 })

		await moveScheduledCallTo(api, 1, (call) =>
			call.isLookup
				? call.asLookup.toHex() == callHash
				: call.isInline
				? blake2AsHex(call.asInline.toHex()) == callHash
				: call.asLegacy.toHex() == callHash
		)
	}
	```

## Summary

In this tutorial, you've learned how to use Chopsticks to test OpenGov proposals on a local fork of the Polkadot network. You've set up a TypeScript project, connected to a local fork, submitted a proposal, and even forced its execution for testing purposes. This process allows you to:

1. Safely experiment with different types of proposals
2. Test the effects of proposals without affecting the live network
3. Rapidly iterate and debug your governance ideas

By using these techniques, you can develop and refine your proposals before submitting them to the actual Polkadot network, ensuring they're well-tested and likely to achieve their intended effects.

## Full Code

Here's the complete code for the `test-proposal.ts` file, incorporating all the steps we've covered:

```typescript
```