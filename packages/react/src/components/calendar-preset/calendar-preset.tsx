import {
    type DateRange,
    isSameDate,
    type PlainDate,
    today,
} from "@fragiola/primitives/date";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    CalendarContext,
    type CalendarContextValue,
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

export interface CalendarPresetProps extends PartProps<CalendarPresetState> {
    value: CalendarPresetValue;
}

/** The preset's dates in its calendar, or `null` when the calendar cannot hold it. */
function presetRange(
    context: CalendarContextValue,
    value: CalendarPresetValue,
): DateRange | null {
    const resolved = typeof value === "function" ? value(today()) : value;
    if ("start" in resolved) {
        return context.mode === "range" ? resolved : null;
    }
    return { start: resolved, end: resolved };
}

/** Whether the calendar's value is the range (a Calendar's: its one date). */
function isCurrent(context: CalendarContextValue, range: DateRange): boolean {
    if (context.mode === "range") {
        const current = context.rangeValue;
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
export function CalendarPreset({ value, ...props }: CalendarPresetProps) {
    const context = useRequiredContext(CalendarContext, "CalendarPreset");
    // the context of the latest render: a range is chosen in two steps, each rendered first
    const latest = useRef(context);
    latest.current = context;
    const range = presetRange(context, value);
    const blocked = (date: PlainDate) => {
        const cell = context.cellState(date, date);
        return cell.disabled || cell.unavailable;
    };
    const disabled =
        range === null ||
        context.disabled ||
        context.readOnly ||
        blocked(range.start) ||
        blocked(range.end);
    const state: CalendarPresetState = {
        selected: range !== null && isCurrent(context, range),
        disabled,
    };
    return renderElement("button", props, state, {
        type: "button",
        disabled,
        "data-primitives-part": `${context.component}-preset`,
        ...stateAttributes({
            selected: state.selected,
            disabled,
        }),
        onClick: () => {
            const target = presetRange(latest.current, value);
            if (target === null || disabled) {
                return;
            }
            // the preset keeps the focus (a picker it closes returns it to its trigger)
            context.focusPending.current = false;
            context.moveFocus(target.start);
            context.moveFocus(target.end);
            if (context.mode !== "range") {
                context.select(target.start);
                return;
            }
            // a range started in the grid is dropped, then the two ends are chosen
            flushSync(() => latest.current.cancelRange());
            flushSync(() => latest.current.select(target.start));
            latest.current.select(target.end);
        },
    });
}
