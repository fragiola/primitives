import {
    afterRenderEffect,
    computed,
    ElementRef,
    effect,
    InjectionToken,
    type InputSignal,
    inject,
    type OutputEmitterRef,
    type Signal,
    signal,
    untracked,
    type WritableSignal,
} from "@angular/core";
import { toIsoDate } from "@fragiola/primitives/date";
import { bridgeForm } from "@fragiola/primitives/form";
import type {
    CalendarMode,
    CalendarOptions,
    CalendarValue,
    PickerBinding,
} from "@fragiola/primitives-angular/calendar";
import {
    type FieldControlBinding,
    fieldControl,
} from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    createHiddenInput,
    createOverlayRoot,
    type OpenChangeEvent,
    type OverlayRoot,
    type Placement,
    placementSignal,
    setInputAttribute,
} from "@fragiola/primitives-angular/internal";

/** The component a picker's parts belong to: their part attribute's prefix. */
export type DatePickerComponent = "date-picker" | "date-range-picker";

/** The pickers whose root provides `DATE_PICKER`: the month and year pickers' too (Epic #79). */
export type PickerComponent =
    | DatePickerComponent
    | "month-picker"
    | "month-range-picker"
    | "year-picker"
    | "year-range-picker";

/** The inputs a DatePicker or DateRangePicker root hands its state. */
export interface DatePickerInputs {
    open: Signal<boolean | undefined>;
    openChange: OutputEmitterRef<boolean>;
    defaultOpen: InputSignal<boolean>;
    openChangeComplete: Pick<OutputEmitterRef<boolean>, "emit">;
    value: Signal<CalendarValue | undefined>;
    valueChange: Pick<OutputEmitterRef<CalendarValue>, "emit">;
    defaultValue: Signal<CalendarValue | undefined>;
    options: Signal<CalendarOptions>;
    /** The form props (spec/calendar.md, "Forms"). */
    name: Signal<string | undefined>;
    required: Signal<boolean>;
    disabled: Signal<boolean>;
    readOnly: Signal<boolean>;
}

/** The picker's trigger state: its form props too. */
export interface DatePickerTriggerData {
    open: boolean;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
}

/**
 * The enclosing picker's state, for its parts. Declared, not inferred, so the built declarations
 * name the calendar entry's types by its specifier.
 */
export interface DatePickerState {
    component: PickerComponent;
    mode: CalendarMode;
    overlay: OverlayRoot;
    value: Signal<CalendarValue>;
    options: Signal<CalendarOptions>;
    /** What the calendar inside binds to. */
    binding: PickerBinding;
    placed: WritableSignal<Placement>;
    state: Signal<{ open: boolean }>;
    /** Its own `disabled`, or its Field's. */
    disabled: Signal<boolean>;
    readOnly: Signal<boolean>;
    required: Signal<boolean>;
    /** The enclosing field's binding, for the trigger (spec/field.md). */
    field: FieldControlBinding;
    /** The trigger's state attributes, its form props with them. */
    trigger: Signal<DatePickerTriggerData>;
    /** Sets the value and closes the popup (reason `item-press`). */
    choose: (next: CalendarValue) => void;
    /** The part attribute of one of its parts. */
    part: (name: string) => string;
}

/** The enclosing picker's state, for its parts. */
export const DATE_PICKER = new InjectionToken<DatePickerState>("DATE_PICKER");

/** What the hidden input submits: an ISO date, the ISO interval `start/end`, or empty. */
function formValue(value: CalendarValue): string {
    if (value === null) {
        return "";
    }
    return "start" in value
        ? `${toIsoDate(value.start)}/${toIsoDate(value.end)}`
        : toIsoDate(value);
}

/**
 * A trigger and a popup holding a bound calendar (spec/calendar.md, pickers): the overlay, the
 * value, the options the calendar inherits, and the form support (a visually hidden text input
 * after the Root's children, while it has a name; "Forms"). Created in a root directive's
 * injection context.
 */
export function createDatePicker(
    component: DatePickerComponent,
    mode: CalendarMode,
    inputs: DatePickerInputs,
    emitOpen: (event: OpenChangeEvent) => void,
    emitValue: (value: CalendarValue, details: ChangeDetails) => void,
): DatePickerState {
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
    const readOnly = computed(() => inputs.readOnly());
    const choose = (next: CalendarValue) => {
        if (untracked(readOnly)) {
            return;
        }
        state.set(next, { reason: "item-press" });
        overlay.setOpen(false, "item-press");
    };
    const binding: PickerBinding = {
        mode,
        value: state.value,
        options: inputs.options,
        open: overlay.open,
        readOnly,
        choose,
    };

    const field = fieldControl({
        id: signal(overlay.triggerId),
        labelable: true,
        focusOnLabel: true,
        value: state.value,
        filled: computed(() => state.value() !== null),
        // read after the render, once the hidden input below exists
        input: () => (untracked(named) ? hidden : null),
        focusTarget: () => overlay.trigger(),
    });
    // the form's name: its Field's, else its own; the hidden input is in the page while it has one
    const name = computed(() => field.name() ?? inputs.name());
    const named = computed(() => name() !== undefined);
    const hidden = createHiddenInput(
        inject(ElementRef).nativeElement,
        { type: "text", "data-primitives-part": `${component}-input` },
        named,
    );
    const disabled = computed(() => inputs.disabled() || field.disabled());
    const required = computed(() => inputs.required());

    effect(() => {
        hidden.value = formValue(state.value());
        setInputAttribute(hidden, "name", name() ?? null);
        hidden.required = required();
        hidden.disabled = disabled();
    });
    // bridged to its form while it is in the page (after the write phase that inserts it)
    afterRenderEffect({
        read: (onCleanup) => {
            if (!named()) {
                return;
            }
            untracked(() => {
                onCleanup(
                    bridgeForm(hidden, {
                        reset: () => {
                            field.reset();
                            state.set(inputs.defaultValue() ?? null, {
                                reason: "none",
                            });
                            // the browser reset the input after the state: write it back
                            hidden.value = formValue(untracked(state.value));
                        },
                        invalid: () => overlay.trigger(),
                    }),
                );
            });
        },
    });

    return {
        component,
        mode,
        overlay,
        value: state.value,
        options: inputs.options,
        binding,
        placed: placementSignal({ side: "bottom", align: "start" }),
        state: computed(() => ({ open: overlay.open() })),
        disabled,
        readOnly,
        required,
        field,
        trigger: computed(() => ({
            open: overlay.open(),
            disabled: disabled(),
            readonly: readOnly(),
            required: required(),
        })),
        choose,
        part: (name: string) => `${component}-${name}`,
    };
}
