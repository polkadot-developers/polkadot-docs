// Place this in your Product, after the setup from `setup-app.ts`.

import { app } from './setup-app';

const CID_STRING = 'INSERT_CID';

const bytes = await app.cloudStorage!.fetch(CID_STRING);
console.log(`Retrieved ${bytes.length} bytes`);
console.log(new TextDecoder().decode(bytes));

// Verify the fetched bytes match the CID you asked for.
const recomputed = await app.cloudStorage!.computeCid(bytes);
console.log(`CID verified: ${recomputed === CID_STRING}`);
