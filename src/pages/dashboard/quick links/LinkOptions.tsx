import { useClickOutside } from "@/hooks/useEventListener";
import { cn } from "@/lib/utils";
import { capital, ellipsis, newLiner } from "@/utils/manipulate/string";
import { Earth, EllipsisVertical, Mail, Phone } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import type { Popup } from "./QuickLinks";
import type { Link as ModelLink } from "@/types/models";
import { useLink } from "@/contexts";
import { createPortal } from "react-dom";

type LinkOptionsProps = {
  setPopup: React.Dispatch<React.SetStateAction<Popup>>;
  link: ModelLink;
  isDrag: boolean;
  optionIndex: number | null;
  setOptionIndex: React.Dispatch<React.SetStateAction<number | null>>;
  index: number;
  wrapperRef: React.RefObject<HTMLDivElement | null>;
};

export const LinkOptions = ({ setPopup, link: linkProp, isDrag, optionIndex, setOptionIndex, index, wrapperRef }: LinkOptionsProps) => {
  const { id, link, title } = linkProp;
  const optionOpen = optionIndex === index;
  const linkRef = useRef<HTMLDivElement>(null);
  const infoButtonRef = useRef<HTMLButtonElement>(null);
  const infoButtonRect = infoButtonRef.current?.getBoundingClientRect();
  const [linkIcon, setLinkIcon] = useState<null | React.ReactNode>(null);
  const { deleteLink } = useLink();

  useClickOutside(linkRef, () => optionOpen === true && setOptionIndex(null));

  const handlePopup = (action: Popup) => () => {
    (document.activeElement as HTMLElement)?.blur();
    setPopup(action);
    setOptionIndex(null);
  };

  const iconClassName = "w-10 p-2 bg-card-foreground/20 rounded-md";

  useEffect(() => {
    try {
      const u = new URL(link);
      if (u.protocol === "mailto:") setLinkIcon(<Mail size={40} className={iconClassName} />);
      if (u.protocol === "tel:") setLinkIcon(<Phone size={40} className={iconClassName} />);
      if (u.protocol === "localhost:" || u.hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname))
        setLinkIcon(<Earth size={40} className={iconClassName} />);
    } catch {
      setLinkIcon(<Earth size={40} className={iconClassName} />);
    }
  }, [link]);

  const handleLinkClick = (e?: React.MouseEvent<HTMLDivElement>) => {
    e?.preventDefault();
    if (isDrag) return;
    window.open(link, "_blank", "noopener,noreferrer");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLinkClick();
    }
  };

  return (
    <div
      ref={linkRef}
      role="link"
      tabIndex={0}
      aria-label={`Open ${title} in new tab`}
      className={cn(
        "group flex flex-col justify-between items-center gap-1 text-xs text-center px-2 py-3 min-w-25 hover:bg-muted rounded-md relative cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30",
        optionOpen && "bg-muted"
      )}
      onClick={(e) => {
        if (e.target === linkRef.current) handleLinkClick(e);
      }}
      onKeyDown={(e) => {
        if (e.target === linkRef.current) handleKeyDown(e);
      }}
    >
      {React.isValidElement(linkIcon) ? (
        linkIcon
      ) : (
        <img
          src={`https://www.google.com/s2/favicons?domain=${link}&sz=24`}
          alt={`${capital(title)} favicon`}
          className="w-10 p-2 bg-card-foreground/20 rounded-md pointer-events-none"
          draggable={false}
        />
      )}
      <span className="pointer-events-none select-none">{ellipsis(newLiner(title, { fontSize: 16, px: 80 }), { px: 145, fontSize: 16 })}</span>
      <button
        ref={infoButtonRef}
        type="button"
        className={cn(
          "absolute top-0 right-0 cursor-pointer group-hover:opacity-100 group-focus:opacity-100 focus:opacity-100 opacity-0 transition mt-1 py-1 px-1 mx-1 hover:bg-muted-foreground/20 rounded-full z-10 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
          optionOpen && "bg-muted-foreground/20 opacity-100"
        )}
        aria-label={`Option button for ${title}`}
        aria-expanded={optionOpen}
        aria-haspopup="menu"
        onClick={(e) => {
          e.stopPropagation();
          setOptionIndex(optionOpen ? null : index);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOptionIndex(optionOpen ? null : index);
          }
        }}
      >
        <EllipsisVertical size={15} />
      </button>
      {optionOpen &&
        createPortal(
          <ul
            role="menu"
            className="absolute py-2 bg-card text-start z-20 rounded-md border shadow-lg text-xs"
            style={infoButtonRect && { top: infoButtonRect.top + infoButtonRect.height / 2, left: infoButtonRect.left + infoButtonRect.width / 2 }}
            aria-label={`Options for ${title}`}
          >
            <li role="none">
              <button
                role="menuitem"
                className="w-full pl-4 pr-7 py-2 text-start hover:bg-card-foreground/20 focus:outline-none focus:bg-card-foreground/20"
                onClick={handlePopup(`edit/${id}`)}
                aria-label={`Edit ${title} link`}
              >
                Edit shortcut
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                className="w-full pl-4 py-2 text-start hover:bg-card-foreground/20 focus:outline-none focus:bg-card-foreground/20"
                onClick={() => deleteLink(id)}
                aria-label={`Delete ${title} link`}
              >
                Remove
              </button>
            </li>
          </ul>,
          wrapperRef.current!
        )}
    </div>
  );
};
