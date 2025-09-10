import { useHeader } from "@/contexts";
import { useRef, useState, useEffect } from "react";

/**
 * Custom hook for managing navigation visibility based on scroll direction
 * Hides navigation when scrolling down and shows it when scrolling up
 * - Customized for Hoshify
 *
 * @returns Object containing headerRef and timeline status
 * @returns headerRef - Reference to attach to the navigation element
 * @returns timelineStatus - Current animation state (true when nav is hidden)
 */
export const useScrollingHeader = (scrollYTrigger: number = 20) => {
  const isScrollingRef = useRef(false);
  const lastScrollYRef = useRef(0);
  const [timelineStatus, setTimelineStatus] = useState(false);
  const { headerHeight, headerRef } = useHeader();

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollYRef.current + scrollYTrigger) {
        if (!isScrollingRef.current && headerRef.current) {
          isScrollingRef.current = true;
          headerRef.current.style.top = `${-headerHeight}px`;
        }
        lastScrollYRef.current = currentScrollY;
        setTimelineStatus(false);
      } else if (currentScrollY < lastScrollYRef.current - scrollYTrigger) {
        if (isScrollingRef.current && headerRef.current) {
          isScrollingRef.current = false;
          headerRef.current.style.top = "0px";
        }
        lastScrollYRef.current = currentScrollY;
        setTimelineStatus(true);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [headerHeight, headerRef, scrollYTrigger]);

  return timelineStatus;
};
