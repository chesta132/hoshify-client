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
export function useClickOutside<T extends Element>(ref: React.RefObject<T | null>, callback: (ref: React.RefObject<T>) => void): void;
export function useClickOutside<T extends Element>(ref: React.RefObject<T | null>[], callback: (ref: React.RefObject<T>[]) => void): void;
export function useClickOutside<T extends Element>(ref: React.RefObject<T | null> | React.RefObject<T | null>[], callback: (ref: any) => void) {
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target) return;

      if (Array.isArray(ref)) {
        if (ref.some((r) => !r.current)) return;
        if (ref.every((r) => r.current && !r.current.contains(target))) {
          callback(ref);
        }
      } else {
        if (!ref.current) return;
        if (!ref.current.contains(target)) {
          callback(ref);
        }
      }
    };

    document.body.addEventListener("click", handleClickOutside);
    return () => {
      document.body.removeEventListener("click", handleClickOutside);
    };
  }, [callback, ref]);
}
