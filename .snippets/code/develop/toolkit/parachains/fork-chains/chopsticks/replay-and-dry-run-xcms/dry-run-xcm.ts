import { assetHub } from "@polkadot-api/descriptors";
import { Binary, createClient, Enum } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { Keyring } from "@polkadot/keyring";
import { cryptoWaitReady } from "@polkadot/util-crypto";

const XCM_VERSION = 5;

async function main() {
    await cryptoWaitReady();

    const provider = withPolkadotSdkCompat(getWsProvider("ws://localhost:8000"));
    const client = createClient(provider);
    const api = client.getTypedApi(assetHub);

    const keyring = new Keyring({ type: "sr25519" });
    const alice = keyring.addFromUri("//Alice");

    const callData = Binary.fromHex(
        "0x1f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000"
    );
    const tx: any = await api.txFromCallData(callData);
    const origin = Enum("system", Enum("Signed", alice.address));
    const dryRunResult: any = await api.apis.DryRunApi.dry_run_call(origin, tx.decodedCall, XCM_VERSION);
    console.dir(dryRunResult.value, { depth: null });

    client.destroy();
}

main().catch(console.error);