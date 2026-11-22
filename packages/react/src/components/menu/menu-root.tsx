import { createTypeahead } from "@fragiola/primitives/collection";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    type ReactNode,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    type OverlayRootProps,
    type OverlayTriggerRootProps,
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import { useAttachHandle } from "../../hooks/use-overlay-trigger.ts";
import {
    MenuContext,
    type MenuContextValue,
    type SafeArea,
} from "./menu-context.ts";
import type { MenuHandle } from "./menu-handle.ts";

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

function useMenuRoot(
    {
        loopFocus = true,
        modal: modalProp = false,
        ...props
    }: Omit<MenuRootProps, "children" | "handle">,
    nested: boolean,
) {
    const parent = useContext(MenuContext);
    const root = useOverlayRoot(props);
    const pendingHighlight = useRef<"first" | "last" | null>(null);
    const typeahead = useMemo(() => createTypeahead(), []);
    const labels = useMemo(() => new Map<Element, string>(), []);
    const openSubmenu = useRef<MenuContextValue | null>(null);
    const safeArea = useRef<SafeArea | null>(null);
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>(
        nested
            ? { side: "inline-end", align: "start" }
            : { side: "bottom", align: "start" },
    );
    const owner = nested ? parent : null;
    // a submenu follows its root menu
    const modal = owner ? owner.modal : modalProp;
    const { setOpen } = root;
    const closeAll = useCallback(
        (
            reason: "item-press" | "focus-out" | "outside-press",
            event?: Event,
        ) => {
            setOpen(false, reason, event);
            owner?.closeAll(reason, event);
        },
        [setOpen, owner],
    );
    const value: MenuContextValue = useMemo(
        () => ({
            ...root,
            parent: owner,
            loopFocus,
            modal,
            pendingHighlight,
            typeahead,
            labels,
            placed,
            setPlaced,
            closeAll,
            openSubmenu,
            safeArea,
        }),
        [root, owner, loopFocus, modal, typeahead, labels, placed, closeAll],
    );
    // a parent level knows its open submenu, so a hovered sibling can close it
    useEffect(() => {
        if (owner === null || !value.open) {
            return undefined;
        }
        owner.openSubmenu.current = value;
        return () => {
            if (owner.openSubmenu.current === value) {
                owner.openSubmenu.current = null;
            }
        };
    }, [owner, value]);
    return value;
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
