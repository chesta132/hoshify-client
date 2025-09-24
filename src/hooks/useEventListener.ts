import type React from "react";
import { useEffect } from "react";

/**
 * Hook that triggers a callback when a click occurs outside of a given element or elements.
 *
 * @param ref - A single React ref object or an array of React ref objects. The hook will monitor clicks outside of these element(s).
 * @param callback - Function to run when a click is detected outside of the given element(s).
 *
 * @example
 * // Single element
 * const ref = useRef<HTMLDivElement>(null);
 * useClickOutside(ref, () => setOpen(false));
 *
 * @example
 * // Multiple elements
 * const ref1 = useRef<HTMLDivElement>(null);
 * const ref2 = useRef<HTMLHeaderElement>(null)
 * useClickOutside([ref1, ref2], () => setOpen(false));
 */
export function useClickOutside<T extends Element>(ref: React.RefObject<T | null>, callback: (e: MouseEvent) => void): void;
export function useClickOutside<T extends Element>(ref: React.RefObject<T | null>[], callback: (e: MouseEvent) => void): void;
export function useClickOutside<T extends Element>(ref: React.RefObject<T | null> | React.RefObject<T | null>[], callback: (e: MouseEvent) => void) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      if (Array.isArray(ref)) {
        if (ref.some((r) => !r.current)) return;
        if (ref.every((r) => r.current && !r.current.contains(target))) {
          callback(e);
        }
      } else {
        if (!ref.current) return;
        if (!ref.current.contains(target)) {
          callback(e);
        }
      }
    };

    document.body.addEventListener("click", handleClickOutside);
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [callback, ref]);
}

/**
 * Hook that runs a callback when a given element enters the viewport.
 *
 * @param ref - A React ref object pointing to the target element to be observed.
 * @param callback - Function to run when the element is visible in the viewport. Can be synchronous or asynchronous.
 * @param options - Optional IntersectionObserver configuration (e.g., root, rootMargin, threshold).
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * useInView(ref, () => {
 *   console.log("Element is visible!");
 * });
 *
 * @example
 * // With async callback
 * const ref = useRef<HTMLDivElement>(null);
 * useInView(ref, async () => {
 *   await fetchData();
 *   console.log("Data loaded when element became visible");
 * });
 */
export const useInView = (ref: React.RefObject<Element | null>, callback: () => void | Promise<void>, options?: IntersectionObserverInit) => {
  useEffect(() => {
    const element = ref.current;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (entry.isIntersecting) {
          await callback();
        }
      },
      { root: null, rootMargin: "20px", threshold: 0.1, ...options }
    );
    if (element) {
      observer.observe(element);
    }
    return () => observer.disconnect();
  }, [callback, options, ref]);
};
