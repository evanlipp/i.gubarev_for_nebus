import { ref } from "vue";

import type { Note, Todo } from "~/types/note";
import { createId } from "~/utils/note";
import { applyOperation, reverseOperation, type EditOperation } from "~/utils/history";

const HISTORY_LIMIT = 50;
const TEXT_GROUP_DELAY = 600;

interface PendingTextChange {
  before: string;
  timeout: ReturnType<typeof setTimeout>;
}

export function useEditSession(initialNote: Note, delay = TEXT_GROUP_DELAY) {
  const note = ref(copyNote(initialNote));
  const undoStack = ref<EditOperation[]>([]);
  const redoStack = ref<EditOperation[]>([]);
  let pendingTitle: PendingTextChange | undefined;
  const pendingTodoTexts = new Map<string, PendingTextChange>();

  function apply(operation: EditOperation) {
    flushTextChanges();
    applyRecorded(operation);
  }

  function setTitle(title: string) {
    if (note.value.title === title) {
      return;
    }

    if (!pendingTitle) {
      pendingTitle = startTextChange(note.value.title, () => flushTitle());
    }

    note.value = { ...note.value, title };
  }

  function flushTitle() {
    const pending = pendingTitle;
    pendingTitle = undefined;

    if (!pending || pending.before === note.value.title) {
      return;
    }

    clearTimeout(pending.timeout);
    record({ type: "set-title", before: pending.before, after: note.value.title });
  }

  function setTodoText(todoId: string, text: string) {
    const todo = findTodo(todoId);
    if (!todo || todo.text === text) {
      return;
    }

    if (!pendingTodoTexts.has(todoId)) {
      pendingTodoTexts.set(todoId, startTextChange(todo.text, () => flushTodoText(todoId)));
    }

    note.value = applyOperation(note.value, {
      type: "set-todo-text",
      todoId,
      before: todo.text,
      after: text,
    });
  }

  function flushTodoText(todoId: string) {
    const pending = pendingTodoTexts.get(todoId);
    pendingTodoTexts.delete(todoId);
    const todo = findTodo(todoId);

    if (!pending || !todo || pending.before === todo.text) {
      return;
    }

    clearTimeout(pending.timeout);
    record({ type: "set-todo-text", todoId, before: pending.before, after: todo.text });
  }

  function flushTextChanges() {
    flushTitle();
    [...pendingTodoTexts.keys()].forEach(flushTodoText);
  }

  function setTodoCompleted(todoId: string, completed: boolean) {
    const todo = findTodo(todoId);
    if (!todo || todo.completed === completed) {
      return;
    }

    apply({ type: "set-todo-completed", todoId, before: todo.completed, after: completed });
  }

  function addTodo(text: string, index = note.value.todos.length): Todo {
    const todo: Todo = { id: createId(), text, completed: false };
    apply({ type: "add-todo", todo, index });
    return todo;
  }

  function removeTodo(todoId: string) {
    const index = note.value.todos.findIndex((todo) => todo.id === todoId);
    if (index === -1) {
      return;
    }

    apply({ type: "remove-todo", todo: { ...note.value.todos[index] }, index });
  }

  function undo() {
    flushTextChanges();
    const operation = undoStack.value.pop();
    if (!operation) {
      return false;
    }

    note.value = applyOperation(note.value, reverseOperation(operation));
    redoStack.value.push(operation);
    return true;
  }

  function redo() {
    flushTextChanges();
    const operation = redoStack.value.pop();
    if (!operation) {
      return false;
    }

    note.value = applyOperation(note.value, operation);
    undoStack.value.push(operation);
    return true;
  }

  function clearHistory() {
    clearPendingTextChanges();
    undoStack.value = [];
    redoStack.value = [];
  }

  function reset(nextNote = initialNote) {
    note.value = copyNote(nextNote);
    clearHistory();
  }

  function applyRecorded(operation: EditOperation) {
    note.value = applyOperation(note.value, operation);
    record(operation);
  }

  function record(operation: EditOperation) {
    undoStack.value.push(operation);
    if (undoStack.value.length > HISTORY_LIMIT) {
      undoStack.value.shift();
    }
    redoStack.value = [];
  }

  function findTodo(todoId: string) {
    return note.value.todos.find((todo) => todo.id === todoId);
  }

  function startTextChange(before: string, flush: () => void): PendingTextChange {
    return { before, timeout: setTimeout(flush, delay) };
  }

  function clearPendingTextChanges() {
    if (pendingTitle) {
      clearTimeout(pendingTitle.timeout);
      pendingTitle = undefined;
    }
    pendingTodoTexts.forEach((pending) => clearTimeout(pending.timeout));
    pendingTodoTexts.clear();
  }

  return {
    note,
    undoStack,
    redoStack,
    apply,
    setTitle,
    flushTitle,
    setTodoText,
    flushTodoText,
    flushTextChanges,
    setTodoCompleted,
    addTodo,
    removeTodo,
    undo,
    redo,
    clearHistory,
    reset,
  };
}

function copyNote(note: Note): Note {
  return { ...note, todos: note.todos.map((todo) => ({ ...todo })) };
}
