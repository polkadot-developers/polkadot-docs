const hre = require('hardhat');

async function main() {
  // Get the contract instance
  const Lock = await hre.ethers.getContractFactory('Lock');
  const contractAddress = '0x46E0a43DC905a5b8FA9Fc4dA61774abE31a098a5';
  const lock = await Lock.attach(contractAddress);

  // Read contract state
  const unlockTime = await lock.unlockTime();

  const unlockTimestamp = Number(unlockTime);
  console.log(`Unlock time: ${new Date(unlockTimestamp)}`);

  const balance = await hre.ethers.provider.getBalance(lock.target);
  console.log(`Contract balance: ${hre.ethers.formatEther(balance)} ETH`);

  // Interact with contract (transaction)
  try {
    const tx = await lock.withdraw();
    await tx.wait();
    console.log('Withdrawal successful!');
  } catch (error) {
    console.error(`Error during withdrawal: ${error.message}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
