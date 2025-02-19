import { readFileSync } from 'fs';
import { Web3 } from 'web3';

const getAbi = (contractName) => {
  try {
    return JSON.parse(readFileSync(`${contractName}.json`), 'utf8');
  } catch (error) {
    console.error(
      `❌ Could not find ABI for contract ${contractName}:`,
      error.message
    );
    throw error;
  }
};

const updateStorage = async (config) => {
  try {
    // Initialize Web3 with RPC URL
    const web3 = new Web3(config.rpcUrl);

    // Prepare account
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    // Load abi
    const abi = getAbi('Storage');

    // Create contract instance
    const contract = new web3.eth.Contract(abi, config.contractAddress);

    // Get initial value
    const initialValue = await contract.methods.storedNumber().call();
    console.log('Current stored value:', initialValue);

    // Prepare transaction
    const updateTransaction = contract.methods.setNumber(1);

    // Estimate gas
    const gasEstimate = await updateTransaction.estimateGas({
      from: account.address,
    });

    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Send update transaction
    const receipt = await updateTransaction.send({
      from: account.address,
      gas: gasEstimate,
      gasPrice: gasPrice,
    });

    // Log transaction details
    console.log(`Transaction hash: ${receipt.transactionHash}`);

    // Get updated value
    const newValue = await contract.methods.storedNumber().call();
    console.log('New stored value:', newValue);

    return receipt;
  } catch (error) {
    console.error('Update failed:', error);
    throw error;
  }
};

// Example usage
const config = {
  rpcUrl: 'INSERT_RPC_URL',
  privateKey: 'INSERT_PRIVATE_KEY',
  contractAddress: 'INSERT_CONTRACT_ADDRESS',
};

updateStorage(config)
  .then((receipt) => console.log('Update successful'))
  .catch((error) => console.error('Update error'));
