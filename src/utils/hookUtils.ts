export function createMergeSetter<S, Z>(setState: React.Dispatch<React.SetStateAction<S>>): React.Dispatch<React.SetStateAction<Z>> {
  return (updater) => {
    setState((prev) => {
      const next = typeof updater === "function" ? (updater as (prev: S) => S)(prev) : updater;
      return { ...prev, ...next };
    });
  };
}
