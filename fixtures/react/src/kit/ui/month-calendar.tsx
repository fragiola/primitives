import { CalendarView } from "@fragiola/primitives-react/calendar-view";
import {
    type MonthCalendarItem,
    MonthCalendar as Primitive,
} from "@fragiola/primitives-react/month-calendar";
import { MonthRangeCalendar as MonthRangePrimitive } from "@fragiola/primitives-react/month-range-calendar";
import { YearCalendar as YearPrimitive } from "@fragiola/primitives-react/year-calendar";
import { YearRangeCalendar as YearRangePrimitive } from "@fragiola/primitives-react/year-range-calendar";
import { calendar, calendarView } from "examples-shared/recipes/calendar";
import { monthCalendar } from "examples-shared/recipes/month-calendar";
import type { ComponentProps } from "react";

const key = (item: MonthCalendarItem) =>
    "month" in item ? `${item.year}-${item.month}` : `${item.year}`;

/**
 * The header (PrevButton, Heading, NextButton) and the grid of a month or year calendar, as every
 * month and year scenario shows them (spec/month-calendar.md).
 */
export function PageView({
    prev,
    next,
    viewTrigger = false,
}: {
    prev: string;
    next: string;
    /** The Heading inside a CalendarView Trigger ("Views"). */
    viewTrigger?: boolean;
}) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
                <Primitive.PrevButton
                    className={calendar["prev-button"]}
                    aria-label={prev}
                >
                    ‹
                </Primitive.PrevButton>
                {viewTrigger ? (
                    <CalendarView.Trigger className={calendarView.trigger}>
                        <Primitive.Heading
                            className={calendar.heading}
                            render={<span />}
                        />
                    </CalendarView.Trigger>
                ) : (
                    <Primitive.Heading className={calendar.heading} />
                )}
                <Primitive.NextButton
                    className={calendar["next-button"]}
                    aria-label={next}
                >
                    ›
                </Primitive.NextButton>
            </div>
            <Primitive.Grid className={monthCalendar.grid}>
                <Primitive.GridBody>
                    {(row) => (
                        <Primitive.Row
                            key={key(row[0] as MonthCalendarItem)}
                            row={row}
                        >
                            {(item) => (
                                <Primitive.Cell
                                    key={key(item)}
                                    value={item}
                                    className={monthCalendar.cell}
                                />
                            )}
                        </Primitive.Row>
                    )}
                </Primitive.GridBody>
            </Primitive.Grid>
        </div>
    );
}

export const MonthCalendar = {
    Root: (props: ComponentProps<typeof Primitive.Root>) => (
        <Primitive.Root className={calendar.root} {...props} />
    ),
};

export const MonthRangeCalendar = {
    Root: (props: ComponentProps<typeof MonthRangePrimitive.Root>) => (
        <MonthRangePrimitive.Root className={calendar.root} {...props} />
    ),
};

export const YearCalendar = {
    Root: (props: ComponentProps<typeof YearPrimitive.Root>) => (
        <YearPrimitive.Root className={calendar.root} {...props} />
    ),
};

export const YearRangeCalendar = {
    Root: (props: ComponentProps<typeof YearRangePrimitive.Root>) => (
        <YearRangePrimitive.Root className={calendar.root} {...props} />
    ),
};
