export type CharOptions = {
  fontSize: number;
  fontFamily?: "Manrope" | "Inter" | (string & {});
  text: string;
};

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d")!;

export const getMaxChar = (width: number, { fontSize, fontFamily = "Manrope", text }: CharOptions) => {
  ctx.font = `${fontSize}px ${fontFamily}, sans-serif`;

  let low = 0;
  let high = text.length - 1;
  let result = 0;

  while (low <= high) {
    const mid = (low + high) >> 1;
    const measured = ctx.measureText(text.slice(0, mid + 1)).width;

    if (measured <= width) {
      result = mid + 1;
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return result;
};
