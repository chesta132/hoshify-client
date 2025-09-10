import React, { useLayoutEffect, useRef } from "react";

type StartEndProps = {
  start?: React.ReactNode;
  end?: React.ReactNode;
  setPadding: React.Dispatch<React.SetStateAction<React.CSSProperties>>;
};

export const StartEnd = ({ start, end, setPadding }: StartEndProps) => {
  const startRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const start = startRef.current?.offsetWidth;
    const end = endRef.current?.offsetWidth;
    if (start || end) {
      setPadding({ paddingLeft: start ? start + 20 : undefined, paddingRight: end ? end + 20 : undefined });
    }
  }, [start, end, setPadding]);

  return (
    <>
      {start && (
        <div ref={startRef} className={"absolute top-3.5 left-3"}>
          {start}
        </div>
      )}
      {end && (
        <div ref={endRef} className={"absolute top-3.5 right-3"}>
          {end}
        </div>
      )}
    </>
  );
};
