import {
    type VirtualAnchor,
    virtualAnchor,
} from "@fragiola/primitives/positioning";
import { defineComponent, provide, shallowRef } from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    overlayRootEmits,
    overlayRootProps,
} from "../../composables/use-overlay-root.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { useMenuRoot } from "../menu/use-menu-root.ts";
import { ContextMenuKey } from "./context-menu-context.ts";

/**
 * Holds the state of a context menu's root level (`v-model:open`); renders no element
 * (spec/context-menu.md). Its parts are Menu's, named `context-menu-*`; its Trigger is an area. A
 * template ref on it exposes the actions, `close()` and `unmount()`.
 */
export interface ContextMenuRootProps extends OverlayRootProps {
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`; spec/menu.md, "Modal").
     */
    modal?: boolean;
    /** The area opens nothing, and the browser's own menu shows (default `false`). */
    disabled?: boolean;
}

export type ContextMenuRootEmits = OverlayRootEmits;

/** An element focus may return to: still in the document, and not disabled. */
function focusable(element: HTMLElement | null): HTMLElement | null {
    return element?.isConnected === true && !element.matches(":disabled")
        ? element
        : null;
}

export const ContextMenuRoot: PublicComponent<
    ContextMenuRootProps,
    ContentSlots,
    ContextMenuRootEmits
> = publicComponent(
    defineComponent({
        name: "ContextMenuRoot",
        props: {
            ...overlayRootProps,
            /** Arrow keys wrap at the ends (default `true`). */
            loopFocus: { type: Boolean, default: true },
            /** Locks the scroll and blocks the outside pointer while open (default `false`). */
            modal: { type: Boolean, default: false },
            /** The area opens nothing (default `false`). */
            disabled: { type: Boolean, default: false },
        },
        emits: overlayRootEmits,
        setup(props, { emit, slots, expose }) {
            const anchor = shallowRef<Element | VirtualAnchor | null>(null);
            // the element that had focus when the menu opened: focus returns to it
            let opener: HTMLElement | null = null;
            const menu = useMenuRoot(props, emit, false, {
                component: "context-menu",
                anchor,
                returnTarget: () => focusable(opener),
            });
            provide(ContextMenuKey, {
                disabled: () => props.disabled,
                openAt(at, reason, event, area, highlight) {
                    const doc = area.ownerDocument;
                    const active = doc.activeElement;
                    // focus left in the menu itself (a press while open) keeps the opener it had
                    if (!menu.positioner.value?.contains(active)) {
                        opener =
                            active instanceof HTMLElement && active !== doc.body
                                ? active
                                : null;
                    }
                    anchor.value =
                        at instanceof Element ? at : virtualAnchor(at, area);
                    menu.pendingHighlight.current = highlight;
                    if (!menu.setOpen(true, reason, event, area)) {
                        menu.pendingHighlight.current = null;
                    }
                },
            });
            expose(menu.actions);
            return () => slots.default?.();
        },
    }),
);
