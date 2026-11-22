import { addMonths, calendarKeyTarget } from "@fragiola/primitives/date";
import { getDirection } from "@fragiola/primitives/direction";
import { interceptEscape } from "@fragiola/primitives/layers";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CalendarContext, CalendarGridContext } from "./calendar-context.ts";

export interface CalendarGridProps extends PartProps<Record<string, never>> {
    /** Which visible month it shows (default 0). */
    offset?: number;
}

/** One month, as an ARIA grid with the APG date grid keyboard (spec/calendar.md, "Keyboard"). */
export function CalendarGrid({ offset = 0, ...props }: CalendarGridProps) {
    const context = useRequiredContext(CalendarContext, "Calendar.Grid");
    const month = addMonths(context.visibleStart, offset);
    const [element, setElement] = useState<HTMLElement | null>(null);
    // read when the key comes, so the interception never waits for a render
    const range = useRef({ started: false, cancel: context.cancelRange });
    range.current = {
        started: context.anchor !== null,
        cancel: context.cancelRange,
    };

    // a started range takes Escape before an enclosing overlay's layer (a picker, a dialog, a
    // popover) closes it: the next Escape closes (spec/calendar.md, "Keyboard")
    useEffect(() => {
        if (element === null) {
            return undefined;
        }
        return interceptEscape(
            element.ownerDocument,
            () => range.current.cancel(),
            {
                when: (event) =>
                    range.current.started &&
                    event.target instanceof Node &&
                    element.contains(event.target),
            },
        );
    }, [element]);

    const onKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            context.select(context.focusedDate);
            return;
        }
        if (event.key === "Escape") {
            if (context.anchor !== null) {
                event.preventDefault();
                context.cancelRange();
            }
            return;
        }
        const target = calendarKeyTarget(event.key, context.focusedDate, {
            rtl: getDirection(event.currentTarget) === "rtl",
            firstDayOfWeek: context.firstDay,
            shiftKey: event.shiftKey,
        });
        if (target === null) {
            return;
        }
        event.preventDefault();
        if (context.moveFocus(target)) {
            context.requestFocus();
        }
    };

    return (
        <CalendarGridContext.Provider value={month}>
            {renderElement(
                "table",
                props,
                {},
                {
                    role: "grid",
                    id: context.gridId(offset),
                    "aria-labelledby": context.headingId(offset),
                    "aria-multiselectable":
                        context.mode === "range" ? "true" : undefined,
                    "aria-readonly": context.readOnly ? "true" : undefined,
                    "aria-disabled": context.disabled ? "true" : undefined,
                    "data-primitives-part": `${context.component}-grid`,
                    onKeyDown,
                },
                setElement,
            )}
        </CalendarGridContext.Provider>
    );
}
