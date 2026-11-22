import type { MouseEvent as ReactMouseEvent } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import { DatePickerContext } from "./date-picker-context.ts";

export interface DatePickerTriggerState {
    open: boolean;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export interface DatePickerTriggerProps
    extends PartProps<DatePickerTriggerState> {}

/**
 * Opens the picker; its content is the consumer's (for example the formatted value). Inside a
 * Field, the field's labelable element and focus target (spec/calendar.md, "Forms").
 */
export function DatePickerTrigger(props: DatePickerTriggerProps) {
    const context = useRequiredContext(DatePickerContext, "DatePicker.Trigger");
    const { open, disabled, readOnly, required, field } = context;
    return renderElement(
        "button",
        props,
        { open, disabled, readOnly, required },
        {
            type: "button",
            id: context.triggerId,
            disabled,
            "aria-haspopup": "dialog",
            "aria-expanded": open,
            "aria-controls": open ? context.popupId : undefined,
            ...field.aria,
            "data-primitives-part": `${context.component}-trigger`,
            ...field.attributes,
            ...stateAttributes({
                "popup-open": open,
                disabled,
                readonly: readOnly,
                required,
            }),
            onClick: (event: ReactMouseEvent) => {
                if (!disabled) {
                    context.setOpen(!open, "trigger-press", event.nativeEvent);
                }
            },
            onFocus: field.onFocus,
            onBlur: field.onBlur,
        },
        context.setTrigger,
    );
}
