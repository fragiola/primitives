import {
    inDocumentOrder,
    type RovingOrientation,
    rovingKeys,
    rovingKeyTarget,
    rovingTabStop,
    textFieldKeepsKey,
} from "@fragiola/primitives/collection";
import { getDirection } from "@fragiola/primitives/direction";
import {
    type KeyboardEvent,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from "react";
import { DirectionContext } from "../direction/direction-context.ts";
import type { RovingScope } from "../utils/roving-context.ts";

interface RovingItem {
    element: HTMLElement;
    focusable: boolean;
}

export interface RovingCompositeOptions {
    orientation: RovingOrientation;
    loopFocus: boolean;
    disabled: boolean;
    /** The scope's root element (only an element inside it is one of its items). */
    root: HTMLElement | null;
}

/**
 * The root of a roving-focus scope (spec/toolbar.md, "Focus" and "Nested composites"): its
 * registered items, the one holding the tab stop (the one that last had focus while it can take
 * focus, else the first that can), and the key handler its element takes: the orientation's
 * arrows (mirrored in RTL), Home and End move the focus through the items in document order,
 * unless a handler before it prevented the key, or a text field keeps it.
 */
export function useRovingComposite({
    orientation,
    loopFocus,
    disabled,
    root,
}: RovingCompositeOptions): {
    scope: RovingScope;
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
} {
    const direction = useContext(DirectionContext);
    const [items, setItems] = useState<readonly RovingItem[]>([]);
    const [active, setActive] = useState<HTMLElement | null>(null);
    const ordered = useMemo(
        () => inDocumentOrder(items, (item) => item.element),
        [items],
    );
    const index = rovingTabStop(
        ordered.length,
        ordered.findIndex((item) => item.element === active),
        (candidate) => !ordered[candidate]?.focusable,
    );
    const tabStop = ordered[index]?.element ?? null;

    const register = useCallback((element: HTMLElement, focusable: boolean) => {
        const item = { element, focusable };
        setItems((current) => [...current, item]);
        return () =>
            setItems((current) => current.filter((entry) => entry !== item));
    }, []);
    const focused = useCallback((element: HTMLElement) => {
        setActive(element);
    }, []);

    const latest = useRef({ ordered, orientation, loopFocus, direction });
    latest.current = { ordered, orientation, loopFocus, direction };
    const onKeyDown = useCallback((event: KeyboardEvent<HTMLElement>) => {
        if (
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
        ) {
            return;
        }
        const current = latest.current;
        const from = current.ordered.findIndex(
            (item) => item.element === event.target,
        );
        if (from === -1) {
            // not one of its items (a menu's popup rendered from an item): not its key
            return;
        }
        const rtl =
            getDirection(event.currentTarget, current.direction) === "rtl";
        if (
            textFieldKeepsKey(
                event.target as Element,
                event.key,
                rovingKeys(current.orientation, rtl),
            )
        ) {
            return;
        }
        const target = rovingKeyTarget(
            event.key,
            from,
            current.ordered.length,
            {
                orientation: current.orientation,
                rtl,
                loop: current.loopFocus,
                skip: (candidate) => !current.ordered[candidate]?.focusable,
            },
        );
        const element =
            target === null ? undefined : current.ordered[target]?.element;
        if (element === undefined) {
            return;
        }
        event.preventDefault();
        element.focus();
        // the toolbar's keys select a text field's whole text (Base UI)
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            (element as HTMLInputElement).select();
        }
    }, []);

    const scope = useMemo(
        () => ({ orientation, disabled, root, tabStop, register, focused }),
        [orientation, disabled, root, tabStop, register, focused],
    );
    return { scope, onKeyDown };
}
