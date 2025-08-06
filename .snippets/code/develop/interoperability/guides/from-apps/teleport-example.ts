// `ahp` is the name given to `npx papi add`
import {
  ahp,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetFungibility,
  XcmV5AssetFilter,
  XcmV5Instruction,
  XcmV5Junction,
  XcmV5Junctions,
  XcmV5WildAsset,
  XcmVersionedXcm,
} from '@polkadot-api/descriptors';
import { createClient, Enum, FixedSizeBinary } from 'polkadot-api';
// import from "polkadot-api/ws-provider/node"
// if running in a NodeJS environment
import { getWsProvider } from 'polkadot-api/ws-provider/web';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
import { sr25519CreateDerive } from '@polkadot-labs/hdkd';
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
} from '@polkadot-labs/hdkd-helpers';
import { getPolkadotSigner } from 'polkadot-api/signer';

const entropy = mnemonicToEntropy(DEV_PHRASE);
const miniSecret = entropyToMiniSecret(entropy);
const derive = sr25519CreateDerive(miniSecret);
const keyPair = derive('//Alice');

const polkadotSigner = getPolkadotSigner(
  keyPair.publicKey,
  'Sr25519',
  keyPair.sign
);

// Connect to Polkadot Asset Hub.
// Pointing to localhost since this example uses chopsticks.
const client = createClient(
  withPolkadotSdkCompat(getWsProvider('ws://localhost:8000'))
);

// Get the typed API, a typesafe API for interacting with the chain.
const ahpApi = client.getTypedApi(ahp);

const PEOPLE_PARA_ID = 1004;
// The identifier for DOT is the location of the Polkadot Relay Chain,
// which is 1 up relative to any parachain.
const DOT = {
  parents: 1,
  interior: XcmV3Junctions.Here(),
};
// DOT has 10 decimals.
const DOT_UNITS = 10_000_000_000n;

// The DOT to withdraw for both fees and transfer.
const dotToWithdraw = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(10n * DOT_UNITS),
};
// The DOT to use for local fee payment.
const dotToPayFees = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
};
// The location of the People Chain from Asset Hub.
const destination = {
  parents: 1,
  interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(PEOPLE_PARA_ID)),
};
// Pay for fees on the People Chain with teleported DOT.
// This is specified independently of the transferred assets since they're used
// exclusively for fees. Also because fees can be paid in a different
// asset from the transferred assets.
const remoteFees = Enum(
  'Teleport',
  XcmV5AssetFilter.Definite([
    {
      id: DOT,
      fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
    },
  ])
);
// No need to preserve origin for this example.
const preserveOrigin = false;
// The assets to transfer are whatever remains in the
// holding register at the time of executing the `InitiateTransfer`
// instruction. DOT in this case, teleported.
const assets = [
  Enum('Teleport', XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1))),
];
// The beneficiary is the same account but on the People Chain.
// This is a very common pattern for one public/private key pair
// to hold assets on multiple chains.
const beneficiary = FixedSizeBinary.fromBytes(keyPair.publicKey);
// The XCM to be executed on the destination chain.
// It's basically depositing everything to the beneficiary.
const remoteXcm = [
  XcmV5Instruction.DepositAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
    beneficiary: {
      parents: 0,
      interior: XcmV5Junctions.X1(
        XcmV5Junction.AccountId32({
          id: beneficiary,
          network: undefined,
        })
      ),
    },
  }),
];

// The message assembles all the previously defined parameters.
const xcm = XcmVersionedXcm.V5([
  XcmV5Instruction.WithdrawAsset([dotToWithdraw]),
  XcmV5Instruction.PayFees({ asset: dotToPayFees }),
  XcmV5Instruction.InitiateTransfer({
    destination,
    remote_fees: remoteFees,
    preserve_origin: preserveOrigin,
    assets,
    remote_xcm: remoteXcm,
  }),
  // Return any leftover fees from the fees register back to holding.
  XcmV5Instruction.RefundSurplus(),
  // Deposit remaining assets (refunded fees) to the originating account.
  // Using AllCounted(1) since only one asset type (DOT) remains - a minor optimization.
  XcmV5Instruction.DepositAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
    beneficiary: {
      parents: 0,
      interior: XcmV5Junctions.X1(
        XcmV5Junction.AccountId32({
          id: beneficiary, // The originating account.
          network: undefined,
        })
      ),
    },
  }),
]);

// The XCM weight is needed to set the `max_weight` parameter
// on the actual `PolkadotXcm.execute()` call.
const weightResult = await ahpApi.apis.XcmPaymentApi.query_xcm_weight(xcm);

if (weightResult.success) {
  const weight = weightResult.success
    ? weightResult.value
    : { ref_time: 0n, proof_size: 0n };

  console.dir(weight);

  // The actual transaction to submit.
  // This tells Asset Hub to execute the XCM.
  const tx = ahpApi.tx.PolkadotXcm.execute({
    message: xcm,
    max_weight: weight,
  });

  // Sign and propagate to the network.
  const result = await tx.signAndSubmit(polkadotSigner);
  console.log(stringify(result));
}

client.destroy();

// A helper function to print numbers inside of the result.
function stringify(obj: any) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === 'bigint' ? v.toString() : v),
    2
  );
}
