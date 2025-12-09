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
  console.log(`Querying balance for: ${ADDRESS}\n`);

  // Query the System.Account storage
  const accountInfo = await api.query.System.Account.getValue(ADDRESS);

  // Extract balance information
  const { data, nonce } = accountInfo;
  const { free, reserved, frozen } = data;

  console.log('Account Information:');
  console.log(`  Nonce: ${nonce}`);
  console.log(`  Free Balance: ${free}`);
  console.log(`  Reserved: ${reserved}`);
  console.log(`  Frozen: ${frozen}`);

  // Disconnect the client
  client.destroy();
}

main().catch(console.error);
