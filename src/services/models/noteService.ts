import api from "@/services/server/ApiClient";
import { Request } from "@/services/server/Request";
import type { PaginationResult } from "@/services/server/ServerSuccess";
import { useError } from "@/contexts";
import type { Note } from "@/types/models";
import type { BodyOf, NoteBody, NoteEndpoints } from "@/types/server/endpoints";
import { useMemo } from "react";

type NoteServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  pagination: PaginationResult;
  setPagination: React.Dispatch<React.SetStateAction<PaginationResult>>;
};

export type NoteServices = {
  updateNote: Request<Note, [updates: NoteBody & { id: string }]>;
  createNote: Request<Note[], [body: NoteBody | NoteBody[]]>;
  deleteNote: Request<Note, [id: string]>;
  getNotes: Request<Note[], [offset: number | "sequel"]>;
  updateNotes: Request<Note[], [updates: NoteBody[]]>;
};

export function useNoteService({ setLoading, setNotes, pagination, setPagination }: NoteServiceProps): NoteServices {
  const { setError } = useError();

  const sort = (a: Note, b: Note) => b.updatedAt.valueOf() - a.updatedAt.valueOf();

  const getNotes = useMemo(
    () =>
      new Request(({ signal }, offset: number | "sequel") =>
        api.note.get<Note[]>(`/?offset=${offset === "sequel" ? pagination.nextOffset : offset}`, { signal })
      )
        .retry(3)
        .loading(setLoading)
        .transform((res) => {
          setNotes((prev) => [...prev, ...res.data].sort(sort));
          setPagination(res.getPagination());
          return res;
        })
        .config({ handleError: { setError } }),
    [pagination.nextOffset, setError, setLoading, setNotes, setPagination]
  );

  const deleteNote = useMemo(
    () =>
      getNotes
        .clone(({ signal }, id: string) => api.note.delete<Note>(`/${id}`, { signal }))
        .reset("transform")
        .transform((res) => {
          setNotes((prev) => prev.filter((note) => note.id !== res.data.id));
          return res;
        }),
    [getNotes, setNotes]
  );

  const createNote = useMemo(
    () =>
      getNotes
        .clone(({ signal }, body: BodyOf<NoteEndpoints["post"], "/">) => api.note.post("/", body, { signal }))
        .reset("transform", "config")
        .transform((res) => {
          setNotes((prev) => {
            if (Array.isArray(res.data)) return [...prev, ...res.data];
            return [...prev, res.data];
          });
          return res;
        })
        .reset("config"),
    [getNotes, setNotes]
  );

  const updateNote = useMemo(
    () =>
      getNotes
        .clone(({ signal }, updates: BodyOf<NoteEndpoints["put"], "/:id"> & { id: string }) => api.note.put(`/${updates.id}`, updates, { signal }))
        .reset("transform", "config")
        .transform((res) => {
          setNotes((prev) => prev.map((note) => (note.id === res.data.id ? res.data : note)));
          return res;
        })
        .reset("config"),
    [getNotes, setNotes]
  );

  const updateNotes = useMemo(
    () =>
      getNotes
        .clone(({ signal }, updates: BodyOf<NoteEndpoints["put"], "/">) => api.note.put("/", updates, { signal }))
        .reset("transform", "config")
        .transform((res) => {
          setNotes((prev) => prev.map((note) => res.data.find((t) => t.id === note.id) || note));
          return res;
        })
        .reset("config"),
    [getNotes, setNotes]
  );

  return { createNote, updateNote, deleteNote, getNotes, updateNotes };
}
