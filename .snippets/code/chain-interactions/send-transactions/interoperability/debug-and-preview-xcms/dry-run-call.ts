import { Binary, createClient, Enum } from 'polkadot-api';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { assetHub } from '@polkadot-api/descriptors';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from '@polkadot-labs/hdkd-helpers';

const XCM_VERSION = 5;

async function main() {
  const provider = withPolkadotSdkCompat(getWsProvider('ws://localhost:8000'));
  const client = createClient(provider);
  const api = client.getTypedApi(assetHub);

  const entropy = mnemonicToEntropy(DEV_PHRASE);
  const miniSecret = entropyToMiniSecret(entropy);
  const derive = sr25519CreateDerive(miniSecret);
  const alice = derive('//Alice');
  const aliceAddress = ss58Address(alice.publicKey);

  const callData = Binary.fromHex(
    '0x1f0803010100411f0300010100fc39fcf04a8071b7409823b7c82427ce67910c6ed80aa0e5093aff234624c8200304000002043205011f0092e81d790000000000',
  );
  const tx: any = await api.txFromCallData(callData);
  const origin = Enum('system', Enum('Signed', aliceAddress));
  const dryRunResult: any = await api.apis.DryRunApi.dry_run_call(
    origin,
    tx.decodedCall,
    XCM_VERSION,
  );
  console.dir(dryRunResult.value, { depth: null });

  client.destroy();
}

main().catch(console.error);
