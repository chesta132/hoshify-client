import type { Note } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";
import { type PaginationResult } from "@/services/server/ServerSuccess";
import { useNoteService, type NoteServices } from "@/services/models/noteService";
import api from "@/services/server/ApiClient";
import { Request } from "@/services/server/Request";

type NotesValues = {
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
} & NoteServices;

const defaultValues: NotesValues = {
  notes: [],
  setNotes() {},
  loading: true,
  setLoading() {},
  createNote: new Request(() => api.note.get("/")),
  deleteNote: new Request(() => api.note.get("/")),
  getNotes: new Request(() => api.note.get("/")),
  updateNote: new Request(() => api.note.get("/")),
  updateNotes: new Request(() => api.note.get("/")),
};

// eslint-disable-next-line react-refresh/only-export-components
export const NoteContext = createContext(defaultValues);

export const NotesProvider = ({ children }: { children: React.ReactNode }) => {
  const { isSignIn, isInitiated } = useUser();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState<PaginationResult>({});

  const { createNote, deleteNote, getNotes, updateNote, updateNotes } = useNoteService({ pagination, setLoading, setNotes });

  const sort = (a: Note, b: Note) => b.updatedAt.valueOf() - a.updatedAt.valueOf();

  useEffect(() => {
    getNotes.onSuccess((res) => {
      setNotes((prev) => [...prev, ...res.data].sort(sort));
      setPagination(res.getPagination());
    });
  }, [getNotes]);

  useEffect(() => {
    if (isInitiated && isSignIn) {
      getNotes
        .clone()
        .onSuccess((res) => {
          setNotes(res.data.sort(sort));
          setPagination(res.getPagination());
        })
        .safeExec(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiated, isSignIn]);

  const value: NotesValues = {
    loading,
    setLoading,
    setNotes,
    notes,
    createNote,
    deleteNote,
    getNotes,
    updateNote,
    updateNotes,
  };

  return <NoteContext.Provider value={value}>{children}</NoteContext.Provider>;
};
