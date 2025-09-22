import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useError, useUser } from "@/contexts";
import type { FormGroup } from "@/hooks/useForm";
import type { Popup } from "@/pages/dashboard/quick links/QuickLinks";
import type { ServerSuccess } from "@/class/server/ServerSuccess";
import type { Link } from "@/types/models";

type LinkServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  formGroup: FormGroup<{
    link: string;
    title: string;
  }>;
  handlePopup: (action: Popup) => void;
  editId: string | false;
  setOptionIndex: React.Dispatch<React.SetStateAction<number | null>>;
};

type DeleteLink = { deleteLink: (id: string) => Promise<ServerSuccess<Link>> };
type CreateLink = { createLink: () => Promise<ServerSuccess<Link>> };
type UpdateLinkk = { updateLink: () => void | Promise<ServerSuccess<Link>> };

export function useLinkService(depedences: Pick<LinkServiceProps, "handlePopup" | "setOptionIndex">): DeleteLink;
export function useLinkService(depedences: Pick<LinkServiceProps, "formGroup" | "handlePopup" | "editId" | "setLoading">): CreateLink & UpdateLinkk;
export function useLinkService(depedences: LinkServiceProps): CreateLink & UpdateLinkk & DeleteLink;

export function useLinkService({ editId, formGroup, handlePopup, setOptionIndex, setLoading }: Partial<LinkServiceProps>) {
  const { setUser, user } = useUser();
  const { setError } = useError();

  const {
    form: [form],
    validate: { compareOld },
  } = formGroup || { form: [], validate: {} };

  const getLinks = new Request(() => api.link.get("/")).retry(3);
  if (setLoading) getLinks.loading(setLoading);

  const deleteLink = (id: string) => {
    return getLinks
      .clone(({ signal }) => api.link.delete(`/${id}`, { signal }))
      .onSuccess(() => {
        setUser((prev) => ({ ...prev, links: prev.links.filter((link) => link.id !== id) }));
        setOptionIndex?.(null);
      })
      .setConfig({ handleError: { setError } })
      .exec();
  };

  const createLink = () =>
    getLinks
      .clone(({ signal }) => api.link.post("/", form, { signal }))
      .onSuccess((res) => {
        setUser((prev) => ({ ...prev, links: [...prev.links, res.data] }));
        handlePopup?.("closed");
      })
      .exec();

  const updateLink = () => {
    const link = user.links.find((link) => link.id === editId);
    if (!link) return handlePopup?.("closed");
    if (compareOld?.(link)) return;

    return getLinks
      .clone(({ signal }) => api.link.put(`/${editId}`, form, { signal }))
      .onSuccess((res) => {
        setUser((prev) => ({ ...prev, links: prev.links.map((link) => (link.id === res.data.id ? res.data : link)) }));
        handlePopup?.("closed");
      })
      .exec();
  };

  return { createLink, deleteLink, updateLink };
}
