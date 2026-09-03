import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Note } from "~/types/note";
import { getDraftStorageKey } from "~/utils/storage/drafts";

import { useDraft } from "./useDraft";

class MemoryStorage {
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
  title: "Исходная",
  todos: [],
  createdAt: "2026-09-03T10:00:00.000Z",
  updatedAt: "2026-09-03T10:00:00.000Z",
};

describe("useDraft", () => {
  let storage: MemoryStorage;

  beforeEach(() => {
    vi.useFakeTimers();
    storage = new MemoryStorage();
    vi.stubGlobal("window", { localStorage: storage });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it("debounces draft writes and supports restore and discard", () => {
    const draft = useDraft(note.id);

    draft.schedule({ ...note, title: "Первый вариант" });
    draft.schedule({ ...note, title: "Второй вариант" });
    vi.advanceTimersByTime(599);
    expect(storage.getItem(getDraftStorageKey(note.id))).toBeNull();

    vi.advanceTimersByTime(1);
    expect(draft.restore()).toMatchObject({ title: "Второй вариант" });
    expect(draft.hasDraft.value).toBe(true);

    draft.discard();
    expect(draft.hasDraft.value).toBe(false);
    expect(storage.getItem(getDraftStorageKey(note.id))).toBeNull();
  });
});
