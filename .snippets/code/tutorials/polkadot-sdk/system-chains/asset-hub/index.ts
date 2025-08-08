import { Builder, Version, BatchMode } from '@paraspell/sdk';

// Paseo has 10 decimals, use this to simplify.
const PAS_UNITS = 10_000_000_000;

async function batchTeleport() {
  const builder = Builder()
    .from('AssetHubPaseo')
    .to('Paseo')
    .currency({ symbol: 'PAS', amount: 1 * PAS_UNITS })
    .address('15whavTNSyceP8SL3Z1JukFcUPzmeR26RxKXkfQiPhsykg7s')
    .xcmVersion(Version.V5)
    .addToBatch()
    
    .from('AssetHubPaseo')
    .to('Paseo')
    .currency({ symbol: 'PAS', amount: 1 * PAS_UNITS })
    .address('14E5nqKAp3oAJcmzgZhUD2RcptBeUBScxKHgJKU4HPNcKVf3')
    .xcmVersion(Version.V5)
    .addToBatch();
  
    const tx = await builder.buildBatch({
    // This settings object is optional and batch all is the default option
    mode: BatchMode.BATCH_ALL, //or BatchMode.BATCH
  });
  
  const callData = await tx.getEncodedData();

  // This generates a link the polkadot developer console.
  // Once there, it's easy to submit.
  console.log(`Send via PAPI console:
    https://dev.papi.how/extrinsics#networkId=paseo_asset_hub&endpoint=light-client&data=${callData.asHex()}
  `);
}

batchTeleport();