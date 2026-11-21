import { createTypeahead } from "@fragiola/primitives/collection";
import type { Align, Side } from "@fragiola/primitives/positioning";
import { defineComponent, inject, provide, ref, watch } from "vue";
import {
    overlayRootEmits,
    overlayRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import type { ChangeDetails } from "../../utils/change-details.ts";
import {
    type ContentSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { type MenuContext, MenuKey } from "./menu-context.ts";

/** A nested menu level's props (`v-model:open`). */
export interface MenuSubmenuRootProps {
    open?: boolean;
    defaultOpen?: boolean;
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
}

export interface MenuRootProps extends MenuSubmenuRootProps {
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`: the APG menu button is non-modal; spec/menu.md, "Modal").
     */
    modal?: boolean;
}

export type MenuRootEmits = {
    "update:open": (open: boolean) => true;
    openChange: (open: boolean, details: ChangeDetails) => true;
};

const submenuProps = {
    ...overlayRootProps,
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus: { type: Boolean, default: true },
};

const menuProps = {
    ...submenuProps,
    /** Locks the scroll and blocks the outside pointer while open (default `false`). */
    modal: { type: Boolean, default: false },
};

function useMenuRoot(
    props: {
        open?: boolean;
        defaultOpen?: boolean;
        loopFocus: boolean;
        modal?: boolean;
    },
    emit: Parameters<typeof useOverlayRoot>[1],
    nested: boolean,
) {
    const parent = nested ? inject(MenuKey, null) : null;
    const root = useOverlayRoot(props, emit);
    const context: MenuContext = {
        ...root,
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
        closeAll(reason) {
            root.setOpen(false, reason);
            parent?.closeAll(reason);
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

/** Holds the state of one menu level (`v-model:open`); renders no element (spec/menu.md). */
export const MenuRoot: PublicComponent<
    MenuRootProps,
    ContentSlots,
    MenuRootEmits
> = publicComponent(
    defineComponent({
        name: "MenuRoot",
        props: menuProps,
        emits: overlayRootEmits,
        setup(props, { emit, slots }) {
            useMenuRoot(props, emit, false);
            return () => slots.default?.();
        },
    }),
);

/** A nested menu level; its trigger is a `SubmenuTrigger` item of the parent menu. */
export const MenuSubmenuRoot: PublicComponent<
    MenuSubmenuRootProps,
    ContentSlots,
    MenuRootEmits
> = publicComponent(
    defineComponent({
        name: "MenuSubmenuRoot",
        props: submenuProps,
        emits: overlayRootEmits,
        setup(props, { emit, slots }) {
            useMenuRoot(props, emit, true);
            return () => slots.default?.();
        },
    }),
);
