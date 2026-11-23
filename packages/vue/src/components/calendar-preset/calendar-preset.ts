import {
    type DateRange,
    isSameDate,
    type PlainDate,
    today,
} from "@fragiola/primitives/date";
import { defineComponent, type PropType } from "vue";
import { useRequiredContext } from "../../composables/use-required-context.ts";
import {
    type PartComponent,
    publicComponent,
} from "../../utils/public-component.ts";
import { asProp, renderPart } from "../../utils/render-part.ts";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type CalendarContext,
    CalendarKey,
} from "../calendar/calendar-context.ts";

/** A preset's value: a date, a range, or a function of today returning one. */
export type CalendarPresetValue =
    | PlainDate
    | DateRange
    | ((today: PlainDate) => PlainDate | DateRange);

export interface CalendarPresetState {
    /** The calendar's value is the preset's. */
    selected: boolean;
    /** It cannot be chosen (the calendar is disabled or read-only, or a date is out of reach). */
    disabled: boolean;
}

export interface CalendarPresetProps {
    value: CalendarPresetValue;
}

/** The preset's dates in its calendar, or `null` when the calendar cannot hold it. */
function presetRange(
    context: CalendarContext,
    value: CalendarPresetValue,
): DateRange | null {
    const resolved = typeof value === "function" ? value(today()) : value;
    if ("start" in resolved) {
        return context.mode === "range" ? resolved : null;
    }
    return { start: resolved, end: resolved };
}

/** Whether the calendar's value is the range (a Calendar's: its one date). */
function isCurrent(context: CalendarContext, range: DateRange): boolean {
    if (context.mode === "range") {
        const current = context.rangeValue();
        return (
            current !== null &&
            isSameDate(current.start, range.start) &&
            isSameDate(current.end, range.end)
        );
    }
    return context.cellState(range.start, range.start).selected;
}

/**
 * A button that sets its calendar's value to a known date or range (spec/calendar.md, "Presets"),
 * inside a Calendar or RangeCalendar, inline or in a picker. The label is the consumer's.
 */
export const CalendarPreset: PartComponent<
    CalendarPresetProps,
    CalendarPresetState
> = publicComponent(
    defineComponent({
        name: "CalendarPreset",
        inheritAttrs: false,
        props: {
            ...asProp,
            value: {
                type: [Object, Function] as PropType<CalendarPresetValue>,
                required: true,
            },
        },
        setup(props, { attrs, slots }) {
            const context = useRequiredContext(CalendarKey, "CalendarPreset");
            const blocked = (date: PlainDate) => {
                const cell = context.cellState(date, date);
                return cell.disabled || cell.unavailable;
            };
            return () => {
                const range = presetRange(context, props.value);
                const disabled =
                    range === null ||
                    context.disabled() ||
                    context.readOnly() ||
                    blocked(range.start) ||
                    blocked(range.end);
                const state: CalendarPresetState = {
                    selected: range !== null && isCurrent(context, range),
                    disabled,
                };
                return renderPart("button", { attrs, slots }, props.as, state, {
                    type: "button",
                    disabled,
                    "data-primitives-part": `${context.component}-preset`,
                    ...stateAttributes({
                        selected: state.selected,
                        disabled,
                    }),
                    onClick: () => {
                        const target = presetRange(context, props.value);
                        if (target === null || disabled) {
                            return;
                        }
                        // the preset keeps the focus (a picker it closes returns it to its
                        // trigger)
                        context.focusPending.current = false;
                        context.moveFocus(target.start);
                        context.moveFocus(target.end);
                        if (context.mode !== "range") {
                            context.select(target.start);
                            return;
                        }
                        // a range started in the grid is dropped, then the two ends are chosen
                        context.cancelRange();
                        context.select(target.start);
                        context.select(target.end);
                    },
                });
            };
        },
    }),
);
