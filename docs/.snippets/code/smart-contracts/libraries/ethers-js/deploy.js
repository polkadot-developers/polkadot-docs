const { writeFileSync, existsSync, readFileSync } = require('fs');
const { join } = require('path');
const { ethers, JsonRpcProvider } = require('ethers');

const scriptsDir = __dirname;
const artifactsDir = join(__dirname, '../contracts');

// Creates a provider with specified RPC URL and chain details
const createProvider = (rpcUrl, chainId, chainName) => {
  const provider = new JsonRpcProvider(rpcUrl, {
    chainId: chainId,
    name: chainName,
  });
  return provider;
};

// Reads and parses the ABI file for a given contract
const getAbi = (contractName) => {
  try {
    const abiPath = join(artifactsDir, `${contractName}.json`);
    return JSON.parse(readFileSync(abiPath, 'utf8'));
  } catch (error) {
    console.error(
      `Could not find ABI for contract ${contractName}:`,
      error.message,
    );
    throw error;
  }
};

// Reads the compiled bytecode for a given contract
const getByteCode = (contractName) => {
  try {
    const bytecodePath = join(artifactsDir, `${contractName}.bin`);
    const bytecode = readFileSync(bytecodePath, 'utf8').trim();
    // Add 0x prefix if not present
    return bytecode.startsWith('0x') ? bytecode : `0x${bytecode}`;
  } catch (error) {
    console.error(
      `Could not find bytecode for contract ${contractName}:`,
      error.message,
    );
    throw error;
  }
};

const deployContract = async (contractName, mnemonic, providerConfig) => {
  console.log(`Deploying ${contractName}...`);
  try {
    // Step 1: Set up provider and wallet
    const provider = createProvider(
      providerConfig.rpc,
      providerConfig.chainId,
      providerConfig.name,
    );
    const walletMnemonic = ethers.Wallet.fromPhrase(mnemonic);
    const wallet = walletMnemonic.connect(provider);

    // Step 2: Create and deploy the contract
    const factory = new ethers.ContractFactory(
      getAbi(contractName),
      getByteCode(contractName),
      wallet,
    );
    const contract = await factory.deploy();
    await contract.waitForDeployment();

    // Step 3: Save deployment information
    const address = await contract.getAddress();
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
  rpc: 'https://services.polkadothub-rpc.com/testnet',
  chainId: 420420417,
  name: 'polkadot-hub-testnet',
};

const mnemonic = 'INSERT_MNEMONIC';

deployContract('Storage', mnemonic, providerConfig);