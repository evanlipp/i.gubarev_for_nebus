<template>
  <main class="notes-page">
    <header class="notes-page__header">
      <div>
        <h1 class="notes-page__title">Мои заметки</h1>
      </div>
      <AppButton @click="createNote">Новая заметка</AppButton>
    </header>
    <p
      v-if="notesStore.loading || !notesStore.initialized"
      class="notes-page__loader"
      role="status"
    >
      Загрузка заметок…
    </p>
    <EmptyState
      v-else-if="!notesStore.notes.length"
      title="Заметок пока нет"
      description="Создайте первую заметку, чтобы собрать задачи в одном месте."
    >
      <AppButton @click="createNote">Создать заметку</AppButton>
    </EmptyState>
    <section v-else class="notes-page__list" aria-label="Список заметок">
      <NoteCard
        v-for="note in notesStore.notes"
        :key="note.id"
        :note="note"
        @remove="askRemove(note)"
      />
    </section>
    <ConfirmDialog
      v-model="isDeleteDialogOpen"
      title="Удалить заметку?"
      message="Заметка и её задачи будут удалены без возможности восстановления."
      confirm-text="Удалить"
      @confirm="removeNote"
    />
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
function createNote() {
  navigateTo("/notes/new");
}
function askRemove(note: Note) {
  noteToDelete.value = note;
  isDeleteDialogOpen.value = true;
}
function removeNote() {
  if (!noteToDelete.value) return;
  notesStore.deleteNote(noteToDelete.value.id);
  noteToDelete.value = null;
}
</script>

<style scoped lang="scss">
.notes-page {
  width: min(100% - 2rem, 72rem);
  margin: 0 auto;
  padding: 2rem 0 3rem;
  &__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
  }
  &__title {
    font-size: clamp(1.5rem, 4vw, 2rem);
    line-height: 1.2;
  }
  &__list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  &__loader {
    padding: 3rem 0;
    color: #667085;
    text-align: center;
  }
}
@media (max-width: 480px) {
  .notes-page {
    width: min(100% - 1rem, 72rem);
    padding-top: 1.25rem;
    &__header {
      align-items: stretch;
      flex-direction: column;
    }
    &__header .app-button {
      width: 100%;
    }
  }
}
</style>
