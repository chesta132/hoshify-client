import { useUser } from "@/contexts";
import { useClickOutside } from "@/hooks/useEventListener";
import { cn } from "@/lib/utils";
import { capital, ellipsis, newLiner } from "@/utils/manipulate/string";
import { Earth, EllipsisVertical, Mail, Phone } from "lucide-react";
import React, { useRef, useState } from "react";
import { Link } from "react-router";
import type { Popup } from "./QuickLinks";
import { useLinkService } from "@/services/linkService";

export const LinkOptions = ({ setPopup }: { setPopup: React.Dispatch<React.SetStateAction<Popup>> }) => {
  const { user } = useUser();
  const [optionIndex, setOptionIndex] = useState<null | number>(null);
  const linkRefs = useRef<React.RefObject<HTMLAnchorElement | null>[]>([]);

  useClickOutside(linkRefs?.current[optionIndex || 0] || [], () => optionIndex !== null && setOptionIndex(null));

  const handlePopup = (action: Popup) => () => {
    (document.activeElement as HTMLElement)?.blur();
    setPopup(action);
  };

  const { deleteLink } = useLinkService({ handlePopup, setOptionIndex });

  const linkIcons = user.links.map(({ link }) => {
    const className = "w-10 p-2 bg-card-foreground/20 rounded-md";
    try {
      const u = new URL(link);
      if (u.protocol === "mailto:") return <Mail size={40} className={className} />;
      if (u.protocol === "tel:") return <Phone size={40} className={className} />;
      if (u.protocol === "localhost:" || u.hostname === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(u.hostname))
        return <Earth size={40} className={className} />;
    } catch {
      return <Earth size={40} className={className} />;
    }
  });

  return (
    <>
      {user.links.map(({ id, link, title }, idx) => (
        <Link
          to={link}
          key={id}
          target="_blank"
          className={cn(
            "group flex flex-col justify-between items-center gap-1 text-center px-2 py-3 min-w-25 hover:bg-muted rounded-md text-xs relative",
            optionIndex === idx && "bg-muted"
          )}
          ref={(el) => {
            linkRefs.current[idx] = { current: el };
          }}
        >
          {React.isValidElement(linkIcons[idx]) ? (
            linkIcons[idx]
          ) : (
            <img
              src={`https://www.google.com/s2/favicons?domain=${link}&sz=24`}
              alt={`${capital(title)} favicon`}
              sizes="24"
              className="w-10 p-2 bg-card-foreground/20 rounded-md"
            />
          )}
          <span>{ellipsis(newLiner(title, { fontSize: 16, px: 80 }), { px: 145, fontSize: 16 })}</span>
          <button
            className={cn(
              "absolute top-0 right-0 cursor-pointer group-hover:opacity-100 group-focus:opacity-100 focus:opacity-100 opacity-0 transition mt-1 py-1 px-1 mx-1 hover:bg-muted-foreground/20 rounded-full z-10",
              optionIndex === idx && "bg-muted-foreground/20 opacity-100"
            )}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (optionIndex !== idx) {
                setOptionIndex(idx);
              } else {
                setOptionIndex(null);
              }
            }}
          >
            <EllipsisVertical size={15} />
          </button>
          {optionIndex === idx && (
            <ul
              className="absolute top-4 right-2.5 py-2 bg-card w-full text-start z-20"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <li>
                <button className="w-full pl-4 py-2 text-start hover:bg-card-foreground/20 cursor-pointer" onClick={handlePopup(`edit/${id}`)}>
                  Edit shortcut
                </button>
              </li>
              <li>
                <button className="w-full pl-4 py-2 text-start hover:bg-card-foreground/20 cursor-pointer" onClick={() => deleteLink(id)}>
                  Remove
                </button>
              </li>
            </ul>
          )}
        </Link>
      ))}
    </>
  );
};
