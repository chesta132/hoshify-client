import type { Todo, TodoStatus } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";
import { useTodoService, type TodoServices } from "@/services/models/todoService";
import { type PaginationResult } from "@/services/server/ServerSuccess";
import { Request } from "@/services/server/Request";
import api from "@/services/server/ApiClient";
import { timeInMs } from "@/utils/manipulate/number";
import type { Dayjs } from "dayjs";

type TodosValues = {
  todos: Todo[];
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setComplete: (id: string, complete: boolean) => Promise<void>;
  getBgByStatus: (status: TodoStatus) => string;
  getTextColorByStatus: (todo: Todo) => string;
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
  getBgByStatus: () => "",
  getTextColorByStatus: () => "",
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

  const getBgByStatus = (status: TodoStatus) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-700/20 text-green-500";
      case "PENDING":
        return "bg-yellow-600/20 text-yellow-500";
      case "CANCELED":
        return "bg-red-700/20 text-red-500!";
      case "COMPLETED":
        return "bg-green-500/20 text-green-500";
    }
  };

  const isRed = (dueDate: Dayjs) => dueDate.valueOf() < Date.now() || dueDate.valueOf() < Date.now() + timeInMs({ day: 3 });
  const isAmber = (dueDate: Dayjs) => dueDate.valueOf() > Date.now() - timeInMs({ day: 5 });

  const getTextColorByStatus = (todo: Todo) => {
    switch (todo.status) {
      case "ACTIVE":
        return isRed(todo.dueDate) ? "text-red-600" : isAmber(todo.dueDate) ? "text-amber-500" : "text-foreground";
      case "COMPLETED":
        return "line-through text-foreground/40";
      case "PENDING":
        return isRed(todo.dueDate) ? "text-red-600/70" : isAmber(todo.dueDate) ? "text-amber-500/70" : "text-foreground/70";
      case "CANCELED":
        return "text-gray-400";
    }
  };

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
    getBgByStatus,
    getTextColorByStatus,
  };

  return <TodoContext.Provider value={value}>{children}</TodoContext.Provider>;
};
