// Place this in your Product, after the setup from `setup-statement-store.ts`.

import { client } from './setup-statement-store';

interface ChatMessage {
  text: string;
  from: string;
  ts: number;
}

const accepted = await client.publish<ChatMessage>(
  {
    text: 'Hello, room!',
    from: 'alice',
    ts: Date.now(),
  },
  {
    topic2: 'room-42', // scope to a specific room, doc, or context
    ttlSeconds: 60, // override the default 30s TTL
  },
);

if (accepted) {
  console.log('Statement accepted into the gossip layer');
} else {
  console.warn('Statement rejected by the network');
}
