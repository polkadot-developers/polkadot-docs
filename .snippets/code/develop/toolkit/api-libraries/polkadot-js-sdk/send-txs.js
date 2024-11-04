// Assuming you have an `alice` keypair from the Keyring
const RECIPIENT = 'RECIPIENT_ADDRESS';
const AMOUNT = 12345; // Amount in the smallest unit (e.g., Planck for DOT)

// Sign and send a transfer
const txHash = await api.tx.balances
  .transfer(RECIPIENT, AMOUNT)
  .signAndSend(alice);

console.log('Transaction Hash:', txHash);
