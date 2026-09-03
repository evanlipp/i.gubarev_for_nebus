<template>
  <main class="notes-page">
    <header class="notes-page__header">
      <div>
        <p class="notes-page__eyebrow">Заметки</p>
        <h1 class="notes-page__title">Мои заметки</h1>
      </div>
      <AppButton @click="createNote">Новая заметка</AppButton>
    </header>
    <EmptyState v-if="!notesStore.notes.length" title="Заметок пока нет" description="Создайте первую заметку, чтобы собрать задачи в одном месте.">
      <AppButton @click="createNote">Создать заметку</AppButton>
    </EmptyState>
    <section v-else class="notes-page__list" aria-label="Список заметок">
      <NoteCard v-for="note in notesStore.notes" :key="note.id" :note="note" @open="openNote(note.id)" @remove="askRemove(note)" />
    </section>
    <ConfirmDialog v-model="isDeleteDialogOpen" title="Удалить заметку?" message="Заметка и её задачи будут удалены без возможности восстановления." confirm-text="Удалить" @confirm="removeNote" />
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import type { Note } from "~/types/note";
import { useNotesStore } from "~/stores/notes";

const notesStore = useNotesStore();
const noteToDelete = ref<Note | null>(null);
const isDeleteDialogOpen = ref(false);

onMounted(() => notesStore.load());
function createNote() { navigateTo("/notes/new"); }
function openNote(id: string) { navigateTo(`/notes/${id}`); }
function askRemove(note: Note) { noteToDelete.value = note; isDeleteDialogOpen.value = true; }
function removeNote() {
  if (!noteToDelete.value) return;
  notesStore.deleteNote(noteToDelete.value.id);
  noteToDelete.value = null;
}
</script>
