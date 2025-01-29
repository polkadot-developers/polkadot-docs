import { createClient } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import {
  XcmVersionedXcm,
  paseo,
  XcmVersionedLocation,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3WeightLimit,
  XcmV3MultiassetFungibility,
  XcmV3MultiassetAssetId,
  XcmV3Instruction,
  XcmV3MultiassetMultiAssetFilter,
  XcmV3MultiassetWildMultiAsset,
} from '@polkadot-api/descriptors';
import { Binary } from 'polkadot-api';
import { ss58Decode } from '@polkadot-labs/hdkd-helpers';

const client = createClient(
  withPolkadotSdkCompat(getWsProvider('wss://paseo-rpc.dwellir.com')),
);

const paseoApi = client.getTypedApi(paseo);

const userAddress = 'INSERT_USER_ADDRESS';
const userPublicKey = ss58Decode(userAddress)[0];
const idBenef = Binary.fromBytes(userPublicKey);

// Define the destination
const destination = XcmVersionedLocation.V3({
  parents: 0,
  interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(1000)),
});

// Define the xcm message that will be sent to the destination
const xcm = XcmVersionedXcm.V3([
  XcmV3Instruction.ReceiveTeleportedAsset([
    {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(12000000000n),
    },
  ]),
  XcmV3Instruction.ClearOrigin(),
  XcmV3Instruction.BuyExecution({
    fees: {
      id: XcmV3MultiassetAssetId.Concrete({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      }),
      fun: XcmV3MultiassetFungibility.Fungible(BigInt(12000000000)),
    },
    weight_limit: XcmV3WeightLimit.Unlimited(),
  }),
  XcmV3Instruction.DepositAsset({
    assets: XcmV3MultiassetMultiAssetFilter.Wild(
      XcmV3MultiassetWildMultiAsset.All(),
    ),
    beneficiary: {
      parents: 0,
      interior: XcmV3Junctions.X1(
        XcmV3Junction.AccountId32({
          network: undefined,
          id: idBenef,
        }),
      ),
    },
  }),
]);

// Execute the query delivery fees runtime call
const result = await paseoApi.apis.XcmPaymentApi.query_delivery_fees(
  destination,
  xcm,
);

// Print the results
console.dir(result.value, { depth: null });

client.destroy();
