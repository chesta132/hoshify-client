import api from "@/services/server/ApiClient";
import { Request } from "@/services/server/Request";
import { useLinkService, type LinkServices } from "@/services/models/linkService";
import type { Link } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";
import type { PaginationResult } from "@/services/server/ServerSuccess";

type LinkValues = {
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  pagination: PaginationResult;
} & LinkServices;

const defaultValues: LinkValues = {
  links: [],
  setLinks() {},
  loading: true,
  setLoading() {},
  createLink: new Request(() => api.link.get("/")),
  deleteLink: new Request(() => api.link.get("/")),
  updateLink: new Request(() => api.link.get("/")),
  getLinks: new Request(() => api.link.get("/")),
  updateLinks: new Request(() => api.link.get("/")),
  pagination: {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const LinkContext = createContext<LinkValues>(defaultValues);

export const LinkProvider = ({ children }: { children: React.ReactNode }) => {
  const { isInitiated, isSignIn } = useUser();
  const [links, setLinks] = useState<Link[]>([]);
  const [pagination, setPagination] = useState<PaginationResult>({});
  const [loading, setLoading] = useState(false);

  const { createLink, deleteLink, updateLink, getLinks, updateLinks } = useLinkService({ setLoading, setLinks, pagination });

  const sort = (a: Link, b: Link) => a.position - b.position;

  useEffect(() => {
    getLinks.onSuccess((res) => {
      setLinks((prev) => [...prev, ...res.data].sort(sort));
      setPagination(res.getPagination());
    });
  }, [getLinks]);

  useEffect(() => {
    if (isInitiated && isSignIn) {
      getLinks
        .clone()
        .onSuccess((res) => {
          setLinks(res.data.sort(sort));
          setPagination(res.getPagination());
        })
        .safeExec(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiated, isSignIn]);

  const value: LinkValues = {
    links,
    setLinks,
    loading,
    setLoading,
    createLink,
    deleteLink,
    updateLink,
    getLinks,
    pagination,
    updateLinks,
  };

  return <LinkContext.Provider value={value}>{children}</LinkContext.Provider>;
};
