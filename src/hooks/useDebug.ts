import { useRef } from "react";

type UseRenderCounterProps = {
  logger?: boolean | string;
  onRender?: (count: number) => void;
};

export const useRenderCounter = ({ logger, onRender }: UseRenderCounterProps = {}) => {
  const count = useRef(0);
  count.current += 1;
  if (logger) {
    console.log(typeof logger === "string" ? logger : "Render count:", count.current);
  }
  onRender?.(count.current);
  return count.current;
};
