// `ahp` is the name we gave to `npx papi add`
import {
  ahp,
  people,
  XcmV2OriginKind,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetFungibility,
  XcmV5AssetFilter,
  XcmV5Instruction,
  XcmV5Junction,
  XcmV5Junctions,
  XcmV5WildAsset,
  XcmVersionedXcm,
} from "@polkadot-api/descriptors";
import { Binary, createClient, Enum, FixedSizeBinary } from "polkadot-api";
// import from "polkadot-api/ws-provider/node"
// if you are running in a NodeJS environment
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { sr25519CreateDerive } from "@polkadot-labs/hdkd";
import {
  DEV_PHRASE,
  entropyToMiniSecret,
  mnemonicToEntropy,
  ss58Address,
} from "@polkadot-labs/hdkd-helpers";
import { getPolkadotSigner } from "polkadot-api/signer";

const entropy = mnemonicToEntropy(DEV_PHRASE);
const miniSecret = entropyToMiniSecret(entropy);
const derive = sr25519CreateDerive(miniSecret);
const keyPair = derive("//Alice");

const polkadotSigner = getPolkadotSigner(
  keyPair.publicKey,
  "Sr25519",
  keyPair.sign,
);

// Connect to Polkadot Asset Hub.
// Pointing to localhost since we're using chopsticks in this example.
const client = createClient(
  withPolkadotSdkCompat(getWsProvider("ws://localhost:8000")),
);

// We get the typed api, a typesafe API for interacting with the chain.
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

// This is the DOT we withdraw to both pay for fees and send.
const dotToWithdraw = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(10n * DOT_UNITS),
};
// This is the DOT we use to pay for fees locally.
const dotToPayFees = {
  id: DOT,
  fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
};
// The location of the People Chain from Asset Hub.
const destination = {
  parents: 1,
  interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(PEOPLE_PARA_ID)),
};
// We'll pay for fees in the People Chain with teleported DOT.
// This is specified independently of the transferred assets since they're used
// exclusively for fees. Also because we can decide to pay fees in a different
// asset from all that we're transferring.
const remoteFees = Enum(
  "Teleport",
  XcmV5AssetFilter.Definite([
    {
      id: DOT,
      fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_UNITS),
    },
  ]),
);
// No need to preserve origin for this example.
const preserveOrigin = false;
// The assets we want to transfer are whatever's left in the
// holding register at the time of executing the `InitiateTransfer`
// instruction. DOT in this case. We teleport it.
const assets = [
  Enum("Teleport", XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1))),
];
// The beneficiary is the same account but on the People Chain.
// This is a very common pattern for one public/private key pair
// to hold assets on multiple chains.
const beneficiary = FixedSizeBinary.fromBytes(keyPair.publicKey);
// The call to be executed on the destination chain.
// It's a simple remark with an event.
// We create the call on Asset Hub since the system pallet is present in
// every runtime, but if using any other pallet, you should connect to
// the destination chain and create the call there.
const remark = Binary.fromText("Hello, cross-chain!");
const call = await ahpApi.tx.System.remark_with_event({ remark }).getEncodedData();
// The XCM to be executed on the destination chain.
// It's basically depositing everything to the beneficiary.
const remoteXcm = [
  XcmV5Instruction.Transact({
    origin_kind: XcmV2OriginKind.SovereignAccount(),
    fallback_max_weight: undefined,
    call,
  }),
  XcmV5Instruction.RefundSurplus(),
  XcmV5Instruction.DepositAsset({
    assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
    beneficiary: {
      parents: 0,
      interior: XcmV5Junctions.X1(
        XcmV5Junction.AccountId32({
          id: beneficiary,
          network: undefined,
        }),
      ),
    },
  }),
];

// The message is just assembling all of these parameters we've defined before.
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
]);

// We need to know the weight of the XCM to set the `max_weight` parameter
// on the actual `PolkadotXcm.execute()` call.
const weightResult = await ahpApi.apis.XcmPaymentApi.query_xcm_weight(xcm);

if (weightResult.success) {
  const weight = weightResult.success
    ? weightResult.value
    : { ref_time: 0n, proof_size: 0n };

  console.dir(weight);

  // The actual transaction we will submit.
  // This tells Asset Hub to execute the XCM.
  const tx = ahpApi.tx.PolkadotXcm.execute({
    message: xcm,
    max_weight: weight,
  });

  // We sign it and propagate it to the network.
  const result = await tx.signAndSubmit(polkadotSigner);
  console.log(stringify(result));
}

client.destroy();

// A helper function to print numbers inside of the result.
function stringify(obj: any) {
  return JSON.stringify(
    obj,
    (_, v) => (typeof v === "bigint" ? v.toString() : v),
    2,
  );
}
