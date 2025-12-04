import { DedotClient, WsProvider } from "dedot";
import { hexToString } from "dedot/utils";
import type { PolkadotAssetHubApi } from "@dedot/chaintypes";

const ASSET_HUB_RPC = "INSERT_WS_ENDPOINT";

// USDT on Polkadot Hub
const USDT_ASSET_ID = 1984;

// Example address to query asset balance
const ADDRESS = "INSERT_ADDRESS";

async function main() {
  // Initialize provider and client with Asset Hub types
  const provider = new WsProvider(ASSET_HUB_RPC);
  const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

  console.log("Connected to Polkadot Hub");
  console.log(`Querying asset ID: ${USDT_ASSET_ID}\n`);

  // Query asset metadata
  const assetMetadata = await client.query.assets.metadata(USDT_ASSET_ID);

  console.log("Asset Metadata:");
  console.log(`  Name: ${hexToString(assetMetadata.name)}`);
  console.log(`  Symbol: ${hexToString(assetMetadata.symbol)}`);
  console.log(`  Decimals: ${assetMetadata.decimals}`);

  // Query asset details
  const assetDetails = await client.query.assets.asset(USDT_ASSET_ID);

  if (assetDetails) {
    console.log("\nAsset Details:");
    console.log(`  Owner: ${assetDetails.owner.address()}`);
    console.log(`  Supply: ${assetDetails.supply}`);
    console.log(`  Accounts: ${assetDetails.accounts}`);
    console.log(`  Min Balance: ${assetDetails.minBalance}`);
    console.log(`  Status: ${JSON.stringify(assetDetails.status)}`);
  }

  // Query account's asset balance
  console.log(`\nQuerying asset balance for: ${ADDRESS}`);
  const assetAccount = await client.query.assets.account([
    USDT_ASSET_ID,
    ADDRESS,
  ]);

  if (assetAccount) {
    console.log("\nAsset Account:");
    console.log(`  Balance: ${assetAccount.balance}`);
    console.log(`  Status: ${JSON.stringify(assetAccount.status)}`);
  } else {
    console.log("\nNo asset balance found for this account");
  }

  // Disconnect the client
  await client.disconnect();
}

main().catch(console.error);
