import { useCallback, useEffect, useRef } from "react";

/**
 * A custom hook to debounce a function.
 * This hook returns a debounced function that will be executed after a specified delay.
 * Subsequent calls to the returned function will reset the timer.
 * 
 * @template T - The type of the arguments for the callback function.
 * @param callback - The function to be debounced.
 * @param delay - The delay in milliseconds before the callback is executed.
 * @returns A debounced version of the callback function.
 */
export const useDebounce = <T extends any[]>(callback: (...args: T) => any, delay: number) => {
  const timerRef = useRef<number>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedFunc = useCallback(
    (...args: T) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  return debouncedFunc;
};

/**
 * A custom hook to execute a function after a specified delay when the component mounts or dependencies change.
 * This is useful for running a function with a delay without needing to manually trigger it.
 *
 * @param - The function to be executed.
 * @param - The delay in milliseconds before the callback is executed.
 */
export const useDebounceOnMount = (callback: () => any, delay: number) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      callback();
    }, delay);

    return () => clearTimeout(timer);
  }, [callback, delay]);
};
