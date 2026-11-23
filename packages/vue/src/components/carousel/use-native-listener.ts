import { type ShallowRef, watch } from "vue";

/**
 * A native listener on a part's element, added once it is rendered: Vue's event invoker skips
 * events under a fixed test clock (Playwright's `page.clock`), which the rotation's checks run
 * under (docs/handoff.md §7; Toast's Close, Clipboard's Trigger).
 */
export function useNativeListener<K extends keyof HTMLElementEventMap>(
    element: ShallowRef<HTMLElement | null>,
    type: K,
    listener: (event: HTMLElementEventMap[K]) => void,
): void {
    watch(
        element,
        (target, _, onCleanup) => {
            if (target === null) {
                return;
            }
            target.addEventListener(type, listener);
            onCleanup(() => target.removeEventListener(type, listener));
        },
        { flush: "post", immediate: true },
    );
}
