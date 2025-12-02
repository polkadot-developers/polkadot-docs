import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { pah } from "@polkadot-api/descriptors";

const ASSET_HUB_RPC = "wss://polkadot-asset-hub-rpc.polkadot.io";

// USDT on Polkadot Hub
const USDT_ASSET_ID = 1984;

// Example address to query asset balance
const ADDRESS = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3";

async function main() {
  // Create the client connection
  const client = createClient(
    withPolkadotSdkCompat(getWsProvider(ASSET_HUB_RPC))
  );

  // Get the typed API for Polkadot Hub
  const api = client.getTypedApi(pah);

  console.log("Connected to Polkadot Hub");
  console.log(`Querying asset ID: ${USDT_ASSET_ID}\n`);

  // Query asset metadata
  const assetMetadata = await api.query.Assets.Metadata.getValue(USDT_ASSET_ID);

  if (assetMetadata) {
    console.log("Asset Metadata:");
    console.log(`  Name: ${assetMetadata.name.asText()}`);
    console.log(`  Symbol: ${assetMetadata.symbol.asText()}`);
    console.log(`  Decimals: ${assetMetadata.decimals}`);
  }

  // Query asset details
  const assetDetails = await api.query.Assets.Asset.getValue(USDT_ASSET_ID);

  if (assetDetails) {
    console.log("\nAsset Details:");
    console.log(`  Owner: ${assetDetails.owner}`);
    console.log(`  Supply: ${assetDetails.supply}`);
    console.log(`  Accounts: ${assetDetails.accounts}`);
    console.log(`  Min Balance: ${assetDetails.min_balance}`);
    console.log(`  Status: ${assetDetails.status.type}`);
  }

  // Query account's asset balance
  console.log(`\nQuerying asset balance for: ${ADDRESS}`);
  const assetAccount = await api.query.Assets.Account.getValue(
    USDT_ASSET_ID,
    ADDRESS
  );

  if (assetAccount) {
    console.log("\nAsset Account:");
    console.log(`  Balance: ${assetAccount.balance}`);
    console.log(`  Status: ${assetAccount.status.type}`);
  } else {
    console.log("\nNo asset balance found for this account");
  }

  // Disconnect the client
  client.destroy();
}

main().catch(console.error);
