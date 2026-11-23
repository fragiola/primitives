import type { ScrollAreaPart } from "@fragiola/primitives/scroll-area";
import { onBeforeUnmount } from "vue";

/**
 * A stable template ref for a part's element, registered with the Root's controller only when the
 * element or the part changes: Vue calls a stable function ref with the same element on each
 * patch, which registers nothing (a `null` then the element would end a running drag).
 */
export function useScrollAreaPart(
    part: () => ScrollAreaPart | null,
    setPart: (part: ScrollAreaPart, element: HTMLElement | null) => void,
) {
    let registered: { part: ScrollAreaPart; element: HTMLElement } | null =
        null;
    const sync = (element: HTMLElement | null) => {
        const name = part();
        if (registered?.part === name && registered.element === element) {
            return;
        }
        if (registered !== null) {
            setPart(registered.part, null);
        }
        registered =
            name !== null && element !== null ? { part: name, element } : null;
        if (registered !== null) {
            setPart(registered.part, registered.element);
        }
    };
    onBeforeUnmount(() => sync(null));
    return (value: unknown) => {
        const element =
            value instanceof HTMLElement
                ? value
                : ((value as { $el?: HTMLElement } | null)?.$el ?? null);
        sync(element);
    };
}
