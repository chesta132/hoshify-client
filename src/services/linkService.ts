import api from "@/class/server/ApiClient";
import { Request, type RequestFetcher } from "@/class/server/Request";
import { useError, useUser } from "@/contexts";
import { handleFormError } from "./handleError";
import type { FormGroup } from "@/hooks/useForm";
import type { Popup } from "@/pages/dashboard/quick links/QuickLinks";
import type { SetGlobalError } from "@/contexts/ErrorContext";

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

const createRequest = <T, A extends any[]>(
  fetcher: RequestFetcher<T, A>,
  {
    setLoading,
    setFormError,
    setError,
  }: Pick<LinkServiceProps, "setLoading"> & { setFormError: LinkServiceProps["formGroup"]["error"][1]; setError: SetGlobalError }
) => {
  return new Request(fetcher)
    .loading(setLoading)
    .retry(3)
    .onError((err) => {
      handleFormError(err, setFormError, setError);
    });
};

export const useDeleteLink = ({ setOptionIndex }: Pick<LinkServiceProps, "setOptionIndex">) => {
  const { setUser } = useUser();
  const { setError } = useError();

  return async (id: string) => {
    return await new Request(({ signal }) => api.link.delete(`/${id}`, { signal }))
      .retry(3)
      .onSuccess(() => {
        setUser((prev) => {
          const linkPosition = prev.links.findIndex((link) => link.id === id);
          const first = prev.links.slice(0, linkPosition);
          const last = prev.links.slice(linkPosition === -1 ? -1 : linkPosition + 1);
          return { ...prev, links: [...first, ...last] };
        });
        setOptionIndex(null);
      })
      .setConfig({ handleError: { setError } })
      .exec();
  };
};

export const useCreateLink = ({ setLoading, formGroup, handlePopup }: Pick<LinkServiceProps, "formGroup" | "setLoading" | "handlePopup">) => {
  const { setError } = useError();
  const { setUser } = useUser();

  return () => {
    const {
      form: [form],
      error: [_, setFormError],
    } = formGroup;

    return createRequest(({ signal }) => api.link.post("/", form, { signal }), { setError, setFormError, setLoading })
      .onSuccess((res) => {
        setUser((prev) => ({ ...prev, links: [...prev.links, res.data] }));
        handlePopup("closed");
      })
      .exec();
  };
};

export const useUpdateLink = ({
  setLoading,
  formGroup,
  handlePopup,
  editId,
}: Pick<LinkServiceProps, "editId" | "handlePopup" | "formGroup" | "setLoading">) => {
  const { setError } = useError();
  const { setUser, user } = useUser();

  return () => {
    const {
      form: [form],
      error: [_, setFormError],
      validate: { compareOld },
    } = formGroup;

    const link = user.links.find((link) => link.id === editId);
    if (!link) return handlePopup("closed");
    if (compareOld(link)) return;

    return createRequest(({ signal }) => api.link.put(`/${editId}`, form, { signal }), { setError, setFormError, setLoading })
      .onSuccess((res) => {
        setUser((prev) => {
          const linkPosition = prev.links.findIndex((link) => link.id === editId);
          const first = prev.links.slice(0, linkPosition);
          const last = prev.links.slice(linkPosition + 1);
          return { ...prev, links: [...first, res.data, ...last] };
        });
        handlePopup("closed");
      })
      .exec();
  };
};
