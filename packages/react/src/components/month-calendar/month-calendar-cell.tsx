import { type MouseEvent, useLayoutEffect } from "react";
import { useElement } from "../../hooks/use-element.ts";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { stateAttributes } from "../../utils/state-attributes.ts";
import {
    type MonthCalendarCellState,
    MonthCalendarContext,
} from "./month-calendar-context.ts";
import type { MonthCalendarItem } from "./month-calendar-value.ts";

export interface MonthCalendarCellProps
    extends PartProps<MonthCalendarCellState> {
    /** The month or year. */
    value: MonthCalendarItem;
}

/** One month or year. Its name and content come from `Intl` (the locale exception). */
export function MonthCalendarCell({
    value,
    children,
    ...props
}: MonthCalendarCellProps) {
    const context = useRequiredContext(
        MonthCalendarContext,
        "MonthCalendar.Cell",
    );
    const [element, ref] = useElement<HTMLElement>();
    const { units } = context;
    const index = units.index(value);
    const state = context.cellState(index);
    const { cells, focusPending } = context;
    useLayoutEffect(() => {
        if (element === null) {
            return undefined;
        }
        cells.set(index, element);
        // a cell of a page just shown mounts after the keyboard moved the focus to it
        if (focusPending.current && state.focused) {
            focusPending.current = false;
            element.focus({ preventScroll: true });
        }
        return () => {
            if (cells.get(index) === element) {
                cells.delete(index);
            }
        };
    }, [element, index, state.focused, cells, focusPending]);

    return renderElement(
        "td",
        {
            "aria-label": units.name(context.locale, index),
            ...props,
            children: children ?? units.text(context.locale, index),
        },
        state,
        {
            role: "gridcell",
            tabIndex: state.focused && !state.disabled ? 0 : -1,
            "aria-selected": state.selected ? "true" : undefined,
            "aria-disabled":
                state.disabled || state.unavailable ? "true" : undefined,
            "aria-current": state.today ? "date" : undefined,
            "data-primitives-part": `${context.component}-cell`,
            ...stateAttributes({
                today: state.today,
                selected: state.selected,
                disabled: state.disabled,
                unavailable: state.unavailable,
                "range-start": state.rangeStart,
                "range-end": state.rangeEnd,
                "in-range": state.inRange,
                "range-preview": state.rangePreview,
            }),
            // a disabled item never takes the focus, not even from a press
            onMouseDown: (event: MouseEvent) => {
                if (state.disabled) {
                    event.preventDefault();
                }
            },
            onClick: () => {
                if (!state.disabled) {
                    context.select(index);
                    context.requestFocus();
                }
            },
            onPointerEnter: () => {
                if (context.anchor !== null) {
                    context.setHovered(index);
                }
            },
            onFocus: () => {
                if (!state.focused) {
                    context.moveFocus(index);
                }
            },
        },
        ref,
    );
}
