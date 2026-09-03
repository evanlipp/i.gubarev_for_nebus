import { describe, expect, it } from "vitest";

import type { Note } from "~/types/note";

import {
  NOTES_STORAGE_KEY,
  STORAGE_VERSION,
  loadNotes,
  saveNotes,
  type StorageLike,
} from "./notes";
import { createNote } from "../note";

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

const sampleNote: Note = {
  id: "note-1",
  title: "Список дел",
  todos: [{ id: "todo-1", text: "Позвонить", completed: false }],
  createdAt: "2026-09-03T10:00:00.000Z",
  updatedAt: "2026-09-03T10:00:00.000Z",
};

describe("notes storage", () => {
  it("returns an empty list when storage is unavailable or empty", () => {
    expect(loadNotes()).toEqual([]);

    const storage = new MemoryStorage();

    expect(loadNotes(storage)).toEqual([]);
  });

  it("ignores corrupted and unsupported stored data", () => {
    const storage = new MemoryStorage();

    storage.setItem(NOTES_STORAGE_KEY, "not json");
    expect(loadNotes(storage)).toEqual([]);

    storage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION + 1, notes: [sampleNote] }),
    );
    expect(loadNotes(storage)).toEqual([]);
  });

  it("loads a valid versioned collection", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      NOTES_STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, notes: [sampleNote] }),
    );

    expect(loadNotes(storage)).toEqual([sampleNote]);
  });

  it("writes only valid notes in the current storage format", () => {
    const storage = new MemoryStorage();

    expect(saveNotes([sampleNote], storage)).toBe(true);
    expect(JSON.parse(storage.getItem(NOTES_STORAGE_KEY) ?? "")).toEqual({
      version: STORAGE_VERSION,
      notes: [sampleNote],
    });
  });

  it("creates a note with an id and matching timestamps", () => {
    const note = createNote({ title: "Новая заметка" });

    expect(note).toMatchObject({
      title: "Новая заметка",
      todos: [],
    });
    expect(note.id).not.toBe("");
    expect(note.createdAt).toBe(note.updatedAt);
  });
});
