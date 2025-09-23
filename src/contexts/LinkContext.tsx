import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useLinkService, type LinkServices } from "@/services/linkService";
import type { Link } from "@/types/models";
import { createContext, useEffect, useState } from "react";
import { useUser } from ".";

type LinkValues = {
  links: Link[];
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
} & LinkServices;

const defaultValues: LinkValues = {
  links: [],
  setLinks() {},
  loading: true,
  setLoading() {},
  createLink: new Request(() => api.link.get("/")).exec,
  deleteLink: new Request(() => api.link.get("/")).exec,
  updateLink: new Request(() => api.link.get("/")).exec,
};

// eslint-disable-next-line react-refresh/only-export-components
export const LinkContext = createContext<LinkValues>(defaultValues);

export const LinkProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, setUser, isInitiated } = useUser();
  const [links, setLinks] = useState<Link[]>(user.links.sort((a, b) => a.position - b.position));
  const [loading, setLoading] = useState(false);

  const { createLink, deleteLink, updateLink } = useLinkService({ setLoading, setLinks });

  useEffect(() => {
    setLinks(user.links.sort((a, b) => a.position - b.position));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setLinks, isInitiated]);

  useEffect(() => {
    setUser((prev) => ({ ...prev, links }));
  }, [links, setUser]);
  useEffect(() => console.log(loading), [loading]);

  const value: LinkValues = {
    links,
    setLinks,
    loading,
    setLoading,
    createLink,
    deleteLink,
    updateLink,
  };

  return <LinkContext.Provider value={value}>{children}</LinkContext.Provider>;
};
