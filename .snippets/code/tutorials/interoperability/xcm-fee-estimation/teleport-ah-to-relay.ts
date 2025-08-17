import { paseo, paseoAssetHub } from "@polkadot-api/descriptors";
import {
  createClient,
  FixedSizeBinary,
  Enum,
} from "polkadot-api";
import { getWsProvider } from "polkadot-api/ws-provider/node";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import {
  XcmVersionedLocation,
  XcmVersionedAssetId,
  XcmV3Junctions,
  XcmV3MultiassetFungibility,
  XcmVersionedXcm,
  XcmV5Instruction,
  XcmV5Junctions,
  XcmV5Junction,
  XcmV5AssetFilter,
  XcmV5WildAsset,
} from "@polkadot-api/descriptors";

// 1 PAS = 10^10 units
const PAS_UNITS = 10_000_000_000n; // 1 PAS
const PAS_CENTS = 100_000_000n; // 0.01 PAS

// Paseo Relay Chain constants
const PASEO_RPC_ENDPOINT = "ws://localhost:8000"; // Paseo Relay Chain chopsticks endpoint
const PASEO_ACCOUNT = "15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5"; // Alice (Paseo Relay Chain)

// Paseo Asset Hub constants
const PASEO_ASSET_HUB_RPC_ENDPOINT = "ws://localhost:8001"; // Paseo Asset Hub chopsticks endpoint
const ASSET_HUB_ACCOUNT = "14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3"; // Bob (Paseo Asset Hub)

// Helper function to create XCM for teleport to Relay (reverse direction)
function createTeleportXcmToRelay() {
  return XcmVersionedXcm.V5([
    // Withdraw PAS from Asset Hub (PAS on parachains is parents:1, interior: Here)
    XcmV5Instruction.WithdrawAsset([
      {
        id: { parents: 1, interior: XcmV5Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(1n * PAS_UNITS), // 1 PAS
      },
    ]),
    // Pay local fees on Asset Hub in PAS
    XcmV5Instruction.PayFees({
      asset: {
        id: { parents: 1, interior: XcmV5Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(10n * PAS_CENTS), // 0.01 PAS
      },
    }),
    // Send to Relay (parents:1, interior: Here)
    XcmV5Instruction.InitiateTransfer({
      destination: {
        parents: 1,
        interior: XcmV5Junctions.Here(),
      },
      remote_fees: Enum(
        "Teleport",
        XcmV5AssetFilter.Definite([
          {
            id: { parents: 1, interior: XcmV5Junctions.Here() },
            fun: XcmV3MultiassetFungibility.Fungible(10n * PAS_CENTS), // 0.01 PAS
          },
        ]),
      ),
      preserve_origin: false,
      remote_xcm: [
        XcmV5Instruction.DepositAsset({
          assets: XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1)),
          beneficiary: {
            parents: 0,
            interior: XcmV5Junctions.X1(
              XcmV5Junction.AccountId32({
                network: undefined,
                id: FixedSizeBinary.fromAccountId32(PASEO_ACCOUNT),
              })
            ),
          },
        }),
      ],
      assets: [
        Enum("Teleport", XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1))), // Send everything.
      ],
    }),
  ]);
}

async function estimateXcmFeesFromAssetHub(xcm: any, assetHubApi: any) {
  console.log("=== Fee Estimation Process (Asset Hub → Relay) ===");

  // 1. LOCAL EXECUTION FEES on Asset Hub
  console.log("1. Calculating local execution fees on Asset Hub...");
  let localExecutionFees = 0n;

  const weightResult = await assetHubApi.apis.XcmPaymentApi.query_xcm_weight(xcm);
  if (weightResult.success) {
    console.log("✓ XCM weight (Asset Hub):", weightResult.value);

    // Convert weight to PAS fees from Asset Hub's perspective (parents:1, Here)
    const executionFeesResult = await assetHubApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
      weightResult.value,
      XcmVersionedAssetId.V4({
        parents: 1,
        interior: XcmV3Junctions.Here(),
      })
    );

    if (executionFeesResult.success) {
      localExecutionFees = executionFeesResult.value;
      console.log("✓ Local execution fees (Asset Hub):", localExecutionFees.toString(), "PAS units");
    } else {
      console.log("✗ Failed to calculate local execution fees:", executionFeesResult.value);
    }
  } else {
    console.log("✗ Failed to query XCM weight on Asset Hub:", weightResult.value);
  }

  // 2. DELIVERY FEES + REMOTE EXECUTION FEES
  console.log("\n2. Calculating delivery and remote execution fees...");
  let deliveryFees = 0n;
  let remoteExecutionFees = 0n;

  // Origin from Asset Hub perspective
  const origin = XcmVersionedLocation.V5({
    parents: 0,
    interior: XcmV5Junctions.X1(
      XcmV5Junction.AccountId32({
        id: FixedSizeBinary.fromAccountId32(ASSET_HUB_ACCOUNT),
        network: undefined,
      })
    ),
  });

  // Dry run the XCM locally on Asset Hub
  const dryRunResult = await assetHubApi.apis.DryRunApi.dry_run_xcm(origin, xcm);

  if (dryRunResult.success && dryRunResult.value.execution_result.type === "Complete") {
    console.log("✓ Local dry run on Asset Hub successful");

    const { forwarded_xcms: forwardedXcms } = dryRunResult.value;

    // Find the XCM message sent to Relay (parents:1, interior: Here)
    const relayXcmEntry = forwardedXcms.find(
      ([location, _]: [any, any]) =>
        (location.type === "V4" || location.type === "V5") &&
        location.value.parents === 1 &&
        location.value.interior?.type === "Here"
    );

    if (relayXcmEntry) {
      const [destination, messages] = relayXcmEntry;
      const remoteXcm = messages[0];

      console.log("✓ Found XCM message to Relay");

      // Calculate delivery fees from Asset Hub to Relay
      const deliveryFeesResult = await assetHubApi.apis.XcmPaymentApi.query_delivery_fees(
        destination,
        remoteXcm
      );

      if (
        deliveryFeesResult.success &&
        deliveryFeesResult.value.type === "V4" &&
        deliveryFeesResult.value.value[0]?.fun?.type === "Fungible"
      ) {
        deliveryFees = deliveryFeesResult.value.value[0].fun.value;
        console.log("✓ Delivery fees:", deliveryFees.toString(), "PAS units");
      } else {
        console.log("✗ Failed to calculate delivery fees:", deliveryFeesResult);
      }

      // 3. REMOTE EXECUTION FEES on Relay
      console.log("\n3. Calculating remote execution fees on Relay...");
      try {
        const relayClient = createClient(withPolkadotSdkCompat(getWsProvider(PASEO_RPC_ENDPOINT)));
        const relayApi = relayClient.getTypedApi(paseo);

        // Query weight of the remote XCM on Relay
        const remoteWeightResult = await relayApi.apis.XcmPaymentApi.query_xcm_weight(remoteXcm);

        if (remoteWeightResult.success) {
          console.log("✓ Remote XCM weight (Relay) calculated:", remoteWeightResult.value);

          // Convert to fee using PAS on Relay (parents:0, Here)
          const remoteFeesResult = await relayApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
            remoteWeightResult.value,
            XcmVersionedAssetId.V5({
              parents: 0,
              interior: XcmV5Junctions.Here(),
            })
          );

          if (remoteFeesResult.success) {
            remoteExecutionFees = remoteFeesResult.value;
            console.log("✓ Remote execution fees:", remoteExecutionFees.toString(), "PAS units");
          } else {
            console.log("✗ Failed to calculate remote execution fees:", remoteFeesResult.value);
          }
        } else {
          console.log("✗ Failed to query remote XCM weight:", remoteWeightResult.value);
        }

        relayClient.destroy();
      } catch (error) {
        console.error("Error calculating remote execution fees on Relay:", error);
      }
    } else {
      console.log("✗ No XCM message found to Relay");
    }
  } else {
    console.log("✗ Local dry run failed on Asset Hub:", dryRunResult.value);
  }

  // 4. TOTAL FEES
  const totalFees = localExecutionFees + deliveryFees + remoteExecutionFees;

  console.log("\n=== Fee Summary (Asset Hub → Relay) ===");
  console.log("Local execution fees:", localExecutionFees.toString(), "PAS units");
  console.log("Delivery fees:", deliveryFees.toString(), "PAS units");
  console.log("Remote execution fees:", remoteExecutionFees.toString(), "PAS units");
  console.log("TOTAL FEES:", totalFees.toString(), "PAS units");
  console.log("TOTAL FEES:", (Number(totalFees) / Number(PAS_UNITS)).toFixed(4), "PAS");

  return {
    localExecutionFees,
    deliveryFees,
    remoteExecutionFees,
    totalFees,
  };
}

async function main() {
  // Connect to the Paseo Asset Hub parachain
  const assetHubClient = createClient(withPolkadotSdkCompat(getWsProvider(PASEO_ASSET_HUB_RPC_ENDPOINT)));

  // Get the typed API for Paseo Asset Hub
  const assetHubApi = assetHubClient.getTypedApi(paseoAssetHub);

  try {
    // Create the XCM message for teleport (Paseo Asset Hub → Paseo Relay)
    const xcm = createTeleportXcmToRelay();

    console.log("=== XCM Teleport: Paseo Asset Hub → Paseo Relay ===");
    console.log("From:", ASSET_HUB_ACCOUNT, "(Bob)");
    console.log("To:", PASEO_ACCOUNT, "(Alice)");
    console.log("Amount:", "1 PAS");
    console.log("");

    // Estimate all fees
    const fees = await estimateXcmFeesFromAssetHub(xcm, assetHubApi);
    void fees; // prevent unused var under isolatedModules

    // Create the execute transaction on Asset Hub
    const tx = assetHubApi.tx.PolkadotXcm.execute({
      message: xcm,
      max_weight: {
        ref_time: 6000000000n,
        proof_size: 65536n,
      },
    });

    console.log("\n=== Transaction Details ===");
    console.log("Transaction hex:", (await tx.getEncodedData()).asHex());
    console.log("Ready to submit!");
  } catch (error) {
    console.error("Error occurred:", (error as Error).message);
    if ((error as Error).cause) {
      console.dir((error as Error).cause, { depth: null });
    }
  } finally {
    // Ensure client is always destroyed
    assetHubClient.destroy();
  }
}

main().catch(console.error);