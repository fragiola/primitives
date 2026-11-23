import { useContext, useLayoutEffect } from "react";
import { RovingContext, type RovingScope } from "../utils/roving-context.ts";
import { useElement } from "./use-element.ts";

/**
 * An item of the nearest roving-focus scope (spec/toolbar.md, "Nested composites"), or `null`
 * outside any: it registers its element, takes the roving `tabIndex` (`0` on the scope's tab
 * stop, `-1` on every other item and before the items are known) and tells the scope when it
 * takes focus. `explicit` names the scope instead of the nearest one (a Menubar's, which its
 * Triggers read from the bar's contract; `null`: none).
 */
export function useRovingItem(
    focusable: boolean,
    explicit?: RovingScope | null,
): {
    scope: RovingScope;
    tabIndex: number;
    ref: (node: HTMLElement | null) => void;
    onFocus: () => void;
} | null {
    const nearest = useContext(RovingContext);
    const scope = explicit === undefined ? nearest : explicit;
    const [element, ref] = useElement<HTMLElement>();
    const register = scope?.register;
    useLayoutEffect(
        () =>
            register === undefined || element === null
                ? undefined
                : register(element, focusable),
        [register, element, focusable],
    );
    if (scope === null) {
        return null;
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
