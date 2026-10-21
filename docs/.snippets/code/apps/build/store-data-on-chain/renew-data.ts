// Place this in your Product, after the setup from `setup-client.ts`.

import { decode } from '@ipld/dag-pb';
import { CidCodec, parseCid } from '@parity/product-sdk/cloud-storage';
import { client } from './setup-client';

// The CID that the upload returned: a single-transaction CID, or the manifest
// CID of a chunked upload.
declare const cid: string;

// A CID's multihash digest is the content hash the Bulletin Chain tracks.
// The map is keyed by CID, so identical chunks are renewed once.
const root = parseCid(cid);
const contentHashes = new Map<string, Uint8Array>([
  [root.toString(), root.multihash.digest],
]);

// A DAG-PB CID is a manifest. Its links are the chunk CIDs, and each chunk is
// a separately stored transaction that needs its own renewal.
if (root.code === CidCodec.DagPb) {
  const manifest = await client.fetchBytes(cid, { noReassemble: true });
  if (!manifest.ok) throw new Error(manifest.error.message);
  for (const link of decode(manifest.value).Links) {
    contentHashes.set(link.Hash.toString(), link.Hash.multihash.digest);
  }
}

// Register a one-time renewal for each stored record.
for (const contentHash of contentHashes.values()) {
  const receipt = await client.inner.renew(contentHash).send();
  console.log(`Renewal registered in block ${receipt.blockNumber}`);
}
