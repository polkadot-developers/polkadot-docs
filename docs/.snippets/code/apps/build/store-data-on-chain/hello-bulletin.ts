// Place this in your Product, after the setup from `setup-app.ts`.

import { app } from './setup-app';

const cid = await app.cloudStorage!.upload('Hello, Bulletin!');

console.log(`CID: ${cid}`);
