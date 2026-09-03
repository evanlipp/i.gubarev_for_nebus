import { describe, expect, it } from "vitest";

import type { Note } from "~/types/note";

import {
  DRAFT_STORAGE_VERSION,
  getDraftStorageKey,
  loadDraft,
  removeDraft,
  saveDraft,
  type StorageLike,
} from "./drafts";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }

  removeItem(key: string) {
    this.values.delete(key);
  }
}

const note: Note = {
  id: "note-1",
  title: "Черновик",
  todos: [{ id: "todo-1", text: "Проверить", completed: false }],
  createdAt: "2026-09-03T10:00:00.000Z",
  updatedAt: "2026-09-03T10:00:00.000Z",
};

describe("draft storage", () => {
  it("stores a versioned draft and returns an independent copy", () => {
    const storage = new MemoryStorage();

    expect(saveDraft(note, storage, "2026-09-03T11:00:00.000Z")).toBe(true);
    expect(loadDraft(note.id, storage)).toEqual({
      version: DRAFT_STORAGE_VERSION,
      noteId: note.id,
      note,
      savedAt: "2026-09-03T11:00:00.000Z",
    });

    const draft = loadDraft(note.id, storage);
    draft?.note.todos.push({ id: "todo-2", text: "Не сохранять", completed: false });
    expect(loadDraft(note.id, storage)?.note.todos).toHaveLength(1);
  });

  it("ignores malformed drafts and discards a saved draft", () => {
    const storage = new MemoryStorage();
    storage.setItem(getDraftStorageKey(note.id), "broken");
    expect(loadDraft(note.id, storage)).toBeUndefined();

    saveDraft(note, storage);
    expect(removeDraft(note.id, storage)).toBe(true);
    expect(loadDraft(note.id, storage)).toBeUndefined();
  });
});
