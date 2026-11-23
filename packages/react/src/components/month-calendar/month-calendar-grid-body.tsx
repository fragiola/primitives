import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MonthCalendarContext } from "./month-calendar-context.ts";
import { MonthCalendarRow } from "./month-calendar-row.tsx";
import type { MonthCalendarItem } from "./month-calendar-value.ts";

export interface MonthCalendarGridBodyProps
    extends Omit<PartProps<Record<string, never>>, "children"> {
    /** Called per row of `columns` items (default: a Row each). */
    children?: (row: MonthCalendarItem[]) => ReactNode;
}

/** The rows of the page (`tbody`). */
export function MonthCalendarGridBody({
    children,
    ...props
}: MonthCalendarGridBodyProps) {
    const context = useRequiredContext(
        MonthCalendarContext,
        "MonthCalendar.GridBody",
    );
    const rows = context.units
        .rows(context.pageStart, context.columns)
        .map((row) => row.map(context.itemOf));
    const render =
        children ??
        ((row: MonthCalendarItem[]) => (
            <MonthCalendarRow
                key={context.units.index(row[0] as MonthCalendarItem)}
                row={row}
            />
        ));
    return renderElement(
        "tbody",
        { ...props, children: rows.map(render) },
        {},
        {
            "data-primitives-part": `${context.component}-grid-body`,
        },
    );
}
