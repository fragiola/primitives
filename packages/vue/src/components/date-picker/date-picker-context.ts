import type { Align, Side } from "@fragiola/primitives/positioning";
import type { InjectionKey, Ref } from "vue";
import type { OverlayRoot } from "../../composables/use-overlay-root.ts";

/** The component a picker's parts belong to: their part attribute's prefix. */
export type DatePickerComponent = "date-picker" | "date-range-picker";

export interface DatePickerContext extends OverlayRoot {
    component: DatePickerComponent;
    placed: Ref<{ side: Side; align: Align }>;
}

export const DatePickerKey: InjectionKey<DatePickerContext> =
    Symbol("DatePicker");
