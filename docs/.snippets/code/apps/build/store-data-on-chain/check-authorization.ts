// Place this in your Product, after the setup from `setup-client.ts`.

import { client, account } from './setup-client';

// `checkAuthorization` resolves with a `Result`, so unwrap it before reading
// the status. The fields live on `auth.value`, never on `auth` itself.
const auth = await client.checkAuthorization(account.address);

if (!auth.ok) {
  console.error(`Could not read the authorization: ${auth.error.message}`);
} else if (!auth.value.authorized) {
  console.log(`No authorization found for ${account.address}`);
} else {
  console.log(`Remaining transactions: ${auth.value.remainingTransactions}`);
  console.log(`Remaining bytes:        ${auth.value.remainingBytes}`);
  console.log(`Expires at block:       ${auth.value.expiration}`);
}

// Estimate authorization needed for a hypothetical 2 MiB payload.
const estimate = client.estimateAuthorization(2 * 1024 * 1024);
console.log(`To store 2 MiB you need ~${estimate.transactions} txs, ${estimate.bytes} bytes`);
