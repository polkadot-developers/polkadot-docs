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

const getByteCode = (contractName) => {
  try {
    return `0x${readFileSync(`${contractName}.polkavm`).toString('hex')}`;
  } catch (error) {
    console.error(
      `❌ Could not find bytecode for contract ${contractName}:`,
      error.message
    );
    throw error;
  }
};

export const deploy = async (config) => {
  try {
    // Initialize Web3 with RPC URL
    const web3 = new Web3(config.rpcUrl);

    // Prepare account
    const account = web3.eth.accounts.privateKeyToAccount(config.privateKey);
    web3.eth.accounts.wallet.add(account);

    // Load abi
    const abi = getAbi('Storage');

    // Create contract instance
    const contract = new web3.eth.Contract(abi);

    // Prepare deployment
    const deployTransaction = contract.deploy({
      data: getByteCode('Storage'),
      arguments: [], // Add constructor arguments if needed
    });

    // Estimate gas
    const gasEstimate = await deployTransaction.estimateGas({
      from: account.address,
    });

    // Get current gas price
    const gasPrice = await web3.eth.getGasPrice();

    // Send deployment transaction
    const deployedContract = await deployTransaction.send({
      from: account.address,
      gas: gasEstimate,
      gasPrice: gasPrice,
    });

    // Log and return contract details
    console.log(`Contract deployed at: ${deployedContract.options.address}`);
    return deployedContract;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
};

// Example usage
const deploymentConfig = {
  rpcUrl: 'INSERT_RPC_URL',
  privateKey: 'INSERT_PRIVATE_KEY',
  contractName: 'INSERT_CONTRACT_NAME',
};

deploy(deploymentConfig)
  .then((contract) => console.log('Deployment successful'))
  .catch((error) => console.error('Deployment error'));
