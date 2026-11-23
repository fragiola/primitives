import {
    inDocumentOrder,
    type RovingOrientation,
    rovingKeys,
    rovingKeyTarget,
    rovingTabStop,
    textFieldKeepsKey,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import { computed, shallowRef } from "vue";
import { useProvidedDirection } from "../direction/direction-context.ts";
import type { RovingScope } from "../utils/roving-context.ts";
import { elementSetter } from "./use-overlay-root.ts";

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
 * The root of a roving-focus scope (spec/toolbar.md, "Focus" and "Nested composites"): its
 * registered items, the one holding the tab stop (the one that last had focus while it can take
 * focus, else the first that can), and the key listener its element takes: the orientation's
 * arrows (mirrored in RTL), Home and End move the focus through the items in document order,
 * unless a listener before it prevented the key, or a text field keeps it.
 */
export function useRovingComposite({
    orientation,
    loopFocus,
    disabled,
}: RovingCompositeOptions): {
    scope: RovingScope;
    onKeydown: (event: KeyboardEvent) => void;
    /** The template ref of the scope's root element (only an element inside it is an item). */
    ref: (value: unknown) => void;
} {
    const direction = useProvidedDirection();
    const items = shallowRef<readonly RovingItem[]>([]);
    const active = shallowRef<HTMLElement | null>(null);
    const root = shallowRef<HTMLElement | null>(null);
    const ordered = computed(() =>
        inDocumentOrder(items.value, (item) => item.element),
    );
    const tabStop = computed(() => {
        const list = ordered.value;
        const index = rovingTabStop(
            list.length,
            list.findIndex((item) => item.element === active.value),
            (candidate) => !list[candidate]?.focusable(),
        );
        return list[index]?.element ?? null;
    });

    const register = (element: HTMLElement, focusable: () => boolean) => {
        const item = { element, focusable };
        items.value = [...items.value, item];
        return () => {
            items.value = items.value.filter((entry) => entry !== item);
        };
    };
    const focused = (element: HTMLElement) => {
        active.value = element;
    };

    const onKeydown = (event: KeyboardEvent) => {
        if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
        ) {
            return;
        }
        const list = ordered.value;
        const from = list.findIndex((item) => item.element === event.target);
        if (from === -1) {
            // not one of its items (a menu's popup rendered from an item): not its key
            return;
        }
        const rtl =
            getDirection(event.currentTarget as HTMLElement, direction()) ===
            "rtl";
        if (
            textFieldKeepsKey(
                event.target as Element,
                event.key,
                rovingKeys(orientation(), rtl),
            )
        ) {
            return;
        }
        const target = rovingKeyTarget(event.key, from, list.length, {
            orientation: orientation(),
            rtl,
            loop: loopFocus(),
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
    };

    return {
        scope: {
            orientation,
            disabled,
            root: () => root.value,
            tabStop: () => tabStop.value,
            register,
            focused,
        },
        onKeydown,
        ref: elementSetter(root),
    };
}
