import { createClient } from 'polkadot-api';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { polkadotTestNet } from '@polkadot-api/descriptors';
import { getWsProvider } from 'polkadot-api/ws-provider';

async function calculateFees() {
  // Connect to chain
  const client = createClient(
    withPolkadotSdkCompat(getWsProvider('INSERT_WS_ENDPOINT'))
  );

  // Get typed API
  const api = client.getTypedApi(polkadotTestNet);

  // Define sender and recipient addresses
  const aliceAddress = 'INSERT_ALICE_ADDRESS';
  const bobAddress = 'INSERT_BOB_ADDRESS';

  // Amount to transfer (1 DOT = 10^10 plancks)
  const amount = 10_000_000_000n; // 1 DOT

  try {
    // Create the transaction
    const tx = api.tx.Balances.transfer_keep_alive({
      dest: {
        type: 'Id',
        value: bobAddress,
      },
      value: amount,
    });

    // Estimate fees
    const estimatedFees = await tx.getEstimatedFees(aliceAddress);

    console.log(`Estimated fee: ${Number(estimatedFees) / 1e10} DOT`);
    console.log(`Transaction amount: ${Number(amount) / 1e10} DOT`);
    console.log(`Total deducted: ${Number(estimatedFees + amount) / 1e10} DOT`);
  } catch (error) {
    console.error('Error calculating fees:', error);
  } finally {
    // Clean up
    client.destroy();
  }
}

calculateFees();