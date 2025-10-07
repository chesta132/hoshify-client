export type OneFieldOnly<T extends Record<string, unknown>> = {
  [K in keyof T]: {
    [P in K]: T[P];
  } & {
    [P in Exclude<keyof T, K>]?: never;
  };
}[keyof T];

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type MergeUnion<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
