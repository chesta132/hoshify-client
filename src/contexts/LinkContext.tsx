import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useLinkService, type LinkServices } from "@/services/linkService";
import type { Link } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";
import type { PaginationResult } from "@/class/server/ServerSuccess";

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
  pagination: {},
};

// eslint-disable-next-line react-refresh/only-export-components
export const LinkContext = createContext<LinkValues>(defaultValues);

export const LinkProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser, isInitiated } = useUser();
  const [links, setLinks] = useState<Link[]>(user.links.sort((a, b) => a.position - b.position));
  const [pagination, setPagination] = useState<PaginationResult>({});
  const [loading, setLoading] = useState(false);

  const { createLink, deleteLink, updateLink, getLinks } = useLinkService({ setLoading, setLinks, pagination });

  useEffect(() => {
    getLinks.onSuccess((res) => {
      setLinks((prev) => [...prev, ...res.data].sort((a, b) => a.position - b.position));
      setPagination(res.getPagination());
    });
  }, [getLinks]);

  useEffect(() => {
    if (isInitiated) {
      let updates = user.links.sort((a, b) => a.position - b.position);
      getLinks
        .clone()
        .onSuccess((res) => {
          updates = [...updates, ...res.data].sort((a, b) => a.position - b.position);
          setPagination(res.getPagination());
        })
        .onFinally(() => {
          setLinks(updates);
        })
        .safeExec(updates.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInitiated]);

  useEffect(() => {
    setUser((prev) => ({ ...prev, links }));
  }, [links, setUser]);

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
  };

  return <LinkContext.Provider value={value}>{children}</LinkContext.Provider>;
};
