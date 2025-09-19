import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from "@polkadot-labs/hdkd-helpers";
import { getPolkadotSigner } from "polkadot-api/signer";
import { createClient } from "polkadot-api";
import { assetHub } from "@polkadot-api/descriptors";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { MultiAddress } from "@polkadot-api/descriptors";

const TARGET_ADDRESS = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3"; // Bob's address
const TRANSFER_AMOUNT = 3_000_000_000n; // 3 DOT
const USD_ASSET_ID = 1337;

const createSigner = async () => {
  const entropy = mnemonicToEntropy(DEV_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const hdkdKeyPair = derive("//Alice");
  const polkadotSigner = getPolkadotSigner(
    hdkdKeyPair.publicKey,
    "Sr25519",
    hdkdKeyPair.sign
  );
  return polkadotSigner;
};

const client = createClient(
  withPolkadotSdkCompat(
    getWsProvider("ws://localhost:8000") // Chopsticks Asset Hub
  )
);

const api = client.getTypedApi(assetHub);

const tx = api.tx.Balances.transfer_keep_alive({
  dest: MultiAddress.Id(TARGET_ADDRESS),
  value: BigInt(TRANSFER_AMOUNT),
});

const signer = await createSigner();

const result = await tx.signAndSubmit(signer, {
  asset: {
    parents: 0,
    interior: {
      type: "X2",
      value: [
        { type: "PalletInstance", value: 50 },
        { type: "GeneralIndex", value: BigInt(USD_ASSET_ID) },
      ],
    },
  },
});

const { txHash, ok, block, events } = result;
console.log(`Tx finalized: ${txHash} (ok=${ok})`);
console.log(`Block: #${block.number} ${block.hash} [tx index ${block.index}]`);

console.log("Events:");
for (const ev of events) {
  const type = (ev as any).type ?? "unknown";
  console.log(`- ${type}`);
}

process.exit(0);