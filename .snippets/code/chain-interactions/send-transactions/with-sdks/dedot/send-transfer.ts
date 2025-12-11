import { DedotClient, WsProvider } from 'dedot';
import type { PolkadotAssetHubApi } from '@dedot/chaintypes';
import { cryptoWaitReady } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';

const POLKADOT_TESTNET_RPC = 'INSERT_WS_ENDPOINT';
const SENDER_MNEMONIC = 'INSERT_MNEMONIC';
const DEST_ADDRESS = 'INSERT_DEST_ADDRESS';
const AMOUNT = 1_000_000_000n; // 1 PAS (adjust decimals as needed)

async function main() {
  // Wait for crypto to be ready
  await cryptoWaitReady();

  // Initialize provider and client with Asset Hub types
  const provider = new WsProvider(POLKADOT_TESTNET_RPC);
  const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

  console.log('Connected to Polkadot Testnet');

  // Set up keyring and get sender account
  const keyring = new Keyring({ type: 'sr25519' });
  const sender = keyring.addFromMnemonic(SENDER_MNEMONIC);
  const senderAddress = sender.address;

  console.log(`Sender address: ${senderAddress}`);
  console.log(`Recipient address: ${DEST_ADDRESS}`);
  console.log(`Amount: ${AMOUNT} (${AMOUNT / 1_000_000_000n} PAS)\n`);

  // Get sender's account info to check balance
  const accountInfo = await client.query.system.account(senderAddress);
  console.log(`Sender balance: ${accountInfo.data.free}`);

  // Sign and submit the transfer transaction
  console.log('\nSigning and submitting transaction...');

  // Wait for transaction to complete using a Promise
  await new Promise<void>((resolve, reject) => {
    client.tx.balances
      .transferKeepAlive(DEST_ADDRESS, AMOUNT)
      .signAndSend(sender, async ({ status, txHash, dispatchError }) => {
        console.log(`Transaction status: ${status.type}`);

        // Log transaction hash immediately
        if (txHash) {
          console.log(
            `Transaction hash: ${
              typeof txHash === 'string' ? txHash : txHash.toHex()
            }`
          );
        }

        if (status.type === 'BestChainBlockIncluded') {
          console.log(
            `Transaction included in block: ${status.value.blockHash}`
          );
        }

        if (status.type === 'Finalized') {
          console.log(
            `Transaction finalized in block: ${status.value.blockHash}`
          );

          // Check for dispatch errors
          if (dispatchError) {
            if (dispatchError.type === 'Module') {
              const decoded = client.registry.findMetaError(
                dispatchError.value
              );
              console.error(
                `Dispatch error: ${decoded.section}.${decoded.name}: ${decoded.docs}`
              );
              reject(
                new Error(
                  `Transaction failed: ${decoded.section}.${decoded.name}`
                )
              );
            } else {
              console.error(`Dispatch error: ${dispatchError.type}`);
              reject(new Error(`Transaction failed: ${dispatchError.type}`));
            }
          } else {
            console.log('Transaction successful!');
            resolve();
          }
        }
      })
      .catch(reject);
  });

  // Disconnect the client after transaction completes
  await client.disconnect();
  console.log('Disconnected from Polkadot Hub');
}

main().catch(console.error);
