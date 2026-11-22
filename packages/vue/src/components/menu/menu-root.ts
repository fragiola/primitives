import { defineComponent, type PropType } from "vue";
import {
    type OverlayRootEmits,
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    overlayRootEmits,
    overlayRootProps,
    overlayTriggerRootProps,
} from "../../composables/use-overlay-root.ts";
import { useAttachHandle } from "../../composables/use-overlay-trigger.ts";
import {
    type ContentSlots,
    type OverlayRootSlots,
    type PublicComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import type { MenuHandle } from "./menu-handle.ts";
import { useMenuRoot } from "./use-menu-root.ts";

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
