import { defineStore } from "pinia";

import type { CreateNoteInput, Note } from "~/types/note";
import { createNote, deleteNote, updateNotes } from "~/utils/note";
import { loadNotes, saveNotes } from "~/utils/storage/notes";

export const useNotesStore = defineStore("notes", {
  state: () => ({
    notes: [] as Note[],
    initialized: false,
    loading: false,
  }),

  getters: {
    getNoteById: (state) => (id: string) => state.notes.find((note) => note.id === id),
  },

  actions: {
    load() {
      if (this.initialized || this.loading) {
        return;
      }

      this.loading = true;
      try {
        this.notes = loadNotes();
        this.initialized = true;
      } finally {
        this.loading = false;
      }
    },

    sync() {
      this.notes = loadNotes();
      this.initialized = true;
    },

    createNote(input: CreateNoteInput) {
      const note = createNote(input);

      this.notes.push(note);
      saveNotes(this.notes);

      return note;
    },

    updateNote(note: Note) {
      this.notes = updateNotes(this.notes, note);
      saveNotes(this.notes);
    },

    deleteNote(id: string) {
      this.notes = deleteNote(this.notes, id);
      saveNotes(this.notes);
    },
  },
});
