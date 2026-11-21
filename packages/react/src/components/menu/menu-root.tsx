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
    useOverlayRoot,
} from "../../hooks/use-overlay-root.ts";
import {
    MenuContext,
    type MenuContextValue,
    type SafeArea,
} from "./menu-context.ts";

export interface MenuSubmenuRootProps extends OverlayRootProps {
    /** Arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
    children?: ReactNode;
}

export interface MenuRootProps extends MenuSubmenuRootProps {
    /**
     * Locks the page's scroll and blocks the pointer outside the menu while it is open (default
     * `false`: the APG menu button is non-modal; spec/menu.md, "Modal").
     */
    modal?: boolean;
}

function useMenuRoot(
    {
        loopFocus = true,
        modal: modalProp = false,
        ...props
    }: Omit<MenuRootProps, "children">,
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
        (reason: "item-press" | "focus-out" | "outside-press") => {
            setOpen(false, reason);
            owner?.closeAll(reason);
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
export function MenuRoot({ children, ...props }: MenuRootProps) {
    const value = useMenuRoot(props, false);
    return (
        <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
    );
}

/** A nested menu level; its trigger is a `SubmenuTrigger` item of the parent menu. */
export function MenuSubmenuRoot({ children, ...props }: MenuSubmenuRootProps) {
    const value = useMenuRoot(props, true);
    return (
        <MenuContext.Provider value={value}>{children}</MenuContext.Provider>
    );
}
