const { ApiPromise, WsProvider } = require('@polkadot/api');

async function checkExistentialDeposit(accountAddress) {
  try {
    // Connect to Polkadot mainnet
    const provider = new WsProvider('wss://rpc.polkadot.io');
    const api = await ApiPromise.create({ provider });

    // Get account info
    const accountInfo = await api.query.system.account(accountAddress);
    
    // Get existential deposit from runtime constants
    const existentialDeposit = api.consts.balances.existentialDeposit.toBigInt();
    
    // Get account balance
    const accountBalance = accountInfo.data.free.toBigInt();
    
    // Convert to DOT (divide by 10^10 planck units)
    const balanceInDOT = Number(accountBalance) / Math.pow(10, 10);
    const existentialDepositInDOT = Number(existentialDeposit) / Math.pow(10, 10);
    
    console.log(`Account: ${accountAddress}`);
    console.log(`Balance: ${balanceInDOT} DOT`);
    console.log(`Existential Deposit: ${existentialDepositInDOT} DOT`);
    console.log(`Has Existential Deposit: ${accountBalance >= existentialDeposit}`);
    
    if (accountBalance >= existentialDeposit) {
      console.log('✅ Account has sufficient balance and meets existential deposit requirement');
    } else if (accountBalance === 0n) {
      console.log("⚠️ Account has zero balance (account doesn't exist or was reaped)");
    } else {
      console.log('❌ Account balance is below existential deposit - account will be reaped!');
    }
    
    await api.disconnect();
    return {
      balance: balanceInDOT,
      existentialDeposit: existentialDepositInDOT,
      hasExistentialDeposit: accountBalance >= existentialDeposit,
      accountExists: accountBalance > 0n
    };
    
  } catch (error) {
    console.error('Error checking existential deposit:', error);
    throw error;
  }
}

// Example usage
async function main() {

    const accountAddress = '15rPBCv19mXZej6DVeyM37KQeRMz1r7X3JkWt4ZYsws8kAgC'
  
  try {
    const result = await checkExistentialDeposit(accountAddress);
    console.log('Result:', result);
  } catch (error) {
    console.error('Failed to check existential deposit:', error);
  }
}

// Alternative function to check multiple accounts
async function checkMultipleAccounts(addresses) {
  const provider = new WsProvider('wss://rpc.polkadot.io');
  const api = await ApiPromise.create({ provider });
  
  const existentialDeposit = api.consts.balances.existentialDeposit.toBigInt();
  
  console.log('Checking multiple accounts...\n');
  
  for (const address of addresses) {
    try {
      const accountInfo = await api.query.system.account(address);
      const balance = accountInfo.data.free.toBigInt();
      const hasED = balance >= existentialDeposit;
      
      console.log(`${address}: ${Number(balance) / Math.pow(10, 10)} DOT - ${hasED ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`${address}: Error - ${error.message}`);
    }
  }
  
  await api.disconnect();
}

// Run the check
main(); 