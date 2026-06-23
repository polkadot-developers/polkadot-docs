// Place this in your Product, after the setup from `setup-statement-store.ts`.

import type { ReceivedStatement } from '@parity/product-sdk-statement-store';
import { client } from './setup-statement-store';

// JSON-serialized when published; decoded back to this type on receive.
interface ChatMessage {
  text: string;
  from: string;
  ts: number;
}

const subscription = client.subscribe<ChatMessage>(
  (statement: ReceivedStatement<ChatMessage>) => {
    console.log(
      `[${statement.signerHex?.slice(0, 10)}…] ${statement.data.from}: ${statement.data.text}`,
    );
  },
  { topic2: 'room-42' },
);

// subscription.unsubscribe() when you no longer want updates.
