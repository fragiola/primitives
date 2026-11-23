import { inject, shallowRef, watch } from "vue";
import { RovingKey, type RovingScope } from "../utils/roving-context.ts";
import { elementSetter } from "./use-overlay-root.ts";

/**
 * An item of the nearest roving-focus scope (spec/toolbar.md, "Nested composites"), or `null`
 * outside any: it registers its element, takes the roving `tabindex` (`0` on the scope's tab
 * stop, `-1` on every other item and before the items are known, on a server) and tells the
 * scope when it takes focus.
 */
export function useRovingItem(focusable: () => boolean): {
    scope: RovingScope;
    tabIndex: () => number;
    ref: (value: unknown) => void;
    onFocus: () => void;
} | null {
    const scope = inject(RovingKey, null);
    if (scope === null) {
        return null;
    }
    const element = shallowRef<HTMLElement | null>(null);
    watch(
        element,
        (node, _, onCleanup) => {
            if (node !== null) {
                onCleanup(scope.register(node, focusable));
            }
        },
        { immediate: true },
    );
    return {
        scope,
        tabIndex: () =>
            element.value !== null && scope.tabStop() === element.value
                ? 0
                : -1,
        ref: elementSetter(element),
        onFocus: () => {
            if (element.value !== null) {
                scope.focused(element.value);
            }
        },
    };
}
