// Place this in your Product, after the setup from `setup-statement-store.ts`.

import { ChannelStore } from '@parity/product-sdk-statement-store';
import { client } from './setup-statement-store';

interface Presence {
  status: 'online' | 'away' | 'offline';
  timestamp: number;
}

const channels = new ChannelStore<Presence>(client, { topic2: 'room-42' });

// `write` forwards to `publish`, so it resolves with a `Result` too.
const written = await channels.write('presence/alice', {
  status: 'online',
  timestamp: Date.now(),
});
if (!written.ok) {
  console.warn(`Channel write rejected: ${written.error.message}`);
}

// A second write on the same channel replaces the first.
await channels.write('presence/alice', {
  status: 'away',
  timestamp: Date.now(),
});

// `onChange` and `readAll` key channels by their hex hash, not by the readable
// name you wrote. Use `channels.read(name)` to look a channel up by name.
channels.onChange((channelHash, value, previous) => {
  console.log(
    `${channelHash}: ${previous?.status ?? '<none>'} → ${value.status}`,
  );
});

for (const [channelHash, value] of channels.readAll()) {
  console.log(`${channelHash}: ${value.status}`);
}

console.log(`alice is ${channels.read('presence/alice')?.status ?? 'unknown'}`);
