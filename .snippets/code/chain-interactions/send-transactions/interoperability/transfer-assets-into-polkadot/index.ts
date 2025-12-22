import { EvmBuilder, getTokenBalance, approveToken, getBridgeStatus } from '@paraspell/sdk-pjs';
import { ethers } from 'ethers';

// Ethereum mainnet RPC endpoint (use your own API key)
const ETH_RPC = 'https://eth-mainnet.g.alchemy.com/v2/INSERT_API_KEY';

// WETH contract address on Ethereum mainnet
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

// WETH has 18 decimals
const WETH_UNITS = 1_000_000_000_000_000_000n;

// Amount to bridge: 0.001 WETH
const AMOUNT = (WETH_UNITS / 1000n).toString();

// Your Polkadot address to receive the bridged tokens (SS58 format)
const RECIPIENT_ADDRESS = 'INSERT_YOUR_POLKADOT_ADDRESS';

// Connect to Ethereum mainnet
async function getProviderAndSigner() {
  // For browser wallet (MetaMask)
  // const provider = new ethers.BrowserProvider(window.ethereum);

  // For script-based execution with private key
  const provider = new ethers.JsonRpcProvider(ETH_RPC);
  const signer = new ethers.Wallet('INSERT_PRIVATE_KEY', provider);

  return { provider, signer };
}

async function approveTokens() {
  const { signer } = await getProviderAndSigner();

  // Check current WETH balance
  const balance = await getTokenBalance(signer, 'WETH');
  console.log(`Current WETH balance: ${balance}`);

  if (BigInt(balance) === 0n) {
    console.log('No WETH balance. Please wrap some ETH to WETH first.');
    console.log(`WETH contract: ${WETH_ADDRESS}`);
    process.exit(1);
  }

  // Approve the Snowbridge Gateway contract to spend WETH
  const { result: approveTx } = await approveToken(signer, BigInt(AMOUNT), 'WETH');
  console.log(`Approval transaction hash: ${approveTx.hash}`);

  // Wait for confirmation
  await approveTx.wait();
  console.log('Token approval confirmed!');
}

approveTokens();

async function bridgeToPolkadot() {
  const { provider, signer } = await getProviderAndSigner();

  console.log('Building bridge transaction...');
  console.log(`Bridging ${AMOUNT} WETH to Polkadot Hub`);
  console.log(`Recipient: ${RECIPIENT_ADDRESS}`);

  // Build and execute the bridge transfer
  // Note: 'AssetHubPolkadot' is the SDK identifier for Polkadot Hub
  const result = await EvmBuilder(provider)
    .to('AssetHubPolkadot')
    .currency({
      symbol: 'WETH',
      amount: AMOUNT,
    })
    .address(RECIPIENT_ADDRESS)
    .signer(signer)
    .build();

  console.log('Bridge transaction submitted!');
  console.log(`Transaction hash: ${result.response.hash}`);
  console.log('Transfer will arrive in approximately 30 minutes.');

  // Wait for Ethereum confirmation
  await result.response.wait();
  console.log('Ethereum transaction confirmed! Waiting for bridge relay...');
}

bridgeToPolkadot();

async function checkBridgeStatus() {
  // Check the current status of the Snowbridge
  const status = await getBridgeStatus();
  console.log('Bridge Status:', status);
}

checkBridgeStatus();
