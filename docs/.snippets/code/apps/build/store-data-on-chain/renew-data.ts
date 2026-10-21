// Place this in your Product, after the setup from `setup-client.ts`.

import { parseCid } from '@parity/product-sdk/cloud-storage';
import { client } from './setup-client';

// The CID of the data to renew. For a chunked upload, renew the manifest CID
// and every chunk CID from `StoreResult.chunks.chunkCids`.
declare const cid: string;

// A CID's multihash digest is the content hash the Bulletin Chain tracks.
// Renewing by content hash keeps working after earlier renewals, because the
// chain maps each content hash to the data's most recent position.
const contentHash = parseCid(cid).multihash.digest;

// Schedule a one-time renewal at the end of the current retention period.
const receipt = await client.inner.renew(contentHash).send();

console.log(`Renewal registered in block: ${receipt.blockHash}`);
console.log(`Tx hash:                     ${receipt.txHash}`);
