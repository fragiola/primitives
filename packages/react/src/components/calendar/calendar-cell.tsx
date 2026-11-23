import {
    formatDayNumber,
    type PlainDate,
    toIsoDate,
} from "@fragiola/primitives/date";
import { type MouseEvent, useLayoutEffect } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type CalendarCellState,
    CalendarContext,
    CalendarGridContext,
} from "./calendar-context.ts";

export interface CalendarCellProps extends PartProps<CalendarCellState> {
    date: PlainDate;
}

/** One date. Its name and content come from `Intl` (spec/calendar.md, the locale exception). */
export function CalendarCell({ date, children, ...props }: CalendarCellProps) {
    const context = useRequiredContext(CalendarContext, "Calendar.Cell");
    const month = useRequiredContext(CalendarGridContext, "Calendar.Cell");
    const [element, ref] = useElement<HTMLElement>();
    const state = context.cellState(date, month);
    const key = toIsoDate(date);
    const { cells, focusPending } = context;
    useLayoutEffect(() => {
        if (element === null || state.outsideMonth) {
            return undefined;
        }
        cells.set(key, element);
        // a cell of a month just shown mounts after the keyboard moved the focus to it
        // (AGENTS.md "Porting", 5)
        if (focusPending.current && state.focused) {
            focusPending.current = false;
            element.focus({ preventScroll: true });
        }
        return () => {
            if (cells.get(key) === element) {
                cells.delete(key);
            }
        };
    }, [element, key, state.outsideMonth, state.focused, cells, focusPending]);

    const choosable = !state.outsideMonth;
    return renderElement(
        "td",
        {
            "aria-label": context.math.fullDate(context.locale, date),
            ...props,
            children: children ?? formatDayNumber(context.locale, date),
        },
        state,
        {
            role: "gridcell",
            tabIndex: state.outsideMonth
                ? undefined
                : state.focused && !state.disabled
                  ? 0
                  : -1,
            "aria-selected": state.selected ? "true" : undefined,
            "aria-disabled":
                state.disabled || state.unavailable || state.outsideMonth
                    ? "true"
                    : undefined,
            "aria-current": state.today ? "date" : undefined,
            "data-primitives-part": `${context.component}-cell`,
            ...stateAttributes({
                today: state.today,
                selected: state.selected,
                disabled: state.disabled,
                unavailable: state.unavailable,
                "outside-month": state.outsideMonth,
                "range-start": state.rangeStart,
                "range-end": state.rangeEnd,
                "in-range": state.inRange,
                "range-preview": state.rangePreview,
            }),
            // a disabled date never takes the focus, not even from a press
            onMouseDown: (event: MouseEvent) => {
                if (state.disabled) {
                    event.preventDefault();
                }
            },
            onClick: () => {
                if (choosable && !state.disabled) {
                    context.select(date);
                    context.requestFocus();
                }
            },
            onPointerEnter: () => {
                if (context.anchor !== null && choosable) {
                    context.setHovered(date);
                }
            },
            onFocus: () => {
                if (choosable && !state.focused) {
                    context.moveFocus(date);
                }
            },
        },
        ref,
    );
}
