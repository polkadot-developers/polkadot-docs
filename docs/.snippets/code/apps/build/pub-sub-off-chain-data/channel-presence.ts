// Place this in your Product, after the setup from `setup-statement-store.ts`.

import { ChannelStore } from '@parity/product-sdk-statement-store';
import { client } from './setup-statement-store';

interface Presence {
  status: 'online' | 'away' | 'offline';
  timestamp: number;
}

const channels = new ChannelStore<Presence>(client, { topic2: 'room-42' });

await channels.write('presence/alice', {
  status: 'online',
  timestamp: Date.now(),
});

// A second write on the same channel replaces the first.
await channels.write('presence/alice', {
  status: 'away',
  timestamp: Date.now(),
});

channels.onChange((name, value, previous) => {
  console.log(`${name}: ${previous?.status ?? '<none>'} → ${value.status}`);
});

for (const [name, value] of channels.readAll()) {
  console.log(`${name}: ${value.status}`);
}
