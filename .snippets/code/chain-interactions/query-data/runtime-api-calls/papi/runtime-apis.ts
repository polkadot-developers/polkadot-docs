import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/node';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { pah } from '@polkadot-api/descriptors';

const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

// Example address to query (Polkadot Hub address)
const ADDRESS = 'INSERT_ADDRESS';

async function main() {
  // Create the client connection
  const client = createClient(
    withPolkadotSdkCompat(getWsProvider(ASSET_HUB_RPC))
  );

  // Get the typed API for Polkadot Hub
  const api = client.getTypedApi(pah);

  console.log('Connected to Polkadot Hub');
  console.log(`Querying runtime APIs for: ${ADDRESS}\n`);

  // Call AccountNonceApi to get the account nonce
  const nonce = await api.apis.AccountNonceApi.account_nonce(ADDRESS);
  console.log('AccountNonceApi Results:');
  console.log(`  Account Nonce: ${nonce}`);

  // Query metadata versions using Metadata runtime API
  const metadataVersions = await api.apis.Metadata.metadata_versions();
  console.log('\nMetadata API Results:');
  console.log(`  Supported Metadata Versions: [${metadataVersions.join(', ')}]`);

  // Disconnect the client
  client.destroy();
}

main().catch(console.error);
