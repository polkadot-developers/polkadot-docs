import { polkadotHub, paseoBridgeHub } from '@polkadot-api/descriptors';
import { createClient, FixedSizeBinary, Enum } from 'polkadot-api';
import { getWsProvider } from 'polkadot-api/ws-provider/node';
import { withPolkadotSdkCompat } from 'polkadot-api/polkadot-sdk-compat';
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
} from '@polkadot-api/descriptors';

// 1 PAS = 10^10 units
const PAS_UNITS = 10_000_000_000n; // 1 PAS
const PAS_CENTS = 100_000_000n; // 0.01 PAS

// Polkadot Hub constants
const POLKADOT_HUB_RPC_ENDPOINT = 'ws://localhost:8001';
const POLKADOT_HUB_ACCOUNT = '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5'; // Alice (Polkadot Hub)

// Bridge Hub destination
const BRIDGE_HUB_RPC_ENDPOINT = 'ws://localhost:8000';
const BRIDGE_HUB_PARA_ID = 1002;
const BRIDGE_HUB_BENEFICIARY =
  '14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'; // Bob (Bridge Hub)

// Create the XCM message for teleport (Polkadot Hub → Bridge Hub)
function createTeleportXcmToBridgeHub(paraId: number) {
  return XcmVersionedXcm.V5([
    // Withdraw PAS from Polkadot Hub (PAS on parachains is parents:1, interior: Here)
    XcmV5Instruction.WithdrawAsset([
      {
        id: { parents: 1, interior: XcmV5Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(1n * PAS_UNITS), // 1 PAS
      },
    ]),
    // Pay local fees on Polkadot Hub in PAS
    XcmV5Instruction.PayFees({
      asset: {
        id: { parents: 1, interior: XcmV5Junctions.Here() },
        fun: XcmV3MultiassetFungibility.Fungible(10n * PAS_CENTS), // 0.01 PAS
      },
    }),
    // Send to Bridge Hub parachain (parents:1, interior: X1(Parachain(paraId)))
    XcmV5Instruction.InitiateTransfer({
      destination: {
        parents: 1,
        interior: XcmV5Junctions.X1(XcmV5Junction.Parachain(paraId)),
      },
      remote_fees: Enum(
        'Teleport',
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
                id: FixedSizeBinary.fromAccountId32(BRIDGE_HUB_BENEFICIARY),
              }),
            ),
          },
        }),
      ],
      assets: [
        Enum('Teleport', XcmV5AssetFilter.Wild(XcmV5WildAsset.AllCounted(1))), // Send everything.
      ],
    }),
  ]);
}

async function estimateXcmFeesFromPolkadotHubToBridgeHub(
  xcm: any,
  polkadotHubApi: any,
) {
  console.log('=== Fee Estimation Process (Polkadot Hub → Bridge Hub) ===');

  // 1. LOCAL EXECUTION FEES on Polkadot Hub
  console.log('1. Calculating local execution fees on Polkadot Hub...');
  let localExecutionFees = 0n;

  const weightResult =
    await polkadotHubApi.apis.XcmPaymentApi.query_xcm_weight(xcm);
  if (weightResult.success) {
    console.log('✓ XCM weight (Polkadot Hub):', weightResult.value);

    // Convert weight to PAS fees from Polkadot Hub's perspective (parents:1, Here)
    const executionFeesResult =
      await polkadotHubApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
        weightResult.value,
        XcmVersionedAssetId.V4({
          parents: 1,
          interior: XcmV3Junctions.Here(),
        }),
      );

    if (executionFeesResult.success) {
      localExecutionFees = executionFeesResult.value;
      console.log(
        '✓ Local execution fees (Polkadot Hub):',
        localExecutionFees.toString(),
        'PAS units',
      );
    } else {
      console.log(
        '✗ Failed to calculate local execution fees:',
        executionFeesResult.value,
      );
    }
  } else {
    console.log(
      '✗ Failed to query XCM weight on Polkadot Hub:',
      weightResult.value,
    );
  }

  // 2. DELIVERY FEES + REMOTE EXECUTION FEES
  console.log('\n2. Calculating delivery and remote execution fees...');
  let deliveryFees = 0n;
  let remoteExecutionFees = 0n; // Skipped (Bridge Hub descriptor not available)

  // Origin from Polkadot Hub perspective
  const origin = XcmVersionedLocation.V5({
    parents: 0,
    interior: XcmV5Junctions.X1(
      XcmV5Junction.AccountId32({
        id: FixedSizeBinary.fromAccountId32(POLKADOT_HUB_ACCOUNT),
        network: undefined,
      }),
    ),
  });

  // Dry run the XCM locally on Polkadot Hub
  const dryRunResult = await polkadotHubApi.apis.DryRunApi.dry_run_xcm(
    origin,
    xcm,
  );

  if (
    dryRunResult.success &&
    dryRunResult.value.execution_result.type === 'Complete'
  ) {
    console.log('✓ Local dry run on Polkadot Hub successful');

    const { forwarded_xcms: forwardedXcms } = dryRunResult.value;

    // Find the XCM message sent to Bridge Hub (parents:1, interior: X1(Parachain(1002)))
    const bridgeHubXcmEntry = forwardedXcms.find(
      ([location, _]: [any, any]) =>
        (location.type === 'V4' || location.type === 'V5') &&
        location.value.parents === 1 &&
        location.value.interior?.type === 'X1' &&
        location.value.interior.value?.type === 'Parachain' &&
        location.value.interior.value.value === BRIDGE_HUB_PARA_ID,
    );

    if (bridgeHubXcmEntry) {
      const [destination, messages] = bridgeHubXcmEntry;
      const remoteXcm = messages[0];

      console.log('✓ Found XCM message to Bridge Hub');

      // Calculate delivery fees from Polkadot Hub to Bridge Hub
      const deliveryFeesResult =
        await polkadotHubApi.apis.XcmPaymentApi.query_delivery_fees(
          destination,
          remoteXcm,
        );

      if (
        deliveryFeesResult.success &&
        deliveryFeesResult.value.type === 'V5' &&
        deliveryFeesResult.value.value[0]?.fun?.type === 'Fungible'
      ) {
        deliveryFees = deliveryFeesResult.value.value[0].fun.value;
        console.log('✓ Delivery fees:', deliveryFees.toString(), 'PAS units');
      } else {
        console.log('✗ Failed to calculate delivery fees:', deliveryFeesResult);
      }

      // 3. REMOTE EXECUTION FEES on Bridge Hub
      console.log('\n3. Calculating remote execution fees on Bridge Hub');
      try {
        const bridgeHubClient = createClient(
          withPolkadotSdkCompat(getWsProvider(BRIDGE_HUB_RPC_ENDPOINT)),
        );
        const bridgeHubApi = bridgeHubClient.getTypedApi(paseoBridgeHub);
        const remoteWeightResult =
          await bridgeHubApi.apis.XcmPaymentApi.query_xcm_weight(remoteXcm);
        const remoteFeesResult =
          await bridgeHubApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
            remoteWeightResult.value as {
              ref_time: bigint;
              proof_size: bigint;
            },
            XcmVersionedAssetId.V4({
              parents: 1,
              interior: XcmV3Junctions.Here(),
            }),
          );
        bridgeHubClient.destroy();
        remoteExecutionFees = remoteFeesResult.value as bigint;
        console.log(
          '✓ Remote execution fees:',
          remoteExecutionFees.toString(),
          'PAS units',
        );
      } catch (error) {
        console.error(
          'Error calculating remote execution fees on Bridge Hub:',
          error,
        );
      }
    } else {
      console.log('✗ No XCM message found to Bridge Hub');
    }
  } else {
    console.log('✗ Local dry run failed on Polkadot Hub:', dryRunResult.value);
  }

  // 4. TOTAL FEES
  const totalFees = localExecutionFees + deliveryFees + remoteExecutionFees;

  console.log('\n=== Fee Summary (Polkadot Hub → Bridge Hub) ===');
  console.log(
    'Local execution fees:',
    localExecutionFees.toString(),
    'PAS units',
  );
  console.log('Delivery fees:', deliveryFees.toString(), 'PAS units');
  console.log(
    'Remote execution fees:',
    remoteExecutionFees.toString(),
    'PAS units',
  );
  console.log('TOTAL FEES:', totalFees.toString(), 'PAS units');
  console.log(
    'TOTAL FEES:',
    (Number(totalFees) / Number(PAS_UNITS)).toFixed(4),
    'PAS',
  );

  return {
    localExecutionFees,
    deliveryFees,
    remoteExecutionFees,
    totalFees,
  };
}

async function main() {
  // Connect to the Polkadot Hub parachain
  const polkadotHubClient = createClient(
    withPolkadotSdkCompat(getWsProvider(POLKADOT_HUB_RPC_ENDPOINT)),
  );

  // Get the typed API for Polkadot Hub
  const polkadotHubApi = polkadotHubClient.getTypedApi(polkadotHub);

  try {
    // Create the XCM message for teleport (Polkadot Hub → Bridge Hub)
    const xcm = createTeleportXcmToBridgeHub(BRIDGE_HUB_PARA_ID);

    console.log('=== XCM Teleport: Polkadot Hub → Bridge Hub ===');
    console.log('From:', POLKADOT_HUB_ACCOUNT, '(Alice on Polkadot Hub)');
    console.log('To:', BRIDGE_HUB_BENEFICIARY, '(Beneficiary on Bridge Hub)');
    console.log('Amount:', '1 PAS');
    console.log('');

    // Estimate all fees
    const fees = await estimateXcmFeesFromPolkadotHubToBridgeHub(xcm, polkadotHubApi);
    void fees; // prevent unused var under isolatedModules

    // Create the execute transaction on Polkadot Hub
    const tx = polkadotHubApi.tx.PolkadotXcm.execute({
      message: xcm,
      max_weight: {
        ref_time: 6000000000n,
        proof_size: 65536n,
      },
    });

    console.log('\n=== Transaction Details ===');
    console.log('Transaction hex:', (await tx.getEncodedData()).asHex());
    console.log('Ready to submit!');
  } catch (error) {
    console.log('Error stack:', (error as Error).stack);
    console.error('Error occurred:', (error as Error).message);
    if ((error as Error).cause) {
      console.dir((error as Error).cause, { depth: null });
    }
  } finally {
    // Ensure client is always destroyed
    polkadotHubClient.destroy();
  }
}

main().catch(console.error);
