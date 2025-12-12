import { ApiPromise, WsProvider } from '@polkadot/api';

const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

// Example address to query
const ADDRESS = 'INSERT_ADDRESS';

async function main() {
  // Create a WebSocket provider
  const wsProvider = new WsProvider(ASSET_HUB_RPC);

  // Initialize the API
  const api = await ApiPromise.create({ provider: wsProvider });

  console.log('Connected to Polkadot Hub TestNet');
  console.log(`Querying runtime APIs for: ${ADDRESS}\n`);

  // Call AccountNonceApi to get the account nonce
  const nonce = await api.call.accountNonceApi.accountNonce(ADDRESS);
  console.log('AccountNonceApi Results:');
  console.log(`  Account Nonce: ${nonce.toString()}`);

  // Query metadata versions using Metadata runtime API
  const metadataVersions = await api.call.metadata.metadataVersions();
  console.log('\nMetadata API Results:');
  console.log(
    `  Supported Metadata Versions: [${metadataVersions.map((v) => v.toString()).join(', ')}]`
  );

  // Disconnect from the node
  await api.disconnect();
}

main().catch(console.error);
