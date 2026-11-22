import {
    computed,
    InjectionToken,
    type InputSignal,
    type OutputEmitterRef,
    type Signal,
} from "@angular/core";
import type {
    CalendarMode,
    CalendarOptions,
    CalendarValue,
    PickerBinding,
} from "@fragiola/primitives-angular/calendar";
import {
    type ChangeDetails,
    controllable,
    createOverlayRoot,
    type OpenChangeEvent,
    placementSignal,
} from "@fragiola/primitives-angular/internal";

/** The component a picker's parts belong to: their part attribute's prefix. */
export type DatePickerComponent = "date-picker" | "date-range-picker";

/** The inputs a DatePicker or DateRangePicker root hands its state. */
export interface DatePickerInputs {
    open: Signal<boolean | undefined>;
    openChange: OutputEmitterRef<boolean>;
    defaultOpen: InputSignal<boolean>;
    value: Signal<CalendarValue | undefined>;
    valueChange: Pick<OutputEmitterRef<CalendarValue>, "emit">;
    defaultValue: Signal<CalendarValue | undefined>;
    options: Signal<CalendarOptions>;
}

/** The enclosing picker's state, for its parts. */
export const DATE_PICKER = new InjectionToken<DatePickerState>("DATE_PICKER");

/**
 * A trigger and a popup holding a bound calendar (spec/calendar.md, pickers): the overlay, the
 * value, and the options the calendar inherits. Created in a root directive's injection context.
 */
export function createDatePicker(
    component: DatePickerComponent,
    mode: CalendarMode,
    inputs: DatePickerInputs,
    emitOpen: (event: OpenChangeEvent) => void,
    emitValue: (value: CalendarValue, details: ChangeDetails) => void,
) {
    const overlay = createOverlayRoot(
        inputs,
        emitOpen,
        `primitives-${component}`,
    );
    const state = controllable<CalendarValue, ChangeDetails>(
        inputs.value,
        inputs.valueChange,
        () => inputs.defaultValue() ?? null,
        emitValue,
    );
    const choose = (next: CalendarValue) => {
        state.set(next, { reason: "item-press" });
        overlay.setOpen(false, "item-press");
    };
    const binding: PickerBinding = {
        mode,
        value: state.value,
        options: inputs.options,
        open: overlay.open,
        choose,
    };
    return {
        component,
        mode,
        overlay,
        value: state.value,
        options: inputs.options,
        binding,
        placed: placementSignal({ side: "bottom", align: "start" }),
        state: computed(() => ({ open: overlay.open() })),
        /** Sets the value and closes the popup (reason `item-press`). */
        choose,
        /** The part attribute of one of its parts. */
        part: (name: string) => `${component}-${name}`,
    };
}

export type DatePickerState = ReturnType<typeof createDatePicker>;
