// Place this in your Product, after the setup from `setup-app.ts`.

import { app } from './setup-app';

const CID_STRING = 'INSERT_CID';

const fetched = await app.cloudStorage!.fetch(CID_STRING);
if (!fetched.ok) throw new Error(`Fetch failed: ${fetched.error.message}`);

const bytes = fetched.value;
console.log(`Retrieved ${bytes.length} bytes`);
console.log(new TextDecoder().decode(bytes));

// Verify the fetched bytes match the CID you asked for.
const recomputed = await app.cloudStorage!.computeCid(bytes);
console.log(`CID verified: ${recomputed === CID_STRING}`);
