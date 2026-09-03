import { describe, expect, it, vi } from "vitest";

import type { Note } from "~/types/note";

import { useEditSession } from "./useEditSession";

function createNote(): Note {
  return {
    id: "note-1",
    title: "Список",
    todos: [
      { id: "todo-1", text: "Первое", completed: false },
      { id: "todo-2", text: "Второе", completed: false },
    ],
    createdAt: "2026-09-03T10:00:00.000Z",
    updatedAt: "2026-09-03T10:00:00.000Z",
  };
}

describe("edit session", () => {
  it("undoes and redoes compact title and todo operations", () => {
    const session = useEditSession(createNote());

    session.setTitle("Новый список");
    session.flushTitle();
    session.setTodoCompleted("todo-1", true);
    session.removeTodo("todo-2");

    expect(session.undoStack.value).toEqual([
      { type: "set-title", before: "Список", after: "Новый список" },
      { type: "set-todo-completed", todoId: "todo-1", before: false, after: true },
      {
        type: "remove-todo",
        todo: { id: "todo-2", text: "Второе", completed: false },
        index: 1,
      },
    ]);

    session.undo();
    session.undo();
    session.undo();
    expect(session.note.value).toEqual(createNote());

    session.redo();
    session.redo();
    session.redo();
    expect(session.note.value.todos).toEqual([{ id: "todo-1", text: "Первое", completed: true }]);
  });

  it("groups text input by debounce and flushes it on blur", () => {
    vi.useFakeTimers();
    const session = useEditSession(createNote());

    session.setTitle("С");
    session.setTitle("Сп");
    session.setTitle("Список дел");
    vi.advanceTimersByTime(600);

    session.setTodoText("todo-1", "П");
    session.setTodoText("todo-1", "Позвонить");
    session.flushTodoText("todo-1");

    expect(session.undoStack.value).toEqual([
      { type: "set-title", before: "Список", after: "Список дел" },
      { type: "set-todo-text", todoId: "todo-1", before: "Первое", after: "Позвонить" },
    ]);
    vi.useRealTimers();
  });

  it("clears redo after a new change and caps history at fifty operations", () => {
    const session = useEditSession(createNote());

    session.setTodoCompleted("todo-1", true);
    session.undo();
    session.setTodoCompleted("todo-2", true);

    expect(session.redoStack.value).toEqual([]);

    for (let index = 0; index < 55; index += 1) {
      session.setTitle(`Заметка ${index}`);
      session.flushTitle();
    }

    expect(session.undoStack.value).toHaveLength(50);
    expect(session.undoStack.value.every((operation) => !Object.hasOwn(operation, "todos"))).toBe(
      true,
    );
  });

  it("clears history on reset", () => {
    const session = useEditSession(createNote());
    session.addTodo("Новое");

    session.reset();

    expect(session.note.value).toEqual(createNote());
    expect(session.undoStack.value).toEqual([]);
    expect(session.redoStack.value).toEqual([]);
  });
});
