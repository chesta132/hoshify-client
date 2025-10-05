import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { PaginationResult } from "@/class/server/ServerSuccess";
import { useError } from "@/contexts";
import type { Note } from "@/types/models";
import type { BodyOf, NoteBody, NoteEndpoints } from "@/types/server/endpoints";
import { useMemo } from "react";

type NoteServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  pagination: PaginationResult;
};

export type NoteServices = {
  updateNote: Request<Note, [updates: NoteBody & { id: string }]>;
  createNote: Request<Note[], [body: NoteBody | NoteBody[]]>;
  deleteNote: Request<Note, [id: string]>;
  getNotes: Request<Note[], [offset: number | "sequel"]>;
  updateNotes: Request<Note[], [updates: NoteBody[]]>;
};

export function useNoteService({ setLoading, setNotes, pagination }: NoteServiceProps): NoteServices {
  const { setError } = useError();

  const getNotes = useMemo(
    () =>
      new Request(({ signal }, offset: number | "sequel") =>
        api.note.get<Note[]>(`/?offset=${offset === "sequel" ? pagination.nextOffset : offset}`, { signal })
      )
        .retry(3)
        .loading(setLoading)
        .config({ handleError: { setError } }),
    [pagination.nextOffset, setError, setLoading]
  );

  const deleteNote = useMemo(
    () =>
      getNotes
        .clone(({ signal }, id: string) => api.note.delete<Note>(`/${id}`, { signal }))
        .onSuccess((res) => {
          setNotes((prev) => prev.filter((note) => note.id !== res.data.id));
        }),
    [getNotes, setNotes]
  );

  const createNote = useMemo(
    () =>
      getNotes
        .clone(({ signal }, body: BodyOf<NoteEndpoints["post"], "/">) => api.note.post("/", body, { signal }))
        .onSuccess((res) => {
          setNotes((prev) => {
            if (Array.isArray(res.data)) return [...prev, ...res.data];
            return [...prev, res.data];
          });
        })
        .reset("config"),
    [getNotes, setNotes]
  );

  const updateNote = useMemo(
    () =>
      getNotes
        .clone(({ signal }, updates: BodyOf<NoteEndpoints["put"], "/:id"> & { id: string }) => api.note.put(`/${updates.id}`, updates, { signal }))
        .onSuccess((res) => {
          setNotes((prev) => prev.map((note) => (note.id === res.data.id ? res.data : note)));
        })
        .reset("config"),
    [getNotes, setNotes]
  );

  const updateNotes = useMemo(
    () =>
      getNotes
        .clone(({ signal }, updates: BodyOf<NoteEndpoints["put"], "/">) => api.note.put("/", updates, { signal }))
        .onSuccess((res) => {
          setNotes((prev) => prev.flatMap((note) => res.data.map((t) => (t.id === note.id ? t : note))));
        })
        .reset("config"),
    [getNotes, setNotes]
  );

  return { createNote, updateNote, deleteNote, getNotes, updateNotes };
}
