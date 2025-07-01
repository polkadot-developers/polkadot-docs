import { assetHub } from "@polkadot-api/descriptors";
import { Binary, createClient } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { getPolkadotSigner } from "polkadot-api/signer";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

const toHuman = (_key: any, value: any) => {
    if (typeof value === 'bigint') {
        return Number(value);
    }

    if (value && typeof value === "object" && typeof value.asHex === "function") {
        return value.asHex();
    }

    return value;
};

async function main() {
    await cryptoWaitReady();

    const provider = withPolkadotSdkCompat(getWsProvider("ws://localhost:8000"));
    const client = createClient(provider);
    const api = client.getTypedApi(assetHub);

    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");
    const aliceSigner = getPolkadotSigner(alice.publicKey, "Sr25519", alice.sign);

    const callData = Binary.fromHex(
        "0x1f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000"
    );
    const tx: any = await api.txFromCallData(callData);
    console.log("Executing XCM:", JSON.stringify(tx.decodedCall, toHuman, 2));

    await new Promise<void>((resolve) => {
        const subscription = tx.signSubmitAndWatch(aliceSigner).subscribe((ev) => {
            if (ev.type === "finalized" || (ev.type === "txBestBlocksState" && ev.found)) {
                console.log(`📦 Included in block #${ev.block.number}: ${ev.block.hash}`);

                if (!ev.ok) {
                    const dispatchError = ev.dispatchError;
                    if (dispatchError.type === "Module") {
                        const modErr: any = dispatchError.value;
                        console.error(`❌ Dispatch error in module: ${modErr.type} → ${modErr.value?.type}`);
                    } else {
                        console.error("❌ Dispatch error:", JSON.stringify(dispatchError, toHuman, 2));
                    }
                }

                for (const event of ev.events) {
                    console.log("📣 Event:", event.type, JSON.stringify(event.value, toHuman, 2));
                }

                console.log("✅ Process completed, exiting...");
                subscription.unsubscribe();
                resolve();
            }
        });
    });

    client.destroy();
}

main().catch(console.error);