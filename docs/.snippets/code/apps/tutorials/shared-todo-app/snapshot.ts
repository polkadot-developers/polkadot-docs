import {
  ChannelStore,
  type StatementStoreClient,
  type Unsubscribable,
} from '@parity/product-sdk-statement-store';
import type { App, Board } from './types';

const SNAPSHOT_CHANNEL = 'board-snapshot';

/**
 * Statements default to a 30-second TTL — far too short for late joiners to
 * discover the board. Announcements request a one-hour retention instead
 * (the pallet caps the maximum); beyond that window a new participant sees
 * an empty board until the next save.
 */
const SNAPSHOT_TTL_SECONDS = 3600;

let authorizationVerified = false;

/**
 * Pre-flight: verify the signing account can store to the Bulletin Chain right
 * now. Without a live allowance the chain rejects uploads with a bare
 * `Invalid: Payment` — this turns that into an actionable error.
 *
 * `getBulletinAllowanceStatus` adds one `System.Number` read on top of
 * `checkAuthorization` and derives `usable`, which is true only when the
 * account is authorized, the authorization has not expired, and quota remains.
 * Checking `authorized` alone would pass an expired or exhausted allowance.
 */
async function ensureAuthorized(app: App, byteLength: number): Promise<void> {
  if (authorizationVerified) return;
  const address = app.wallet.getSelectedAccount()?.address;
  if (!address) throw new Error('No account selected');

  const { CloudStorageClient, createLazySigner, getBulletinAllowanceStatus } =
    await import('@parity/product-sdk-cloud-storage');
  const readOnly = await CloudStorageClient.create({
    environment: 'paseo',
    signer: createLazySigner(() => null, 'read-only client'),
  });

  const status = await getBulletinAllowanceStatus(readOnly.api, address);
  if (!status.ok) {
    throw new Error(
      `Could not read the storage allowance: ${status.error.message}`,
    );
  }
  if (!status.value.usable) {
    throw new Error(
      `Account ${address} has no usable Bulletin Chain allowance (authorized: ${status.value.authorized}, blocks left: ${status.value.remainingBlocks}) — request one, then retry`,
    );
  }
  // `usable` does not size-check the payload; the chain rejects an oversized store.
  if (status.value.remainingBytes < BigInt(byteLength)) {
    throw new Error(
      `Snapshot is ${byteLength} bytes but only ${status.value.remainingBytes} remain in the allowance`,
    );
  }
  authorizationVerified = true;
}

/**
 * Announcement of the latest durable snapshot, written to a last-write-wins
 * channel. The board itself lives on the Bulletin Chain; only its CID travels
 * through the statement store, which keeps the payload well under 512 bytes.
 */
export interface SnapshotAnnouncement {
  cid: string;
  /** Board.updatedAt at the time of the snapshot. */
  updatedAt: number;
  /** Stamped by ChannelStore when omitted. */
  timestamp?: number;
}

/** Upload the board as JSON to the Bulletin Chain. Returns the CID. */
export async function uploadSnapshot(app: App, board: Board): Promise<string> {
  if (!app.cloudStorage) {
    throw new Error('Cloud storage is disabled for this app');
  }
  const payload = JSON.stringify(board);
  await ensureAuthorized(app, new TextEncoder().encode(payload).length);
  const stored = await app.cloudStorage.upload(payload);
  if (!stored.ok) {
    throw new Error(`Snapshot upload failed: ${stored.error.message}`);
  }
  return stored.value;
}

/** Fetch and decode a board snapshot by CID. */
export async function fetchSnapshot(app: App, cid: string): Promise<Board> {
  if (!app.cloudStorage) {
    throw new Error('Cloud storage is disabled for this app');
  }
  const fetched = await app.cloudStorage.fetch(cid);
  if (!fetched.ok) {
    throw new Error(`Could not fetch snapshot ${cid}: ${fetched.error.message}`);
  }
  return JSON.parse(new TextDecoder().decode(fetched.value)) as Board;
}

/** Create the snapshot-announcement channel on top of the sync client. */
export function createSnapshotChannel(
  client: StatementStoreClient,
): ChannelStore<SnapshotAnnouncement> {
  return new ChannelStore<SnapshotAnnouncement>(client);
}

/**
 * Announce a new snapshot CID to every participant. Published directly
 * through the client (not ChannelStore.write) so the statement can carry a
 * long TTL — late joiners receive the latest live announcement on subscribe.
 */
export function announceSnapshot(
  client: StatementStoreClient,
  cid: string,
  updatedAt: number,
) {
  return client.publish<SnapshotAnnouncement>(
    { cid, updatedAt, timestamp: Date.now() },
    { channel: SNAPSHOT_CHANNEL, ttlSeconds: SNAPSHOT_TTL_SECONDS },
  );
}

/**
 * React to snapshot announcements — including the replay a late joiner
 * receives on subscribe. The app only uses one channel, so no name filtering
 * is needed.
 */
export function onSnapshotAnnounced(
  channels: ChannelStore<SnapshotAnnouncement>,
  callback: (announcement: SnapshotAnnouncement) => void,
): Unsubscribable {
  return channels.onChange((_name, value) => callback(value));
}

/**
 * Merge a snapshot into the local board — per-todo last write wins, same rule
 * as live sync. Union by id, so todos deleted after the snapshot was taken
 * can reappear; the next snapshot clears them again.
 */
export function mergeBoards(local: Board, remote: Board): Board {
  const byId = new Map(local.todos.map((t) => [t.id, t]));
  for (const todo of remote.todos) {
    const existing = byId.get(todo.id);
    if (!existing || todo.updatedAt > existing.updatedAt) {
      byId.set(todo.id, todo);
    }
  }
  return {
    todos: [...byId.values()],
    updatedAt: Math.max(local.updatedAt, remote.updatedAt),
    snapshotCid:
      remote.updatedAt > local.updatedAt
        ? (remote.snapshotCid ?? local.snapshotCid)
        : local.snapshotCid,
  };
}
