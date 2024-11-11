// Assuming you have an `alice` keypair from the Keyring
const recipient = 'INSERT_RECIPIENT_ADDRESS';
const amount = 'INSERT_VALUE'; // Amount in the smallest unit (e.g., Planck for DOT)

// Sign and send a transfer
const txHash = await api.tx
  .balances
  .transfer(recipient, amount)
  .signAndSend(alice);

console.log('Transaction Hash:', txHash);
