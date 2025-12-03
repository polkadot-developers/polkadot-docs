import { DedotClient, WsProvider } from "dedot";
import type { PolkadotAssetHubApi } from "@dedot/chaintypes";

const ASSET_HUB_RPC = "INSERT_WS_ENDPOINT";

// Example address to query (Polkadot Hub address)
const ADDRESS = "INSERT_ADDRESS";

async function main() {
  // Initialize provider and client with Asset Hub types
  const provider = new WsProvider(ASSET_HUB_RPC);
  const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

  console.log("Connected to Polkadot Hub");
  console.log(`Querying balance for: ${ADDRESS}\n`);

  // Query the system.account storage
  const accountInfo = await client.query.system.account(ADDRESS);

  // Extract balance information
  const { nonce, data } = accountInfo;
  const { free, reserved, frozen } = data;

  console.log("Account Information:");
  console.log(`  Nonce: ${nonce}`);
  console.log(`  Free Balance: ${free}`);
  console.log(`  Reserved: ${reserved}`);
  console.log(`  Frozen: ${frozen}`);

  // Disconnect the client
  await client.disconnect();
}

main().catch(console.error);
