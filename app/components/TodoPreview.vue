<template>
  <li class="todo-preview" :class="{ 'todo-preview--completed': todo.completed }">
    <span class="todo-preview__mark" aria-hidden="true">{{ todo.completed ? "✓" : "" }}</span>
    <span class="todo-preview__text">{{ todo.text }}</span>
  </li>
</template>

<script setup lang="ts">
import type { Todo } from "~/types/note";

defineProps<{
  todo: Todo;
}>();
</script>
