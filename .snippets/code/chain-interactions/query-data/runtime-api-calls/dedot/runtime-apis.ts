import { DedotClient, WsProvider } from 'dedot';
import type { PolkadotAssetHubApi } from '@dedot/chaintypes';

const ASSET_HUB_RPC = 'INSERT_WS_ENDPOINT';

// Example address to query
const ADDRESS = 'INSERT_ADDRESS';

async function main() {
  // Initialize provider and client with Asset Hub types
  const provider = new WsProvider(ASSET_HUB_RPC);
  const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

  console.log('Connected to Polkadot Hub TestNet');
  console.log(`Querying runtime APIs for: ${ADDRESS}\n`);

  // Call AccountNonceApi to get the account nonce
  const nonce = await client.call.accountNonceApi.accountNonce(ADDRESS);
  console.log('AccountNonceApi Results:');
  console.log(`  Account Nonce: ${nonce}`);

  // Query metadata versions using Metadata runtime API
  const metadataVersions = await client.call.metadata.metadataVersions();
  console.log('\nMetadata API Results:');
  console.log(`  Supported Metadata Versions: [${metadataVersions.join(', ')}]`);

  // Disconnect the client
  await client.disconnect();
}

main().catch(console.error);
