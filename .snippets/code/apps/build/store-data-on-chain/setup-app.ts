import { createApp } from '@parity/product-sdk';

export const app = await createApp({ name: 'my-product' });
await app.wallet.connect();
