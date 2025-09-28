import { Button } from "@/components/form/button";
import { FormLayout } from "@/components/form/FormLayout";
import { Popup as PopupWrapper } from "@/components/ui/Popup";
import useForm from "@/hooks/useForm";
import { motion } from "motion/react";
import { useEffect, useMemo } from "react";
import { type Popup } from "./QuickLinks";
import { pick } from "@/utils/manipulate/object";
import { useLink, useUser } from "@/contexts";

export function LinkPopup({ popup, setPopup }: { popup: Popup; setPopup: React.Dispatch<React.SetStateAction<Popup>> }) {
  const { user } = useUser();
  const { createLink, links, updateLink, loading } = useLink();
  const formSchema = useMemo(() => ({ link: "", title: "" }), []);
  const formGroup = useForm(formSchema, { link: true, title: { max: 100 } });

  const inputField = { elementType: "input", size: "sm", classLabel: "bg-popover" } as const;
  const isAdd = popup === "add";
  const editId = !isAdd && popup.slice(5);
  const currentLink = !isAdd && links.find((link) => link.id === popup.slice(5));
  const {
    form: [form, setForm],
    error: [_, setFormError],
    validate: { compareOld },
  } = formGroup;

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
    const oldLink = user.links.find((link) => link.id === currentLink.id);
    if (!oldLink || compareOld(oldLink)) return;
    return updateLink.exec({ ...currentLink, ...form });
  };

  return (
    <PopupWrapper blur>
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
          items={[
            {
              ...inputField,
              label: "Title",
              placeholder: "Shortcut title",
              fieldId: "title",
            },
            { ...inputField, label: "URL", placeholder: "Link URL", fieldId: "link" },
          ]}
          form={formGroup}
          submitButton={null}
          onFormSubmit={async () => (editId ? await handleUpdate() : await createLink.exec(form)) && handlePopup("closed")}
        >
          <div className="flex gap-2 justify-end">
            <Button
              variant={"outline"}
              className="hover:bg-red-500 dark:hover:bg-red-500 hover:text-white"
              onClick={() => handlePopup("closed")}
              type="button"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button variant={"outline"} disabled={loading}>
              {isAdd ? "Add" : "Save"}
            </Button>
          </div>
        </FormLayout>
      </motion.div>
    </PopupWrapper>
  );
}
