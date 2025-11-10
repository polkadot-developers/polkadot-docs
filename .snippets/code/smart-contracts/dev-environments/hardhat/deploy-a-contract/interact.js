const hre = require('hardhat');

async function main() {
  // Get the contract factory
  const Lock = await hre.ethers.getContractFactory('Lock');

  // Replace with your deployed contract address
  const contractAddress = '0xc01Ee7f10EA4aF4673cFff62710E1D7792aBa8f3';

  // Attach to existing contract
  const lock = await Lock.attach(contractAddress);

  // Get signers
  const [deployer] = await hre.ethers.getSigners();

  // Read contract state
  const unlockTime = await lock.unlockTime();
  console.log(`Unlock time: ${unlockTime}`);

  const balance = await lock.owner();
  console.log(`Owner: ${balance}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});