import { CalendarView } from "@fragiola/primitives-react/calendar-view";
import type { ReactNode } from "react";
import { MonthView } from "./calendar.tsx";
import { MonthCalendar, PageView, YearCalendar } from "./month-calendar.tsx";

/**
 * A calendar's three views (spec/month-calendar.md, "Views"): the days with their header's Heading
 * in the view Trigger (and an optional footer), the months, the years.
 */
export function CalendarViews({ footer }: { footer?: ReactNode }) {
    return (
        <CalendarView.Root>
            {({ view }) =>
                view === "day" ? (
                    <>
                        <MonthView viewTrigger />
                        {footer}
                    </>
                ) : view === "month" ? (
                    <MonthCalendar.Root>
                        <PageView
                            prev="Previous year"
                            next="Next year"
                            viewTrigger
                        />
                    </MonthCalendar.Root>
                ) : (
                    <YearCalendar.Root>
                        <PageView
                            prev="Previous years"
                            next="Next years"
                            viewTrigger
                        />
                    </YearCalendar.Root>
                )
            }
        </CalendarView.Root>
    );
}
