import { Binary, createClient, Transaction } from 'polkadot-api';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { getWsProvider } from 'polkadot-api/ws';
import { polkadotHub } from '@polkadot-api/descriptors';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from '@polkadot-labs/hdkd-helpers';

const toHuman = (_key: any, value: any) => {
  if (typeof value === 'bigint') {
    return Number(value);
  }

  // In v2, raw binary values are Uint8Arrays rather than Binary instances.
  if (value instanceof Uint8Array) {
    return Binary.toHex(value);
  }

  return value;
};

function getSigner() {
  const entropy = mnemonicToEntropy(DEV_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const alice = derive('//Alice');

  return getPolkadotSigner(alice.publicKey, 'Sr25519', alice.sign);
}

async function main() {
  const client = createClient(getWsProvider('ws://localhost:8000'));
  const api = client.getTypedApi(polkadotHub);
  const aliceSigner = getSigner();

  const callData = Binary.fromHex(
    '0x1f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000',
  );
  // In v2, Transaction has two generic parameters: <Asset, Ext>.
  const tx: Transaction<string, any> = await api.txFromCallData(callData);
  console.log('👀 Executing XCM:', JSON.stringify(tx.decodedCall, toHuman, 2));

  await new Promise<void>((resolve) => {
    const subscription = tx.signSubmitAndWatch(aliceSigner).subscribe((ev) => {
      if (
        ev.type === 'finalized' ||
        (ev.type === 'txBestBlocksState' && ev.found)
      ) {
        console.log(
          `📦 Included in block #${ev.block.number}: ${ev.block.hash}`,
        );

        if (!ev.ok) {
          const dispatchError = ev.dispatchError;
          if (dispatchError.type === 'Module') {
            const modErr: any = dispatchError.value;
            console.error(
              `❌ Dispatch error in module: ${modErr.type} → ${modErr.value?.type}`,
            );
          } else {
            console.error(
              '❌ Dispatch error:',
              JSON.stringify(dispatchError, toHuman, 2),
            );
          }
        }

        for (const event of ev.events) {
          console.log(
            '📣 Event:',
            event.type,
            JSON.stringify(event.value, toHuman, 2),
          );
        }

        console.log('✅ Process completed, exiting...');
        subscription.unsubscribe();
        resolve();
      }
    });
  });

  client.destroy();
}

main().catch(console.error);
