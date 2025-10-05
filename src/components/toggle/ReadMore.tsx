import { getMaxChar } from "@/utils/manipulate/number";
import { ellipsis, type WidthOptions } from "@/utils/manipulate/string";
import clsx from "clsx";
import { useState } from "react";

type ReadMoreProps = {
  text: string;
  className?: string;
  classButton?: string;
  max: WidthOptions | number;
  as?: React.ElementType;
};

export const ReadMore = ({ text, className, classButton, max, as: Wrapper = "span" }: ReadMoreProps) => {
  const [readMore, setReadMore] = useState(false);

  if (typeof max !== "number") {
    max = getMaxChar(max.px, { text, fontSize: max.fontSize, fontFamily: max.fontFamily });
  }

  return (
    <Wrapper className={clsx(readMore && "overflow-auto", className)}>
      {max > 30 ? (
        <>
          {readMore ? text : ellipsis(text, max)}
          <br />
          <button
            className={clsx("text-foreground/50 cursor-pointer w-fit text-sm", classButton)}
            onClick={(e) => {
              e.stopPropagation();
              setReadMore((prev) => !prev);
            }}
          >
            {readMore ? "Read less" : "Read more"}
          </button>
        </>
      ) : (
        text
      )}
    </Wrapper>
  );
};
