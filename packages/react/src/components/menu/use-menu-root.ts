import { createTypeahead } from "@fragiola/primitives/collection";
import type {
    Align,
    Side,
    VirtualAnchor,
} from "@fragiola/primitives/positioning";
import {
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
import {
    type MenuComponent,
    MenuContext,
    type MenuContextValue,
    type SafeArea,
} from "./menu-context.ts";

/** What a root menu level gets from the component it belongs to (a Menu or a ContextMenu). */
export interface MenuRootOptions {
    /** The part attributes' prefix (default: the parent level's, else `menu`). */
    component?: MenuComponent;
    /** What the positioner anchors to instead of the trigger (a context menu's point). */
    anchor?: Element | VirtualAnchor | null;
    /** Where focus returns, and where Tab moves on from (default: the trigger). */
    returnTarget?: () => HTMLElement | null;
}

/** The state of one menu level, a root or a submenu (spec/menu.md). */
export function useMenuRoot(
    {
        loopFocus = true,
        modal: modalProp = false,
        ...props
    }: OverlayRootProps &
        OverlayTriggerRootProps & { loopFocus?: boolean; modal?: boolean },
    nested: boolean,
    options: MenuRootOptions = {},
): MenuContextValue {
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
    const component = options.component ?? owner?.component ?? "menu";
    const anchor = options.anchor ?? null;
    const returnTarget = useRef(options.returnTarget);
    returnTarget.current = options.returnTarget;
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
            component,
            anchor,
            returnTarget: () =>
                returnTarget.current ? returnTarget.current() : root.trigger,
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
        [
            root,
            component,
            anchor,
            owner,
            loopFocus,
            modal,
            typeahead,
            labels,
            placed,
            closeAll,
        ],
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
