import { type ShallowRef, watch } from "vue";

/**
 * A native listener on a part's element while it is mounted: Vue's event invoker skips events
 * whose timestamp is older than the handler under a fixed test clock (AGENTS.md, "Gotchas").
 */
export function useNativeListener<K extends keyof HTMLElementEventMap>(
    element: ShallowRef<HTMLElement | null>,
    type: K,
    listener: (event: HTMLElementEventMap[K], element: HTMLElement) => void,
): void {
    watch(
        element,
        (target, _, onCleanup) => {
            if (target === null) {
                return;
            }
            const handle = (event: HTMLElementEventMap[K]) =>
                listener(event, target);
            target.addEventListener(type, handle);
            onCleanup(() => target.removeEventListener(type, handle));
        },
        { flush: "post" },
    );
}
