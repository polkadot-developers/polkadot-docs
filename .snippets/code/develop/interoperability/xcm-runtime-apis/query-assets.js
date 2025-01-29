import { paseoAssetHub } from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';

// Connect to the polkadot relay chain.
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://asset-hub-paseo-rpc.dwellir.com')),
);

const paseoAssetHubApi = client.getTypedApi(paseoAssetHub);

// Define the xcm version to use
const xcmVersion = 3;

// Execute the runtime call to query the assets
const result =
  await paseoAssetHubApi.apis.XcmPaymentApi.query_acceptable_payment_assets(
    xcmVersion,
  );

// Print the assets
console.dir(result.value, { depth: null });

client.destroy();
