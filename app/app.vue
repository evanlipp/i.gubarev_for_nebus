<template>
  <div>
    <p class="app-greeting">Привет, приятного просмотра и хорошего дня! Губарев Иван</p>
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useNotesStore } from "~/stores/notes";
import { NOTES_STORAGE_KEY } from "~/utils/storage/notes";

const notesStore = useNotesStore();

function onStorage(event: StorageEvent) {
  if (event.key === NOTES_STORAGE_KEY || event.key === null) notesStore.sync();
}

onMounted(() => window.addEventListener("storage", onStorage));
onBeforeUnmount(() => window.removeEventListener("storage", onStorage));
</script>

<style scoped>
.app-greeting {
  width: min(100% - 2rem, 72rem);
  margin: 1rem auto 0;
  color: #667085;
}
</style>
