const { Web3 } = require('web3');
const fs = require('fs');
const path = require('path');

// ... (provider setup and utility functions)

const deployContract = async (contractName, privateKey, providerConfig) => {
  console.log(`Deploying ${contractName}...`);

  try {
    // Setup web3 and account
    const web3 = createProvider(providerConfig.rpc);
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    web3.eth.accounts.wallet.add(account);

    // Create contract instance
    const Contract = new web3.eth.Contract(getAbi(contractName));

    // Deploy contract
    const contract = await Contract.deploy({
      data: getByteCode(contractName),
    }).send({
      from: account.address,
      gas: await Contract.deploy({
        data: getByteCode(contractName),
      }).estimateGas(),
    });

    console.log(`Contract deployed at: ${contract.options.address}`);
    return contract;
  } catch (error) {
    console.error(`Failed to deploy contract:`, error);
    throw error;
  }
};
