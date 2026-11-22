import { getDirection } from "@fragiola/primitives/direction";
import { getTabbables } from "@fragiola/primitives/focus";
import {
    type KeyboardEvent,
    type MouseEvent,
    type PointerEvent,
    useContext,
    useLayoutEffect,
    useState,
} from "react";
import { DirectionContext } from "../../direction/direction-context.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    NavigationMenuContext,
    NavigationMenuItemContext,
} from "./navigation-menu-context.ts";

export interface NavigationMenuTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface NavigationMenuTriggerProps
    extends PartProps<NavigationMenuTriggerState> {
    disabled?: boolean;
}

/** A press within this many ms of a hover opening keeps it open (Base UI's patient click). */
const PATIENT_CLICK = 500;

/**
 * Discloses its item's Content (spec/navigation-menu.md): a hover after the delay, a press, Enter
 * or Space toggle it; the open key opens it with focus inside; Tab from it enters the Content.
 */
export function NavigationMenuTrigger({
    disabled = false,
    ...props
}: NavigationMenuTriggerProps) {
    const context = useRequiredContext(
        NavigationMenuContext,
        "NavigationMenu.Trigger",
    );
    const item = useRequiredContext(
        NavigationMenuItemContext,
        "NavigationMenu.Trigger",
    );
    const provided = useContext(DirectionContext);
    const [element, setElement] = useState<HTMLElement | null>(null);
    const { registerTrigger } = context;
    useLayoutEffect(
        () => (element ? registerTrigger(item.value, element) : undefined),
        [element, item.value, registerTrigger],
    );
    const open = context.value === item.value;
    const { setValue, hover, pendingHover } = context;

    const onPointerEnter = (event: PointerEvent<HTMLElement>) => {
        if (disabled || event.pointerType === "touch") {
            return;
        }
        if (context.value !== null) {
            // another Content is open: this one opens at once
            hover.cancel();
            if (!open) {
                setValue(item.value, "trigger-hover", event.nativeEvent);
            }
            return;
        }
        pendingHover.current = item.value;
        hover.enter(context.delay);
    };
    const onPointerLeave = (event: PointerEvent<HTMLElement>) => {
        if (event.pointerType === "touch") {
            return;
        }
        if (context.value === null && pendingHover.current === item.value) {
            pendingHover.current = null;
            hover.cancel();
        }
    };
    const onClick = (event: MouseEvent<HTMLElement>) => {
        if (disabled) {
            return;
        }
        hover.cancel();
        const opened = context.openedBy.current;
        if (open) {
            if (
                opened.by === "hover" &&
                performance.now() - opened.at < PATIENT_CLICK
            ) {
                // the user aimed for it: it stays open, and the pointer leaving keeps it
                opened.by = "press";
                return;
            }
            setValue(null, "trigger-press", event.nativeEvent);
            return;
        }
        setValue(item.value, "trigger-press", event.nativeEvent, "press");
    };
    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (disabled) {
            return;
        }
        const rtl = getDirection(event.currentTarget, provided) === "rtl";
        const openKey =
            context.orientation === "horizontal"
                ? "ArrowDown"
                : rtl
                  ? "ArrowLeft"
                  : "ArrowRight";
        if (event.key === openKey) {
            event.preventDefault();
            event.stopPropagation();
            hover.cancel();
            const content = item.content;
            if (open && content) {
                getTabbables(content)[0]?.focus();
                return;
            }
            context.pendingFocus.current = item.value;
            setValue(item.value, "list-navigation", event.nativeEvent, "press");
            return;
        }
        if (event.key === "Tab" && !event.shiftKey && open && item.content) {
            // in the tab order, the Content comes right after its Trigger
            const first = getTabbables(item.content)[0];
            if (first) {
                event.preventDefault();
                first.focus();
            }
        }
    };

    const state = { open, disabled };
    return renderElement(
        "button",
        props,
        state,
        {
            type: "button",
            disabled,
            "aria-expanded": open,
            "aria-controls": open ? item.contentId : undefined,
            "data-primitives-part": "navigation-menu-trigger",
            ...stateAttributes({ "popup-open": open, disabled }),
            onPointerEnter,
            onPointerLeave,
            onClick,
            onKeyDown,
        },
        setElement,
    );
}
