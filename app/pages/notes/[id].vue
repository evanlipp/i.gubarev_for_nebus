<template>
  <main class="notes-page">
    <h1 class="notes-page__title">Редактирование заметки</h1>
    <p v-if="note">Редактор заметки будет доступен в следующем этапе.</p>
    <EmptyState v-else title="Заметка не найдена" description="Она могла быть удалена в другой вкладке." />
    <AppButton @click="navigateTo('/')">Вернуться к списку</AppButton>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useNotesStore } from "~/stores/notes";

const route = useRoute();
const notesStore = useNotesStore();
onMounted(() => notesStore.load());
const note = computed(() => notesStore.getNoteById(String(route.params.id)));
</script>
