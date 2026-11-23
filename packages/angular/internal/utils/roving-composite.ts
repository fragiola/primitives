import { computed, signal } from "@angular/core";
import {
    inDocumentOrder,
    type RovingOrientation,
    rovingKeys,
    rovingKeyTarget,
    rovingTabStop,
    textFieldKeepsKey,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { injectFlush } from "./flush.ts";
import { injectHost } from "./host-element.ts";
import { injectProvidedDirection } from "./provided-direction.ts";
import type { RovingScope } from "./roving-scope.ts";

interface RovingItem {
    element: HTMLElement;
    focusable: () => boolean;
}

export interface RovingCompositeOptions {
    orientation: () => RovingOrientation;
    loopFocus: () => boolean;
    disabled: () => boolean;
}

/**
 * The root of a roving-focus scope on the host element, in an injection context (spec/toolbar.md,
 * "Focus" and "Nested composites"): its registered items, the one holding the tab stop (the one
 * that last had focus while it can take focus, else the first that can), and the key handler the
 * host binds: the orientation's arrows (mirrored in RTL), Home and End move the focus through the
 * items in document order, unless a handler before it prevented the key, a modifier is held, or
 * a text field keeps it. The focus it moves is rendered within the key's event, so a quick next
 * key reaches the new tab stop (AGENTS.md, "Porting", 8).
 */
export function injectRovingComposite(
    options: RovingCompositeOptions,
): RovingScope {
    const host = injectHost();
    const direction = injectProvidedDirection();
    const flush = injectFlush();
    const items = signal<readonly RovingItem[]>([]);
    const active = signal<HTMLElement | null>(null);
    const ordered = computed(() =>
        inDocumentOrder(items(), (item) => item.element),
    );
    const tabStop = computed(() => {
        const list = ordered();
        const index = rovingTabStop(
            list.length,
            list.findIndex((item) => item.element === active()),
            (candidate) => !list[candidate]?.focusable(),
        );
        return list[index]?.element ?? null;
    });

    const keydown = (event: KeyboardEvent) => {
        if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
        ) {
            return;
        }
        const list = ordered();
        const from = list.findIndex((item) => item.element === event.target);
        if (from === -1) {
            // not one of its items (a menu's popup rendered from an item): not its key
            return;
        }
        const orientation = options.orientation();
        const rtl = getDirection(host, direction()) === "rtl";
        if (
            textFieldKeepsKey(
                event.target as Element,
                event.key,
                rovingKeys(orientation, rtl),
            )
        ) {
            return;
        }
        const target = rovingKeyTarget(event.key, from, list.length, {
            orientation,
            rtl,
            loop: options.loopFocus(),
            skip: (candidate) => !list[candidate]?.focusable(),
        });
        const element = target === null ? undefined : list[target]?.element;
        if (element === undefined) {
            return;
        }
        event.preventDefault();
        element.focus();
        // the toolbar's keys select a text field's whole text (Base UI)
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            (element as HTMLInputElement).select();
        }
        flush();
    };

    return {
        orientation: computed(options.orientation),
        root: computed(() => host),
        disabled: computed(options.disabled),
        tabStop,
        register: (element, focusable) => {
            const item = { element, focusable };
            items.update((current) => [...current, item]);
            return () =>
                items.update((current) =>
                    current.filter((entry) => entry !== item),
                );
        },
        focused: (element) => active.set(element),
        keydown,
    };
}
