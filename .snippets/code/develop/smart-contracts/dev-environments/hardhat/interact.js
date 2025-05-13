const hre = require('hardhat');

async function main() {
  // Get the contract factory
  const MyToken = await hre.ethers.getContractFactory('MyToken');

  // Replace with your deployed contract address
  const contractAddress = 'INSERT_CONTRACT_ADDRESS';

  // Attach to existing contract
  const token = await MyToken.attach(contractAddress);

  // Get signers
  const [deployer] = await hre.ethers.getSigners();

  // Read contract state
  const name = await token.name();
  const symbol = await token.symbol();
  const totalSupply = await token.totalSupply();
  const balance = await token.balanceOf(deployer.address);

  console.log(`Token: ${name} (${symbol})`);
  console.log(
    `Total Supply: ${hre.ethers.formatUnits(totalSupply, 18)} tokens`
  );
  console.log(
    `Deployer Balance: ${hre.ethers.formatUnits(balance, 18)} tokens`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
