const { JsonRpcProvider } = require('ethers');
const provider = new JsonRpcProvider('http://localhost:8545');
const wallet = new ethers.Wallet('YOUR_PRIVATE_KEY', provider);

// Deploy using direct provider instead of Hardhat's wrapper
const ContractFactory = new ethers.ContractFactory(
  contractABI,
  contractBytecode,
  wallet
);
const contract = await ContractFactory.deploy(...constructorArgs);
