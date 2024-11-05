// `dot` is the identifier assigned when executing `npx papi add`
import { dot } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
// Use this import for Node.js environments
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

// Establish a connection to the Polkadot relay chain.
const client = createClient(
  // The Polkadot SDK nodes may have compatibility issues; using this enhancer is recommended.
  // Refer to the Requirements page for additional details.
  withPolkadotSdkCompat(getWsProvider('wss://dot-rpc.stakeworld.io')),
);

// To interact with the chain, obtain the `TypedApi`, which provides
// the types for all available calls in that chain
const dotApi = client.getTypedApi(dot);
