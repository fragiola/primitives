import {
    afterNextRender,
    computed,
    DestroyRef,
    effect,
    inject,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import { injectHost } from "./host-element.ts";
import {
    ROVING_SCOPE,
    type RovingScope,
    scopeOfElement,
} from "./roving-scope.ts";

export interface RovingItemBinding {
    /**
     * The scope it is an item of: the nearest one (or `explicit`), unless the host is outside that
     * scope's root (a popup a portal renders); `null` then.
     */
    scope: Signal<RovingScope | null>;
    /**
     * The roving `tabindex`: `"0"` on the scope's tab stop, `"-1"` on every other item; `null`
     * outside the scope.
     */
    tabIndex: Signal<string | null>;
}

/**
 * The host as an item of the nearest roving-focus scope (spec/toolbar.md, "Nested composites"), or
 * `null` with none around it, in an injection context: it registers once rendered (never on a
 * server, so every item has `tabindex="-1"` until the items are known), takes the roving
 * `tabindex` and tells the scope when it takes focus. A host outside the scope's root (rendered
 * through a portal) is in no scope ("Nested composites", 6). `explicit` names the scope instead
 * of the nearest one (a Menubar's, which its Triggers read from the bar's contract; `null`: none).
 */
export function injectRovingItem(
    focusable: () => boolean,
    explicit?: RovingScope | null,
): RovingItemBinding | null {
    const around =
        explicit === undefined
            ? inject(ROVING_SCOPE, { optional: true })
            : explicit;
    if (around === null) {
        return null;
    }
    const host = injectHost();
    const rendered = signal(false);
    afterNextRender(() => rendered.set(true));
    const scope = computed(() => {
        // the root is read even when the host is not rendered yet: a forwarding scope (a
        // ToggleGroup's) changes it with the scope its items are in
        around.root();
        return scopeOfElement(around, host, rendered());
    });
    // registered once rendered, again whenever the scope it is in changes (its root included)
    effect((onCleanup) => {
        const current = scope();
        around.root();
        if (!rendered() || current === null) {
            return;
        }
        onCleanup(untracked(() => current.register(host, focusable)));
    });
    const onFocus = () => scope()?.focused(host);
    host.addEventListener("focus", onFocus);
    inject(DestroyRef).onDestroy(() => {
        host.removeEventListener("focus", onFocus);
    });
    return {
        scope,
        tabIndex: computed(() => {
            const current = scope();
            if (current === null) {
                return null;
            }
            return current.tabStop() === host ? "0" : "-1";
        }),
    };
}
