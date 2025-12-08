import { createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { polkadotTestNet } from "@polkadot-api/descriptors";
import { cryptoWaitReady } from "@polkadot/util-crypto";
import { Keyring } from "@polkadot/keyring";
import { getPolkadotSigner } from "polkadot-api/signer";

const POLKADOT_TESTNET_RPC = "INSERT_RPC_URL";
const SENDER_MNEMONIC = "INSERT_MNEMONIC";
const DEST_ADDRESS = "INSERT_DEST_ADDRESS";
const AMOUNT = 1_000_000_000n; // 1 PAS (adjust decimals as needed)

async function main() {
  try {
    await cryptoWaitReady();

    const keyring = new Keyring({ type: "sr25519" });
    const sender = keyring.addFromMnemonic(SENDER_MNEMONIC);
    
    console.log(`Sender address: ${sender.address}`);

    // Create the client connection
    const client = createClient(
      withPolkadotSdkCompat(getWsProvider(POLKADOT_TESTNET_RPC))
    );

    // Get the typed API
    const api = client.getTypedApi(polkadotTestNet);
    console.log("Connected to Polkadot Testnet");

    // Create signer using getPolkadotSigner
    const signer = getPolkadotSigner(
      sender.publicKey,
      "Sr25519",
      async (input) => sender.sign(input)
    );

    // Construct and submit the transfer transaction
    const tx = api.tx.Balances.transfer_keep_alive({
      dest: { type: "Id", value: DEST_ADDRESS },
      value: AMOUNT,
    });

    console.log("\nSigning and submitting transaction...");
    const { txHash } = (await tx.signAndSubmit(signer));
    console.log(`Transaction submitted with hash: ${txHash}`);
    
    await client.destroy();
    console.log("Disconnected");
    
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();