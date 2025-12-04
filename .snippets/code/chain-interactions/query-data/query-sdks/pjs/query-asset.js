import { ApiPromise, WsProvider } from "@polkadot/api";

const ASSET_HUB_RPC = "INSERT_WS_ENDPOINT";

// USDT on Polkadot Hub
const USDT_ASSET_ID = 1984;

// Example address to query asset balance
const ADDRESS = "INSERT_ADDRESS";

async function main() {
  // Create a WebSocket provider
  const wsProvider = new WsProvider(ASSET_HUB_RPC);

  // Initialize the API
  const api = await ApiPromise.create({ provider: wsProvider });

  console.log("Connected to Polkadot Hub");
  console.log(`Querying asset ID: ${USDT_ASSET_ID}\n`);

  // Query asset metadata
  const assetMetadata = await api.query.assets.metadata(USDT_ASSET_ID);

  console.log("Asset Metadata:");
  console.log(`  Name: ${assetMetadata.name.toUtf8()}`);
  console.log(`  Symbol: ${assetMetadata.symbol.toUtf8()}`);
  console.log(`  Decimals: ${assetMetadata.decimals.toString()}`);

  // Query asset details
  const assetDetails = await api.query.assets.asset(USDT_ASSET_ID);

  if (assetDetails.isSome) {
    const details = assetDetails.unwrap();
    console.log("\nAsset Details:");
    console.log(`  Owner: ${details.owner.toString()}`);
    console.log(`  Supply: ${details.supply.toString()}`);
    console.log(`  Accounts: ${details.accounts.toString()}`);
    console.log(`  Min Balance: ${details.minBalance.toString()}`);
    console.log(`  Status: ${details.status.type}`);
  }

  // Query account's asset balance
  console.log(`\nQuerying asset balance for: ${ADDRESS}`);
  const assetAccount = await api.query.assets.account(USDT_ASSET_ID, ADDRESS);

  if (assetAccount.isSome) {
    const account = assetAccount.unwrap();
    console.log("\nAsset Account:");
    console.log(`  Balance: ${account.balance.toString()}`);
    console.log(`  Status: ${account.status.type}`);
  } else {
    console.log("\nNo asset balance found for this account");
  }

  // Disconnect from the node
  await api.disconnect();
}

main().catch(console.error);
