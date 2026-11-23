import {
    afterRenderEffect,
    computed,
    ElementRef,
    effect,
    type InputSignal,
    inject,
    type OutputEmitterRef,
    type Signal,
    signal,
    untracked,
} from "@angular/core";
import { bridgeForm } from "@fragiola/primitives/form";
import {
    type PlainYear,
    type PlainYearMonth,
    toIsoYear,
    toIsoYearMonth,
} from "@fragiola/primitives/month-year";
import type {
    CalendarOptions,
    CalendarValue,
    PickerBinding,
} from "@fragiola/primitives-angular/calendar";
import type {
    DatePickerState,
    PickerComponent,
} from "@fragiola/primitives-angular/date-picker";
import { fieldControl } from "@fragiola/primitives-angular/field";
import {
    type ChangeDetails,
    controllable,
    createHiddenInput,
    createOverlayRoot,
    type OpenChangeEvent,
    placementSignal,
    setInputAttribute,
} from "@fragiola/primitives-angular/internal";
import {
    isItemRange,
    type MonthCalendarBinding,
    type MonthCalendarItem,
    type MonthCalendarKind,
    type MonthCalendarMode,
    type MonthCalendarOptions,
    type MonthCalendarValue,
} from "@fragiola/primitives-angular/month-calendar";

/** The inputs a month or year picker root hands its state. */
export interface MonthPickerInputs {
    open: Signal<boolean | undefined>;
    openChange: OutputEmitterRef<boolean>;
    defaultOpen: InputSignal<boolean>;
    openChangeComplete: Pick<OutputEmitterRef<boolean>, "emit">;
    value: Signal<MonthCalendarValue | undefined>;
    valueChange: Pick<OutputEmitterRef<MonthCalendarValue>, "emit">;
    defaultValue: Signal<MonthCalendarValue | undefined>;
    options: Signal<MonthCalendarOptions>;
    name: Signal<string | undefined>;
    required: Signal<boolean>;
    disabled: Signal<boolean>;
    readOnly: Signal<boolean>;
}

/** A month or year picker's state: the DatePicker's (for its parts), and its calendar's binding. */
export interface MonthPickerState {
    /** What the DatePicker's Trigger, Portal, Positioner and Popup read (`DATE_PICKER`). */
    picker: DatePickerState;
    /** What the month or year calendar inside binds to (`MONTH_CALENDAR_BINDING`). */
    binding: MonthCalendarBinding;
}

/** `2026-11` or `2026`. */
function isoOf(kind: MonthCalendarKind, item: MonthCalendarItem): string {
    return kind === "month"
        ? toIsoYearMonth(item as PlainYearMonth)
        : toIsoYear(item as PlainYear);
}

/**
 * What the form submits: `2026-11`, `2026`, a range as the ISO 8601 interval (`2026-03/2026-06`,
 * `2020/2024`), or empty with no value.
 */
function formValue(kind: MonthCalendarKind, value: MonthCalendarValue): string {
    if (value === null) {
        return "";
    }
    if (isItemRange(value)) {
        return `${isoOf(kind, value.start)}/${isoOf(kind, value.end)}`;
    }
    return isoOf(kind, value);
}

/**
 * A MonthPicker, MonthRangePicker, YearPicker or YearRangePicker (spec/month-calendar.md): the
 * DatePicker's overlay, form support and Field, with a month or year value the calendar inside
 * binds to. Its `picker` is a `DatePickerState`, so the DatePicker's part directives are its parts.
 * Created in a root directive's injection context.
 */
export function createMonthPicker(
    component: PickerComponent,
    kind: MonthCalendarKind,
    mode: MonthCalendarMode,
    inputs: MonthPickerInputs,
    emitOpen: (event: OpenChangeEvent) => void,
    emitValue: (value: MonthCalendarValue, details: ChangeDetails) => void,
): MonthPickerState {
    const overlay = createOverlayRoot(
        inputs,
        emitOpen,
        `primitives-${component}`,
    );
    const state = controllable<MonthCalendarValue, ChangeDetails>(
        inputs.value,
        inputs.valueChange,
        () => inputs.defaultValue() ?? null,
        emitValue,
    );
    const readOnly = computed(() => inputs.readOnly());
    const choose = (next: MonthCalendarValue) => {
        if (untracked(readOnly)) {
            return;
        }
        state.set(next, { reason: "item-press" });
        overlay.setOpen(false, "item-press");
    };
    const binding: MonthCalendarBinding = {
        kind: signal(kind),
        mode,
        open: overlay.open,
        focusOnMount: () => true,
        value: state.value,
        choose,
        options: inputs.options,
        readOnly,
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
        hidden.value = formValue(kind, state.value());
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
                            hidden.value = formValue(
                                kind,
                                untracked(state.value),
                            );
                        },
                        invalid: () => overlay.trigger(),
                    }),
                );
            });
        },
    });

    // the DatePicker's view of it: its parts read the overlay, the field, the trigger's data and
    // the placement; a day calendar never binds to it (no PICKER_BINDING is provided)
    const value = state.value as Signal<unknown> as Signal<CalendarValue>;
    const calendarOptions = computed<CalendarOptions>(() => ({}));
    const dayBinding: PickerBinding = {
        mode,
        value,
        options: calendarOptions,
        open: overlay.open,
        readOnly,
        choose: () => {},
    };
    return {
        binding,
        picker: {
            component,
            mode,
            overlay,
            value,
            options: calendarOptions,
            binding: dayBinding,
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
            choose: (next) => choose(next as unknown as MonthCalendarValue),
            part: (part: string) => `${component}-${part}`,
        },
    };
}
