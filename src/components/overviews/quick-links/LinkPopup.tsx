import { FormLayout } from "@/components/form-layout/FormLayout";
import { Popup as PopupWrapper } from "@/components/popup/Popup";
import useForm from "@/hooks/useForm";
import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { type Popup } from "./QuickLinks";
import { pick } from "@/utils/manipulate/object";
import { useLink } from "@/contexts";

type LinkPopupProps = {
  popup: Popup;
  setPopup: React.Dispatch<React.SetStateAction<Popup>>;
};

export function LinkPopup({ popup, setPopup }: LinkPopupProps) {
  const { createLink, links, updateLink, loading } = useLink();
  const formSchema = useMemo(() => ({ link: "", title: "" }), []);
  const formGroup = useForm(formSchema, { link: true, title: { max: 100 } });

  const isAdd = popup === "add";
  const editId = !isAdd && popup.slice(5);
  const currentLink = !isAdd && links.find((link) => link.id === popup.slice(5));
  const {
    form: [form, setForm],
    error: [_, setFormError],
    validate: { compareOld },
  } = formGroup;
  const oldLink = !isAdd && links.find((link) => link.id === editId);

  useEffect(() => {
    if (!isAdd) {
      setForm(currentLink ? pick(currentLink, ["link", "title"]) : formSchema);
    }
  }, [currentLink, formSchema, isAdd, setForm]);

  const handlePopup = (action: Popup) => {
    setForm(formSchema);
    setFormError(formSchema);
    setPopup(action);
  };

  const handleUpdate = () => {
    if (!currentLink) return;
    if (!oldLink || !compareOld(pick(oldLink, ["link", "title"]))) return;
    return updateLink.exec({ ...currentLink, ...form });
  };

  return (
    <PopupWrapper blur bodyScroll>
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 100 }}
        exit={{ y: -50, opacity: 0 }}
        transition={{ type: "keyframes", duration: 0.1 }}
        className="min-w-96 lg:min-w-2xl bg-popover rounded-2xl border px-6 py-7 space-y-4"
      >
        <div className="border-b border-muted-foreground pb-1 font-heading font-medium">
          <h1>{isAdd ? "Add" : "Edit"} shortcut</h1>
        </div>
        <FormLayout
          form={formGroup}
          onFormSubmit={async () => (editId ? await handleUpdate() : await createLink.exec(form)) && handlePopup("closed")}
        >
          <FormLayout.input size="sm" classLabel="bg-popover" label="Title" placeholder="Shortcut title" fieldId="title" />
          <FormLayout.input size="sm" classLabel="bg-popover" label="URL" placeholder="Link URL" fieldId="link" />
          <FormLayout.direction position={"right"}>
            <FormLayout.cancel onClick={() => handlePopup("closed")} disabled={loading}>
              Cancel
            </FormLayout.cancel>
            <FormLayout.submit disabled={loading}>{isAdd ? "Add" : "Save"}</FormLayout.submit>
          </FormLayout.direction>
        </FormLayout>
      </motion.div>
    </PopupWrapper>
  );
}
