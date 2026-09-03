import type { Note, Todo } from "~/types/note";

export const NOTES_STORAGE_KEY = "nebus-notes";
export const STORAGE_VERSION = 1;

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem?(key: string): void;
}

interface StoredNotes {
  version: typeof STORAGE_VERSION;
  notes: Note[];
}

export function loadNotes(storage = getBrowserStorage()): Note[] {
  if (!storage) {
    return [];
  }

  try {
    const value = storage.getItem(NOTES_STORAGE_KEY);

    if (!value) {
      return [];
    }

    const storedNotes: unknown = JSON.parse(value);

    return isStoredNotes(storedNotes) ? storedNotes.notes : [];
  } catch {
    return [];
  }
}

export function saveNotes(notes: Note[], storage = getBrowserStorage()) {
  if (!storage || !notes.every(isNote)) {
    return false;
  }

  const storedNotes: StoredNotes = {
    version: STORAGE_VERSION,
    notes,
  };

  try {
    storage.setItem(NOTES_STORAGE_KEY, JSON.stringify(storedNotes));
    return true;
  } catch {
    return false;
  }
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

function isStoredNotes(value: unknown): value is StoredNotes {
  if (
    !isRecord(value) ||
    value.version !== STORAGE_VERSION ||
    !Array.isArray(value.notes)
  ) {
    return false;
  }

  return value.notes.every(isNote);
}

function isNote(value: unknown): value is Note {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.title === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string" &&
    Array.isArray(value.todos) &&
    value.todos.every(isTodo)
  );
}

function isTodo(value: unknown): value is Todo {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    typeof value.text === "string" &&
    typeof value.completed === "boolean"
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
