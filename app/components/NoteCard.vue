<template>
  <article class="note-card">
    <button class="note-card__open" type="button" @click="$emit('open')">
      <h2 class="note-card__title">{{ note.title }}</h2>
      <ul v-if="visibleTodos.length" class="note-card__todos" aria-label="Задачи заметки">
        <TodoPreview v-for="todo in visibleTodos" :key="todo.id" :todo="todo" />
      </ul>
      <p v-else class="note-card__empty">Нет задач</p>
      <p v-if="remainingTodos" class="note-card__more">Ещё {{ remainingTodos }}</p>
    </button>

    <div class="note-card__actions">
      <AppButton variant="ghost" @click="$emit('open')">Открыть</AppButton>
      <AppButton variant="danger" @click="$emit('remove')">Удалить</AppButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed } from "vue";

import type { Note } from "~/types/note";

const props = withDefaults(
  defineProps<{
    note: Note;
    todosLimit?: number;
  }>(),
  { todosLimit: 3 },
);

defineEmits<{
  open: [];
  remove: [];
}>();

const visibleTodos = computed(() => props.note.todos.slice(0, props.todosLimit));
const remainingTodos = computed(() => Math.max(0, props.note.todos.length - visibleTodos.value.length));
</script>
