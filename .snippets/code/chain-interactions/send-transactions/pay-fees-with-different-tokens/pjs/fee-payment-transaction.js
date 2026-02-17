import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

const TARGET_ADDRESS = '14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'; // Bob's address
const TRANSFER_AMOUNT = 3_000_000_000n; // 3 DOT
const USDT_ASSET_ID = 1984;

async function main() {
  // Wait for crypto libraries to be ready
  await cryptoWaitReady();

  // Create a keyring instance and add Alice's account
  const keyring = new Keyring({ type: 'sr25519' });
  const alice = keyring.addFromUri('//Alice');

  // Connect to the local Chopsticks Polkadot Hub fork
  const wsProvider = new WsProvider('ws://localhost:8000');
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('Connected to Polkadot Hub (Chopsticks fork)');

  // Create the transfer transaction
  const tx = api.tx.balances.transferKeepAlive(TARGET_ADDRESS, TRANSFER_AMOUNT);

  // Define the USDT asset as an XCM multi-location for fee payment
  const assetId = {
    parents: 0,
    interior: {
      X2: [{ PalletInstance: 50 }, { GeneralIndex: USDT_ASSET_ID }],
    },
  };

  // Sign and send the transaction, paying fees with USDT
  console.log('Signing and submitting transaction...');
  const txHash = await new Promise((resolve, reject) => {
    tx.signAndSend(alice, { assetId }, ({ status, events, txHash }) => {
      if (status.isFinalized) {
        console.log(
          `\nTransaction finalized in block: ${status.asFinalized.toHex()}`
        );
        console.log(`Transaction hash: ${txHash.toHex()}`);

        // Display all events
        console.log('\nEvents:');
        events.forEach(({ event }) => {
          console.log(`  ${event.section}.${event.method}`);
        });

        resolve(txHash.toHex());
      }
    }).catch(reject);
  });

  // Disconnect from the node
  await api.disconnect();
}

main().catch(console.error);
