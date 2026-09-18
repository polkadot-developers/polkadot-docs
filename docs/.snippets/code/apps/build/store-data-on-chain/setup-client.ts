import { SignerManager } from '@parity/product-sdk';
import { CloudStorageClient } from '@parity/product-sdk-cloud-storage';

// `dappName` is your dotNS identifier: the Host derives the product account
// from it, appending `.dot` to a bare label. An unregistered name leaves
// `accounts` empty rather than raising an error.
const signerManager = new SignerManager({ dappName: 'my-product.dot' });
await signerManager.connect();

const { accounts } = signerManager.getState();
if (accounts.length === 0) {
  throw new Error('No accounts available — pair your Polkadot Desktop with a signer.');
}

// A real Product would render an account picker; here we pick the first one.
signerManager.selectAccount(accounts[0].address);

const signer = signerManager.getSigner();
if (!signer) throw new Error('Could not build a signer from the selected account.');

export const client = await CloudStorageClient.create({
  environment: 'paseo',
  signer,
});

export const account = signerManager.getState().selectedAccount!;
