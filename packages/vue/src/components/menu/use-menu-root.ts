import { createTypeahead } from "@fragiola/primitives/collection";
import type {
    Align,
    Side,
    VirtualAnchor,
} from "@fragiola/primitives/positioning";
import { inject, provide, ref, type ShallowRef, shallowRef, watch } from "vue";
import {
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import {
    type MenuComponent,
    type MenuContext,
    MenuKey,
} from "./menu-context.ts";

/** What a root menu level gets from the component it belongs to (a Menu or a ContextMenu). */
export interface MenuRootOptions {
    /** The part attributes' prefix (default: the parent level's, else `menu`). */
    component?: MenuComponent;
    /** What the positioner anchors to instead of the trigger (a context menu's point). */
    anchor?: Readonly<ShallowRef<Element | VirtualAnchor | null>>;
    /** Where focus returns, and where Tab moves on from (default: the trigger). */
    returnTarget?: () => HTMLElement | null;
}

/** The state of one menu level, a root or a submenu (spec/menu.md); provides it to its parts. */
export function useMenuRoot(
    props: OverlayRootProps &
        OverlayTriggerRootProps & {
            loopFocus: boolean;
            modal?: boolean;
        },
    emit: Parameters<typeof useOverlayRoot>[1],
    nested: boolean,
    options: MenuRootOptions = {},
): MenuContext {
    const parent = nested ? inject(MenuKey, null) : null;
    const root = useOverlayRoot(props, emit);
    const returnTarget = options.returnTarget;
    const context: MenuContext = {
        ...root,
        component: options.component ?? parent?.component ?? "menu",
        anchor: options.anchor ?? shallowRef(null),
        returnTarget: returnTarget ?? (() => root.trigger.value),
        parent,
        loopFocus: () => props.loopFocus,
        // a submenu follows its root menu
        modal: () => (parent ? parent.modal() : (props.modal ?? false)),
        pendingHighlight: { current: null },
        typeahead: createTypeahead(),
        labels: new Map(),
        placed: ref<{ side: Side; align: Align }>(
            nested
                ? { side: "inline-end", align: "start" }
                : { side: "bottom", align: "start" },
        ),
        closeAll(reason, event) {
            root.setOpen(false, reason, event);
            parent?.closeAll(reason, event);
        },
        openSubmenu: { current: null },
        safeArea: { current: null },
    };
    // a parent level knows its open submenu, so a hovered sibling can close it
    if (parent) {
        watch(
            root.open,
            (open) => {
                if (open) {
                    parent.openSubmenu.current = context;
                } else if (parent.openSubmenu.current === context) {
                    parent.openSubmenu.current = null;
                }
            },
            { immediate: true },
        );
    }
    provide(MenuKey, context);
    return context;
}
