import type { Note, Todo } from "~/types/note";

export type EditOperation =
  | { type: "set-title"; before: string; after: string }
  | { type: "set-todo-text"; todoId: string; before: string; after: string }
  | { type: "set-todo-completed"; todoId: string; before: boolean; after: boolean }
  | { type: "add-todo"; todo: Todo; index: number }
  | { type: "remove-todo"; todo: Todo; index: number };

export function applyOperation(note: Note, operation: EditOperation): Note {
  switch (operation.type) {
    case "set-title":
      return { ...note, title: operation.after };
    case "set-todo-text":
      return updateTodo(note, operation.todoId, (todo) => ({ ...todo, text: operation.after }));
    case "set-todo-completed":
      return updateTodo(note, operation.todoId, (todo) => ({
        ...todo,
        completed: operation.after,
      }));
    case "add-todo":
      return insertTodo(note, operation.todo, operation.index);
    case "remove-todo":
      return removeTodo(note, operation.todo.id);
  }
}

export function reverseOperation(operation: EditOperation): EditOperation {
  switch (operation.type) {
    case "set-title":
      return { ...operation, before: operation.after, after: operation.before };
    case "set-todo-text":
      return { ...operation, before: operation.after, after: operation.before };
    case "set-todo-completed":
      return { ...operation, before: operation.after, after: operation.before };
    case "add-todo":
      return { type: "remove-todo", todo: copyTodo(operation.todo), index: operation.index };
    case "remove-todo":
      return { type: "add-todo", todo: copyTodo(operation.todo), index: operation.index };
  }
}

function updateTodo(note: Note, todoId: string, update: (todo: Todo) => Todo): Note {
  return {
    ...note,
    todos: note.todos.map((todo) => (todo.id === todoId ? update(todo) : todo)),
  };
}

function insertTodo(note: Note, todo: Todo, index: number): Note {
  const todos = note.todos.slice();
  todos.splice(Math.max(0, Math.min(index, todos.length)), 0, copyTodo(todo));

  return { ...note, todos };
}

function removeTodo(note: Note, todoId: string): Note {
  return { ...note, todos: note.todos.filter((todo) => todo.id !== todoId) };
}

function copyTodo(todo: Todo): Todo {
  return { ...todo };
}
