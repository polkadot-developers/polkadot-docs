// --8<-- [start:imports]
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
