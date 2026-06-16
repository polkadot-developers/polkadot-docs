'use client';

import { useEffect, useRef, useState } from 'react';
import { useProductSDK } from '@parity/product-sdk/react';
import type {
  ChannelStore,
  StatementStoreClient,
} from '@parity/product-sdk-statement-store';
import { connectIdentity, type BoardIdentity } from '@/lib/signer';
import { createTodo, emptyBoard, loadBoard, saveBoard } from '@/lib/board';
import {
  applyEvent,
  createSyncClient,
  deleteEvent,
  publishEvent,
  subscribeToBoard,
  toggleEvent,
  type BoardEvent,
} from '@/lib/sync';
import {
  announceSnapshot,
  createSnapshotChannel,
  fetchSnapshot,
  mergeBoards,
  onSnapshotAnnounced,
  uploadSnapshot,
  type SnapshotAnnouncement,
} from '@/lib/snapshot';
import type { Board, Todo } from '@/lib/types';

function shortAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-6)}`;
}

export default function Home() {
  const app = useProductSDK();
  const [identity, setIdentity] = useState<BoardIdentity | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [draft, setDraft] = useState('');
  const [live, setLive] = useState(false);
  const [saving, setSaving] = useState(false);
  const syncRef = useRef<StatementStoreClient | null>(null);
  const channelsRef = useRef<ChannelStore<SnapshotAnnouncement> | null>(null);
  const boardRef = useRef<Board | null>(null);

  // Load whatever this device last saw, before any host interaction
  useEffect(() => {
    loadBoard(app).then((stored) => setBoard(stored ?? emptyBoard()));
  }, [app]);

  useEffect(() => {
    boardRef.current = board;
  }, [board]);

  useEffect(() => {
    return () => syncRef.current?.destroy();
  }, []);

  /** Merge an event into local state and persist the result. */
  function receiveEvent(event: BoardEvent) {
    setBoard((prev) => {
      if (!prev) return prev;
      const next = applyEvent(prev, event);
      if (next !== prev) void saveBoard(app, next);
      return next;
    });
  }

  /** Apply a local mutation and broadcast it to other participants. */
  function dispatch(event: BoardEvent) {
    receiveEvent(event);
    const client = syncRef.current;
    if (client) {
      publishEvent(client, event).then((accepted) => {
        if (!accepted) setError('Statement rejected — check your allowance');
      });
    }
  }

  /** Pull a newer snapshot from the Bulletin Chain and merge it in. */
  async function receiveSnapshot(announcement: SnapshotAnnouncement) {
    const current = boardRef.current;
    if (!current) return;
    if (announcement.updatedAt <= current.updatedAt && current.snapshotCid)
      return;
    try {
      const remote = await fetchSnapshot(app, announcement.cid);
      remote.snapshotCid = announcement.cid;
      setBoard((prev) => {
        if (!prev) return prev;
        const next = mergeBoards(prev, remote);
        void saveBoard(app, next);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleConnect() {
    setConnecting(true);
    setError(null);
    try {
      const id = await connectIdentity(app);
      setIdentity(id);
      const client = await createSyncClient(id.address);
      syncRef.current = client;
      subscribeToBoard(client, receiveEvent);
      const channels = createSnapshotChannel(client);
      channelsRef.current = channels;
      onSnapshotAnnounced(
        channels,
        (announcement) => void receiveSnapshot(announcement),
      );
      setLive(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setConnecting(false);
    }
  }

  async function handleSaveBoard() {
    const client = syncRef.current;
    if (!board || !client) return;
    setSaving(true);
    setError(null);
    try {
      const cid = await uploadSnapshot(app, board);
      await announceSnapshot(client, cid, board.updatedAt);
      setBoard((prev) => {
        if (!prev) return prev;
        const next = { ...prev, snapshotCid: cid };
        void saveBoard(app, next);
        return next;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!identity || !draft.trim()) return;
    dispatch({
      kind: 'upsert',
      todo: createTodo(draft.trim(), identity.address),
    });
    setDraft('');
  }

  function handleToggle(todo: Todo) {
    dispatch(toggleEvent(todo));
  }

  function handleRemove(todo: Todo) {
    dispatch(deleteEvent(todo));
  }

  return (
    <main className="flex flex-1 flex-col mx-auto w-full max-w-2xl p-6 gap-6">
      <header className="flex items-center justify-between border-b border-foreground/10 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Shared Todo Board</h1>
          {live && (
            <span className="rounded-full bg-green-500/15 px-2 py-0.5 text-xs text-green-600">
              live
            </span>
          )}
        </div>
        {identity ? (
          <div className="text-right text-sm">
            <p className="font-mono">{shortAddress(identity.address)}</p>
            <p className="text-xs opacity-60">
              {identity.isProductAccount
                ? 'product account'
                : (identity.name ?? 'account')}
            </p>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            disabled={connecting}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
          >
            {connecting ? 'Connecting…' : 'Connect'}
          </button>
        )}
      </header>

      {error && (
        <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-500">
          {error}
        </p>
      )}

      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={identity ? 'Add a todo…' : 'Connect to add todos'}
          disabled={!identity || !board}
          className="flex-1 rounded-lg border border-foreground/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-foreground/40 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={!identity || !board || !draft.trim()}
          className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50"
        >
          Add
        </button>
      </form>

      {board && board.todos.length === 0 && (
        <p className="text-sm opacity-60">No todos yet. Add the first one.</p>
      )}

      <ul className="flex flex-col gap-2">
        {board?.todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center gap-3 rounded-lg border border-foreground/10 px-3 py-2"
          >
            <input
              type="checkbox"
              checked={todo.done}
              onChange={() => handleToggle(todo)}
              className="size-4 accent-foreground"
            />
            <span
              className={`flex-1 text-sm ${todo.done ? 'line-through opacity-50' : ''}`}
            >
              {todo.text}
            </span>
            <span className="font-mono text-xs opacity-40">
              {shortAddress(todo.author)}
            </span>
            <button
              onClick={() => handleRemove(todo)}
              className="text-xs opacity-40 hover:opacity-100"
              aria-label={`Delete ${todo.text}`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <footer className="mt-auto flex items-center justify-between border-t border-foreground/10 pt-4">
        <p className="font-mono text-xs opacity-40">
          {board?.snapshotCid
            ? `snapshot: ${board.snapshotCid}`
            : 'no snapshot yet'}
        </p>
        <button
          onClick={handleSaveBoard}
          disabled={!live || !board || saving}
          className="rounded-lg border border-foreground/20 px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save board'}
        </button>
      </footer>
    </main>
  );
}
