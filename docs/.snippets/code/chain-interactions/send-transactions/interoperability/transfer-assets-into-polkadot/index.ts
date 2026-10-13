import { Builder, getBridgeStatus } from '@paraspell/sdk';
import { approveToken, getTokenBalance } from '@paraspell/evm-snowbridge';
import { createPublicClient, createWalletClient, formatUnits, http, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { mainnet } from 'viem/chains';

// Ethereum mainnet RPC endpoint (use your own API key)
const ETH_RPC = 'https://eth-mainnet.g.alchemy.com/v2/INSERT_API_KEY';

// WETH contract address on Ethereum mainnet
const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';

// WETH has 18 decimals
const WETH_UNITS = 1_000_000_000_000_000_000n;

// Amount to bridge: 0.001 WETH (raw units as bigint)
const AMOUNT = WETH_UNITS / 1000n;

// Your Polkadot address to receive the bridged tokens (SS58 format)
const RECIPIENT_ADDRESS = 'INSERT_YOUR_POLKADOT_ADDRESS';

// Connect to Ethereum mainnet
// For a browser wallet (MetaMask), use custom(window.ethereum) as the transport
const walletClient = createWalletClient({
  account: privateKeyToAccount('INSERT_PRIVATE_KEY' as Hex),
  chain: mainnet,
  transport: http(ETH_RPC),
});
const publicClient = createPublicClient({ chain: mainnet, transport: http(ETH_RPC) });

async function approveTokens() {
  // Check current WETH balance and Snowbridge Gateway allowance
  const { balance, gatewayAllowance } = await getTokenBalance(walletClient, 'WETH');
  console.log(`Current WETH balance: ${formatUnits(balance, 18)}`);

  if (balance === 0n) {
    console.log('No WETH balance. Please wrap some ETH to WETH first.');
    console.log(`WETH contract: ${WETH_ADDRESS}`);
    process.exit(1);
  }

  if (gatewayAllowance >= AMOUNT) {
    console.log('Gateway allowance already covers the transfer amount.');
    return;
  }

  // Approve the Snowbridge Gateway contract to spend WETH
  const approveTxHash = await approveToken(walletClient, AMOUNT, 'WETH');
  console.log(`Approval transaction hash: ${approveTxHash}`);

  // Wait for confirmation
  await publicClient.waitForTransactionReceipt({ hash: approveTxHash });
  console.log('Token approval confirmed!');
}

approveTokens();

async function bridgeToPolkadot() {
  console.log('Building bridge transaction...');
  console.log(`Bridging ${formatUnits(AMOUNT, 18)} WETH to Polkadot Hub`);
  console.log(`Recipient: ${RECIPIENT_ADDRESS}`);

  // Build and execute the bridge transfer
  // Note: 'AssetHubPolkadot' is the SDK identifier for Polkadot Hub
  const builder = Builder()
    .from('Ethereum')
    .to('AssetHubPolkadot')
    .currency({
      symbol: 'WETH',
      amount: AMOUNT,
    })
    .recipient(RECIPIENT_ADDRESS)
    .sender(walletClient);

  // Resolves once the Ethereum transaction is confirmed
  const txHash = await builder.signAndSubmit();
  await builder.disconnect();

  console.log('Bridge transaction confirmed on Ethereum!');
  console.log(`Transaction hash: ${txHash}`);
  console.log('Transfer will arrive in approximately 30 minutes.');
}

bridgeToPolkadot();

async function checkBridgeStatus() {
  // Check the current status of the Snowbridge
  const status = await getBridgeStatus();
  console.log('Bridge Status:', status);
  process.exit(0);
}

checkBridgeStatus();
