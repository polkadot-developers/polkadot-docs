// `dot` is the alias assigned during `npx papi add`
import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getSmProvider } from 'polkadot-api/sm-provider';
import { chainSpec } from 'polkadot-api/chains/polkadot';
import { startFromWorker } from 'polkadot-api/smoldot/from-node-worker';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';

// Get the path for the worker file in ESM
const workerPath = fileURLToPath(
  import.meta.resolve('polkadot-api/smoldot/node-worker'),
);

const worker = new Worker(workerPath);
const smoldot = startFromWorker(worker);
const chain = await smoldot.addChain({ chainSpec });

// Set up a client to connect to the Polkadot relay chain
const client = createClient(getSmProvider(chain));

// To interact with the chain's API, use `TypedApi` for access to
// all the necessary types and calls associated with this chain
const dotApi = client.getTypedApi(dot);
