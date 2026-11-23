import { useRequiredContext } from "../../hooks/use-required-context.ts";
import { type PartProps, renderElement } from "../../utils/render-element.tsx";
import { MonthCalendarContext } from "./month-calendar-context.ts";

export interface MonthCalendarHeadingState {
    /** The year (a month calendar) or the page of years it names, from `Intl`. */
    label: string;
}

export interface MonthCalendarHeadingProps
    extends PartProps<MonthCalendarHeadingState> {}

/** The year or the page of years shown, from `Intl` unless the consumer gives children. */
export function MonthCalendarHeading({
    children,
    ...props
}: MonthCalendarHeadingProps) {
    const context = useRequiredContext(
        MonthCalendarContext,
        "MonthCalendar.Heading",
    );
    const label = context.units.heading(context.locale, context.pageStart);
    return renderElement(
        "h2",
        { ...props, children: children ?? label },
        { label },
        {
            id: context.headingId,
            "aria-live": "polite",
            "data-primitives-part": `${context.component}-heading`,
        },
    );
}
