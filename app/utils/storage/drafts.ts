import type { Note } from "~/types/note";
import type { StorageLike } from "~/utils/storage/notes";

export const DRAFT_STORAGE_PREFIX = "nebus-note-draft:";
export const DRAFT_STORAGE_VERSION = 1;

export interface NoteDraft {
  version: typeof DRAFT_STORAGE_VERSION;
  noteId: string;
  note: Note;
  savedAt: string;
}

export function loadDraft(noteId: string, storage = getBrowserStorage()): NoteDraft | undefined {
  if (!storage) {
    return undefined;
  }

  try {
    const value = storage.getItem(getDraftStorageKey(noteId));
    if (!value) {
      return undefined;
    }

    const draft: unknown = JSON.parse(value);
    return isDraft(draft) && draft.noteId === noteId ? copyDraft(draft) : undefined;
  } catch {
    return undefined;
  }
}

export function saveDraft(
  note: Note,
  storage = getBrowserStorage(),
  savedAt = new Date().toISOString(),
) {
  if (!storage || !isNote(note)) {
    return false;
  }

  const draft: NoteDraft = {
    version: DRAFT_STORAGE_VERSION,
    noteId: note.id,
    note: copyNote(note),
    savedAt,
  };

  try {
    storage.setItem(getDraftStorageKey(note.id), JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}

export function removeDraft(noteId: string, storage = getBrowserStorage()) {
  if (!storage) {
    return false;
  }

  if (!storage.removeItem) {
    return false;
  }

  try {
    storage.removeItem(getDraftStorageKey(noteId));
    return true;
  } catch {
    return false;
  }
}

export function getDraftStorageKey(noteId: string) {
  return `${DRAFT_STORAGE_PREFIX}${noteId}`;
}

function getBrowserStorage(): StorageLike | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function isDraft(value: unknown): value is NoteDraft {
  return (
    isRecord(value) &&
    value.version === DRAFT_STORAGE_VERSION &&
    typeof value.noteId === "string" &&
    typeof value.savedAt === "string" &&
    isNote(value.note)
  );
}

function isNote(value: unknown): value is Note {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    Array.isArray(value.todos) &&
    value.todos.every(
      (todo) =>
        isRecord(todo) &&
        typeof todo.id === "string" &&
        typeof todo.text === "string" &&
        typeof todo.completed === "boolean",
    )
  );
}

function copyDraft(draft: NoteDraft): NoteDraft {
  return { ...draft, note: copyNote(draft.note) };
}

function copyNote(note: Note): Note {
  return { ...note, todos: note.todos.map((todo) => ({ ...todo })) };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
