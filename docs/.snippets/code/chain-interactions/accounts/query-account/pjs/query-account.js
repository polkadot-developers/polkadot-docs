import { ApiPromise, WsProvider } from '@polkadot/api';

const POLKADOT_HUB_RPC = 'INSERT_WS_ENDPOINT';
const ACCOUNT_ADDRESS = 'INSERT_ACCOUNT_ADDRESS';
const PAS_UNITS = 10_000_000_000;

async function main() {
  // Create a WebSocket provider
  const wsProvider = new WsProvider(POLKADOT_HUB_RPC);

  // Initialize the API
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('Connected to Polkadot Hub');

  console.log(`\nQuerying account: ${ACCOUNT_ADDRESS}\n`);

  // Query account information
  const accountInfo = await api.query.system.account(ACCOUNT_ADDRESS);

  // Display account information
  console.log('Account Information:');
  console.log('===================');
  console.log(`Nonce: ${accountInfo.nonce.toString()}`);
  console.log(`Consumers: ${accountInfo.consumers.toString()}`);
  console.log(`Providers: ${accountInfo.providers.toString()}`);
  console.log(`Sufficients: ${accountInfo.sufficients.toString()}`);

  console.log('\nBalance Details:');
  console.log('================');
  console.log(
    `Free Balance: ${accountInfo.data.free.toString()} (${
      Number(accountInfo.data.free.toBigInt()) / PAS_UNITS
    } PAS)`
  );
  console.log(
    `Reserved Balance: ${accountInfo.data.reserved.toString()} (${
      Number(accountInfo.data.reserved.toBigInt()) / PAS_UNITS
    } PAS)`
  );
  console.log(
    `Frozen Balance: ${accountInfo.data.frozen.toString()} (${
      Number(accountInfo.data.frozen.toBigInt()) / PAS_UNITS
    } PAS)`
  );

  const total =
    Number(accountInfo.data.free.toBigInt()) +
    Number(accountInfo.data.reserved.toBigInt());
  console.log(`\nTotal Balance: ${total} (${total / PAS_UNITS} PAS)`);

  // Disconnect from the node
  await api.disconnect();
  console.log('\nDisconnected');
}

main().catch(console.error);
