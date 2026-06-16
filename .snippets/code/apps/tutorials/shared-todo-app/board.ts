import type { App, Board, Todo } from './types';

const BOARD_KEY = 'board';

export function emptyBoard(): Board {
  return { todos: [], updatedAt: 0 };
}

/** Load the board from per-product local storage (null if never saved). */
export async function loadBoard(app: App): Promise<Board | null> {
  return app.localStorage.getJSON<Board>(BOARD_KEY);
}

/** Persist the board to per-product local storage. */
export async function saveBoard(app: App, board: Board): Promise<void> {
  await app.localStorage.setJSON(BOARD_KEY, board);
}

/** Create a new todo authored by the given account address. */
export function createTodo(text: string, author: string): Todo {
  return {
    id: crypto.randomUUID(),
    text,
    done: false,
    author,
    updatedAt: Date.now(),
  };
}
