import { type PlainDate, toIsoDate } from "@fragiola/primitives/date";
import type { ReactNode } from "react";
import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { CalendarCell } from "./calendar-cell.tsx";
import { CalendarContext } from "./calendar-context.ts";

export interface CalendarRowProps
    extends Omit<PartProps<Record<string, never>>, "children"> {
    week: PlainDate[];
    /** Called per date (default: a Cell each). */
    children?: (date: PlainDate) => ReactNode;
}

/** One week (`tr`). */
export function CalendarRow({ week, children, ...props }: CalendarRowProps) {
    const context = useRequiredContext(CalendarContext, "Calendar.Row");
    const render =
        children ??
        ((date: PlainDate) => (
            <CalendarCell key={toIsoDate(date)} date={date} />
        ));
    return renderElement(
        "tr",
        { ...props, children: week.map(render) },
        {},
        {
            "data-primitives-part": `${context.component}-row`,
        },
    );
}
