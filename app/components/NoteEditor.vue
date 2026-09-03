<template>
  <main class="editor-page">
    <header class="editor-page__header">
      <AppButton variant="ghost" @click="cancel">К списку</AppButton>
      <div class="editor-page__actions">
        <AppButton
          variant="secondary"
          :disabled="!canUndo"
          aria-label="Отменить последнее действие"
          @click="undo"
        >
          Отменить
        </AppButton>
        <AppButton
          variant="secondary"
          :disabled="!canRedo"
          aria-label="Повторить отменённое действие"
          @click="redo"
        >
          Повторить
        </AppButton>
        <AppButton :disabled="!canSave" @click="save">Сохранить</AppButton>
        <AppButton v-if="!isNew" variant="danger" @click="isDeleteDialogOpen = true"
          >Удалить</AppButton
        >
      </div>
    </header>
    <form class="editor-form" @submit.prevent="save">
      <label class="editor-form__label" for="note-title">Название</label>
      <input
        id="note-title"
        class="editor-form__title"
        :value="note.title"
        @input="setTitle"
        @blur="session.flushTitle"
      />
      <p v-if="showError" class="editor-form__error" role="alert">
        Введите название заметки и текст каждой задачи.
      </p>
      <section class="editor-todos" aria-labelledby="todos-title">
        <h2 id="todos-title">Задачи</h2>
        <ul class="editor-todos__list">
          <li v-for="todo in note.todos" :key="todo.id" class="editor-todo">
            <input
              :id="`todo-${todo.id}`"
              type="checkbox"
              :checked="todo.completed"
              @change="toggleTodo(todo.id, $event)"
            />
            <input
              class="editor-todo__text"
              :aria-label="`Задача: ${todo.text || 'без текста'}`"
              :value="todo.text"
              @input="setTodoText(todo.id, $event)"
              @blur="session.flushTodoText(todo.id)"
            />
            <AppButton variant="danger" @click="removeTodo(todo.id)">Удалить</AppButton>
          </li>
        </ul>
        <div class="editor-todos__add">
          <input
            v-model="newTodoText"
            aria-label="Текст новой задачи"
            placeholder="Новая задача"
            @keyup.enter.prevent="addTodo"
          />
          <AppButton variant="secondary" @click="addTodo">Добавить</AppButton>
        </div>
      </section>
    </form>
    <ConfirmDialog
      v-model="isCancelDialogOpen"
      title="Отменить изменения?"
      message="Несохранённые изменения будут удалены."
      cancel-text="Отменить изменения"
      confirm-text="Сохранить изменения"
      @cancel-button="leave"
      @confirm="save"
    />
    <ConfirmDialog
      v-model="isDeleteDialogOpen"
      title="Удалить заметку?"
      message="Заметка и её задачи будут удалены без возможности восстановления."
      confirm-text="Удалить"
      danger
      @confirm="remove"
    />
    <ConfirmDialog
      v-if="hasDraft"
      v-model="isDraftDialogOpen"
      title="Восстановить черновик?"
      message="Найден черновик этой заметки."
      confirm-text="Восстановить"
      @confirm="restoreDraft"
      @cancel="draft.discard"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import type { Note } from "~/types/note";
import { useDraft } from "~/composables/useDraft";
import { useEditSession } from "~/composables/useEditSession";
import { useNotesStore } from "~/stores/notes";
import { getEditorShortcut } from "~/utils/editorShortcuts";
import { NOTES_STORAGE_KEY } from "~/utils/storage/notes";

const props = withDefaults(defineProps<{ initialNote: Note; isNew?: boolean }>(), { isNew: false });
const router = useRouter();
const notesStore = useNotesStore();
const session = useEditSession(props.initialNote);
const note = session.note;
const draft = useDraft(props.initialNote.id);
const newTodoText = ref("");
const showError = ref(false);
const isCancelDialogOpen = ref(false);
const isDeleteDialogOpen = ref(false);
const isDraftDialogOpen = ref(Boolean(draft.hasDraft.value));
const isLeaving = ref(false);
const hasDraft = draft.hasDraft;
const hasChanges = computed(
  () =>
    JSON.stringify({ title: session.note.value.title, todos: session.note.value.todos }) !==
    JSON.stringify({ title: props.initialNote.title, todos: props.initialNote.todos }),
);
const canUndo = computed(() => session.undoStack.value.length > 0);
const canRedo = computed(() => session.redoStack.value.length > 0);
const canSave = computed(
  () =>
    Boolean(session.note.value.title?.trim()) &&
    session.note.value.todos.every((todo) => Boolean(todo?.text?.trim())),
);

onMounted(() => {
  window.addEventListener("keydown", onKeydown);
  window.addEventListener("storage", onStorage);
});
const removeNavigationGuard = router.beforeEach((_to, _from) => {
  if (isLeaving.value || !hasChanges.value) {
    return true;
  }

  isCancelDialogOpen.value = true;
  return false;
});
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown);
  window.removeEventListener("storage", onStorage);
  removeNavigationGuard();
});

function onStorage(event: StorageEvent) {
  if (
    !props.isNew &&
    (event.key === NOTES_STORAGE_KEY || event.key === null) &&
    !notesStore.getNoteById(note.value.id)
  ) {
    draft.discard();
  }
}

function onKeydown(event: KeyboardEvent) {
  const target = event.target as HTMLElement | null;
  const isApplePlatform =
    typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const shortcut = getEditorShortcut(event, target, isApplePlatform);
  if (!shortcut) return;
  event.preventDefault();
  if (shortcut === "redo") redo();
  else undo();
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

function setTitle(event: Event) {
  session.setTitle((event.target as HTMLInputElement).value);
  draft.schedule(session.note.value);
}
function setTodoText(id: string, event: Event) {
  session.setTodoText(id, (event.target as HTMLInputElement).value);
  draft.schedule(session.note.value);
}
function toggleTodo(id: string, event: Event) {
  session.setTodoCompleted(id, (event.target as HTMLInputElement).checked);
  draft.schedule(session.note.value);
}
function addTodo() {
  const text = newTodoText.value.trim();
  if (!text) return;
  session.addTodo(text);
  newTodoText.value = "";
  draft.schedule(session.note.value);
}
function removeTodo(id: string) {
  session.removeTodo(id);
  draft.schedule(session.note.value);
}
function save() {
  session.flushTextChanges();
  if (!canSave.value) {
    showError.value = true;
    return;
  }
  const note = { ...session.note.value, updatedAt: new Date().toISOString() };
  if (props.isNew) notesStore.createNote({ title: note.title, todos: note.todos });
  else notesStore.updateNote(note);
  draft.discard();
  isLeaving.value = true;
  navigateTo("/");
}
function cancel() {
  if (hasChanges.value) {
    isCancelDialogOpen.value = true;
  } else {
    leave();
  }
}
function leave() {
  draft.discard();
  isLeaving.value = true;
  navigateTo("/");
}
function remove() {
  isLeaving.value = true;
  notesStore.deleteNote(session.note.value.id);
  draft.discard();
  navigateTo("/");
}
function restoreDraft() {
  const restored = draft.restore();
  if (restored) session.reset(restored);
}
</script>

<style scoped lang="scss">
.editor-page {
  width: min(100% - 2rem, 72rem);
  margin: 0 auto;
  padding: 2rem 0 3rem;
  &__header,
  &__actions,
  .editor-todo,
  .editor-todos__add {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  &__header {
    justify-content: space-between;
    margin-bottom: 2rem;
  }
}
.editor-form {
  display: grid;
  gap: 0.75rem;
}
.editor-form__label {
  font-weight: 600;
}
.editor-form__title,
.editor-todo__text,
.editor-todos__add input {
  min-height: 2.75rem;
  border: 1px solid #d0d5dd;
  border-radius: 0.5rem;
  padding: 0.625rem 0.75rem;
}
.editor-form__title {
  font-size: 1.5rem;
}
.editor-form__error {
  color: #b42318;
}
.editor-todos {
  display: grid;
  gap: 1rem;
  margin-top: 1.5rem;
}
.editor-todos__list {
  display: grid;
  gap: 0.75rem;
  list-style: none;
}
.editor-todos__add input {
  min-width: 0;
  flex: 1;
}
.editor-todo__text {
  min-width: 0;
  flex: 1;
}
@media (max-width: 480px) {
  .editor-page {
    width: min(100% - 1rem, 72rem);
    padding-top: 1.25rem;
  }
  .editor-page__header {
    align-items: stretch;
    flex-direction: column;
  }
  .editor-page__actions {
    flex-wrap: wrap;
  }
  .editor-page__actions .app-button {
    flex: 1;
  }
  .editor-todo {
    align-items: stretch;
    flex-wrap: wrap;
  }
  .editor-todo__text {
    flex-basis: calc(100% - 2.5rem);
  }
}
</style>
