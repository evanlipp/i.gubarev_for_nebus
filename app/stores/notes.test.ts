import { createPinia, setActivePinia } from "pinia";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Note } from "~/types/note";
import { loadNotes, saveNotes, type StorageLike } from "~/utils/storage/notes";

import { useNotesStore } from "./notes";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

function note(id: string, title: string): Note {
  return {
    id,
    title,
    todos: [],
    createdAt: "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T10:00:00.000Z",
  };
}

describe("notes store", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    setActivePinia(createPinia());
    storage = new MemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("loads notes once", () => {
    const storedNote = note("note-1", "Первая");
    saveNotes([storedNote], storage);

    const store = useNotesStore();
    store.load();
    saveNotes([note("note-2", "Вторая")], storage);
    store.load();

    expect(store.initialized).toBe(true);
    expect(store.notes).toEqual([storedNote]);
  });

  it("creates, updates and deletes saved notes", () => {
    const store = useNotesStore();
    store.load();

    const created = store.createNote({ title: "Первая" });
    const updated = { ...created, title: "Обновлённая" };

    store.updateNote(updated);
    store.deleteNote(created.id);

    expect(store.getNoteById(created.id)).toBeUndefined();
    expect(loadNotes(storage)).toEqual([]);
  });

  it("syncs notes after storage changes in another tab", () => {
    const store = useNotesStore();
    store.load();
    const storedNote = note("note-1", "Из другой вкладки");
    saveNotes([storedNote], storage);

    store.sync();

    expect(store.notes).toEqual([storedNote]);
  });
});
