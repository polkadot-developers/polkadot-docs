import { readFileSync } from 'fs';
import { join } from 'path';
import { createWallet } from './createWallet';
import { publicClient } from './createClient';

const deployContract = async (
  contractName: string,
  privateKey: `0x${string}`
) => {
  try {
    console.log(`Deploying ${contractName}...`);

    // Read contract artifacts
    const abi = JSON.parse(
      readFileSync(
        join(__dirname, '../artifacts', `${contractName}.json`),
        'utf8'
      )
    );
    const bytecode = `0x${readFileSync(
      join(__dirname, '../artifacts', `${contractName}.polkavm`)
    ).toString('hex')}` as `0x${string}`;

    // Create wallet
    const wallet = createWallet(privateKey);

    // Deploy contract
    const hash = await wallet.deployContract({
      abi,
      bytecode,
      args: [], // Add constructor arguments if needed
    });

    // Wait for deployment
    const receipt = await publicClient.waitForTransactionReceipt({ hash });
    const contractAddress = receipt.contractAddress;

    console.log(`Contract deployed at: ${contractAddress}`);
    return contractAddress;
  } catch (error) {
    console.error('Deployment failed:', error);
    throw error;
  }
};

const privateKey = 'INSERT_PRIVATE_KEY';
deployContract('Storage', privateKey);