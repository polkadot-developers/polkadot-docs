// Place this in your Product, after the setup from `setup-client.ts`.

import { client } from './setup-client';

// e.g., a File the user dropped, an asset bundled with your Product.
declare const largeFile: Uint8Array;

const estimate = client.estimateAuthorization(largeFile.length);
console.log(
  `Need ${estimate.transactions} txs / ${estimate.bytes} bytes of authorization`,
);

const result = await client
  .store(largeFile)
  .withChunkSize(1024 * 1024)
  .withManifest(true)
  .withCallback((event) => {
    console.log(`Progress: ${JSON.stringify(event)}`);
  })
  .send();

console.log(`Root CID (manifest): ${result.cid?.toString()}`);
if (result.chunks) {
  console.log(`Chunks: ${result.chunks.numChunks}`);
  for (const [i, cid] of result.chunks.chunkCids.entries()) {
    console.log(`  [${i}] ${cid.toString()}`);
  }
}
