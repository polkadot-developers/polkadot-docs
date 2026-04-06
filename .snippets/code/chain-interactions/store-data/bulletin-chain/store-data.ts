import { Binary, createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/node';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { bulletin } from '@polkadot-api/descriptors';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { CID } from 'multiformats/cid';
import { readFile } from 'fs/promises';

// Bulletin Chain Polkadot TestNet RPC endpoint
const BULLETIN_RPC = 'wss://paseo-bulletin-rpc.polkadot.io';

// Path to the image you want to store
const FILE_PATH = 'INSERT_IMAGE_PATH';

async function main() {
  // Create the client connection
  const client = createClient(
    withPolkadotSdkCompat(getWsProvider(BULLETIN_RPC))
  );

  // Get the typed API for the Bulletin Chain
  const api = client.getTypedApi(bulletin);

  console.log('Connected to Bulletin Chain (Polkadot TestNet)');

  // Derive a signer from a mnemonic
  const miniSecret = entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE));
  const derive = sr25519CreateDerive(miniSecret);
  const hdkdKeyPair = derive('//Alice');
  const signer = getPolkadotSigner(
    hdkdKeyPair.publicKey,
    'Sr25519',
    hdkdKeyPair.sign
  );

  // Read the image to store
  const fileData = await readFile(FILE_PATH);
  console.log(`Read file: ${FILE_PATH} (${fileData.length} bytes)`);

  // Submit the store transaction
  // Note: the signing account must have an active authorization (see Get Authorization section)
  console.log('Submitting store transaction...');
  const result = await api.tx.TransactionStorage.store({
    data: Binary.fromBytes(new Uint8Array(fileData)),
  }).signAndSubmit(signer);

  console.log(`Transaction included in block: ${result.block.hash}`);
  console.log(`Transaction index: ${result.block.index}`);

  // Check events for the Stored event containing the CID
  for (const event of result.events) {
    if (event.type === 'TransactionStorage' && event.value.type === 'Stored') {
      // Decode the raw CID bytes into a standard IPFS CID string
      const cidBytes = event.value.value.cid.asBytes();
      const cid = CID.decode(cidBytes);

      console.log('\nImage stored successfully!');
      console.log(`Index: ${event.value.value.index}`);
      console.log(`CID: ${cid.toString()}`);
      console.log(`\nRetrieve via IPFS gateway:`);
      console.log(`https://paseo-ipfs.polkadot.io/ipfs/${cid.toString()}`);
    }
  }

  // Disconnect the client
  client.destroy();
}

main().catch(console.error);
