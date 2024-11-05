// Assuming you have an `alice` keypair from the Keyring
const RECIPIENT = 'INSERT_RECIPIENT_ADDRESS';
const AMOUNT = 'INSERT_VALUE'; // Amount in the smallest unit (e.g., Planck for DOT)

// Sign and send a transfer
const txHash = await api.tx
  .balances
  .transfer(RECIPIENT, AMOUNT)
  .signAndSend(alice);

console.log('Transaction Hash:', txHash);
