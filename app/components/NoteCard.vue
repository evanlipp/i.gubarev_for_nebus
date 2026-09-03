<template>
  <article class="note-card">
    <NuxtLink class="note-card__open" :to="`/notes/${note.id}`">
      <h2 class="note-card__title">{{ note.title }}</h2>
      <ul v-if="displayedTodos.length" class="note-card__todos" aria-label="Задачи заметки">
        <TodoPreview
          v-for="(todo, index) in displayedTodos"
          :key="todo.id"
          :todo="todo"
          :number="index + 1"
        />
      </ul>
      <p v-else class="note-card__empty">Нет задач</p>
    </NuxtLink>
    <button
      v-if="remainingTodos && !isExpanded"
      class="note-card__more"
      type="button"
      @click="isExpanded = true"
    >
      Ещё {{ remainingTodos }}
    </button>

    <div class="note-card__actions">
      <AppButton variant="danger" @click="$emit('remove')">Удалить</AppButton>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

import type { Note } from "~/types/note";

const props = withDefaults(
  defineProps<{
    note: Note;
    todosLimit?: number;
  }>(),
  { todosLimit: 3 },
);

defineEmits<{
  remove: [];
}>();

const isExpanded = ref(false);
const displayedTodos = computed(() =>
  isExpanded.value ? props.note.todos : props.note.todos.slice(0, props.todosLimit),
);
const remainingTodos = computed(() => Math.max(0, props.note.todos.length - props.todosLimit));
</script>

<style scoped lang="scss">
.note-card {
  display: flex;
  min-width: 0;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid #eaecf0;
  border-radius: 0.75rem;
  padding: 1rem;
  background: #fff;
  box-shadow: 0 1px 2px rgb(16 24 40 / 5%);
  cursor: pointer;
}
.note-card__open {
  display: block;
  min-width: 0;
  border: 0;
  color: inherit;
  background: transparent;
  text-align: left;
  text-decoration: none;
}
.note-card__title {
  overflow: hidden;
  margin-bottom: 0.875rem;
  font-size: 1.125rem;
  line-height: 1.35;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.note-card__todos {
  display: grid;
  gap: 0.5rem;
  list-style: none;
}
.note-card__empty,
.note-card__more {
  color: #667085;
  line-height: 1.5;
}
.note-card__more {
  margin-top: 0.75rem;
  align-self: flex-start;
  border: 0;
  padding: 0;
  background: transparent;
  font-size: 0.875rem;
  cursor: pointer;
}
.note-card__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-self: flex-end;
  width: max-content;
  max-width: 100%;
  gap: 0.5rem;
}
</style>
