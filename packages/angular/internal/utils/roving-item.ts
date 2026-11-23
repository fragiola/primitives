import {
    afterNextRender,
    computed,
    DestroyRef,
    inject,
    type Signal,
} from "@angular/core";
import { injectHost } from "./host-element.ts";
import { ROVING_SCOPE, type RovingScope } from "./roving-scope.ts";

export interface RovingItemBinding {
    scope: RovingScope;
    /** The roving `tabindex`: `"0"` on the scope's tab stop, `"-1"` on every other item. */
    tabIndex: Signal<string>;
}

/**
 * The host as an item of the nearest roving-focus scope (spec/toolbar.md, "Nested composites"), or
 * `null` outside any, in an injection context: it registers once rendered (never on a server, so
 * every item has `tabindex="-1"` until the items are known), takes the roving `tabindex` and tells
 * the scope when it takes focus.
 */
export function injectRovingItem(
    focusable: () => boolean,
): RovingItemBinding | null {
    const scope = inject(ROVING_SCOPE, { optional: true });
    if (scope === null) {
        return null;
    }
    const host = injectHost();
    let unregister: (() => void) | null = null;
    afterNextRender(() => {
        unregister = scope.register(host, focusable);
    });
    const onFocus = () => scope.focused(host);
    host.addEventListener("focus", onFocus);
    inject(DestroyRef).onDestroy(() => {
        unregister?.();
        host.removeEventListener("focus", onFocus);
    });
    return {
        scope,
        tabIndex: computed(() => (scope.tabStop() === host ? "0" : "-1")),
    };
}
