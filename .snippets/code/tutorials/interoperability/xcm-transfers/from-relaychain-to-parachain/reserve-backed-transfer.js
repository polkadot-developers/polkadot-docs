// Import necessary modules from Polkadot API and helpers
import {
  astar, // Astar chain metadata
  dot, // Polkadot chain metadata
  XcmVersionedLocation,
  XcmVersionedAssets,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmV3MultiassetFungibility,
  XcmV3MultiassetAssetId,
} from '@polkadot-api/descriptors';
import { createClient } from 'polkadot-api';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Decode,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { Binary } from 'polkadot-api';

// Create Polkadot client using WebSocket provider for Polkadot chain
const polkadotClient = createClient(
  withPolkadotSdkCompat(getWsProvider('ws://127.0.0.1:8001')),
);
const dotApi = polkadotClient.getTypedApi(dot);

// Create Astar client using WebSocket provider for Astar chain
const astarClient = createClient(
  withPolkadotSdkCompat(getWsProvider('ws://localhost:8000')),
);
const astarApi = astarClient.getTypedApi(astar);

// Create keypair for Alice using dev phrase to sign transactions
const miniSecret = entropyToMiniSecret(mnemonicToEntropy(DEV_PHRASE));
const derive = sr25519CreateDerive(miniSecret);
const aliceKeyPair = derive('//Alice');
const alice = getPolkadotSigner(
  aliceKeyPair.publicKey,
  'Sr25519',
  aliceKeyPair.sign,
);

// Define recipient (Dave) address on Astar chain
const daveAddress = 'X2mE9hCGX771c3zzV6tPa8U2cDz4U4zkqUdmBrQn83M3cm7';
const davePublicKey = ss58Decode(daveAddress)[0];
const idBenef = Binary.fromBytes(davePublicKey);

// Define Polkadot Asset ID on Astar chain (example)
const polkadotAssetId = 340282366920938463463374607431768211455n;

// Fetch asset balance of recipient (Dave) before transaction
let assetMetadata = await astarApi.query.Assets.Account.getValue(
  polkadotAssetId,
  daveAddress,
);
console.log('Asset balance before tx:', assetMetadata?.balance ?? 0);

// Prepare and submit transaction to transfer assets from Polkadot to Astar
const tx = dotApi.tx.XcmPallet.limited_reserve_transfer_assets({
  dest: XcmVersionedLocation.V3({
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.Parachain(2006), // Destination is the Astar rollup
    ),
  }),
  beneficiary: XcmVersionedLocation.V3({
    parents: 0,
    interior: XcmV3Junctions.X1(
      XcmV3Junction.AccountId32({
        // Beneficiary address on Astar
        network: undefined,
        id: idBenef,
      }),
    ),
  }),
  assets: XcmVersionedAssets.V3([
    {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 0,
        interior: XcmV3Junctions.Here(), // Asset from the sender's location
      }),
      fun: XcmV3MultiassetFungibility.Fungible(120000000000), // Asset amount to transfer
    },
  ]),
  fee_asset_item: 0, // Asset used to pay transaction fees
  weight_limit: XcmV3WeightLimit.Unlimited(), // No weight limit on transaction
});

// Sign and submit the transaction
tx.signSubmitAndWatch(alice).subscribe({
  next: async (event) => {
    if (event.type === 'finalized') {
      console.log('Transaction completed successfully');
    }
  },
  error: console.error,
  complete() {
    polkadotClient.destroy(); // Clean up after transaction
  },
});

// Wait for transaction to complete
await new Promise((resolve) => setTimeout(resolve, 20000));

// Fetch asset balance of recipient (Dave) after transaction
assetMetadata = await astarApi.query.Assets.Account.getValue(
  polkadotAssetId,
  daveAddress,
);
console.log('Asset balance after tx:', assetMetadata?.balance ?? 0);

// Exit the process
process.exit(0);
