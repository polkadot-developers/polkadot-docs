import { ApiPromise, WsProvider } from '@polkadot/api';

async function calculateFees() {
  // Connect to chain
  const wsProvider = new WsProvider('INSERT_WS_ENDPOINT');
  const api = await ApiPromise.create({ provider: wsProvider });

  // Wait for API to be ready
  await api.isReady;

  // Define sender and recipient addresses
  const aliceAddress = 'INSERT_ALICE_ADDRESS';
  const bobAddress = 'INSERT_BOB_ADDRESS';

  // Amount to transfer (1 DOT = 10^10 plancks)
  const amount = 10_000_000_000n; // 1 DOT

  try {
    // Create the transaction
    const tx = api.tx.balances.transferKeepAlive(bobAddress, amount);

    // Get payment information
    const paymentInfo = await tx.paymentInfo(aliceAddress);

    console.log(
      `Estimated fee: ${Number(paymentInfo.partialFee.toBigInt()) / 1e10} DOT`
    );
    console.log(`Transaction amount: ${Number(amount) / 1e10} DOT`);
    console.log(
      `Total deducted: ${
        Number(paymentInfo.partialFee.toBigInt() + amount) / 1e10
      } DOT`
    );
  } catch (error) {
    console.error('Error calculating fees:', error);
  } finally {
    // Clean up
    await api.disconnect();
  }
}

calculateFees();