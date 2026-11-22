import { activationDirection } from "@fragiola/primitives/collection";
import { createHoverIntent } from "@fragiola/primitives/hover";
import type { Align, Side } from "@fragiola/primitives/positioning";
import {
    useCallback,
    useContext,
    useEffect,
    useLayoutEffect,
    useMemo,
    useReducer,
    useRef,
    useState,
} from "react";
import { useControllableState } from "../../hooks/use-controllable-state.ts";
import { usePresence } from "../../hooks/use-presence.ts";
import type {
    ChangeDetails,
    ChangeReason,
} from "../../utils/change-details.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuContentContext,
    NavigationMenuContext,
    type NavigationMenuContextValue,
    type NavigationMenuOrientation,
    type OpenedBy,
} from "./navigation-menu-context.ts";

export interface NavigationMenuRootState {
    open: boolean;
    orientation: NavigationMenuOrientation;
    nested: boolean;
}

export interface NavigationMenuRootProps
    extends PartProps<NavigationMenuRootState> {
    /** The open item's value, controlled (`null`: closed). */
    value?: string | null;
    defaultValue?: string | null;
    onValueChange?: (value: string | null, details: ChangeDetails) => void;
    /** ms before a hover opens (default `50`). */
    delay?: number;
    /** ms before the pointer leaving closes (default `50`). */
    closeDelay?: number;
    orientation?: NavigationMenuOrientation;
    /** The arrow keys wrap at the ends (default `true`). */
    loopFocus?: boolean;
}

/**
 * A site's navigation (spec/navigation-menu.md): the APG disclosure navigation menu, with Base UI's
 * hover, shared popup and nested levels. A `nav`; inside a Content, a nested level (`div`).
 */
export function NavigationMenuRoot({
    value: valueProp,
    defaultValue = null,
    onValueChange,
    delay = 50,
    closeDelay = 50,
    orientation = "horizontal",
    loopFocus = true,
    ...props
}: NavigationMenuRootProps) {
    const nested = useContext(NavigationMenuContentContext);
    const [value, setOwnValue] = useControllableState<
        string | null,
        ChangeDetails
    >(valueProp, defaultValue, onValueChange);
    const [lastValue, setLastValue] = useState<string | null>(value);
    if (value !== null && value !== lastValue) {
        setLastValue(value);
    }
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const triggers = useRef(new Map<string, HTMLElement>()).current;
    const [registryVersion, bumpRegistry] = useReducer(
        (count: number) => count + 1,
        0,
    );
    const registerTrigger = useCallback(
        (item: string, element: HTMLElement) => {
            triggers.set(item, element);
            bumpRegistry();
            return () => {
                if (triggers.get(item) === element) {
                    triggers.delete(item);
                    bumpRegistry();
                }
            };
        },
        [triggers],
    );
    const [direction, setDirection] =
        useState<NavigationMenuContextValue["activationDirection"]>("none");
    const openedBy = useRef<{ by: OpenedBy; at: number }>({
        by: "press",
        at: 0,
    });
    const lastReason = useRef<ChangeReason | null>(null);
    const pendingHover = useRef<string | null>(null);
    const pendingFocus = useRef<string | null>(null);
    // the value the last setValue asked for: a controlled value that changed without one is a
    // programmatic change
    const requested = useRef<string | null | undefined>(undefined);
    const previousValue = useRef(value);
    useLayoutEffect(() => {
        if (previousValue.current !== value && requested.current !== value) {
            pendingFocus.current = null;
            if (value !== null) {
                openedBy.current = { by: "press", at: performance.now() };
            }
        }
        previousValue.current = value;
        requested.current = undefined;
    }, [value]);
    const latest = useRef({ value, orientation });
    latest.current = { value, orientation };

    const setValue = useCallback(
        (
            next: string | null,
            reason: ChangeReason,
            event?: Event,
            by?: OpenedBy,
        ) => {
            const previous = latest.current.value;
            if (previous === next) {
                return;
            }
            if (next !== null) {
                // a programmatic opening (no `by`) is a deliberate one, as a press
                openedBy.current = { by: by ?? "press", at: performance.now() };
            }
            // the open key's pending focus belongs to its own change only
            if (reason !== "list-navigation") {
                pendingFocus.current = null;
            }
            requested.current = next;
            // the direction from the Trigger open before (none from closed)
            setDirection(
                previous !== null && next !== null
                    ? activationDirection(
                          triggers.get(previous),
                          triggers.get(next),
                          latest.current.orientation,
                      )
                    : "none",
            );
            lastReason.current = reason;
            latest.current = { ...latest.current, value: next };
            setOwnValue(next, { reason, event });
        },
        [setOwnValue, triggers],
    );

    const hover = useMemo(
        () =>
            createHoverIntent({
                open: () => {
                    const item = pendingHover.current;
                    if (item !== null) {
                        setValue(item, "trigger-hover", undefined, "hover");
                    }
                },
                close: () => setValue(null, "trigger-hover"),
            }),
        [setValue],
    );
    useEffect(() => () => hover.cancel(), [hover]);

    const [positioner, setPositioner] = useState<HTMLElement | null>(null);
    const [popup, setPopup] = useState<HTMLElement | null>(null);
    const [viewport, setViewport] = useState<HTMLElement | null>(null);
    const [arrow, setArrow] = useState<HTMLElement | null>(null);
    const [placed, setPlaced] = useState<{ side: Side; align: Align }>({
        side: "bottom",
        align: "center",
    });
    const [size, setSizeState] = useState<{
        width: number;
        height: number;
    } | null>(null);
    const setSize = useCallback(
        (next: { width: number; height: number }) =>
            setSizeState((previous) =>
                previous?.width === next.width &&
                previous.height === next.height
                    ? previous
                    : next,
            ),
        [],
    );
    const open = value !== null;
    const presence = usePresence(open, () => popup);
    const shown = value ?? lastValue;
    // biome-ignore lint/correctness/useExhaustiveDependencies: the registry is read through its version
    const activeTrigger = useMemo(
        () => (shown === null ? null : (triggers.get(shown) ?? null)),
        [shown, triggers, registryVersion],
    );

    const getValue = useCallback(() => latest.current.value, []);
    const context: NavigationMenuContextValue = useMemo(
        () => ({
            value,
            getValue,
            lastValue,
            setValue,
            openedBy,
            lastReason,
            orientation,
            loopFocus,
            delay,
            closeDelay,
            hover,
            pendingHover,
            pendingFocus,
            nested,
            root,
            setRoot,
            triggers,
            registerTrigger,
            activeTrigger,
            activationDirection: direction,
            positioner,
            setPositioner,
            popup,
            setPopup,
            viewport,
            setViewport,
            arrow,
            setArrow,
            placed,
            setPlaced,
            size,
            setSize,
            presence: { mounted: presence.mounted, status: presence.status },
        }),
        [
            value,
            getValue,
            lastValue,
            setValue,
            orientation,
            loopFocus,
            delay,
            closeDelay,
            hover,
            nested,
            root,
            triggers,
            registerTrigger,
            activeTrigger,
            direction,
            positioner,
            popup,
            viewport,
            arrow,
            placed,
            size,
            setSize,
            presence.mounted,
            presence.status,
        ],
    );
    const state = { open, orientation, nested };
    return (
        <NavigationMenuContext.Provider value={context}>
            {renderElement(
                nested ? "div" : "nav",
                props,
                state,
                {
                    "data-primitives-part": "navigation-menu-root",
                    ...stateAttributes({ orientation }),
                },
                setRoot,
            )}
        </NavigationMenuContext.Provider>
    );
}
