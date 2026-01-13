---
title: XCM Fee Estimation
description: This tutorial demonstrates how to estimate the fees for teleporting assets from the Polkadot Hub TestNet to the Paseo People Chain.
url: https://docs.polkadot.com/chain-interactions/send-transactions/interoperability/estimate-xcm-fees/
---

# XCM Fee Estimation

## Introduction

When sending cross-chain messages, ensure that the transaction will be successful not only in the local chain but also in the destination chain and any intermediate chains.

Sending cross-chain messages requires estimating the fees for the operation. 

This tutorial will demonstrate how to dry-run and estimate the fees for teleporting assets from the Polkadot Hub TestNet to the Paseo People Chain.

## Fee Mechanism

There are three types of fees that can be charged when sending a cross-chain message:

- **Local execution fees**: Fees charged in the local chain for executing the message.
- **Delivery fees**: Fees charged for delivering the message to the destination chain.
- **Remote execution fees**: Fees charged in the destination chain for executing the message.

If there are multiple intermediate chains, delivery fees and remote execution fees will be charged for each one.

In this example, you will estimate the fees for teleporting assets from the Polkadot Hub to the Paseo People Chain. The fee structure will be as follows:

```mermaid
flowchart LR
    PolkadotHub[Polkadot Hub] -->|Delivery Fees| PeopleChain[Paseo People Chain]
    PolkadotHub -->|<br />Local<br />Execution<br />Fees| PolkadotHub
    PeopleChain -->|<br />Remote<br />Execution<br />Fees| PeopleChain
```

The overall fees are `local_execution_fees` + `delivery_fees` + `remote_execution_fees`.

## Environment Setup

First, you need to set up your environment:

1. Create a new directory and initialize the project:

    ```bash
    mkdir xcm-fee-estimation && \
    cd xcm-fee-estimation
    ```

2. Initialize the project:

    ```bash
    npm init -y
    ```

3. Install dev dependencies:

    ```bash
    npm install --save-dev @types/node@^22.12.0 ts-node@^10.9.2 typescript@^5.7.3
    ```

4. Install dependencies:

    ```bash
    npm install --save @polkadot-labs/hdkd@^0.0.13 @polkadot-labs/hdkd-helpers@^0.0.13 polkadot-api@1.9.5
    ```

5. Create TypeScript configuration:

    ```bash
    npx tsc --init
    ```

6. Generate the types for the Polkadot API for Paseo People Chain and Polkadot Hub TestNet:

    ```bash
    npx papi add polkadotHub -n paseo_asset_hub && \
    npx papi add paseoPeopleChain -w wss://people-paseo.rpc.amforc.com
    ```

    !!!info "Polkadot Hub"
        The `paseo_asset_hub` is the identifier for the Polkadot Hub TestNet.

7. Create a new file called `teleport-polkadot-hub-to-people-chain.ts`:

    ```bash
    touch teleport-polkadot-hub-to-people-chain.ts
    ```

8. Import the necessary modules. Add the following code to the `teleport-polkadot-hub-to-people-chain.ts` file:

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
    import { polkadotHub, paseoPeopleChain } from '@polkadot-api/descriptors';
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
    ```

9. Define constants and a `main` function where you will implement all the logic:

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
    // 1 PAS = 10^10 units
    const PAS_UNITS = 10_000_000_000n; // 1 PAS
    const PAS_CENTS = 100_000_000n; // 0.01 PAS

    // Polkadot Hub constants
    const POLKADOT_HUB_RPC_ENDPOINT = 'ws://localhost:8001';
    const POLKADOT_HUB_ACCOUNT = '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5'; // Alice (Polkadot Hub)

    // People Chain destination
    const PEOPLE_CHAIN_RPC_ENDPOINT = 'ws://localhost:8000';
    const PEOPLE_CHAIN_PARA_ID = 1004;
    const PEOPLE_CHAIN_BENEFICIARY =
    async function main() {
      // Code will go here
    }
    ```

All the following code explained in the subsequent sections must be added inside the `main` function.

## Client and API Setup

Now you are ready to start implementing the logic for the fee estimation for the teleport you want to perform. In this step, you will create the client for the Polkadot Hub TestNet and generate the typed API to interact with the chain. Follow the steps below:

Create the API client. You will need to create a client for the Polkadot Hub TestNet:

```typescript title="teleport-polkadot-hub-to-people-chain.ts"
  // Connect to the Polkadot Hub parachain
  const polkadotHubClient = createClient(
    withPolkadotSdkCompat(getWsProvider(POLKADOT_HUB_RPC_ENDPOINT)),
  );

  // Get the typed API for Polkadot Hub
  const polkadotHubApi = polkadotHubClient.getTypedApi(polkadotHub);
```

Ensure that you replace the endpoint URLs with the actual WebSocket endpoints. This example uses local chopsticks endpoints, but you can use public endpoints or run local nodes.

## Create the XCM Message

Now, you can construct a proper XCM message using the new XCM V5 instructions for teleporting from Polkadot Hub TestNet to the People Chain:

```typescript title="teleport-polkadot-hub-to-people-chain.ts"
function createTeleportXcmToPeopleChain(paraId: number) {
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
    // Send to People Chain parachain (parents:1, interior: X1(Parachain(paraId)))
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
                id: FixedSizeBinary.fromAccountId32(PEOPLE_CHAIN_BENEFICIARY),
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
```

## Fee Estimation Function

Below is a four-step breakdown of the logic needed to estimate the fees for the teleport.

First, you need to create the function that will estimate the fees for the teleport:

```typescript title="teleport-polkadot-hub-to-people-chain.ts"
async function estimateXcmFeesFromPolkadotHubToPeopleChain(
  xcm: any,
  polkadotHubApi: any,
) {
  // Code will go here
}
```

1. **Local execution fees on Polkadot Hub**: Compute the XCM weight locally, then convert that weight to PAS using Polkadot Hub's view of PAS (`parents: 1, interior: Here`). Add the code to the function:

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
      console.log('=== Fee Estimation Process (Polkadot Hub → People Chain) ===');

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
    ```

2. **Dry-run and delivery fees to People Chain**: Dry-run the XCM on Polkadot Hub to capture forwarded messages, locate the one targeting People Chain (`parents: 1, interior: Here`), and ask for delivery fees. Add the code to the function:

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
      // 2. DELIVERY FEES + REMOTE EXECUTION FEES
      console.log('\n2. Calculating delivery and remote execution fees...');
      let deliveryFees = 0n;
      let remoteExecutionFees = 0n; // Skipped (People Chain descriptor not available)

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

        // Find the XCM message sent to People Chain (parents:1, interior: X1(Parachain(1004)))
        const peopleChainXcmEntry = forwardedXcms.find(
          ([location, _]: [any, any]) =>
            (location.type === 'V4' || location.type === 'V5') &&
            location.value.parents === 1 &&
            location.value.interior?.type === 'X1' &&
            location.value.interior.value?.type === 'Parachain' &&
            location.value.interior.value.value === PEOPLE_CHAIN_PARA_ID,
        );

        if (peopleChainXcmEntry) {
          const [destination, messages] = peopleChainXcmEntry;
          const remoteXcm = messages[0];

          console.log('✓ Found XCM message to People Chain');

          // Calculate delivery fees from Polkadot Hub to People Chain
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
    ```

3. **Remote execution fees on People Chain**: Connect to People Chain, recompute the forwarded XCM weight there, and convert weight to PAS (`parents: 0, interior: Here`). Add the code to the function:

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
          // 3. REMOTE EXECUTION FEES on People Chain
          console.log('\n3. Calculating remote execution fees on People Chain');
          try {
            const peopleChainClient = createClient(
              withPolkadotSdkCompat(getWsProvider(PEOPLE_CHAIN_RPC_ENDPOINT)),
            );
            const peopleChainApi = peopleChainClient.getTypedApi(paseoPeopleChain);
            const remoteWeightResult =
              await peopleChainApi.apis.XcmPaymentApi.query_xcm_weight(remoteXcm);
            const remoteFeesResult =
              await peopleChainApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
                remoteWeightResult.value as {
                  ref_time: bigint;
                  proof_size: bigint;
                },
                XcmVersionedAssetId.V4({
                  parents: 1,
                  interior: XcmV3Junctions.Here(),
                }),
              );
            peopleChainClient.destroy();
            remoteExecutionFees = remoteFeesResult.value as bigint;
            console.log(
              '✓ Remote execution fees:',
              remoteExecutionFees.toString(),
              'PAS units',
            );
          } catch (error) {
            console.error(
              'Error calculating remote execution fees on People Chain:',
              error,
            );
          }
        } else {
          console.log('✗ No XCM message found to People Chain');
        }
      } else {
        console.log('✗ Local dry run failed on Polkadot Hub:', dryRunResult.value);
      }
    ```

4. **Sum and return totals**: Aggregate all parts, print a short summary, and return a structured result. Add the code to the function:

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
      // 4. TOTAL FEES
      const totalFees = localExecutionFees + deliveryFees + remoteExecutionFees;

      console.log('\n=== Fee Summary (Polkadot Hub → People Chain) ===');
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
    ```

The full code for the fee estimation function is the following:

??? code "Fee Estimation Function"

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
    async function estimateXcmFeesFromPolkadotHubToPeopleChain(
      xcm: any,
      polkadotHubApi: any,
    ) {
      console.log('=== Fee Estimation Process (Polkadot Hub → People Chain) ===');

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
      let remoteExecutionFees = 0n; // Skipped (People Chain descriptor not available)

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

        // Find the XCM message sent to People Chain (parents:1, interior: X1(Parachain(1004)))
        const peopleChainXcmEntry = forwardedXcms.find(
          ([location, _]: [any, any]) =>
            (location.type === 'V4' || location.type === 'V5') &&
            location.value.parents === 1 &&
            location.value.interior?.type === 'X1' &&
            location.value.interior.value?.type === 'Parachain' &&
            location.value.interior.value.value === PEOPLE_CHAIN_PARA_ID,
        );

        if (peopleChainXcmEntry) {
          const [destination, messages] = peopleChainXcmEntry;
          const remoteXcm = messages[0];

          console.log('✓ Found XCM message to People Chain');

          // Calculate delivery fees from Polkadot Hub to People Chain
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

          // 3. REMOTE EXECUTION FEES on People Chain
          console.log('\n3. Calculating remote execution fees on People Chain');
          try {
            const peopleChainClient = createClient(
              withPolkadotSdkCompat(getWsProvider(PEOPLE_CHAIN_RPC_ENDPOINT)),
            );
            const peopleChainApi = peopleChainClient.getTypedApi(paseoPeopleChain);
            const remoteWeightResult =
              await peopleChainApi.apis.XcmPaymentApi.query_xcm_weight(remoteXcm);
            const remoteFeesResult =
              await peopleChainApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
                remoteWeightResult.value as {
                  ref_time: bigint;
                  proof_size: bigint;
                },
                XcmVersionedAssetId.V4({
                  parents: 1,
                  interior: XcmV3Junctions.Here(),
                }),
              );
            peopleChainClient.destroy();
            remoteExecutionFees = remoteFeesResult.value as bigint;
            console.log(
              '✓ Remote execution fees:',
              remoteExecutionFees.toString(),
              'PAS units',
            );
          } catch (error) {
            console.error(
              'Error calculating remote execution fees on People Chain:',
              error,
            );
          }
        } else {
          console.log('✗ No XCM message found to People Chain');
        }
      } else {
        console.log('✗ Local dry run failed on Polkadot Hub:', dryRunResult.value);
      }

      // 4. TOTAL FEES
      const totalFees = localExecutionFees + deliveryFees + remoteExecutionFees;

      console.log('\n=== Fee Summary (Polkadot Hub → People Chain) ===');
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
    ```

## Complete Implementation

Now put it all together in the main function:

```typescript title="teleport-polkadot-hub-to-people-chain.ts"
async function main() {
  // Connect to the Polkadot Hub parachain
  const polkadotHubClient = createClient(
    withPolkadotSdkCompat(getWsProvider(POLKADOT_HUB_RPC_ENDPOINT)),
  );

  // Get the typed API for Polkadot Hub
  const polkadotHubApi = polkadotHubClient.getTypedApi(polkadotHub);

  try {
    // Create the XCM message for teleport (Polkadot Hub → People Chain)
    const xcm = createTeleportXcmToPeopleChain(PEOPLE_CHAIN_PARA_ID);

    console.log('=== XCM Teleport: Polkadot Hub → People Chain ===');
    console.log('From:', POLKADOT_HUB_ACCOUNT, '(Alice on Polkadot Hub)');
    console.log('To:', PEOPLE_CHAIN_BENEFICIARY, '(Beneficiary on People Chain)');
    console.log('Amount:', '1 PAS');
    console.log('');

    // Estimate all fees
    const fees = await estimateXcmFeesFromPolkadotHubToPeopleChain(xcm, polkadotHubApi);
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
```

## Full Code

The full code for the complete implementation is the following:

??? code "Teleport from Polkadot Hub to People Chain"

    ```typescript title="teleport-polkadot-hub-to-people-chain.ts"
    import { polkadotHub, paseoPeopleChain } from '@polkadot-api/descriptors';
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

    // People Chain destination
    const PEOPLE_CHAIN_RPC_ENDPOINT = 'ws://localhost:8000';
    const PEOPLE_CHAIN_PARA_ID = 1004;
    const PEOPLE_CHAIN_BENEFICIARY =
      '14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3'; // Bob (People Chain)

    // Create the XCM message for teleport (Polkadot Hub → People Chain)
    function createTeleportXcmToPeopleChain(paraId: number) {
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
        // Send to People Chain parachain (parents:1, interior: X1(Parachain(paraId)))
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
                    id: FixedSizeBinary.fromAccountId32(PEOPLE_CHAIN_BENEFICIARY),
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

    async function estimateXcmFeesFromPolkadotHubToPeopleChain(
      xcm: any,
      polkadotHubApi: any,
    ) {
      console.log('=== Fee Estimation Process (Polkadot Hub → People Chain) ===');

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
      let remoteExecutionFees = 0n; // Skipped (People Chain descriptor not available)

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

        // Find the XCM message sent to People Chain (parents:1, interior: X1(Parachain(1004)))
        const peopleChainXcmEntry = forwardedXcms.find(
          ([location, _]: [any, any]) =>
            (location.type === 'V4' || location.type === 'V5') &&
            location.value.parents === 1 &&
            location.value.interior?.type === 'X1' &&
            location.value.interior.value?.type === 'Parachain' &&
            location.value.interior.value.value === PEOPLE_CHAIN_PARA_ID,
        );

        if (peopleChainXcmEntry) {
          const [destination, messages] = peopleChainXcmEntry;
          const remoteXcm = messages[0];

          console.log('✓ Found XCM message to People Chain');

          // Calculate delivery fees from Polkadot Hub to People Chain
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

          // 3. REMOTE EXECUTION FEES on People Chain
          console.log('\n3. Calculating remote execution fees on People Chain');
          try {
            const peopleChainClient = createClient(
              withPolkadotSdkCompat(getWsProvider(PEOPLE_CHAIN_RPC_ENDPOINT)),
            );
            const peopleChainApi = peopleChainClient.getTypedApi(paseoPeopleChain);
            const remoteWeightResult =
              await peopleChainApi.apis.XcmPaymentApi.query_xcm_weight(remoteXcm);
            const remoteFeesResult =
              await peopleChainApi.apis.XcmPaymentApi.query_weight_to_asset_fee(
                remoteWeightResult.value as {
                  ref_time: bigint;
                  proof_size: bigint;
                },
                XcmVersionedAssetId.V4({
                  parents: 1,
                  interior: XcmV3Junctions.Here(),
                }),
              );
            peopleChainClient.destroy();
            remoteExecutionFees = remoteFeesResult.value as bigint;
            console.log(
              '✓ Remote execution fees:',
              remoteExecutionFees.toString(),
              'PAS units',
            );
          } catch (error) {
            console.error(
              'Error calculating remote execution fees on People Chain:',
              error,
            );
          }
        } else {
          console.log('✗ No XCM message found to People Chain');
        }
      } else {
        console.log('✗ Local dry run failed on Polkadot Hub:', dryRunResult.value);
      }

      // 4. TOTAL FEES
      const totalFees = localExecutionFees + deliveryFees + remoteExecutionFees;

      console.log('\n=== Fee Summary (Polkadot Hub → People Chain) ===');
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
        // Create the XCM message for teleport (Polkadot Hub → People Chain)
        const xcm = createTeleportXcmToPeopleChain(PEOPLE_CHAIN_PARA_ID);

        console.log('=== XCM Teleport: Polkadot Hub → People Chain ===');
        console.log('From:', POLKADOT_HUB_ACCOUNT, '(Alice on Polkadot Hub)');
        console.log('To:', PEOPLE_CHAIN_BENEFICIARY, '(Beneficiary on People Chain)');
        console.log('Amount:', '1 PAS');
        console.log('');

        // Estimate all fees
        const fees = await estimateXcmFeesFromPolkadotHubToPeopleChain(xcm, polkadotHubApi);
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


    ```

## Running the Script

Before running the script, you can use chopsticks to fork the Polkadot Hub TestNet and Paseo People Chain locally. To do so, you can use the following files and commands:

1. Create a new directory called `.chopsticks` and add the files:

    ??? code "paseo-people-chain.yml"

        {% raw %}
        ```yaml title=".chopsticks/paseo-people-chain.yml"
        endpoint: wss://people-paseo.rpc.amforc.com
        mock-signature-host: true
        block: ${env.PASEO_PEOPLE_CHAIN_BLOCK_NUMBER}
        db: ./db.sqlite

        import-storage:
          Sudo:
            Key: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY # Alice
          System:
            Account:
              -
                -
                  - 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
                - providers: 1
                  data:
                    free: '10000000000000000000'


        ```
        {% endraw %}
    
    ??? code "paseo-asset-hub.yml"

        {% raw %}
        ```yaml title=".chopsticks/paseo-asset-hub.yml"
        endpoint: wss://asset-hub-paseo-rpc.n.dwellir.com
        mock-signature-host: true
        block: ${env.PASEO_ASSET_HUB_BLOCK_NUMBER}
        db: ./db.sqlite

        import-storage:
          Sudo:
            Key: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY # Alice
          System:
            Account:
              -
                -
                  - 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
                - providers: 1
                  data:
                    free: '10000000000000000000'
        ```
        {% endraw %}

2. Run the following command to fork the Paseo People Chain:

    ```bash
    chopsticks --config=.chopsticks/paseo-people-chain.yml
    ```

    After running the command, you will see the following output:

    <div id="termynal" data-termynal>
      <span data-ty="input"><span class="file-path"></span>chopsticks --config=.chopsticks/paseo-people-chain.yml</span>
      <span data-ty="output">[15:55:22.770] INFO: Paseo People Chain RPC listening on http://[::]:8000 and ws://[::]:8000</span>
      <span data-ty="output">app: "chopsticks"</span>
    </div>


3. Run the following command to fork the Polkadot Hub TestNet chain:

    ```bash
    chopsticks --config=.chopsticks/paseo-asset-hub.yml
    ```

    After running the commands, you will see the following output:

    <div id="termynal" data-termynal>
      <span data-ty="input"><span class="file-path"></span>chopsticks --config=.chopsticks/paseo-asset-hub.yml</span>
      <span data-ty="output">[15:55:22.770] INFO: Paseo Asset Hub Testnet RPC listening on http://[::]:8001 and ws://[::]:8001</span>
      <span data-ty="output">app: "chopsticks"</span>
    </div>

4. Run the script:

    ```bash
    npx ts-node teleport-polkadot-hub-to-people-chain.ts
    ```

After running the script, you will see the following output:

<div id="termynal" data-termynal>
  <span data-ty="input"><span class="file-path"></span>npx ts-node teleport-polkadot-hub-to-people-chain.ts</span>
  <pre>
=== XCM Teleport: Polkadot Hub TestNet → People Chain ===
From: 15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5 (Alice on Polkadot Hub TestNet)
To: 14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3 (Beneficiary on People Chain)
Amount: 1 PAS

=== Fee Estimation Process (Polkadot Hub TestNet → People Chain) ===
1. Calculating local execution fees on Polkadot Hub TestNet...
✓ XCM weight (Polkadot Hub TestNet): { ref_time: 1462082000n, proof_size: 19578n }
✓ Local execution fees (Polkadot Hub TestNet): 97890000 PAS units

2. Calculating delivery and remote execution fees...
✓ Local dry run on Polkadot Hub TestNet successful
✓ Found XCM message to People Chain
✓ Delivery fees: 305150000 PAS units

3. Calculating remote execution fees on People Chain
✓ Remote execution fees: 17965000 PAS units

=== Fee Summary (Polkadot Hub TestNet → People Chain) ===
Local execution fees: 97890000 PAS units
Delivery fees: 305150000 PAS units
Remote execution fees: 17965000 PAS units
TOTAL FEES: 421005000 PAS units
TOTAL FEES: 0.0421 PAS

=== Transaction Details ===
Transaction hex: 0x1f03050c00040100000700e40b54023001000002286bee31010100a90f0100000401000002286bee000400010204040d010204000101008eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a480700bca0650102000400
Ready to submit!

</pre
  >
</div>

## Conclusion

This approach provides accurate fee estimation for XCM teleports from Polkadot Hub TestNet to People Chain by properly simulating execution on both chains and utilizing dedicated runtime APIs for fee calculation. The fee breakdown helps you understand the cost structure of cross-chain operations (asset hub → system parachain) and ensures your transactions have sufficient funds to complete successfully.

The key insight is understanding how asset references change based on the perspective of each chain in the XCM ecosystem, which is crucial for proper fee estimation and XCM construction.
