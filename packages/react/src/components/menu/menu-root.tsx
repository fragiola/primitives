import type { ReactNode } from "react";
import type {
    OverlayRootProps,
    OverlayTriggerRootProps,
} from "../../hooks/use-overlay-root.ts";
import { useAttachHandle } from "../../hooks/use-overlay-trigger.ts";
import { MenuContext } from "./menu-context.ts";
import type { MenuHandle } from "./menu-handle.ts";
import { useMenuRoot } from "./use-menu-root.ts";

export interface MenuSubmenuRootProps extends OverlayRootProps {
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
    children?: ReactNode;
}

export interface MenuRootProps<Payload = unknown>
    extends Omit<MenuSubmenuRootProps, "children">,
        OverlayTriggerRootProps {
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`: the APG menu button is non-modal; spec/menu.md, "Modal").
     */
    modal?: boolean;
    /** Connects Triggers rendered outside the Root (spec/menu.md, "Detached triggers"). */
    handle?: MenuHandle<Payload>;
    /** The content, or a function of the active trigger's payload. */
    children?:
        | ReactNode
        | ((state: { payload: Payload | undefined }) => ReactNode);
}

/** Holds the state of one menu level; renders no element (spec/menu.md). */
export function MenuRoot<Payload = unknown>({
    children,
    handle,
    ...props
}: MenuRootProps<Payload>) {
    const value = useMenuRoot(props, false);
    useAttachHandle(handle, value);
    return (
        <MenuContext.Provider value={value}>
            {typeof children === "function"
                ? children({ payload: value.payload as Payload | undefined })
                : children}
        </MenuContext.Provider>
    );
}

/** A nested menu level; its trigger is a `SubmenuTrigger` item of the parent menu. */
export function MenuSubmenuRoot({ children, ...props }: MenuSubmenuRootProps) {
    const value = useMenuRoot(props, true);
    return (
        <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
    );
}
