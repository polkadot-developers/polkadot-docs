import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { polkadotTestNet } from '@polkadot-api/descriptors';

const POLKADOT_HUB_RPC = 'INSERT_WS_ENDPOINT';
const ACCOUNT_ADDRESS = 'INSERT_ACCOUNT_ADDRESS';
const PAS_UNITS = 10_000_000_000;

async function main() {
  try {
    // Create the client connection
    const client = createClient(
      withPolkadotSdkCompat(getWsProvider(POLKADOT_HUB_RPC))
    );

    // Get the typed API
    const api = client.getTypedApi(polkadotTestNet);
    console.log('Connected to Polkadot Hub');

    console.log(`\nQuerying account: ${ACCOUNT_ADDRESS}\n`);

    // Query account information
    const accountInfo = await api.query.System.Account.getValue(
      ACCOUNT_ADDRESS
    );

    // Display account information
    console.log('Account Information:');
    console.log('===================');
    console.log(`Nonce: ${accountInfo.nonce}`);
    console.log(`Consumers: ${accountInfo.consumers}`);
    console.log(`Providers: ${accountInfo.providers}`);
    console.log(`Sufficients: ${accountInfo.sufficients}`);

    console.log('\nBalance Details:');
    console.log('================');
    console.log(
      `Free Balance: ${accountInfo.data.free} (${
        Number(accountInfo.data.free) / PAS_UNITS
      } PAS)`
    );
    console.log(
      `Reserved Balance: ${accountInfo.data.reserved} (${
        Number(accountInfo.data.reserved) / PAS_UNITS
      } PAS)`
    );
    console.log(
      `Frozen Balance: ${accountInfo.data.frozen} (${
        Number(accountInfo.data.frozen) / PAS_UNITS
      } PAS)`
    );

    const total =
      Number(accountInfo.data.free) + Number(accountInfo.data.reserved);
    console.log(`\nTotal Balance: ${total} (${total / PAS_UNITS} PAS)`);

    await client.destroy();
    console.log('\nDisconnected');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

main();
