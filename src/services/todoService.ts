import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { PaginationResult } from "@/class/server/ServerSuccess";
import { useError } from "@/contexts";
import type { Todo } from "@/types/models";
import type { BodyOf, CreateTodoBody, TodoEndpoints } from "@/types/server/endpoints";
import { useMemo } from "react";

type TodoServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setTodos: React.Dispatch<React.SetStateAction<Todo[]>>;
  pagination: PaginationResult;
};

export type TodoServices = {
  updateTodo: Request<Todo, [updates: CreateTodoBody & { id: string }]>;
  createTodo: Request<Todo[], [body: CreateTodoBody | CreateTodoBody[]]>;
  deleteTodo: Request<Todo, [id: string]>;
  getTodos: Request<Todo[], [offset: number | "sequel"]>;
  updateTodos: Request<Todo[], [updates: CreateTodoBody[]]>;
};

export function useTodoService({ setLoading, setTodos, pagination }: TodoServiceProps): TodoServices {
  const { setError } = useError();

  const getTodos = useMemo(
    () =>
      new Request(({ signal }, offset: number | "sequel") =>
        api.todo.get<Todo[]>(`/?offset=${offset === "sequel" ? pagination.nextOffset : offset}`, { signal })
      )
        .retry(3)
        .loading(setLoading)
        .config({ handleError: { setError } }),
    [pagination.nextOffset, setError, setLoading]
  );

  const deleteTodo = useMemo(
    () =>
      getTodos
        .clone(({ signal }, id: string) => api.todo.delete<Todo>(`/${id}`, { signal }))
        .onSuccess((res) => {
          setTodos((prev) => prev.filter((todo) => todo.id !== res.data.id));
        }),
    [getTodos, setTodos]
  );

  const createTodo = useMemo(
    () =>
      getTodos
        .clone(({ signal }, body: BodyOf<TodoEndpoints["post"], "/">) => api.todo.post("/", body, { signal }))
        .onSuccess((res) => {
          setTodos((prev) => {
            if (Array.isArray(res.data)) return [...prev, ...res.data];
            return [...prev, res.data];
          });
        })
        .reset("config"),
    [getTodos, setTodos]
  );

  const updateTodo = useMemo(
    () =>
      getTodos
        .clone(({ signal }, updates: BodyOf<TodoEndpoints["put"], "/:id"> & { id: string }) => api.todo.put(`/${updates.id}`, updates, { signal }))
        .onSuccess((res) => {
          setTodos((prev) => prev.map((todo) => (todo.id === res.data.id ? res.data : todo)));
        })
        .reset("config"),
    [getTodos, setTodos]
  );

  const updateTodos = useMemo(
    () =>
      getTodos
        .clone(({ signal }, updates: BodyOf<TodoEndpoints["put"], "/">) => api.todo.put("/", updates, { signal }))
        .reset("onSuccess", "config"),
    [getTodos]
  );

  return { createTodo, updateTodo, deleteTodo, getTodos, updateTodos };
}
