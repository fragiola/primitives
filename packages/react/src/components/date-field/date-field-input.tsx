import type { DateSegment } from "@fragiola/primitives/segments";
import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { DateFieldContext, type DateFieldState } from "./date-field-context.ts";
import { DateFieldSegment } from "./date-field-segment.tsx";

export interface DateFieldInputProps
    extends Omit<PartProps<DateFieldState>, "children"> {
    /** A function of each segment; default: every segment with its own text. */
    children?: (segment: DateSegment) => ReactNode;
}

/** The `group` of the segments (spec/date-field.md, "Anatomy"). */
export function DateFieldInput({ children, ...props }: DateFieldInputProps) {
    const context = useRequiredContext(DateFieldContext, "DateField.Input");
    const { field } = context;
    const state: DateFieldState = {
        disabled: context.disabled,
        readOnly: context.readOnly,
        required: context.required,
        invalid: context.invalid,
    };
    return renderElement(
        "div",
        {
            ...props,
            children: context.segments.map((segment) =>
                children ? (
                    children(segment)
                ) : (
                    <DateFieldSegment key={segment.index} segment={segment} />
                ),
            ),
        },
        state,
        {
            role: "group",
            "aria-labelledby": field.aria["aria-labelledby"],
            "aria-describedby": field.aria["aria-describedby"],
            "data-primitives-part":
                context.inputPart ?? `${context.component}-input`,
            ...context.attributes,
        },
        context.setInputElement,
    );
}
