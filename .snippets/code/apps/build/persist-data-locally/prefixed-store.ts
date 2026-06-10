import { createLocalKvStore } from '@parity/product-sdk-local-storage';

const settingsStore = await createLocalKvStore({ prefix: 'settings' });
const cacheStore = await createLocalKvStore({ prefix: 'cache' });

// Stored internally as "settings:theme"
await settingsStore.set('theme', 'dark');

// Stored internally as "cache:lastBlock"
await cacheStore.set('lastBlock', '21540000');
