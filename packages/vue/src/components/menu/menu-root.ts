import { createTypeahead } from "@fragiola/primitives/collection";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    defineComponent,
    inject,
    type PropType,
    provide,
    ref,
    watch,
} from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    overlayRootEmits,
    overlayRootProps,
    overlayTriggerRootProps,
    useOverlayRoot,
} from "../../composables/use-overlay-root.ts";
import { useAttachHandle } from "../../composables/use-overlay-trigger.ts";
import {
    type ContentSlots,
    type OverlayRootSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { type MenuContext, MenuKey } from "./menu-context.ts";
import type { MenuHandle } from "./menu-handle.ts";

/**
 * A nested menu level's props (`v-model:open`). A template ref on a level's Root exposes its
 * actions, `close()` and `unmount()`.
 */
export interface MenuSubmenuRootProps extends OverlayRootProps {
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
}

export interface MenuRootProps
    extends MenuSubmenuRootProps,
        OverlayTriggerRootProps {
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`: the APG menu button is non-modal; spec/menu.md, "Modal").
     */
    modal?: boolean;
    /** Connects Triggers rendered outside the Root (spec/menu.md, "Detached triggers"). */
    handle?: MenuHandle;
}

export type MenuRootEmits = OverlayRootEmits;

export const submenuProps = {
    ...overlayRootProps,
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus: { type: Boolean, default: true },
};

export const menuProps = {
    ...submenuProps,
    ...overlayTriggerRootProps,
    handle: { type: Object as PropType<MenuHandle>, default: undefined },
    /** Locks the scroll and blocks the outside pointer while open (default `false`). */
    modal: { type: Boolean, default: false },
};

function useMenuRoot(
    props: OverlayRootProps &
        OverlayTriggerRootProps & {
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

/** Holds the state of one menu level (`v-model:open`); renders no element (spec/menu.md). */
export const MenuRoot: PublicComponent<
    MenuRootProps,
    OverlayRootSlots,
    MenuRootEmits
> = publicComponent(
    defineComponent({
        name: "MenuRoot",
        props: menuProps,
        emits: overlayRootEmits,
        setup(props, { emit, slots, expose }) {
            const context = useMenuRoot(props, emit, false);
            useAttachHandle(() => props.handle, context);
            expose(context.actions);
            return () => slots.default?.({ payload: context.payload.value });
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
        setup(props, { emit, slots, expose }) {
            const context = useMenuRoot(props, emit, true);
            expose(context.actions);
            return () => slots.default?.();
        },
    }),
);
