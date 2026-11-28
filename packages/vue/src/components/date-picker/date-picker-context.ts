import type { Align, Side } from "@fragiola/primitives/positioning";
import type { InjectionKey, Ref } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";

/** The component a picker's parts belong to: their part attribute's prefix. */
export type DatePickerComponent = "date-picker" | "date-range-picker";

/** The pickers whose Root provides this context: the month and year pickers' too (Epic #79). */
export type PickerComponent =
    | DatePickerComponent
    | "month-picker"
    | "month-range-picker"
    | "year-picker"
    | "year-range-picker";

export interface DatePickerContext extends OverlayRoot {
    component: PickerComponent;
    placed: Ref<{ side: Side; align: Align }>;
    /** Whether the Popup is a layer (its overlay session is open): its calendar waits for it. */
    layered: Ref<boolean>;
    /** The enclosing field's binding, for the trigger (spec/field.md). */
    field: FieldControlBinding;
    /** Its own `disabled`, or its Field's (or a Fieldset's). */
    disabled: () => boolean;
    readOnly: () => boolean;
    required: () => boolean;
}

export const DatePickerKey: InjectionKey<DatePickerContext> =
    Symbol("DatePicker");
