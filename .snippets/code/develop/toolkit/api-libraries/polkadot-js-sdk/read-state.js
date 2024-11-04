// Example address
const ADDRESS = '5DTestUPts3kjeXSTMyerHihn1uwMfLj8vU8sqF7qYrFabHE';

// Get current timestamp
const timestamp = await api.query.timestamp.now();

// Get account information
const { nonce, data: balance } = await api.query.system.account(ADDRESS);

console.log(`
  Timestamp: ${timestamp}
  Free Balance: ${balance.free}
  Nonce: ${nonce}
`);
