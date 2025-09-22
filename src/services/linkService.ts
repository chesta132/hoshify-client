import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useError, useUser } from "@/contexts";
import type { FormGroup } from "@/hooks/useForm";
import type { ServerSuccess } from "@/class/server/ServerSuccess";
import type { Link } from "@/types/models";
import type { UnionToInter } from "@/types";

type FormItems = {
  link: string;
  title: string;
};

type LinkServiceProps = {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  formGroup: FormGroup<FormItems>;
  setOptionOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

type DeleteLink = { deleteLink: (id: string) => Promise<ServerSuccess<Link>> };
type CreateLink = { createLink: (form: FormItems) => Promise<ServerSuccess<Link>> };
type UpdateLink = { updateLink: (update: FormItems) => void | Promise<ServerSuccess<Link>> };

type ServiceMap = {
  create: { dep: Pick<LinkServiceProps, "formGroup" | "setLoading">; ret: CreateLink };
  update: { dep: Pick<LinkServiceProps, "formGroup" | "setLoading">; ret: UpdateLink };
  delete: { dep: Pick<LinkServiceProps, "setOptionOpen">; ret: DeleteLink };
};

type Services = keyof ServiceMap;

type Depedencies<S extends Services> = [dep: UnionToInter<ServiceMap[S]["dep"]>];
type AvailableService<S extends Services> = ServiceMap[S]["ret"];

export function useLinkService<S extends Services>(service: S | S[], ...depedences: Depedencies<S>): UnionToInter<AvailableService<S>>;
export function useLinkService(service: Services | Services[], { formGroup, setOptionOpen, setLoading }: Partial<LinkServiceProps> = {}) {
  const { setUser, user } = useUser();
  const { setError } = useError();

  const {
    validate: { compareOld },
  } = formGroup || { validate: {} };

  const getLinks = new Request(() => api.link.get("/")).retry(3);
  if (setLoading) getLinks.loading(setLoading);

  const deleteLink = (id: string) => {
    return getLinks
      .clone(({ signal }) => api.link.delete(`/${id}`, { signal }))
      .onSuccess(() => {
        setUser((prev) => ({ ...prev, links: prev.links.filter((link) => link.id !== id) }));
        setOptionOpen?.(false);
      })
      .setConfig({ handleError: { setError } })
      .exec();
  };

  const createLink = (formItem: FormItems) =>
    getLinks
      .clone(({ signal }) => api.link.post("/", formItem, { signal }))
      .onSuccess((res) => {
        setUser((prev) => ({ ...prev, links: [...prev.links, res.data] }));
      })
      .exec();

  const updateLink = (update: Partial<Link>) => {
    const link = user.links.find((link) => link.id === update.id);
    if (!link || compareOld?.(link)) return;

    return getLinks
      .clone(({ signal }) => api.link.put(`/${update.id}`, update, { signal }))
      .onSuccess((res) => {
        setUser((prev) => ({ ...prev, links: prev.links.map((link) => (link.id === res.data.id ? res.data : link)) }));
      })
      .exec();
  };

  const services = {
    create: { createLink },
    update: { updateLink },
    delete: { deleteLink },
  };

  if (Array.isArray(service)) {
    return service.reduce((acc, key) => Object.assign(acc, services[key]), {});
  }

  return services[service];
}
