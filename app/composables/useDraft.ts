import { computed, ref } from "vue";

import type { Note } from "~/types/note";
import { loadDraft, removeDraft, saveDraft, type NoteDraft } from "~/utils/storage/drafts";

const DRAFT_DELAY = 600;

export function useDraft(noteId: string, delay = DRAFT_DELAY) {
  const draft = ref<NoteDraft | undefined>(loadDraft(noteId));
  let pendingNote: Note | undefined;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  function schedule(note: Note) {
    pendingNote = copyNote(note);
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(flush, delay);
  }

  function flush() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    if (!pendingNote) {
      return false;
    }

    const nextNote = pendingNote;
    pendingNote = undefined;
    const saved = saveDraft(nextNote);
    draft.value = saved ? loadDraft(noteId) : draft.value;
    return saved;
  }

  function discard() {
    pendingNote = undefined;
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
    const removed = removeDraft(noteId);
    draft.value = undefined;
    return removed;
  }

  function restore() {
    return draft.value ? copyNote(draft.value.note) : undefined;
  }

  return {
    draft,
    hasDraft: computed(() => Boolean(draft.value)),
    schedule,
    flush,
    discard,
    restore,
  };
}

function copyNote(note: Note): Note {
  return { ...note, todos: note.todos.map((todo) => ({ ...todo })) };
}
