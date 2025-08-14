import { Builder, hasDryRunSupport } from '@paraspell/sdk';
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { inspect } from 'util';

// DOT/PAS has 10 decimals
const PAS_UNITS = 10_000_000_000n;

const SEED_PHRASE =
  'INSERT_YOUR_SEED_PHRASE';

// Create Sr25519 signer from mnemonic
function getSigner() {
  const entropy = mnemonicToEntropy(SEED_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const keyPair = derive('');
  return getPolkadotSigner(keyPair.publicKey, 'Sr25519', keyPair.sign);
}

const RECIPIENT_ADDRESS = ss58Address(getSigner().publicKey);
const SENDER_ADDRESS = ss58Address(getSigner().publicKey);

async function teleport() {
  const signer = getSigner();

  const tx = await Builder()
    .from('AssetHubPaseo')
    .to('Paseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS, // 10 PAS
    })
    .address(RECIPIENT_ADDRESS)
    .build();

  console.log('Built transaction:', inspect(tx, { colors: true, depth: null }));

  const result = await tx.signAndSubmit(signer);
  console.log(inspect(result, { colors: true, depth: null }));
}

async function dryRunTeleport() {
  if (!hasDryRunSupport('AssetHubPaseo')) {
    console.log('Dry run is not supported on AssetHubPaseo.');
    return;
  }

  const tx = await Builder()
    .from('AssetHubPaseo')
    .to('Paseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .dryRun();

  console.log(inspect(tx, { colors: true, depth: null }));
}

dryRunTeleport();

async function verifyED() {
  const isValid = await Builder()
    .from('AssetHubPaseo')
    .to('Paseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .verifyEdOnDestination();

  console.log(`ED verification ${isValid ? 'successful' : 'failed'}.`);
}

verifyED();

async function XcmTransferInfo() {
  const info = await Builder()
    .from('AssetHubPaseo')
    .to('Paseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .address(RECIPIENT_ADDRESS)
    .senderAddress(SENDER_ADDRESS)
    .getTransferInfo();

  console.log('Transfer Info:', info);
}

XcmTransferInfo();

teleport();
