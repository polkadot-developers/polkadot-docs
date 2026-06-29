// `dot` is the identifier assigned when executing `npx papi add`
import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
// Use this import for Node.js environments
import { getWsProvider } from 'polkadot-api/ws';

// Establish a connection to the Polkadot relay chain
const client = createClient(getWsProvider('wss://dot-rpc.stakeworld.io'));

// To interact with the chain, obtain the `TypedApi`, which provides
// the types for all available calls in that chain
const dotApi = client.getTypedApi(dot);
