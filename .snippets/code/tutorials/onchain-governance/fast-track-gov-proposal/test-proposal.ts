// --8<-- [start:imports]
import '@polkadot/api-augment/polkadot';
import { FrameSupportPreimagesBounded } from '@polkadot/types/lookup';
import { blake2AsHex } from '@polkadot/util-crypto';
import { ApiPromise, Keyring, WsProvider } from '@polkadot/api';
import { type SubmittableExtrinsic } from '@polkadot/api/types';
import { ISubmittableResult } from '@polkadot/types/types';
// --8<-- [end:imports]

// --8<-- [start:connectToFork]
async function connectToFork(): Promise<ApiPromise> {
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  await api.isReady;
  console.log(`Connected to chain: ${await api.rpc.system.chain()}`);
  return api;
}
// --8<-- [end:connectToFork]

// --8<-- [start:generateProposal]
async function generateProposal(
  api: ApiPromise,
  call: SubmittableExtrinsic<'promise', ISubmittableResult>,
  origin: any
): Promise<number> {
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');

  const proposalIndex = (
    await api.query.referenda.referendumCount()
  ).toNumber();

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
          unsub();
          resolve();
        }
      });
  });
  return proposalIndex;
}
// --8<-- [end:generateProposal]

// --8<-- [start:moveScheduledCallTo]
async function moveScheduledCallTo(
  api: ApiPromise,
  blockCounts: number,
  verifier: (call: FrameSupportPreimagesBounded) => boolean
) {
  const blockNumber = (await api.rpc.chain.getHeader()).number.toNumber();
  // Fast forward the nudge referendum to the next block to get the refendum to be scheduled
  const agenda = await api.query.scheduler.agenda.entries();
  let found = false;
  for (const agendaEntry of agenda) {
    for (const scheduledEntry of agendaEntry[1]) {
      if (scheduledEntry.isSome && verifier(scheduledEntry.unwrap().call)) {
        found = true;
        const result = await api.rpc('dev_setStorage', [
          [agendaEntry[0]], // require to ensure unique id
          [
            await api.query.scheduler.agenda.key(blockNumber + blockCounts),
            agendaEntry[1].toHex(),
          ],
        ]);
        if (scheduledEntry.unwrap().maybeId.isSome) {
          const id = scheduledEntry.unwrap().maybeId.unwrap().toHex();
          const lookup = await api.query.scheduler.lookup(id);

          if (lookup.isSome) {
            const lookupKey = await api.query.scheduler.lookup.key(id);
            const lookupJson = lookup.unwrap().toJSON();
            const fastLookup = api.registry.createType('Option<(u32,u32)>', [
              blockNumber + blockCounts,
              0,
            ]);
            const result = await api.rpc('dev_setStorage', [
              [lookupKey, fastLookup.toHex()],
            ]);
          }
        }
      }
    }
  }
  if (!found) {
    throw new Error('No scheduled call found');
  }
}
// --8<-- [end:moveScheduledCallTo]

// --8<-- [start:forceProposalExecution]
async function forceProposalExecution(api: ApiPromise, proposalIndex: number) {
  const referendumData = await api.query.referenda.referendumInfoFor(
    proposalIndex
  );
  const referendumKey =
    api.query.referenda.referendumInfoFor.key(proposalIndex);
  if (!referendumData.isSome) {
    throw new Error(`Referendum ${proposalIndex} not found`);
  }
  const referendumInfo = referendumData.unwrap();
  if (!referendumInfo.isOngoing) {
    throw new Error(`Referendum ${proposalIndex} is not ongoing`);
  }

  const ongoingData = referendumInfo.asOngoing;
  const ongoingJson = ongoingData.toJSON();
  
  // Support Lookup, Inline or Legacy
  const callHash = ongoingData.proposal.isLookup
    ? ongoingData.proposal.asLookup.toHex()
    : ongoingData.proposal.isInline
    ? blake2AsHex(ongoingData.proposal.asInline.toHex())
    : ongoingData.proposal.asLegacy.toHex();

  const totalIssuance = (await api.query.balances.totalIssuance()).toBigInt();

  const proposalBlockTarget = (
    await api.rpc.chain.getHeader()
  ).number.toNumber();
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

  await api.rpc('dev_newBlock', { count: 1 });

  await moveScheduledCallTo(api, 1, (call) =>
    call.isLookup
      ? call.asLookup.toHex() == callHash
      : call.isInline
      ? blake2AsHex(call.asInline.toHex()) == callHash
      : call.asLegacy.toHex() == callHash
  );

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
