import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { PaginationResult } from "@/class/server/ServerSuccess";
import { useError } from "@/contexts";
import type { Link } from "@/types/models";
import { omit } from "@/utils/manipulate/object";
import { useMemo } from "react";

type LinkServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  pagination: PaginationResult;
};

export type LinkServices = {
  updateLink: Request<Link, [updates: Partial<Link>]>;
  createLink: Request<Link, [body: Partial<Link>]>;
  deleteLink: Request<Link, [id: string]>;
  getLinks: Request<Link[], [offset: number | "sequel"]>;
};

export function useLinkService({ setLoading, setLinks, pagination }: LinkServiceProps): LinkServices {
  const { setError } = useError();

  const getLinks = useMemo(
    () =>
      new Request(({ signal }, offset: number | "sequel") =>
        api.link.get<Link[]>(`/?offset=${offset === "sequel" ? pagination.nextOffset : offset}`, { signal })
      )
        .retry(3)
        .loading(setLoading)
        .setConfig({ handleError: { setError } }),
    [pagination.nextOffset, setError, setLoading]
  );

  const deleteLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, id: string) => api.link.delete(`/${id}`, { signal }))
        .onSuccess((res) => {
          setLinks((prev) => prev.filter((link) => link.id !== res.data.id));
        }),
    [getLinks, setLinks]
  );

  const createLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, body: Partial<Link>) => api.link.post("/", body, { signal }))
        .onSuccess((res) => {
          setLinks((prev) => [...prev, res.data]);
        })
        .setConfig({ handleError: undefined }),
    [getLinks, setLinks]
  );

  const updateLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, updates: Partial<Link>) =>
          api.link.put(`/${updates.id}`, omit(updates, ["createdAt", "id", "updatedAt", "userId"]), { signal })
        )
        .onSuccess((res) => {
          setLinks((prev) => prev.map((link) => (link.id === res.data.id ? res.data : link)));
        })
        .setConfig({ handleError: undefined }),
    [getLinks, setLinks]
  );

  return { createLink, updateLink, deleteLink, getLinks };
}
