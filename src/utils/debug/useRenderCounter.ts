import { useRef } from "react";

export const useRenderCounter = () => {
  const count = useRef(0);
  count.current += 1;
  return count.current;
};
