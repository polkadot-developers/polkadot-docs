import {
  ah,
  myth,
  XcmV3Junction,
  XcmV3Junctions,
  XcmV3MultiassetFungibility,
  XcmV3WeightLimit,
  XcmV4AssetAssetFilter,
  XcmV4AssetWildAsset,
  XcmV4Instruction,
  XcmVersionedAssets,
  XcmVersionedLocation,
  XcmVersionedXcm
} from "@polkadot-api/descriptors";
import { createClient, Enum, FixedSizeBinary, type Transaction } from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/web";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";

// Some constants.
// For Asset Hub.
const ASSET_HUB_WS_URL = "ws://localhost:8000";
const ASSET_HUB_PARA_ID = 1000;
const ASSET_HUB_ACCOUNT = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5";
const DOT_UNITS = 10_000_000_000n; // 10 decimals.
const DOT_CENTS = DOT_UNITS / 100n;

// For Mythos.
const MYTHOS_WS_URL = "ws://localhost:8001";
const MYTHOS_PARA_ID = 3369;
const MYTHOS_ACCOUNT = "0x69CF15A9393A0869A7fE535eCFe2C3CbaC127A40";
const MYTH_UNITS = 1_000_000_000_000_000_000n; // 18 decimals.
 
// Connect to Mythos.
const mythosClient = createClient(
  withPolkadotSdkCompat(
    getWsProvider(MYTHOS_WS_URL)
  )
);

// Get the typed API which lets us use descriptors.
const mythApi = mythosClient.getTypedApi(myth);

// Build the teleport transaction.
const tx = mythApi.tx.PolkadotXcm.limited_teleport_assets({
  dest: XcmVersionedLocation.V4({
    parents: 1,
    interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(ASSET_HUB_PARA_ID)),
  }),
  beneficiary: XcmVersionedLocation.V4({
    parents: 0,
    interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({
      id: FixedSizeBinary.fromAccountId32(ASSET_HUB_ACCOUNT),
      network: undefined,
    })),
  }),
  assets: XcmVersionedAssets.V4([
    {
      id: { parents: 0, interior: XcmV3Junctions.Here() },
      fun: XcmV3MultiassetFungibility.Fungible(1n * MYTH_UNITS)
    },
  ]),
  fee_asset_item: 0,
  weight_limit: XcmV3WeightLimit.Unlimited(),
});

await dryRun(tx.decodedCall);

async function dryRun(call: Transaction<any, any, any, any>['decodedCall']) {
  // Dry run the teleport locally so we know we can for example withdraw
  // the necessary funds and pay for delivery fees.
  console.log('Dry running teleport on Mythos...')
  const localDryRunResult = await mythApi.apis.DryRunApi.dry_run_call(
    Enum('system', Enum('Signed', MYTHOS_ACCOUNT)),
    call,
  );

  // Only continue if the local dry run works.
  // The first condition is whether or not the runtime API was successful,
  // the second is whether or not the underlying dry-run was successful.
  if (localDryRunResult.success && localDryRunResult.value.execution_result.success) {
    // We are interested in the message to Asset Hub that results from our call.
    // We filter for it here.
    const [_, messages] =
      localDryRunResult.value.forwarded_xcms.find(
        ([location, _]) =>
          // We happen to know the latest version in Mythos is V5 because of the descriptors.
          location.type === 'V5' &&
            location.value.parents === 1 &&
            location.value.interior.type === 'X1' &&
            location.value.interior.value.type === 'Parachain' &&
            location.value.interior.value.value === ASSET_HUB_PARA_ID
        )!;
    // There could be multiple messages to Asset Hub, we know it's only one
    // so we take the first one.
    const messageToAh = messages[0];

    // We connect to Asset Hub to dry run this message there.
    const assetHubClient = createClient(getWsProvider(ASSET_HUB_WS_URL));
    const ahApi = assetHubClient.getTypedApi(ah);

    // We need to make sure it's V4 because V5 is not supported by asset hub.
    // We get the supported versions directly from the descriptors.
    if (messageToAh.type === 'V4') {
      console.log('Dry running on Asset Hub...');
      const remoteDryRunResult =
        await ahApi.apis.DryRunApi.dry_run_xcm(
          XcmVersionedLocation.V4({
            parents: 1,
            interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(MYTHOS_PARA_ID))
          }),
          messageToAh
        );

      if (remoteDryRunResult.success && remoteDryRunResult.value.execution_result.type === 'Complete') {
        // Success! Let's go ahead with the teleport.
        console.log('Success!');
      } else {
        // It probably failed because our account doesn't exist on Asset Hub and
        // we don't have DOT for the existential deposit.
        // We should solve that problem and try again.
        // We will later improve errors so that we know exactly what went wrong and can act accordingly.
        // See https://github.com/paritytech/polkadot-sdk/issues/6119.
        console.log('Failure :( Going to try again.');

        // We're manually building an XCM here since we want to use the `ExchangeAsset` instruction
        // to swap some of the MYTH for DOT to cover the existential deposit.
        // This is executed via `PolkadotXcm.execute()` on Mythos and will send a message to Asset Hub.
        const xcm = XcmVersionedXcm.V4([
          // We withdraw some MYTH from our account on Mythos.
          XcmV4Instruction.WithdrawAsset([
            { id: { parents: 0, interior: XcmV3Junctions.Here() }, fun: XcmV3MultiassetFungibility.Fungible(100n * MYTH_UNITS) },
          ]),
          // Use them to pay fees.
          XcmV4Instruction.BuyExecution({
            fees: { id: { parents: 0, interior: XcmV3Junctions.Here() }, fun: XcmV3MultiassetFungibility.Fungible(100n * MYTH_UNITS) },
            weight_limit: XcmV3WeightLimit.Unlimited(),
          }),
          // Teleport the MYTH to Asset Hub.
          XcmV4Instruction.InitiateTeleport({
            assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
            dest: { parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(ASSET_HUB_PARA_ID)) },
            xcm: [
              // We pay fees with MYTH on Asset Hub.
              // This is possible because Asset Hub allows paying fees with any asset that has a liquidity pool.
              XcmV4Instruction.BuyExecution({
                fees: { id: { parents: 1, interior: XcmV3Junctions.X1(XcmV3Junction.Parachain(MYTHOS_PARA_ID)) }, fun: XcmV3MultiassetFungibility.Fungible(50n * MYTH_UNITS) },
                weight_limit: XcmV3WeightLimit.Unlimited(),
              }),
              // We explicitly swap our MYTH for 0.01 DOT to cover ED.
              XcmV4Instruction.ExchangeAsset({
                give: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(1)),
                want: [{ id: { parents: 1, interior: XcmV3Junctions.Here() }, fun: XcmV3MultiassetFungibility.Fungible(1n * DOT_CENTS) }],
                maximal: false,
              }),
              // We deposit all our MYTH and our 0.01 DOT into the beneficiary account.
              XcmV4Instruction.DepositAsset({
                assets: XcmV4AssetAssetFilter.Wild(XcmV4AssetWildAsset.AllCounted(2)),
                beneficiary: {
                  parents: 0,
                  interior: XcmV3Junctions.X1(XcmV3Junction.AccountId32({
                    id: FixedSizeBinary.fromAccountId32(ASSET_HUB_ACCOUNT),
                    network: undefined,
                  })),
                },
              }),
            ],
          }),
        ]);

        const tx = mythApi.tx.PolkadotXcm.execute({
          message: xcm,
          max_weight: { ref_time: 4_000_000_000n, proof_size: 300_000n }
        });

        // We try the dry run again.
        dryRun(tx.decodedCall);
      }
    }
  }
}