import { persian } from "@fragiola/primitives/calendar-systems";
import { Calendar, type PlainDate } from "@fragiola/primitives-react/calendar";
import {
    DateField,
    type DateFieldValue,
} from "@fragiola/primitives-react/date-field";
import { Field } from "@fragiola/primitives-react/field";
import { useState } from "react";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-20`: the ISO date, whatever calendar shows it. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};
/** The date part of a field's value (a day granularity gives a date already). */
const dayOf = (value: DateFieldValue | null): PlainDate | null =>
    value === null
        ? null
        : { year: value.year, month: value.month, day: value.day };

// A calendar and a date field in the Persian calendar, right to left: `calendar={persian}` makes
// the grid's months, its names and Page Up / Down the system's, and the field's segments its
// year, month and day, while both keep one ISO date (spec/calendar-systems.md).
export default function PersianCalendar() {
    const [date, setDate] = useState<PlainDate | null>(today);
    return (
        <div className={styles.example}>
            <div dir="rtl" className={styles.panel}>
                <Calendar.Root
                    calendar={persian}
                    locale="fa-IR"
                    value={date}
                    onValueChange={setDate}
                    className={styles.calendar.root}
                >
                    <div className={styles.header}>
                        <Calendar.PrevButton
                            aria-label="Previous month"
                            className={styles.calendar.prevButton}
                        >
                            ›
                        </Calendar.PrevButton>
                        <Calendar.Heading className={styles.calendar.heading} />
                        <Calendar.NextButton
                            aria-label="Next month"
                            className={styles.calendar.nextButton}
                        >
                            ‹
                        </Calendar.NextButton>
                    </div>
                    <Calendar.Grid className={styles.calendar.grid}>
                        <Calendar.GridHeader>
                            {(weekday) => (
                                <Calendar.HeaderCell
                                    key={weekday.index}
                                    weekday={weekday}
                                    className={styles.calendar.headerCell}
                                />
                            )}
                        </Calendar.GridHeader>
                        <Calendar.GridBody>
                            {(week) => (
                                <Calendar.Row
                                    key={iso(week[0] ?? today)}
                                    week={week}
                                >
                                    {(day) => (
                                        <Calendar.Cell
                                            key={iso(day)}
                                            date={day}
                                            className={styles.calendar.cell}
                                        />
                                    )}
                                </Calendar.Row>
                            )}
                        </Calendar.GridBody>
                    </Calendar.Grid>
                </Calendar.Root>
                <Field.Root className={styles.field.root}>
                    <Field.Label className={styles.field.label}>
                        Date
                    </Field.Label>
                    <DateField.Root
                        calendar={persian}
                        locale="fa-IR"
                        value={date}
                        onValueChange={(value) => setDate(dayOf(value))}
                        className={styles.dateField.root}
                    >
                        <DateField.Input className={styles.dateField.input}>
                            {(segment) => (
                                <DateField.Segment
                                    key={segment.index}
                                    segment={segment}
                                    className={styles.dateField.segment}
                                />
                            )}
                        </DateField.Input>
                    </DateField.Root>
                </Field.Root>
            </div>
            <p role="status" className={styles.status}>
                {date === null ? "ISO: none" : `ISO: ${iso(date)}`}
            </p>
        </div>
    );
}
