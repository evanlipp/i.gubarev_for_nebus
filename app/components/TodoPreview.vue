<template>
  <li class="todo-preview" :class="{ 'todo-preview--completed': todo.completed }">
    <span class="todo-preview__number" aria-hidden="true">{{ `${number}-` }}</span>
    <span class="todo-preview__text">{{ todo.text }}</span>
  </li>
</template>

<script setup lang="ts">
import type { Todo } from "~/types/note";

defineProps<{
  todo: Todo;
  number: number;
}>();
</script>

<style scoped>
.todo-preview {
  display: flex;
  min-width: 0;
  line-height: 1.4;
}
.todo-preview__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.todo-preview__number {
  flex: 0 0 auto;
}
.todo-preview--completed {
  color: #667085;
}
.todo-preview--completed .todo-preview__text {
  text-decoration: line-through;
}
</style>
