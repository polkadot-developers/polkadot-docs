import type { useProductSDK } from '@parity/product-sdk/react';

/** The SDK App instance, as returned by useProductSDK(). */
export type App = ReturnType<typeof useProductSDK>;

/** A single todo on the shared board. */
export interface Todo {
  id: string;
  text: string;
  done: boolean;
  /** SS58 address of the participant who created the todo. */
  author: string;
  /** Milliseconds since epoch of the last mutation. */
  updatedAt: number;
}

/** The full board state — synced per todo (last write wins), never broadcast whole. */
export interface Board {
  todos: Todo[];
  /** Timestamp of the latest mutation; receivers keep the newest board. */
  updatedAt: number;
  /** CID of the latest Bulletin Chain snapshot, if one has been saved. */
  snapshotCid?: string;
}
