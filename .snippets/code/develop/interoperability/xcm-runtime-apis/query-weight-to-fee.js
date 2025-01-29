import { paseoAssetHub } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

// Connect to the polkadot relay chain.
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
);

const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

// Define the weight to convert to fee
const weight = { ref_time: 15574200000n, proof_size: 359300n };

// Define the versioned asset id
const versionedAssetId = {
  type: 'V4',
  value: { parents: 1, interior: { type: 'Here', value: undefined } },
};

// Execute the runtime call to convert the weight to fee
const result =
  await paseoAssetHubApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
    weight,
    versionedAssetId,
  );

// Print the fee
console.dir(result.value, { depth: null });

client.destroy();
