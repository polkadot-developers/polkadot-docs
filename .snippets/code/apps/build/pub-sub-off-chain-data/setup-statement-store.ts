import { createApp } from '@parity/product-sdk';
import { StatementStoreClient } from '@parity/product-sdk-statement-store';

const app = await createApp({ name: 'my-product' });
const { accounts } = await app.wallet.connect();
if (accounts.length === 0) {
  throw new Error('No accounts available — pair Polkadot Desktop with a signer.');
}

export const client = new StatementStoreClient({ appName: 'my-product' });
await client.connect({
  mode: 'host',
  accountId: [accounts[0].address, 42], // 42 = generic SS58 prefix
});

console.log('Statement Store connected as', accounts[0].address);
