export interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export interface Note {
  id: string;
  title: string;
  todos: Todo[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteInput {
  title: string;
  todos?: Todo[];
}
