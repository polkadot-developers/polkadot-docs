import { createApp } from '@parity/product-sdk';

// `name` is also your dotNS identifier: the Host derives the user's product
// account from it, appending `.dot` when the name is a bare label. If the name
// is not registered, the Host cannot derive an account and `connect()` resolves
// with an empty list instead of failing, so check the list before you rely on it.
export const app = await createApp({ name: 'my-product.dot' });

const { accounts } = await app.wallet.connect();
if (accounts.length === 0) {
  throw new Error(
    'The Host derived no account for this name — check that it is a registered .dot name.',
  );
}
