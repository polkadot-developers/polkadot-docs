import {
  StatementStoreClient,
  type Unsubscribable,
} from '@parity/product-sdk-statement-store';
import type { Board, Todo } from './types';

/** Hashed with blake2b as the primary statement topic — scopes gossip to this app. */
const APP_NAME = 'shared-todo-board';

/**
 * One board mutation, published as a single statement.
 * Statements are capped at 512 bytes, so we broadcast per-todo events
 * rather than the whole board.
 */
export type BoardEvent =
  | { kind: 'upsert'; todo: Todo }
  | { kind: 'delete'; id: string; updatedAt: number };

/** Event for a toggled todo. */
export function toggleEvent(todo: Todo): BoardEvent {
  return {
    kind: 'upsert',
    todo: { ...todo, done: !todo.done, updatedAt: Date.now() },
  };
}

/** Event removing a todo. */
export function deleteEvent(todo: Todo): BoardEvent {
  return { kind: 'delete', id: todo.id, updatedAt: Date.now() };
}

/** Connect a statement store client signing as the given account. */
export async function createSyncClient(
  address: string,
): Promise<StatementStoreClient> {
  const client = new StatementStoreClient({ appName: APP_NAME });
  await client.connect({ mode: 'host', accountId: [address, 42] }); // 42 = generic SS58 prefix
  return client;
}

/** Broadcast a mutation to every other participant. Returns false if the node rejected it. */
export function publishEvent(
  client: StatementStoreClient,
  event: BoardEvent,
): Promise<boolean> {
  return client.publish<BoardEvent>(event);
}

/** Receive mutations from other participants (and replays of our own). */
export function subscribeToBoard(
  client: StatementStoreClient,
  onEvent: (event: BoardEvent) => void,
): Unsubscribable {
  return client.subscribe<BoardEvent>((statement) => {
    if (statement.data && 'kind' in statement.data) {
      onEvent(statement.data);
    }
  });
}

/**
 * Merge an incoming event into the board — last write wins per todo,
 * compared by `updatedAt`. Idempotent, so replayed statements are harmless.
 */
export function applyEvent(board: Board, event: BoardEvent): Board {
  if (event.kind === 'delete') {
    const existing = board.todos.find((t) => t.id === event.id);
    if (!existing || existing.updatedAt > event.updatedAt) return board;
    return {
      ...board,
      todos: board.todos.filter((t) => t.id !== event.id),
      updatedAt: Math.max(board.updatedAt, event.updatedAt),
    };
  }

  const incoming: Todo = event.todo;
  const existing = board.todos.find((t) => t.id === incoming.id);
  if (existing && existing.updatedAt >= incoming.updatedAt) return board;

  const todos = existing
    ? board.todos.map((t) => (t.id === incoming.id ? incoming : t))
    : [...board.todos, incoming];
  return {
    ...board,
    todos,
    updatedAt: Math.max(board.updatedAt, incoming.updatedAt),
  };
}
