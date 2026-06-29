// Place this in your Product, after the setup from `setup-client.ts`.

import { client } from './setup-client';

// Captured from the Stored event of the original store; persist these in
// your Product. Each renewal returns a NEW (block, index) — track the
// latest values, reusing the original ones on a future renewal will fail.
declare const lastBlock: number;
declare const lastIndex: number;

const receipt = await client.renew(lastBlock, lastIndex).send();

console.log(`Renewed in block:  ${receipt.blockHash}`);
console.log(`Tx hash:           ${receipt.txHash}`);
console.log(`Block number:      ${receipt.blockNumber}`);
