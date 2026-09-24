import { CloudStorageClient, SignerManager } from '@parity/product-sdk';

// `App` does not expose its signer, so the advanced sections build their own.
// Unlike `createApp`, `SignerManager` does not read your Product's identity from
// the Host: set `dappName` to the product ID the Host loads you under (your
// `.dot` name) so it derives the same account that `app.wallet` does.
const signerManager = new SignerManager({ dappName: 'my-product.dot' });

const connected = await signerManager.connect();
if (!connected.ok) throw new Error(connected.error.message);

const accounts = connected.value;
if (accounts.length === 0) {
  throw new Error(
    'The Host returned no account for this Product. Check that you are signed in to Polkadot Desktop.',
  );
}

// A real Product would render an account picker; here we pick the first one.
const selected = signerManager.selectAccount(accounts[0].address);
if (!selected.ok) throw new Error(selected.error.message);

const signer = signerManager.getSigner();
if (!signer) throw new Error('Could not build a signer from the selected account.');

export const client = await CloudStorageClient.create({
  environment: 'paseo',
  signer,
});

export const account = selected.value;
