import type { CreateNoteInput, Note } from "~/types/note";

export function createNote({ title, todos = [] }: CreateNoteInput): Note {
  const now = new Date().toISOString();

  return {
    id: createId(),
    title,
    todos: todos.map((todo) => ({ ...todo })),
    createdAt: now,
    updatedAt: now,
  };
}

export function updateNotes(notes: Note[], note: Note): Note[] {
  return notes.map((currentNote) => (currentNote.id === note.id ? copyNote(note) : currentNote));
}

export function deleteNote(notes: Note[], id: string): Note[] {
  return notes.filter((note) => note.id !== id);
}

export function createId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

function copyNote(note: Note): Note {
  return {
    ...note,
    todos: note.todos.map((todo) => ({ ...todo })),
  };
}
