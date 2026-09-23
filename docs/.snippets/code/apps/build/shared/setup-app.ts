import { createApp } from '@parity/product-sdk';

// The Host supplies your Product's identity: `createApp` reads the product ID
// the Host loaded you under and derives the user's product account from it.
// If the Host declines to derive an account, `connect()` resolves with an empty
// list instead of failing, so check the list before you rely on it.
export const app = await createApp();

export const { accounts } = await app.wallet.connect();
if (accounts.length === 0) {
  throw new Error(
    'The Host returned no account for this Product. Check that you are signed in to Polkadot Desktop.',
  );
}
