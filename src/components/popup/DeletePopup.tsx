import { Info } from "lucide-react";
import { Button } from "../form/Button";
import React from "react";
import { motion } from "motion/react";

type DeletePopupProps = {
  titleItem: string;
  item: string;
  onDelete?: () => any;
  onCancel?: () => any;
  permanent?: boolean;
  info?: React.ReactNode;
  animate?: boolean;
};

export const DeletePopup = ({ titleItem, onCancel, onDelete, permanent, info, item, animate }: DeletePopupProps) => {
  return (
    <motion.div
      initial={animate ? { y: -50, opacity: 0 } : {}}
      animate={animate ? { y: 0, opacity: 100 } : {}}
      exit={animate ? { y: -50, opacity: 0 } : {}}
      transition={animate ? { type: "keyframes", duration: 0.1 } : {}}
      className="fixed-center bg-card p-5 border border-border rounded-md text-start min-w-80 max-w-96 md:max-w-xl"
    >
      <h1 className="font-heading text-[17px] font-medium">Delete {titleItem}</h1>
      <div className="h-px bg-border w-full my-2" />
      <div className="text-sm flex flex-col gap-2 overflow-auto scroll-bar pb-3">
        <p>Are you sure you want to delete {item}?</p>
        {info && (React.isValidElement(info) ? info : <p>{info}</p>)}
        {permanent && (
          <p className="flex gap-1 items-center text-xs text-red-400">
            <Info size={13} /> This item will be permanently deleted.
          </p>
        )}
      </div>
      <div className="flex gap-2 justify-end mt-2">
        <Button variant={"outline"} onClick={onCancel}>
          Cancel
        </Button>
        <Button variant={"outline"} className="hover:bg-red-600 dark:hover:bg-red-600 hover:text-white" onClick={onDelete}>
          Delete
        </Button>
      </div>
    </motion.div>
  );
};
