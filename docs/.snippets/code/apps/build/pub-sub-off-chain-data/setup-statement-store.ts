import { createApp } from '@parity/product-sdk';
import { StatementStoreClient } from '@parity/product-sdk-statement-store';

// `name` is your dotNS identifier: the Host derives the product account from
// it. An unregistered name leaves `accounts` empty rather than raising an error.
const app = await createApp({ name: 'my-product.dot' });
const { accounts } = await app.wallet.connect();
if (accounts.length === 0) {
  throw new Error(
    'No accounts available — pair Polkadot Desktop with a signer.',
  );
}

// `appName` is the gossip topic this client subscribes to, not a dotNS name.
export const client = new StatementStoreClient({ appName: 'my-product' });
await client.connect({
  mode: 'host',
  accountId: [accounts[0].address, 42], // 42 = generic SS58 prefix
});

console.log('Statement Store connected as', accounts[0].address);
