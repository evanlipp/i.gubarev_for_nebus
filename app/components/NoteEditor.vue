<template>
  <main class="editor-page">
    <header class="editor-page__header">
      <AppButton variant="ghost" @click="cancel">К списку</AppButton>
      <div class="editor-page__actions">
        <AppButton variant="secondary" :disabled="!undoStack.length" @click="undo">Отменить</AppButton>
        <AppButton variant="secondary" :disabled="!redoStack.length" @click="redo">Повторить</AppButton>
        <AppButton :disabled="!canSave" @click="save">Сохранить</AppButton>
        <AppButton v-if="!isNew" variant="danger" @click="isDeleteDialogOpen = true">Удалить</AppButton>
      </div>
    </header>
    <form class="editor-form" @submit.prevent="save">
      <label class="editor-form__label" for="note-title">Название</label>
      <input id="note-title" class="editor-form__title" :value="note.title" @input="setTitle" @blur="session.flushTitle" />
      <p v-if="showError" class="editor-form__error" role="alert">Введите название заметки и текст каждой задачи.</p>
      <section class="editor-todos" aria-labelledby="todos-title">
        <h2 id="todos-title">Задачи</h2>
        <ul class="editor-todos__list">
          <li v-for="todo in note.todos" :key="todo.id" class="editor-todo">
            <input :id="`todo-${todo.id}`" type="checkbox" :checked="todo.completed" @change="toggleTodo(todo.id, $event)" />
            <input class="editor-todo__text" :aria-label="`Задача: ${todo.text || 'без текста'}`" :value="todo.text" @input="setTodoText(todo.id, $event)" @blur="session.flushTodoText(todo.id)" />
            <AppButton variant="danger" @click="removeTodo(todo.id)">Удалить</AppButton>
          </li>
        </ul>
        <div class="editor-todos__add">
          <input v-model="newTodoText" aria-label="Текст новой задачи" placeholder="Новая задача" @keyup.enter.prevent="addTodo" />
          <AppButton variant="secondary" @click="addTodo">Добавить</AppButton>
        </div>
      </section>
    </form>
    <ConfirmDialog v-model="isCancelDialogOpen" title="Отменить изменения?" message="Несохранённые изменения будут удалены." confirm-text="Отменить изменения" @confirm="leave" />
    <ConfirmDialog v-model="isDeleteDialogOpen" title="Удалить заметку?" message="Заметка и её задачи будут удалены без возможности восстановления." confirm-text="Удалить" danger @confirm="remove" />
    <ConfirmDialog v-if="hasDraft" v-model="isDraftDialogOpen" title="Восстановить черновик?" message="Найден черновик этой заметки." confirm-text="Восстановить" @confirm="restoreDraft" @cancel="draft.discard" />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import type { Note } from "~/types/note";
import { useDraft } from "~/composables/useDraft";
import { useEditSession } from "~/composables/useEditSession";
import { useNotesStore } from "~/stores/notes";
import { getEditorShortcut } from "~/utils/editorShortcuts";

const props = withDefaults(defineProps<{ initialNote: Note; isNew?: boolean }>(), { isNew: false });
const notesStore = useNotesStore();
const session = useEditSession(props.initialNote);
const note = session.note;
const undoStack = session.undoStack;
const redoStack = session.redoStack;
const draft = useDraft(props.initialNote.id);
const newTodoText = ref("");
const showError = ref(false);
const isCancelDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isDraftDialogOpen = ref(Boolean(draft.hasDraft.value));
const hasDraft = draft.hasDraft;
const canSave = computed(() => Boolean(session.note.value.title?.trim()) && session.note.value.todos.every((todo) => Boolean(todo?.text?.trim())));

onMounted(() => window.addEventListener("keydown", onKeydown));
onBeforeUnmount(() => window.removeEventListener("keydown", onKeydown));

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const isApplePlatform = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const shortcut = getEditorShortcut(event, target, isApplePlatform);
  if (!shortcut) return;
  event.preventDefault();
  if (shortcut === "redo") redo(); else undo();
}

function undo() {
  if (session.undo()) {
    draft.schedule(note.value);
  }
}

function redo() {
  if (session.redo()) {
    draft.schedule(note.value);
  }
}

function setTitle(event: Event) { session.setTitle((event.target as HTMLInputElement).value); draft.schedule(session.note.value); }
function setTodoText(id: string, event: Event) { session.setTodoText(id, (event.target as HTMLInputElement).value); draft.schedule(session.note.value); }
function toggleTodo(id: string, event: Event) { session.setTodoCompleted(id, (event.target as HTMLInputElement).checked); draft.schedule(session.note.value); }
function addTodo() { const text = newTodoText.value.trim(); if (!text) return; session.addTodo(text); newTodoText.value = ""; draft.schedule(session.note.value); }
function removeTodo(id: string) { session.removeTodo(id); draft.schedule(session.note.value); }
function save() {
  session.flushTextChanges();
  if (!canSave.value) { showError.value = true; return; }
  const note = { ...session.note.value, updatedAt: new Date().toISOString() };
  if (props.isNew) notesStore.createNote({ title: note.title, todos: note.todos }); else notesStore.updateNote(note);
  draft.discard();
  navigateTo("/");
}
function cancel() { isCancelDialogOpen.value = true; }
function leave() { draft.discard(); navigateTo("/"); }
function remove() { notesStore.deleteNote(session.note.value.id); draft.discard(); navigateTo("/"); }
function restoreDraft() { const restored = draft.restore(); if (restored) session.reset(restored); }
</script>
