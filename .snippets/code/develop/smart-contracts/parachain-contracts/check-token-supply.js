// Required imports
const { ethers } = require('ethers');

// Network RPC endpoints
const NETWORK_CONFIGS = {
  moonbeam: {
    rpc: 'https://rpc.api.moonbeam.network',
    name: 'Moonbeam (Wormhole USDC)'
  },
  acala: {
    rpc: 'https://eth-rpc-acala.aca-api.network',
    name: 'Acala ACA'
  },
  astar: {
    rpc: 'https://evm.astar.network',
    name: 'Astar (USDC)'
  }
};

// Minimal ERC20 ABI - we only need totalSupply
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{"name": "", "type": "uint256"}],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{"name": "", "type": "uint8"}],
    "type": "function"
  }
];

async function getTokenSupply(networkKey, tokenAddress) {
  try {
    // Get network configuration
    const networkConfig = NETWORK_CONFIGS[networkKey];
    if (!networkConfig) {
      throw new Error(`Unsupported network: ${networkKey}`);
    }

    // Create provider and contract instance - Updated for ethers v6
    const provider = new ethers.JsonRpcProvider(networkConfig.rpc);
    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

    // Get total supply and decimals
    const [totalSupply, decimals] = await Promise.all([
      contract.totalSupply(),
      contract.decimals()
    ]);

    // Convert to human readable format
    const formattedSupply = ethers.formatUnits(totalSupply, decimals);

    return {
      network: networkConfig.name,
      tokenAddress,
      totalSupply: formattedSupply,
      rawTotalSupply: totalSupply.toString(),
      decimals: decimals
    };
  } catch (error) {
    throw new Error(`Error fetching token supply: ${error.message}`);
  }
}

async function main() {
  const tokens = {
    moonbeam: "0x931715FEE2d06333043d11F658C8CE934aC61D0c", // Wormhole USDC
    acala: "0x0000000000000000000100000000000000000000", // ACA
    astar: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98" // USDC on Astar
  };

  for (const [network, tokenAddress] of Object.entries(tokens)) {
    try {
      const result = await getTokenSupply(network, tokenAddress);
      console.log(`\n${result.network} Token Supply:`);
      console.log(`Address: ${result.tokenAddress}`);
      console.log(`Total Supply: ${result.totalSupply}`);
      console.log(`Decimals: ${result.decimals}`);
    } catch (error) {
      console.error(`Error for ${network}:`, error.message);
    }
  }
}

// Execute the main function and handle any errors
main().catch((error) => {
  console.error("Error in main:", error);
  process.exit(1);
});