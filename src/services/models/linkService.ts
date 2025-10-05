import api from "@/services/server/ApiClient";
import { Request } from "@/services/server/Request";
import type { PaginationResult } from "@/services/server/ServerSuccess";
import { useError } from "@/contexts";
import type { Link } from "@/types/models";
import type { BodyOf, LinkBody, LinkEndpoints } from "@/types/server/endpoints";
import { useMemo } from "react";

type LinkServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  pagination: PaginationResult;
  setPagination: React.Dispatch<React.SetStateAction<PaginationResult>>;
};

export type LinkServices = {
  updateLink: Request<Link, [updates: LinkBody & { id: string }]>;
  createLink: Request<Link[], [body: LinkBody | LinkBody[]]>;
  deleteLink: Request<Link, [id: string]>;
  getLinks: Request<Link[], [offset: number | "sequel"]>;
  updateLinks: Request<Link[], [updates: LinkBody[]]>;
};

export function useLinkService({ setLoading, setLinks, pagination, setPagination }: LinkServiceProps): LinkServices {
  const { setError } = useError();
  const sort = (a: Link, b: Link) => a.position - b.position;

  const getLinks = useMemo(
    () =>
      new Request(({ signal }, offset: number | "sequel") =>
        api.link.get<Link[]>(`/?offset=${offset === "sequel" ? pagination.nextOffset : offset}`, { signal })
      )
        .retry(3)
        .loading(setLoading)
        .transform((res) => {
          setLinks((prev) => [...prev, ...res.data].sort(sort));
          setPagination(res.getPagination());
          return res;
        })
        .config({ handleError: { setError } }),
    [pagination.nextOffset, setError, setLinks, setLoading, setPagination]
  );

  const deleteLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, id: string) => api.link.delete<Link>(`/${id}`, { signal }))
        .reset("transform")
        .transform((res) => {
          setLinks((prev) => prev.filter((link) => link.id !== res.data.id));
          return res;
        }),
    [getLinks, setLinks]
  );

  const createLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, body: BodyOf<LinkEndpoints["post"], "/">) => api.link.post("/", body, { signal }))
        .reset("transform", "config")
        .transform((res) => {
          setLinks((prev) => {
            if (Array.isArray(res.data)) return [...prev, ...res.data].sort(sort);
            return [...prev, res.data].sort(sort);
          });
          return res;
        }),
    [getLinks, setLinks]
  );

  const updateLink = useMemo(
    () =>
      getLinks
        .clone(({ signal }, updates: BodyOf<LinkEndpoints["put"], "/:id"> & { id: string }) => api.link.put(`/${updates.id}`, updates, { signal }))
        .reset("transform", "config")
        .transform((res) => {
          setLinks((prev) => prev.map((link) => (link.id === res.data.id ? res.data : link)));
          return res;
        }),
    [getLinks, setLinks]
  );

  const updateLinks = useMemo(
    () =>
      getLinks
        .clone(({ signal }, updates: BodyOf<LinkEndpoints["put"], "/">) => api.link.put<Link[]>("/", updates, { signal }))
        .reset("transform", "config")
        .transform((res) => {
          setLinks((prev) => prev.map((link) => res.data.find((t) => t.id === link.id) || link));
          return res;
        }),
    [getLinks, setLinks]
  );

  return { createLink, updateLink, deleteLink, getLinks, updateLinks };
}
