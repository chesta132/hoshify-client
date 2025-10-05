import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { PaginationResult } from "@/class/server/ServerSuccess";
import { useError } from "@/contexts";
import type { Link } from "@/types/models";
import type { BodyOf, LinkBody, LinkEndpoints } from "@/types/server/endpoints";
import { useMemo } from "react";

type LinkServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  pagination: PaginationResult;
};

export type LinkServices = {
  updateLink: Request<Link, [updates: LinkBody & { id: string }]>;
  createLink: Request<Link[], [body: LinkBody | LinkBody[]]>;
  deleteLink: Request<Link, [id: string]>;
  getLinks: Request<Link[], [offset: number | "sequel"]>;
  updateLinks: Request<Link[], [updates: LinkBody[]]>;
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
        .config({ handleError: { setError } }),
    [pagination.nextOffset, setError, setLoading]
  );

  const deleteLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, id: string) => api.link.delete<Link>(`/${id}`, { signal }))
        .onSuccess((res) => {
          setLinks((prev) => prev.filter((link) => link.id !== res.data.id));
        }),
    [getLinks, setLinks]
  );

  const createLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, body: BodyOf<LinkEndpoints["post"], "/">) => api.link.post("/", body, { signal }))
        .onSuccess((res) => {
          setLinks((prev) => {
            if (Array.isArray(res.data)) return [...prev, ...res.data];
            return [...prev, res.data];
          });
        })
        .reset("config"),
    [getLinks, setLinks]
  );

  const updateLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, updates: BodyOf<LinkEndpoints["put"], "/:id"> & { id: string }) => api.link.put(`/${updates.id}`, updates, { signal }))
        .onSuccess((res) => {
          setLinks((prev) => prev.map((link) => (link.id === res.data.id ? res.data : link)));
        })
        .reset("config"),
    [getLinks, setLinks]
  );

  const updateLinks = useMemo(
    () => getLinks.clone(({ signal }, updates: BodyOf<LinkEndpoints["put"], "/">) => api.link.put<Link[]>("/", updates, { signal })).reset("config"),
    [getLinks]
  );

  return { createLink, updateLink, deleteLink, getLinks, updateLinks };
}
