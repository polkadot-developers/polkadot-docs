import { createApp } from '@parity/product-sdk';
import { StatementStoreClient } from '@parity/product-sdk-statement-store';

// The Host supplies your Product's identity and derives the product account
// from it. If it declines to derive one, `accounts` is empty rather than an error.
const app = await createApp();
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
