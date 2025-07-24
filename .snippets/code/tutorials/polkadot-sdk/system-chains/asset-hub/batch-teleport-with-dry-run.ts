import { Builder, Version, BatchMode, hasDryRunSupport } from '@paraspell/sdk';

// Paseo has 10 decimals, we use this to simplify.
const PAS_UNITS = 10_000_000_000;
// The RPC endpoints to connect to Paseo.
// Not needed if using Polkadot.
const PASEO_AH_RPC = 'wss://asset-hub-paseo.dotters.network';

teleport();

async function teleport() {
  const senderAddress = '15whavTNSyceP8SL3Z1JukFcUPzmeR26RxKXkfQiPhsykg7s';
  const recipientAddress = '14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3';

  // Check if dry run is supported on Polkadot Asset Hub
  const supportsDryRun = hasDryRunSupport('AssetHubPolkadot');
  console.log(`AssetHubPolkadot supports dry run: ${supportsDryRun}`);

  if (supportsDryRun) {
    console.log('Running dry run for first transaction...');

    // Dry run the first transaction
    try {
      const dryRunResult1 = await Builder([PASEO_AH_RPC])
        .from('AssetHubPolkadot')
        .to('Polkadot')
        .currency({ symbol: 'DOT', amount: 1 * PAS_UNITS })
        .address(recipientAddress)
        .senderAddress(senderAddress)
        .xcmVersion(Version.V5)
        .dryRun();

      console.log('Dry run result 1:', dryRunResult1);

      // Dry run the second transaction
      console.log('Running dry run for second transaction...');
      const dryRunResult2 = await Builder([PASEO_AH_RPC])
        .from('AssetHubPolkadot')
        .to('Polkadot')
        .currency({ symbol: 'DOT', amount: 1 * PAS_UNITS })
        .address(recipientAddress)
        .senderAddress(senderAddress)
        .xcmVersion(Version.V5)
        .dryRun();

      console.log('Dry run result 2:', dryRunResult2);

      // Check if both dry runs were successful before proceeding
      console.log('Dry run results:');
      console.log('Transaction 1:');
      console.dir(dryRunResult1, { depth: null });
      console.log('Transaction 2:');
      console.dir(dryRunResult2, { depth: null });


    } catch (error) {
      console.error('Dry run failed:', error);
      return; // Exit early if dry run throws an error
    }
  } else {
    console.log('Dry run not supported, proceeding directly to batch transaction...');
  }

  // Original batch transaction code
  const builder = Builder([PASEO_AH_RPC])
    .from('AssetHubPolkadot')
    .to('Polkadot')
    .currency({ symbol: 'DOT', amount: 1 * PAS_UNITS })
    .address(recipientAddress)
    .xcmVersion(Version.V5)
    .addToBatch()

    .from('AssetHubPolkadot')
    .to('Polkadot')
    .currency({ symbol: 'DOT', amount: 1 * PAS_UNITS })
    .address(recipientAddress)
    .xcmVersion(Version.V5)
    .addToBatch();

  const tx = await builder.buildBatch({
    // This settings object is optional and batch all is the default option
    mode: BatchMode.BATCH_ALL //or BatchMode.BATCH
  });

  const callData = await tx.getEncodedData();

  // This generates a link the polkadot developer console.
  // Once there, it's easy to submit.
  console.log(`Send via PAPI console:
    https://dev.papi.how/extrinsics#networkId=paseo_asset_hub&endpoint=light-client&data=${callData.asHex()}
  `);
}