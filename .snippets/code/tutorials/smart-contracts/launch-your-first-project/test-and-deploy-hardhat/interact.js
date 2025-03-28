const hre = require('hardhat');

async function main() {
  // Replace with your deployed contract address
  const contractAddress = 'INSERT_DEPLOYED_CONTRACT_ADDRESS';

  // Get the contract instance
  const Storage = await hre.ethers.getContractFactory('Storage');
  const storage = await Storage.attach(contractAddress);

  // Get current value
  const currentValue = await storage.retrieve();
  console.log('Current stored value:', currentValue.toString());

  // Store a new value
  const newValue = 42;
  console.log(`Storing new value: ${newValue}...`);
  const tx = await storage.store(newValue);

  // Wait for transaction to be mined
  await tx.wait();
  console.log('Transaction confirmed');

  // Get updated value
  const updatedValue = await storage.retrieve();
  console.log('Updated stored value:', updatedValue.toString());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
