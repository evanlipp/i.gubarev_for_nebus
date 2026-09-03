<template>
  <NoteEditor v-if="note" :initial-note="note" /><EmptyState
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
