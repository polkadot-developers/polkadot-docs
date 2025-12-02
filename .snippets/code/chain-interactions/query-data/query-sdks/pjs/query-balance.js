import { ApiPromise, WsProvider } from "@polkadot/api";

const ASSET_HUB_RPC = "wss://polkadot-asset-hub-rpc.polkadot.io";

// Example address to query (Polkadot Hub address)
const ADDRESS = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3";

async function main() {
  // Create a WebSocket provider
  const wsProvider = new WsProvider(ASSET_HUB_RPC);

  // Initialize the API
  const api = await ApiPromise.create({ provider: wsProvider });

  console.log("Connected to Polkadot Hub");
  console.log(`Querying balance for: ${ADDRESS}\n`);

  // Query the system.account storage
  const accountInfo = await api.query.system.account(ADDRESS);

  // Extract balance information
  const { nonce, data } = accountInfo;
  const { free, reserved, frozen } = data;

  console.log("Account Information:");
  console.log(`  Nonce: ${nonce.toString()}`);
  console.log(`  Free Balance: ${free.toString()}`);
  console.log(`  Reserved: ${reserved.toString()}`);
  console.log(`  Frozen: ${frozen.toString()}`);

  // Disconnect from the node
  await api.disconnect();
}

main().catch(console.error);
