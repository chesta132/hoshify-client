import Color from "color";

export const getForeground = (base: string) => {
  const color = Color(base);
  const foreground = color.isLight() ? color.mix(Color("black"), 0.2).hex() : color.mix(Color("white"), 0.15).hex();
  return foreground;
};
