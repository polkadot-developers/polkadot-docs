// Place this in your Product, after the setup from `setup-app.ts`.
import { StatementStoreClient } from '@parity/product-sdk-statement-store';
import { accounts } from './setup-app';

// `appName` is the gossip topic this client subscribes to, not a dotNS name.
export const client = new StatementStoreClient({ appName: 'my-product' });
await client.connect({
  mode: 'host',
  accountId: [accounts[0].address, 42], // 42 = generic SS58 prefix
});

console.log('Statement Store connected as', accounts[0].address);
