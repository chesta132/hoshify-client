import type { Todo } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";
import { useTodoService, type TodoServices } from "@/services/models/todoService";
import { type PaginationResult } from "@/services/server/ServerSuccess";
import { Request } from "@/services/server/Request";
import api from "@/services/server/ApiClient";

type TodosValues = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setComplete: (id: string, complete: boolean) => Promise<void>;
} & TodoServices;

const defaultValues: TodosValues = {
  todos: [],
  setTodos() {},
  loading: true,
  setLoading() {},
  createTodo: new Request(() => api.todo.get("/")),
  deleteTodo: new Request(() => api.todo.get("/")),
  getTodos: new Request(() => api.todo.get("/")),
  updateTodo: new Request(() => api.todo.get("/")),
  updateTodos: new Request(() => api.todo.get("/")),
  async setComplete() {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const TodoContext = createContext(defaultValues);

export const TodosProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignIn, isInitiated } = useUser();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationResult>({});

  const { createTodo, deleteTodo, getTodos, updateTodo, updateTodos } = useTodoService({ pagination, setLoading, setTodos, setPagination });

  const setComplete = async (id: string, val: boolean) => {
    const original = todos.find((todo) => todo.id === id);
    if (!original) return console.error("Todo not found");
    const update: Todo = { ...original, status: val ? "COMPLETED" : "ACTIVE" };
    setTodos((prev) => prev.map((todo) => (todo.id === id ? update : todo)));

    await updateTodo
      .clone()
      .onError((_, retry) => {
        const { counted } = retry || {};
        if (counted === 3) {
          setTodos((prev) => prev.map((todo) => (todo.id === id ? original : todo)));
        }
      })
      .safeExec(update);
  };

  useEffect(() => {
    if (isInitiated && isSignIn) {
      getTodos.clone().safeExec(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiated, isSignIn]);

  const value: TodosValues = {
    loading,
    setLoading,
    setTodos,
    todos,
    createTodo,
    deleteTodo,
    getTodos,
    updateTodo,
    updateTodos,
    setComplete,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
