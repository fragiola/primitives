import type { ScrollAreaPart } from "@fragiola/primitives/scroll-area";
import { useCallback, useLayoutEffect, useRef } from "react";

/**
 * A stable ref for a part's element, registered with the Root's controller after each commit in
 * which it changed: a ref callback that a merged ref calls with `null` then the element on every
 * render would end a running drag.
 */
export function useScrollAreaPart(
    part: ScrollAreaPart | null,
    setPart: (part: ScrollAreaPart, element: HTMLElement | null) => void,
) {
    const element = useRef<HTMLElement | null>(null);
    const registered = useRef<{
        part: ScrollAreaPart;
        element: HTMLElement;
    } | null>(null);
    const ref = useCallback((node: HTMLElement | null) => {
        element.current = node;
    }, []);
    useLayoutEffect(() => {
        const current = registered.current;
        const next = element.current;
        if (current?.part === part && current.element === next) {
            return;
        }
        if (current !== null) {
            setPart(current.part, null);
        }
        registered.current =
            part !== null && next !== null ? { part, element: next } : null;
        if (part !== null && next !== null) {
            setPart(part, next);
        }
    });
    useLayoutEffect(
        () => () => {
            const current = registered.current;
            registered.current = null;
            if (current !== null) {
                setPart(current.part, null);
            }
        },
        [setPart],
    );
    return ref;
}
