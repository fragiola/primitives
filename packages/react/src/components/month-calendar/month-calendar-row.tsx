import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MonthCalendarCell } from "./month-calendar-cell.tsx";
import { MonthCalendarContext } from "./month-calendar-context.ts";
import type { MonthCalendarItem } from "./month-calendar-value.ts";

export interface MonthCalendarRowProps
    extends Omit<PartProps<Record<string, never>>, "children"> {
    row: MonthCalendarItem[];
    /** Called per item (default: a Cell each). */
    children?: (item: MonthCalendarItem) => ReactNode;
}

/** One row of items (`tr`). */
export function MonthCalendarRow({
    row,
    children,
    ...props
}: MonthCalendarRowProps) {
    const context = useRequiredContext(
        MonthCalendarContext,
        "MonthCalendar.Row",
    );
    const render =
        children ??
        ((item: MonthCalendarItem) => (
            <MonthCalendarCell key={context.units.index(item)} value={item} />
        ));
    return renderElement(
        "tr",
        { ...props, children: row.map(render) },
        {},
        {
            "data-primitives-part": `${context.component}-row`,
        },
    );
}
