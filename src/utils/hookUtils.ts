export function createMergeState<S, Z extends Partial<S> = S>(
  setState: React.Dispatch<React.SetStateAction<S>>
): React.Dispatch<React.SetStateAction<Z | S>> {
  return (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? (updater as (prev: S) => S)(prev) : updater;

      if (prev && typeof prev === "object" && !Array.isArray(prev) && typeof next === "object" && !Array.isArray(next)) {
        return { ...prev, ...next } as S;
      }

      if (Array.isArray(prev) && Array.isArray(next)) {
        return [...prev, ...next] as S;
      }

      return next as S;
    });
  };
}
