import { inject, shallowRef, watch } from "vue";
import {
    RovingKey,
    type RovingScope,
    scopeOfElement,
} from "../utils/roving-context.ts";
import { elementSetter } from "./use-overlay-root.ts";

export interface RovingItem {
    /**
     * The scope it is an item of: the nearest one (or `explicit`), unless its element is outside
     * that scope's root (a popup a Teleport renders); `null` then.
     */
    scope: () => RovingScope | null;
    /** The roving `tabindex`; `undefined` outside the scope. */
    tabIndex: () => number | undefined;
    /** The item's element (also while it is outside the scope's root, so it keeps knowing where it is). */
    ref: (value: unknown) => void;
    onFocus: () => void;
}

/**
 * An item of the nearest roving-focus scope (spec/toolbar.md, "Nested composites"), or `null`
 * with none around it: it registers its element, takes the roving `tabindex` (`0` on the scope's
 * tab stop, `-1` on every other item and before the items are known, on a server) and tells the
 * scope when it takes focus. An element outside the scope's root (rendered through a Teleport) is
 * in no scope ("Nested composites", 6). `explicit` names the scope instead of the nearest one (a
 * Menubar's, which its Triggers read from the bar's contract; `null`: none).
 */
export function useRovingItem(
    focusable: () => boolean,
    explicit?: RovingScope | null,
): RovingItem | null {
    const nearest = inject(RovingKey, null);
    const around = explicit === undefined ? nearest : explicit;
    if (around === null) {
        return null;
    }
    const element = shallowRef<HTMLElement | null>(null);
    const scope = () => scopeOfElement(around, element.value);
    // the root is watched too: a forwarding scope (a ToggleGroup's) changes it with the scope its
    // items are in
    watch(
        [element, scope, () => around.root()],
        ([node, current], _, onCleanup) => {
            if (node !== null && current !== null) {
                onCleanup(current.register(node, focusable));
            }
        },
        { immediate: true },
    );
    return {
        scope,
        tabIndex: () => {
            const current = scope();
            if (current === null) {
                return undefined;
            }
            return element.value !== null && current.tabStop() === element.value
                ? 0
                : -1;
        },
        ref: elementSetter(element),
        onFocus: () => {
            const current = scope();
            if (element.value !== null && current !== null) {
                current.focused(element.value);
            }
        },
    };
}
