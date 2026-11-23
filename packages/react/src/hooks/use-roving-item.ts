import { useContext, useLayoutEffect } from "react";
import {
    RovingContext,
    type RovingScope,
    scopeOfElement,
} from "../utils/roving-context.ts";
import { useElement } from "./use-element.ts";

export interface RovingItem {
    /**
     * The scope it is an item of: the nearest one (or `explicit`), unless its element is outside
     * that scope's root (a popup rendered through a portal); `null` outside any.
     */
    scope: RovingScope | null;
    /** The roving `tabIndex`; `undefined` outside any scope. */
    tabIndex: number | undefined;
    /**
     * The item's element, attached whenever a scope is around it (also while it is outside the
     * scope's root, so the item keeps knowing where it is); `undefined` with no scope around it.
     */
    ref: ((node: HTMLElement | null) => void) | undefined;
    onFocus: () => void;
}

/**
 * An item of the nearest roving-focus scope (spec/toolbar.md, "Nested composites"): it registers
 * its element, takes the roving `tabIndex` (`0` on the scope's tab stop, `-1` on every other item
 * and before the items are known) and tells the scope when it takes focus. An element outside the
 * scope's root (rendered through a portal) is in no scope ("Nested composites", 6). `focusable`
 * reads the scope's `disabled`; `explicit` names the scope instead of the nearest one (a
 * Menubar's, which its Triggers read from the bar's contract; `null`: none).
 */
export function useRovingItem(
    focusable: (scopeDisabled: boolean) => boolean,
    explicit?: RovingScope | null,
): RovingItem {
    const nearest = useContext(RovingContext);
    const [element, ref] = useElement<HTMLElement>();
    const around = explicit === undefined ? nearest : explicit;
    const scope = scopeOfElement(around, element);
    const register = scope?.register;
    const canFocus = scope === null ? false : focusable(scope.disabled);
    useLayoutEffect(
        () =>
            register === undefined || element === null
                ? undefined
                : register(element, canFocus),
        [register, element, canFocus],
    );
    if (scope === null) {
        return {
            scope,
            tabIndex: undefined,
            ref: around === null ? undefined : ref,
            onFocus: () => {},
        };
    }
    return {
        scope,
        tabIndex: element !== null && scope.tabStop === element ? 0 : -1,
        ref,
        onFocus: () => {
            if (element !== null) {
                scope.focused(element);
            }
        },
    };
}
