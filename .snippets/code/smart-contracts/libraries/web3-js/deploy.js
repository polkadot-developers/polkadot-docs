const { writeFileSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { Web3 } = require('web3');

const scriptsDir = __dirname;
const abisDir = join(__dirname, '../abis');
const artifactsDir = join(__dirname, '../artifacts');

const createProvider = (rpcUrl, chainId, chainName) => {
  const web3 = new Web3(rpcUrl);
  return web3;
};

const getAbi = (contractName) => {
  try {
    const abiPath = join(abisDir, `${contractName}.json`);
    return JSON.parse(readFileSync(abiPath, 'utf8'));
  } catch (error) {
    console.error(
      `Could not find ABI for contract ${contractName}:`,
      error.message,
    );
    throw error;
  }
};

const getByteCode = (contractName) => {
  try {
    const bytecodePath = join(artifactsDir, `${contractName}.bin`);
    const bytecode = readFileSync(bytecodePath, 'utf8').trim();
    return bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;
  } catch (error) {
    console.error(
      `Could not find bytecode for contract ${contractName}:`,
      error.message,
    );
    throw error;
  }
};

const deployContract = async (contractName, privateKey, providerConfig) => {
  console.log(`Deploying ${contractName}...`);
  try {
    const web3 = createProvider(
      providerConfig.rpc,
      providerConfig.chainId,
      providerConfig.name,
    );

    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    const account = web3.eth.accounts.privateKeyToAccount(formattedPrivateKey);
    web3.eth.accounts.wallet.add(account);
    web3.eth.defaultAccount = account.address;

    const abi = getAbi(contractName);
    const bytecode = getByteCode(contractName);
    const contract = new web3.eth.Contract(abi);
    const deployTx = contract.deploy({
      data: bytecode,
    });

    const gas = await deployTx.estimateGas();
    const gasPrice = await web3.eth.getGasPrice();

    console.log(`Estimated gas: ${gas}`);
    console.log(`Gas price: ${web3.utils.fromWei(gasPrice, 'gwei')} gwei`);

    const deployedContract = await deployTx.send({
      from: account.address,
      gas: gas,
      gasPrice: gasPrice,
    });

    const address = deployedContract.options.address;
    console.log(`Contract ${contractName} deployed at: ${address}`);

    const addressesFile = join(scriptsDir, 'contract-address.json');
    const addresses = existsSync(addressesFile)
      ? JSON.parse(readFileSync(addressesFile, 'utf8'))
      : {};

    addresses[contractName] = address;
    writeFileSync(addressesFile, JSON.stringify(addresses, null, 2), 'utf8');
  } catch (error) {
    console.error(`Failed to deploy contract ${contractName}:`, error);
  }
};

const providerConfig = {
  rpc: 'https://testnet-passet-hub-eth-rpc.polkadot.io', // TODO: replace to `https://services.polkadothub-rpc.com/testnet` when ready
  chainId: 420420422,
  name: 'polkadot-hub-testnet',
};

const privateKey = 'INSERT_PRIVATE_KEY';

deployContract('Storage', privateKey, providerConfig);

