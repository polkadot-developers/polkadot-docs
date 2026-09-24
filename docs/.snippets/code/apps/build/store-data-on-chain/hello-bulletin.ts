// Place this in your Product, after the setup from `setup-app.ts`.

import { app } from './setup-app';

const stored = await app.cloudStorage!.upload('Hello, Bulletin!');
if (!stored.ok) throw new Error(`Upload failed: ${stored.error.message}`);

console.log(`CID: ${stored.value}`);
