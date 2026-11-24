import type { MouseEvent as ReactMouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { ColorPickerPopoverContext } from "./color-picker-popover-context.ts";

export interface ColorPickerPopoverTriggerState {
    open: boolean;
    disabled: boolean;
}

export interface ColorPickerPopoverTriggerProps
    extends PartProps<ColorPickerPopoverTriggerState> {}

/** Opens the picker's popup; its content is the app's (a ColorSwatch of the picker's color). */
export function ColorPickerPopoverTrigger(
    props: ColorPickerPopoverTriggerProps,
) {
    const context = useRequiredContext(
        ColorPickerPopoverContext,
        "ColorPickerPopover.Trigger",
    );
    const { open, disabled } = context;
    return renderElement(
        "button",
        props,
        { open, disabled },
        {
            type: "button",
            id: context.triggerId,
            disabled,
            "aria-haspopup": "dialog",
            "aria-expanded": open,
            "aria-controls": open ? context.popupId : undefined,
            "data-primitives-part": "color-picker-popover-trigger",
            ...stateAttributes({ "popup-open": open, disabled }),
            onClick: (event: ReactMouseEvent) => {
                if (!disabled) {
                    context.setOpen(!open, "trigger-press", event.nativeEvent);
                }
            },
        },
        context.setTrigger,
    );
}
