import { Builder, hasDryRunSupport } from '@paraspell/sdk';
import {
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from '@polkadot-labs/hdkd-helpers';
import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws';
import { getTxCreator } from 'polkadot-api/tx-creator';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import { inspect } from 'util';

// Paseo Asset Hub RPC endpoint
const ASSET_HUB_PASEO_RPC = 'wss://asset-hub-paseo-rpc.n.dwellir.com';

// PAS token has 10 decimals
const PAS_UNITS = 10_000_000_000n;

const SEED_PHRASE =
  'INSERT_YOUR_SEED_PHRASE';

// Create Sr25519 signer from mnemonic
function getSigner() {
  const entropy = mnemonicToEntropy(SEED_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const keyPair = derive('');
  return getTxCreator(keyPair.publicKey, 'Sr25519', keyPair.sign);
}

const RECIPIENT_ADDRESS = ss58Address(getSigner().publicKey);
const SENDER_ADDRESS = ss58Address(getSigner().publicKey);

async function transfer() {
  const signer = getSigner();
  // Use your own client so the connection stays open until finalization
  const client = createClient(getWsProvider(ASSET_HUB_PASEO_RPC));

  const tx = await Builder(client)
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS, // 10 PAS
    })
    .recipient(RECIPIENT_ADDRESS)
    .sender(SENDER_ADDRESS)
    .build();

  console.log('Built transaction:', inspect(tx, { colors: true, depth: null }));

  // Polkadot Hub TestNet requires a value for its RestrictOrigins extension
  const result = await tx.createAndSubmit(signer, {
    customSignedExtensions: { RestrictOrigins: { value: true } },
  });
  console.log(inspect(result, { colors: true, depth: null }));
  client.destroy();
  process.exit(0);
}

async function dryRunTransfer() {
  if (!hasDryRunSupport('AssetHubPaseo')) {
    console.log('Dry run is not supported on AssetHubPaseo.');
    return;
  }

  const tx = await Builder()
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .recipient(RECIPIENT_ADDRESS)
    .sender(SENDER_ADDRESS)
    .dryRun();

  console.log(inspect(tx, { colors: true, depth: null }));
  process.exit(0);
}

dryRunTransfer();

async function verifyED() {
  const isValid = await Builder()
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .recipient(RECIPIENT_ADDRESS)
    .sender(SENDER_ADDRESS)
    .verifyEdOnDestination();

  console.log(`ED verification ${isValid ? 'successful' : 'failed'}.`);
  process.exit(0);
}

verifyED();

async function XcmTransferInfo() {
  const info = await Builder()
    .from('AssetHubPaseo')
    .to('PeoplePaseo')
    .currency({
      symbol: 'PAS',
      amount: 10n * PAS_UNITS,
    })
    .recipient(RECIPIENT_ADDRESS)
    .sender(SENDER_ADDRESS)
    .getTransferInfo();

  console.log('Transfer Info:', info);
  process.exit(0);
}

XcmTransferInfo();

transfer();
