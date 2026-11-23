import {
    CalendarPreset,
    type DateRange,
    type PlainDate,
} from "@fragiola/primitives-react/calendar-preset";
import { DateRangePicker } from "@fragiola/primitives-react/date-range-picker";
import { RangeCalendar } from "@fragiola/primitives-react/range-calendar";
import { useState } from "react";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a row key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
/** `Nov 14 – 20, 2026`: what the trigger shows. */
const format = (range: DateRange) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).formatRange(
        new Date(range.start.year, range.start.month - 1, range.start.day),
        new Date(range.end.year, range.end.month - 1, range.end.day),
    );
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};
/** `days` days before `date` (the month and year carry). */
const daysBefore = (date: PlainDate, days: number): PlainDate => {
    const local = new Date(date.year, date.month - 1, date.day - days);
    return {
        year: local.getFullYear(),
        month: local.getMonth() + 1,
        day: local.getDate(),
    };
};

// The presets: functions of today, read when they render and when they are pressed.
const lastWeek = (day: PlainDate): DateRange => ({
    start: daysBefore(day, 6),
    end: day,
});
const lastMonth = (day: PlainDate): DateRange => ({
    start: daysBefore(day, 29),
    end: day,
});
const thisMonth = (day: PlainDate): DateRange => ({
    start: { ...day, day: 1 },
    end: day,
});

// A report's period: a date range picker whose calendar has presets. A preset sets the range in
// one press and closes the popup, as choosing the range's end does; the current one is marked
// (`data-selected`). Days after today are disabled (spec/calendar.md, "Presets").
export default function ReportPeriod() {
    const [range, setRange] = useState<DateRange | null>(lastWeek(today));
    return (
        <div className={styles.page}>
            <DateRangePicker.Root
                value={range}
                onValueChange={setRange}
                max={today}
                locale="en-US"
            >
                <DateRangePicker.Trigger className={styles.picker.trigger}>
                    {range ? format(range) : "Choose a period"}
                </DateRangePicker.Trigger>
                <DateRangePicker.Portal>
                    <DateRangePicker.Positioner
                        sideOffset={4}
                        className={styles.picker.positioner}
                    >
                        <DateRangePicker.Popup
                            aria-label="Report period"
                            className={styles.picker.popup}
                        >
                            <RangeCalendar.Root
                                className={styles.calendar.root}
                            >
                                <div className={styles.preset.list}>
                                    <CalendarPreset
                                        value={lastWeek}
                                        className={styles.preset.preset}
                                    >
                                        Last 7 days
                                    </CalendarPreset>
                                    <CalendarPreset
                                        value={lastMonth}
                                        className={styles.preset.preset}
                                    >
                                        Last 30 days
                                    </CalendarPreset>
                                    <CalendarPreset
                                        value={thisMonth}
                                        className={styles.preset.preset}
                                    >
                                        This month
                                    </CalendarPreset>
                                </div>
                                <div className={styles.header}>
                                    <RangeCalendar.PrevButton
                                        aria-label="Previous month"
                                        className={styles.calendar.prevButton}
                                    >
                                        ‹
                                    </RangeCalendar.PrevButton>
                                    <RangeCalendar.Heading
                                        className={styles.calendar.heading}
                                    />
                                    <RangeCalendar.NextButton
                                        aria-label="Next month"
                                        className={styles.calendar.nextButton}
                                    >
                                        ›
                                    </RangeCalendar.NextButton>
                                </div>
                                <RangeCalendar.Grid
                                    className={styles.calendar.grid}
                                >
                                    <RangeCalendar.GridHeader>
                                        {(weekday) => (
                                            <RangeCalendar.HeaderCell
                                                key={weekday.index}
                                                weekday={weekday}
                                                className={
                                                    styles.calendar.headerCell
                                                }
                                            />
                                        )}
                                    </RangeCalendar.GridHeader>
                                    <RangeCalendar.GridBody>
                                        {(week) => (
                                            <RangeCalendar.Row
                                                key={iso(week[0] ?? today)}
                                                week={week}
                                            >
                                                {(date) => (
                                                    <RangeCalendar.Cell
                                                        key={iso(date)}
                                                        date={date}
                                                        className={
                                                            styles.calendar.cell
                                                        }
                                                    />
                                                )}
                                            </RangeCalendar.Row>
                                        )}
                                    </RangeCalendar.GridBody>
                                </RangeCalendar.Grid>
                            </RangeCalendar.Root>
                        </DateRangePicker.Popup>
                    </DateRangePicker.Positioner>
                </DateRangePicker.Portal>
            </DateRangePicker.Root>
        </div>
    );
}
