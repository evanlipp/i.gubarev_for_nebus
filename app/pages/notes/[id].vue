<template>
  <p v-if="notesStore.loading || !notesStore.initialized" class="note-page__loader" role="status">
    Загрузка заметки…
  </p>
  <NoteEditor v-else-if="note" :initial-note="note" />
  <EmptyState
    v-else
    title="Заметка не найдена"
    description="Она могла быть удалена в другой вкладке."
  />
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useNotesStore } from "~/stores/notes";
import NoteEditor from "~/components/NoteEditor.vue";

const route = useRoute();
const notesStore = useNotesStore();
onMounted(() => notesStore.load());
const note = computed(() => notesStore.getNoteById(String(route.params.id)));
</script>

<style scoped>
.note-page__loader {
  padding: 3rem 1rem;
  color: #667085;
  text-align: center;
}
</style>
