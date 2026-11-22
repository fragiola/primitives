import type { Weekday } from "@fragiola/primitives/date";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CalendarContext } from "./calendar-context.ts";

export interface CalendarHeaderCellState {
    weekday: Weekday;
}

export interface CalendarHeaderCellProps
    extends PartProps<CalendarHeaderCellState> {
    weekday: Weekday;
}

/** One weekday: its short name, the long one as `abbr`. */
export function CalendarHeaderCell({
    weekday,
    children,
    ...props
}: CalendarHeaderCellProps) {
    const context = useRequiredContext(CalendarContext, "Calendar.HeaderCell");
    return renderElement(
        "th",
        { ...props, children: children ?? weekday.short },
        { weekday },
        {
            scope: "col",
            abbr: weekday.long,
            "data-primitives-part": `${context.component}-header-cell`,
        },
    );
}
