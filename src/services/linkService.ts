import api from "@/class/server/ApiClient";
import { Request } from "@/class/server/Request";
import { useError, useUser } from "@/contexts";
import { handleFormError } from "./handleError";
import type { FormGroup } from "@/hooks/useForm";
import type { Popup } from "@/pages/dashboard/quick links/QuickLinks";

export const useDeleteLink = ({ setOptionIndex }: { setOptionIndex: React.Dispatch<React.SetStateAction<number | null>> }) => {
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

export const useUpdateLink = ({
  setLoading,
  formGroup,
  handlePopup,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  formGroup: FormGroup<{
    link: string;
    title: string;
  }>;
  handlePopup: (action: Popup) => void;
}) => {
  const { setError } = useError();
  const { setUser } = useUser();

  return () => {
    const {
      form: [form],
      error: [_, setFormError],
    } = formGroup;

    return new Request(({ signal }) => api.link.post("/", form, { signal }))
      .loading(setLoading)
      .retry(3)
      .onError((err) => {
        handleFormError(err, setFormError, setError);
      })
      .onSuccess((res) => {
        setUser((prev) => ({ ...prev, links: [...prev.links, res.data] }));
        handlePopup("closed");
      })
      .exec();
  };
};

export const useCreateLink = ({
  setLoading,
  formGroup,
  handlePopup,
  editId,
}: {
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  formGroup: FormGroup<{
    link: string;
    title: string;
  }>;
  handlePopup: (action: Popup) => void;
  editId: string | false;
}) => {
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

    const updateLink = new Request(({ signal }) => api.link.put(`/${editId}`, form, { signal }))
      .loading(setLoading)
      .retry(3)
      .onError((err) => {
        handleFormError(err, setFormError, setError);
      });

    return updateLink
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
