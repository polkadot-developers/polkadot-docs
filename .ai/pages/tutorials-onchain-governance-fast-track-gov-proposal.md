---
title: Fast Track a Governance Proposal
...
description: Learn how to fast-track governance proposals in Polkadot's OpenGov using Chopsticks.
  Simulate, test, and execute proposals confidently.
...
categories: Tooling
...
url: https://docs.polkadot.com/tutorials/onchain-governance/fast-track-gov-proposal/
...
---

# Fast Track a Governance Proposal

## Introduction

Polkadot's [OpenGov](/polkadot-protocol/onchain-governance/overview){target=\_blank} is a sophisticated governance mechanism designed to allow the network to evolve gracefully over time, guided by its stakeholders. This system features multiple [tracks](https://wiki.polkadot.com/learn/learn-polkadot-opengov-origins/#origins-and-tracks-info){target=\_blank} for different types of proposals, each with parameters for approval, support, and confirmation period. While this flexibility is powerful, it also introduces complexity that can lead to failed proposals or unexpected outcomes.

Testing governance proposals before submission is crucial for the ecosystem. This process enhances efficiency by reducing the need for repeated submissions, improves security by identifying potential risks, and allows proposal optimization based on simulated outcomes. It also serves as an educational tool, providing stakeholders with a safe environment to understand the impacts of different voting scenarios. 

By leveraging simulation tools like [Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks){target=\_blank}, developers can:

- Simulate the entire lifecycle of a proposal.
- Test the voting outcomes by varying the support and approval levels.
- Analyze the effects of a successfully executed proposal on the network's state.
- Identify and troubleshoot potential issues or unexpected consequences before submitting the proposals.

This tutorial will guide you through using Chopsticks to test OpenGov proposals thoroughly. This ensures that when you submit a proposal to the live network, you can do so with confidence in its effects and viability.

## Prerequisites

Before proceeding, ensure the following prerequisites are met:

- **Chopsticks installation**: If you have not installed Chopsticks yet, refer to the [Install Chopsticks](/develop/toolkit/parachains/fork-chains/chopsticks/get-started/#install-chopsticks){target=\_blank} guide for detailed instructions.
- **Familiarity with key concepts**:
    - [Polkadot.js](/develop/toolkit/api-libraries/polkadot-js-api){target=\_blank}
    - [OpenGov](/polkadot-protocol/onchain-governance/overview){target=\_blank}

## Set Up the Project

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
        You'll write your code to simulate and test OpenGov proposals in the `test-proposal.ts` file.

5. Open the `tsconfig.json` file and ensure it includes these compiler options:
    ```json
    -{
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

## Submit and Execute a Proposal Using Chopsticks

You should identify the right track and origin for your proposal. For example, select the appropriate treasury track based on the spending limits if you're requesting funds from the treasury. For more detailed information, refer to [Polkadot OpenGov Origins](https://wiki.polkadot.com/learn/learn-polkadot-opengov-origins/){target=\_blank}.

!!!note
    This tutorial will focus on the main steps and core logic within the main function. For clarity and conciseness, the implementation details of individual functions will be available in expandable tabs below each section. You'll find the complete code for reference at the end of the tutorial.

### Spin Up the Polkadot Fork

To set up your Polkadot fork using Chopsticks, open a new terminal window and run the following command:

```bash
npx @acala-network/chopsticks --config=polkadot
```

This command will start a local fork of the Polkadot network accessible at `ws://localhost:8000`. Keep this terminal window open and running throughout your testing process.

Once your forked network is up and running, you can proceed with the following steps.

### Set Up Dependencies and Structure

Begin by adding the necessary imports and a basic structure to the `test-proposal.ts` file:

```typescript
-// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]


const main = async () => {
  // The code will be added here

  process.exit(0);
}

-// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]

```

This structure provides the foundation for your script. It imports all the necessary dependencies and sets up a main function that will contain the core logic of your proposal submission process.

### Connect to the Forked Chain

Create a `connectToFork` function outside the `main` function to connect your locally forked chain to the Polkadot.js API:

```typescript
    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]

```

Inside the `main` function, add the code to establish a connection to your local Polkadot fork:

```typescript hl_lines="2-3"
-const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();
  ...
}
```

### Create and Submit the Proposal

Create a `generateProposal` function that will be responsible for preparing and submitting the on-chain proposal:

```typescript
-async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
    ...
}
```

Now, you need to implement the following logic:

1. Set up the keyring and use the Alice development account:

    ```typescript
    -  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');
    ```
 
    !!!note
        When using Chopsticks, this development account is pre-funded to execute all necessary actions.

2. Retrieve the proposal index:

    ```typescript
    -  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();
    ```

3. Execute a batch transaction that comprises the following three operations:

    1. **`preimage.notePreimage`**: Registers a [preimage](/polkadot-protocol/glossary#preimage){target=\_blank} using the selected call.

        !!!note
            The preimage hash is simply the hash of the proposal to be enacted. The on-chain proposals do not require the entire image of extrinsics and data (for instance, the Wasm code, in case of upgrades) to be submitted but would need that image's hash. That preimage can be submitted and stored on-chain against the hash later upon the proposal's dispatch.

    2. **`referenda.submit`**: Submits the proposal to the referenda system. It uses the preimage hash extracted from the call as part of the proposal submission process. The proposal is submitted with the selected origin.

    3. **`referenda.placeDecisionDeposit`**: Places the required decision deposit for the referendum. This deposit is required to move the referendum from the preparing phase to the deciding phase.

    ```typescript
    -  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
    ```

4. Return the proposal index:

    ```typescript
    -  return proposalIndex;
    ```

If you followed all the steps correctly, the function should look like this:

??? code "`generateProposal` code"
    ```typescript
    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]

    ```

Then, within the `main` function, define the specific call you want to execute and its corresponding origin, then invoke the `generateProposal` method:

```typescript hl_lines="5-14"
-const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);
  ...
}
```

!!!note
    The [`setCodeWithoutChecks`](https://paritytech.github.io/polkadot-sdk/master/frame_system/pallet/struct.Pallet.html#method.set_code_without_checks){target=\_blank} extrinsic used in this example is for demonstration purposes only. Replace it with the specific extrinsic that matches your governance proposal's intended functionality. Ensure the call matches your target Polkadot SDK-based network's runtime requirements and governance process.

### Force Proposal Execution

After submitting your proposal, you can test its execution by directly manipulating the chain state and scheduler using Chopsticks, bypassing the standard voting and enactment periods.

Create a new function called `forceProposalExecution`:

```typescript
-async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  ...
}
```

This function will accomplish two primary objectives:

- Modify the chain storage to set the proposal's approvals and support artificially, ensuring its passage.
- Override the scheduler to execute the proposal immediately in the subsequent blocks, circumventing standard waiting periods.

Implement the functionality through the following steps:

1. Get the referendum information and its hash:
    ```typescript
    -  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();
    ```

2. Determine the total amount of existing native tokens:
    ```typescript
    -  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();
    ```

3. Fetch the current block number:
    ```typescript
    -  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();
    ```

4. Modify the proposal data and overwrite the storage:
    ```typescript
    -  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);
    ```

5. Manipulate the scheduler to execute the proposal in the next blocks:
    ```typescript
    -  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
    ```

    ???+ child "Utility Function"
        This section utilizes a `moveScheduledCallTo` utility function to move a scheduled call matching specific criteria to a designated future block. Include this function in the same file:

        ??? code "`moveScheduledCallTo`"
            ```typescript
            -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]

            ```

After implementing the complete logic, your function will resemble:

??? code "`forceProposalExecution`"
    ```typescript
    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]

    ```

Invoke `forceProposalExecution` from the `main` function using the `proposalIndex` obtained from the previous `generateProposal` call:

```typescript hl_lines="16-17"
-// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]

```

## Execute the Proposal Script

To run the proposal execution script, use the following command in your terminal:

```bash
npx ts-node test-proposal.ts
```

When executing the script, you should expect the following key actions and outputs:

- **Chain forking**: The script connects to a forked version of the Polkadot network, allowing safe manipulation of the chain state without affecting the live network.

- **Proposal generation**: A new governance proposal is created using the specified extrinsic (in this example, `setCodeWithoutChecks`).

- **State manipulation**: The referendum's storage is modified to simulate immediate approval by adjusting tally and support values to force proposal passing. Scheduled calls are then redirected to ensure immediate execution.

- **Execution**: The script advances the chain to trigger the scheduled call execution. The specified call (e.g., `setCodeWithoutChecks`) is processed.

## Summary

In this tutorial, you've learned how to use Chopsticks to test OpenGov proposals on a local fork of the Polkadot network. You've set up a TypeScript project, connected to a local fork, submitted a proposal, and forced its execution for testing purposes. This process allows you to:

- Safely experiment with different types of proposals.
- Test the effects of proposals without affecting the live network.
- Rapidly iterate and debug your governance ideas.

Using these techniques, you can develop and refine your proposals before submitting them to the Polkadot network, ensuring they're well-tested and likely to achieve their intended effects.

## Full Code

Here's the complete code for the `test-proposal.ts` file, incorporating all the steps we've covered:

??? code "`test-proposal.ts`"
    ```typescript
    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]


    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]


    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]


    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]


    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]


    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]


    -// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
/**
 * Establishes a connection to the local forked chain.
 *
 * @returns A promise that resolves to an `ApiPromise` instance connected to the local chain.
 */
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
/**
 * Generates a proposal by submitting a preimage, creating the proposal, and placing a deposit.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param call - The extrinsic to be executed, encapsulating the specific action to be proposed.
 * @param origin - The origin of the proposal, specifying the source authority (e.g., `{ System: 'Root' }`).
 * @returns A promise that resolves to the proposal ID of the generated proposal.
 *
 */
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  // Initialize the keyring
  const keyring = new Keyring({ type: 'sr25519' });

  // Set up Alice development account
  const alice = keyring.addFromUri('//Alice');

  // Get the next available proposal index
  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

  // Execute the batch transaction
  await new Promise<void>(async (resolve) => {
    const unsub = await api.tx.utility
      .batch([
        // Register the preimage for your proposal
        api.tx.preimage.notePreimage(call.method.toHex()),
        // Submit your proposal to the referenda system
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
        // Place the required decision deposit
        api.tx.referenda.placeDecisionDeposit(proposalIndex),
      ])
      .signAndSend(alice, (status: any) => {
        if (status.blockNumber) {
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
/**
 * Moves a scheduled call to a specified future block if it matches the given verifier criteria.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param blockCounts - The number of blocks to move the scheduled call forward.
 * @param verifier - A function to verify if a scheduled call matches the desired criteria.
 * @throws An error if no matching scheduled call is found.
 */
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  // Get the current block number
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  
  // Retrieve the scheduler's agenda entries
  const agenda = await api.query.scheduler.agenda.entries();
  
  // Initialize a flag to track if a matching scheduled call is found
  let found = false;
  
  // Iterate through the scheduler's agenda entries
  for (const agendaEntry of agenda) {
    // Iterate through the scheduled entries in the current agenda entry
    for (const scheduledEntry of agendaEntry[1]) {
      // Check if the scheduled entry is valid and matches the verifier criteria
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        
        // Overwrite the agendaEntry item in storage
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        
        // Check if the scheduled call has an associated lookup
        if (scheduledEntry.unwrap().maybeId.isSome) {
          // Get the lookup ID
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          // Check if the lookup exists
          if (lookup.isSome) {
            // Get the lookup key
            const lookupKey = await api.query.scheduler.lookup.key(id);
            
            // Create a new lookup object with the updated block number
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            
            // Overwrite the lookup entry in storage
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  
  // Throw an error if no matching scheduled call is found
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
/**
 * Forces the execution of a specific proposal by updating its referendum state and ensuring the execution process is triggered.
 *
 * @param api - An instance of the Polkadot.js API promise used to interact with the blockchain.
 * @param proposalIndex - The index of the proposal to be executed.
 * @throws An error if the referendum is not found or not in an ongoing state.
 */
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  // Retrieve the referendum data for the given proposal index
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  // Get the storage key for the referendum data
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);

  // Check if the referendum data exists
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }

  const referendumInfo = referendumData.unwrap();

  // Check if the referendum is in an ongoing state
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  // Get the ongoing referendum data
  const ongoingData = referendumInfo.asOngoing;
  // Convert the ongoing data to JSON
  const ongoingJson = ongoingData.toJSON();

  // Support Lookup, Inline or Legacy proposals
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  // Get the total issuance of the native token
  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  // Get the current block number
  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();

  // Create a new proposal data object with the updated fields
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
  };

  // Create a new proposal object from the proposal data
  let fastProposal;
  try {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfo>`,
      fastProposalData
    );
  } catch {
    fastProposal = api.registry.createType(
      `Option<PalletReferendaReferendumInfoConvictionVotingTally>`,
      fastProposalData
    );
  }

  // Update the storage with the new proposal object
  const result = await api.rpc('dev_setStorage', [
    [referendumKey, fastProposal.toHex()],
  ]);

  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  await moveScheduledCallTo(api, 1, (call) => {
    if (!call.isInline) {
      return false;
    }

    const callData = api.createType('Call', call.asInline.toHex());

    return (
      callData.method == 'nudgeReferendum' &&
      (callData.args[0] as any).toNumber() == proposalIndex
    );
  });

  // Create a new block
  await api.rpc('dev_newBlock', { count: 1 });

  // Move the scheduled call to the next block
  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

  // Create another new block
  await api.rpc('dev_newBlock', { count: 1 });
}
// --8<-- [end:forceProposalExecution]

// --8<-- [start:main]
const main = async () => {
  // Connect to the forked chain
  const api = await connectToFork();

  // Select the call to perform
  const call = api.tx.system.setCodeWithoutChecks('0x1234');

  // Select the origin
  const origin = {
    System: 'Root',
  };

  // Submit preimage, submit proposal, and place decision deposit
  const proposalIndex = await generateProposal(api, call, origin);

  // Force the proposal to be executed
  await forceProposalExecution(api, proposalIndex);

  process.exit(0);
};
// --8<-- [end:main]

// --8<-- [start:try-catch-block]
try {
  main();
} catch (e) {
  console.log(e);
  process.exit(1);
}
// --8<-- [end:try-catch-block]

    ```
