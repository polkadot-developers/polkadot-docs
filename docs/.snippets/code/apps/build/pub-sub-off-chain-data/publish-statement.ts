// Place this in your Product, after the setup from `setup-statement-store.ts`.

import { client } from './setup-statement-store';

interface ChatMessage {
  text: string;
  from: string;
  ts: number;
}

// `publish` resolves with a `Result`. A `Result` is always truthy, so check
// `.ok` rather than the returned object itself.
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

if (accepted.ok) {
  console.log('Statement accepted into the gossip layer');
} else {
  console.warn(`Statement rejected: ${accepted.error.message}`);
}
