import type { FocusEvent, PointerEvent } from "react";
import {
    type OverlayTriggerProps,
    useOverlayTrigger,
} from "../../hooks/use-overlay-trigger.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { TooltipContext } from "./tooltip-context.ts";
import type { TooltipHandle } from "./tooltip-handle.ts";

function isFocusVisible(element: Element): boolean {
    try {
        return element.matches(":focus-visible");
    } catch {
        return true;
    }
}

export interface TooltipTriggerProps<Payload = unknown>
    extends PartProps<{ open: boolean }>,
        OverlayTriggerProps<TooltipHandle<Payload>, Payload> {}

/** A described control and the anchor; with a `handle`, anywhere in the page (spec/tooltip.md). */
export function TooltipTrigger<Payload = unknown>({
    handle,
    payload,
    id: idProp,
    ...props
}: TooltipTriggerProps<Payload>) {
    const { root, id, ref, active } = useOverlayTrigger(
        TooltipContext,
        "Tooltip.Trigger",
        { handle, payload, id: idProp },
    );
    const { "aria-describedby": describedBy, ...rest } = props;
    const description =
        [describedBy, active ? root?.popupId : undefined]
            .filter(Boolean)
            .join(" ") || undefined;
    return renderElement(
        "button",
        rest,
        { open: active },
        {
            type: "button",
            id,
            "aria-describedby": description,
            "data-primitives-part": "tooltip-trigger",
            ...stateAttributes({ "popup-open": active }),
            onPointerEnter: (event: PointerEvent<HTMLElement>) => {
                // a tap never opens a tooltip
                if (event.pointerType !== "touch") {
                    root?.hoverStart(event.currentTarget, event.nativeEvent);
                }
            },
            onPointerLeave: (event: PointerEvent<HTMLElement>) => {
                if (event.pointerType !== "touch") {
                    root?.hoverEnd(event.currentTarget);
                }
            },
            onPointerDown: (event: PointerEvent) => {
                // a tap neither opens nor blocks it (the block ends on a pointer leave touch has not)
                if (event.pointerType !== "touch") {
                    root?.press(event.nativeEvent);
                }
            },
            onFocus: (event: FocusEvent<HTMLElement>) => {
                if (
                    root !== null &&
                    !root.disabled &&
                    isFocusVisible(event.currentTarget)
                ) {
                    root.show(
                        "trigger-focus",
                        true,
                        event.nativeEvent,
                        event.currentTarget,
                    );
                }
            },
            onBlur: (event: FocusEvent) => {
                if (active) {
                    root?.hide("trigger-focus", event.nativeEvent);
                }
            },
        },
        ref,
    );
}
