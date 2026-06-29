// Place this in your Product, after the setup from `setup-client.ts`.

import { client, account } from './setup-client';

const auth = await client.checkAuthorization(account.address);

if (!auth.authorized) {
  console.log(`No authorization found for ${account.address}`);
} else {
  console.log(`Remaining transactions: ${auth.remainingTransactions}`);
  console.log(`Remaining bytes:        ${auth.remainingBytes}`);
  console.log(`Expires at block:       ${auth.expiration}`);
}

// Estimate authorization needed for a hypothetical 2 MiB payload.
const estimate = client.estimateAuthorization(2 * 1024 * 1024);
console.log(`To store 2 MiB you need ~${estimate.transactions} txs, ${estimate.bytes} bytes`);
