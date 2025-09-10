import { useState, useEffect } from "react";
import { useDebounce } from "./useDebounce";

function useViewportWidth(delay = 500) {
  const [width, setWidth] = useState(window.innerWidth);
  const debounce = useDebounce(() => setWidth(window.innerWidth), delay);

  useEffect(() => {
    window.addEventListener("resize", debounce);

    return () => {
      window.removeEventListener("resize", debounce);
    };
  }, [debounce]);
  const isDesktop = width >= 1024;
  const isMobile = width <= 768;
  const isTablet = !isDesktop && !isMobile;

  return { width, isDesktop, isMobile, isTablet };
}

const useViewportHeight = (delay = 500) => {
  const [height, setHeight] = useState(window.innerHeight);
  const debounce = useDebounce(() => setHeight(window.innerHeight), delay);

  useEffect(() => {
    window.addEventListener("resize", debounce);

    return () => {
      window.removeEventListener("resize", debounce);
    };
  }, [debounce]);

  return height;
};

export { useViewportWidth, useViewportHeight };
