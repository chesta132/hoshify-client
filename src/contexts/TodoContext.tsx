import type { Todo } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";
import { useTodoService, type TodoServices } from "@/services/todoService";
import { type PaginationResult } from "@/class/server/ServerSuccess";
import { Request } from "@/class/server/Request";
import api from "@/class/server/ApiClient";

type TodosValues = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
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
};

// eslint-disable-next-line react-refresh/only-export-components
export const TodoContext = createContext(defaultValues);

export const TodosProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, isInitiated, setUser } = useUser();
  const [todos, setTodos] = useState(user.todos);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationResult>({});

  const { createTodo, deleteTodo, getTodos, updateTodo, updateTodos } = useTodoService({ pagination, setLoading, setTodos });

  const sort = (a: Todo, b: Todo) => a.dueDate.valueOf() - b.dueDate.valueOf();

  useEffect(() => {
    getTodos.onSuccess((res) => {
      setTodos((prev) => [...prev, ...res.data].sort(sort));
      setPagination(res.getPagination());
      return res;
    });
  }, [getTodos]);

  useEffect(() => {
    if (isInitiated) {
      let updates = user.todos.sort(sort);
      getTodos
        .clone()
        .onSuccess((res) => {
          updates = [...updates, ...res.data].sort(sort);
          setPagination(res.getPagination());
        })
        .onFinally(() => {
          setTodos(updates);
        })
        .safeExec(updates.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiated]);

  useEffect(() => {
    setUser((prev) => ({ ...prev, todos }));
  }, [setUser, todos]);

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
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
