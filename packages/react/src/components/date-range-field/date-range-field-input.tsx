import { useId } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { DateFieldContext } from "../date-field/date-field-context.ts";
import {
    DateFieldInput,
    type DateFieldInputProps,
} from "../date-field/date-field-input.tsx";
import {
    DateRangeFieldContext,
    type RangeEnd,
} from "./date-range-field-context.ts";

export interface DateRangeFieldInputProps extends DateFieldInputProps {
    /** The end whose segments it holds. */
    range: RangeEnd;
}

/**
 * The `group` of one end's segments (spec/date-range-field.md, "Anatomy"): named by the
 * consumer (`aria-label`) and, inside a Field, by its label too; its segments by both and their
 * own name ("Stay Start date month").
 */
export function DateRangeFieldInput({
    range,
    ...props
}: DateRangeFieldInputProps) {
    const context = useRequiredContext(
        DateRangeFieldContext,
        "DateRangeField.Input",
    );
    const group = context.groups[range];
    const generated = useId();
    const id = typeof props.id === "string" ? props.id : generated;
    const named = props["aria-label"] !== undefined;
    const labelledBy =
        [group.labelId, named ? id : undefined]
            .filter((part) => part !== undefined)
            .join(" ") || undefined;
    return (
        <DateFieldContext.Provider value={{ ...group, labelId: labelledBy }}>
            <DateFieldInput
                id={id}
                aria-labelledby={
                    group.labelId === undefined ? undefined : labelledBy
                }
                data-range={range}
                {...props}
            />
        </DateFieldContext.Provider>
    );
}
