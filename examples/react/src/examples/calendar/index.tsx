import {
    type DateRange,
    type PlainDate,
    RangeCalendar,
} from "@fragiola/primitives-react/range-calendar";
import { useState } from "react";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const local = (date: PlainDate) =>
    new Date(date.year, date.month - 1, date.day);
const DAY = 24 * 60 * 60 * 1000;
/** `Nov 24 – 28, 2026, 4 nights`: the chosen stay. */
function summary(range: DateRange | null): string {
    if (range === null) {
        return "Choose your check-in, then your check-out.";
    }
    const dates = new Intl.DateTimeFormat("en-US", {
        dateStyle: "medium",
    }).formatRange(local(range.start), local(range.end));
    const nights = Math.round(
        (local(range.end).getTime() - local(range.start).getTime()) / DAY,
    );
    return `${dates}, ${nights} ${nights === 1 ? "night" : "nights"}`;
}

/** One month of the range: its heading, its grid, and the page buttons on the outer sides. */
function Month({ offset }: { offset: number }) {
    return (
        <div className={styles.month}>
            <div className={styles.header}>
                {offset === 0 ? (
                    <RangeCalendar.PrevButton
                        aria-label="Previous months"
                        className={styles.prevButton}
                    >
                        ‹
                    </RangeCalendar.PrevButton>
                ) : (
                    <span className={styles.spacer} />
                )}
                <RangeCalendar.Heading
                    offset={offset}
                    className={styles.heading}
                />
                {offset === 1 ? (
                    <RangeCalendar.NextButton
                        aria-label="Next months"
                        className={styles.nextButton}
                    >
                        ›
                    </RangeCalendar.NextButton>
                ) : (
                    <span className={styles.spacer} />
                )}
            </div>
            <RangeCalendar.Grid offset={offset} className={styles.grid}>
                <RangeCalendar.GridHeader>
                    {(weekday) => (
                        <RangeCalendar.HeaderCell
                            key={weekday.index}
                            weekday={weekday}
                            className={styles.headerCell}
                        />
                    )}
                </RangeCalendar.GridHeader>
                <RangeCalendar.GridBody>
                    {(week) => (
                        <RangeCalendar.Row
                            key={week.map(iso).join()}
                            week={week}
                        >
                            {(date) => (
                                <RangeCalendar.Cell
                                    key={iso(date)}
                                    date={date}
                                    className={styles.cell}
                                />
                            )}
                        </RangeCalendar.Row>
                    )}
                </RangeCalendar.GridBody>
            </RangeCalendar.Grid>
        </div>
    );
}

// A stay: two months side by side; the first day chosen is the check-in, hovering previews the
// stay, the second day chosen is the check-out (swapped when it comes first), Escape cancels a
// started stay (spec/calendar.md).
export default function TripDates() {
    const [stay, setStay] = useState<DateRange | null>(null);
    return (
        <RangeCalendar.Root
            value={stay}
            onValueChange={setStay}
            visibleMonths={2}
            locale="en-US"
            className={styles.root}
        >
            <div className={styles.months}>
                <Month offset={0} />
                <Month offset={1} />
            </div>
            <p role="status" className={styles.status}>
                {summary(stay)}
            </p>
        </RangeCalendar.Root>
    );
}
