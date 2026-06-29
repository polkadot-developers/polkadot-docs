// `dot` is the identifier assigned during `npx papi add`
import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getSmProvider } from 'polkadot-api/sm-provider';
import { chainSpec } from 'polkadot-api/chains/polkadot';
import { startFromWorker } from 'polkadot-api/smoldot/from-worker';
import SmWorker from 'polkadot-api/smoldot/worker?worker';

const worker = new SmWorker();
const smoldot = startFromWorker(worker);

// Establish connection to the Polkadot relay chain
const client = createClient(
  getSmProvider(() => smoldot.addChain({ chainSpec })),
);

// To interact with the chain, obtain the `TypedApi`, which provides
// the necessary types for every API call on this chain
const dotApi = client.getTypedApi(dot);
