import type { Align, Side } from "@fragiola/primitives/positioning";
import type { InjectionKey, Ref } from "vue";
import type { FieldControlBinding } from "../../composables/use-field-control.ts";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";

/** The component a picker's parts belong to: their part attribute's prefix. */
export type DatePickerComponent = "date-picker" | "date-range-picker";

export interface DatePickerContext extends OverlayRoot {
    component: DatePickerComponent;
    placed: Ref<{ side: Side; align: Align }>;
    /** The enclosing field's binding, for the trigger (spec/field.md). */
    field: FieldControlBinding;
    /** Its own `disabled`, or its Field's (or a Fieldset's). */
    disabled: () => boolean;
    readOnly: () => boolean;
    required: () => boolean;
}

export const DatePickerKey: InjectionKey<DatePickerContext> =
    Symbol("DatePicker");
