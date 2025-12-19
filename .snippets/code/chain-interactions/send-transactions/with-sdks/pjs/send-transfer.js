import { ApiPromise, WsProvider } from '@polkadot/api';
import { Keyring } from '@polkadot/keyring';
import { cryptoWaitReady } from '@polkadot/util-crypto';

const POLKADOT_TESTNET_RPC = 'INSERT_WS_ENDPOINT';
const SENDER_MNEMONIC = 'INSERT_MNEMONIC';
const DEST_ADDRESS = 'INSERT_DEST_ADDRESS';
const AMOUNT = 1_000_000_000n; // 1 PAS (adjust decimals as needed)

async function main() {
  // Wait for crypto to be ready
  await cryptoWaitReady();

  // Create a WebSocket provider
  const wsProvider = new WsProvider(POLKADOT_TESTNET_RPC);

  // Initialize the API
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log('Connected to Polkadot Testnet');

  // Set up keyring and get sender account
  const keyring = new Keyring({ type: 'sr25519' });
  const sender = keyring.addFromMnemonic(SENDER_MNEMONIC);
  const senderAddress = sender.address;

  console.log(`Sender address: ${senderAddress}`);
  console.log(`Recipient address: ${DEST_ADDRESS}`);
  console.log(`Amount: ${AMOUNT} (${Number(AMOUNT) / 1_000_000_000} PAS)\n`);

  // Get sender's account info to check balance
  const accountInfo = await api.query.system.account(senderAddress);
  console.log(
    `Sender balance: ${accountInfo.data.free.toString()} (${
      Number(accountInfo.data.free.toBigInt()) / 1_000_000_000
    } PAS)`
  );

  // Construct and sign the transfer transaction
  console.log('\nSigning and submitting transaction...');

  await new Promise((resolve, reject) => {
    api.tx.balances
      .transferKeepAlive(DEST_ADDRESS, AMOUNT)
      .signAndSend(sender, ({ status, txHash, dispatchError }) => {
        if (status.isInBlock) {
          console.log(
            `Transaction included in block: ${status.asInBlock.toHex()}`
          );
        } else if (status.isFinalized) {
          console.log(
            `Transaction finalized in block: ${status.asFinalized.toHex()}`
          );
          console.log(`Transaction hash: ${txHash.toHex()}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(
                dispatchError.asModule
              );
              const { docs, name, section } = decoded;
              reject(new Error(`${section}.${name}: ${docs.join(' ')}`));
            } else {
              reject(new Error(dispatchError.toString()));
            }
          } else {
            console.log('Transaction successful!');
            resolve(txHash.toHex());
          }
        }
      })
      .catch(reject);
  });

  // Disconnect from the node
  await api.disconnect();
}

main().catch(console.error);
