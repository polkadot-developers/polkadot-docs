import { DedotClient, WsProvider } from "dedot";
import type { PolkadotAssetHubApi } from "@dedot/chaintypes";

const POLKADOT_HUB_RPC = "INSERT_WS_ENDPOINT";
const ACCOUNT_ADDRESS = "INSERT_ACCOUNT_ADDRESS";
const PAS_UNITS = 10_000_000_000;

async function main() {
  // Initialize provider and client with Asset Hub types
  const provider = new WsProvider(POLKADOT_HUB_RPC);
  const client = await DedotClient.new<PolkadotAssetHubApi>(provider);

  console.log("Connected to Polkadot Hub");

  console.log(`\nQuerying account: ${ACCOUNT_ADDRESS}\n`);

  // Query account information
  const accountInfo = await client.query.system.account(ACCOUNT_ADDRESS);

  // Display account information
  console.log("Account Information:");
  console.log("===================");
  console.log(`Nonce: ${accountInfo.nonce}`);
  console.log(`Consumers: ${accountInfo.consumers}`);
  console.log(`Providers: ${accountInfo.providers}`);
  console.log(`Sufficients: ${accountInfo.sufficients}`);
  
  console.log("\nBalance Details:");
  console.log("================");
  console.log(`Free Balance: ${accountInfo.data.free} (${Number(accountInfo.data.free) / PAS_UNITS} PAS)`);
  console.log(`Reserved Balance: ${accountInfo.data.reserved} (${Number(accountInfo.data.reserved) / PAS_UNITS} PAS)`);
  console.log(`Frozen Balance: ${accountInfo.data.frozen} (${Number(accountInfo.data.frozen) / PAS_UNITS} PAS)`);
  
  const total = Number(accountInfo.data.free) + Number(accountInfo.data.reserved);
  console.log(`\nTotal Balance: ${total} (${total / PAS_UNITS} PAS)`);

  // Disconnect the client
  await client.disconnect();
  console.log("\nDisconnected from Polkadot Hub");
}

main().catch(console.error);