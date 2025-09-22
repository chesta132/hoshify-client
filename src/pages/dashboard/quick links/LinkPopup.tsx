import { Button } from "@/components/form/button";
import { FormLayout } from "@/components/form/FormLayout";
import { Popup as PopupWrapper } from "@/components/ui/popup";
import { useUser } from "@/contexts";
import useForm from "@/hooks/useForm";
import { motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { type Popup } from "./QuickLinks";
import { useLinkService } from "@/services/linkService";

export function LinkPopup({ popup, setPopup }: { popup: Popup; setPopup: React.Dispatch<React.SetStateAction<Popup>> }) {
  const inputField = { elementType: "input", size: "sm", classLabel: "bg-popover" } as const;
  const isAdd = popup === "add";
  const editId = !isAdd && popup.slice(5);

  const formSchema = useMemo(() => ({ link: "", title: "" }), []);
  const formGroup = useForm(formSchema, { link: true, title: { max: 100 } });
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const {
    form: [form, setForm],
    error: [_, setFormError],
  } = formGroup;

  useEffect(() => {
    if (!isAdd) {
      setForm(user.links.find((link) => link.id === editId) || formSchema);
    }
  }, [editId, formSchema, isAdd, setForm, user.links]);

  const handlePopup = (action: Popup) => {
    setForm(formSchema);
    setFormError(formSchema);
    setPopup(action);
  };

  const { createLink, updateLink } = useLinkService(["create", "update"], { formGroup, setLoading });

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
          onFormSubmit={async () => (editId ? await updateLink(form) : await createLink(form)) && handlePopup("closed")}
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
