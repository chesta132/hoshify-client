import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import type { ServerSuccess } from "@/class/server/ServerSuccess";
import { useError } from "@/contexts";
import type { Link } from "@/types/models";
import { omit } from "@/utils/manipulate/object";

type LinkServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setLinks: React.Dispatch<React.SetStateAction<Link[]>>;
};

export type LinkServices = {
  updateLink: (updates: Partial<Link>) => Promise<ServerSuccess<Link>> | void;
  createLink: (formItem: Partial<Link>) => Promise<ServerSuccess<Link>>;
  deleteLink: (id: string) => Promise<ServerSuccess<Link>>;
};

export function useLinkService({ setLoading, setLinks }: LinkServiceProps) {
  const { setError } = useError();

  const getLinks = new Request(() => api.link.get("/")).retry(3).loading(setLoading);

  const deleteLink = (id: string) => {
    return getLinks
      .clone(({ signal }) => api.link.delete(`/${id}`, { signal }))
      .onSuccess(() => {
        setLinks((prev) => prev.filter((link) => link.id !== id));
      })
      .setConfig({ handleError: { setError } })
      .exec();
  };

  const createLink = (formItem: Partial<Link>) => {
    return getLinks
      .clone(({ signal }) => api.link.post("/", formItem, { signal }))
      .onSuccess((res) => {
        setLinks((prev) => [...prev, res.data]);
      })
      .exec();
  };

  const updateLink = (updates: Partial<Link>) => {
    return getLinks
      .clone(({ signal }) => api.link.put(`/${updates.id}`, omit(updates, ["createdAt", "id", "updatedAt", "userId"]), { signal }))
      .onSuccess((res) => {
        setLinks((prev) => prev.map((link) => (link.id === res.data.id ? res.data : link)));
      })
      .exec();
  };

  return { createLink, updateLink, deleteLink };
}
