import type { Align, Side } from "@fragiola/primitives/positioning";
import { createContext } from "react";
import type { FieldControlBinding } from "../../hooks/use-field-control.ts";
import type { OverlayRoot } from "../../hooks/use-overlay-root.ts";

/** The component a picker's parts belong to: their part attribute's prefix. */
export type DatePickerComponent = "date-picker" | "date-range-picker";

/** The pickers whose Root provides this context: the month and year pickers' too (Epic #79). */
export type PickerComponent =
    | DatePickerComponent
    | "month-picker"
    | "month-range-picker"
    | "year-picker"
    | "year-range-picker";

export interface DatePickerContextValue extends OverlayRoot {
    component: PickerComponent;
    placed: { side: Side; align: Align };
    setPlaced: (placed: { side: Side; align: Align }) => void;
    /** The enclosing field's binding, for the trigger (spec/field.md). */
    field: FieldControlBinding;
    disabled: boolean;
    readOnly: boolean;
    required: boolean;
}

export const DatePickerContext = createContext<DatePickerContextValue | null>(
    null,
);
