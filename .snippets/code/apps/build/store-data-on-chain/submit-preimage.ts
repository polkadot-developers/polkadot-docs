import { getPreimageManager } from '@parity/product-sdk-host';

const preimageManager = await getPreimageManager();
if (!preimageManager) {
  throw new Error('No preimage manager — Product is not loaded inside Polkadot Desktop.');
}

const payload = new TextEncoder().encode('preimage payload bytes');

const key = await preimageManager.submit(payload);

console.log(`Preimage submitted. Key (resource lookup): ${key}`);
