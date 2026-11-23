import { Calendar } from "@fragiola/primitives-react/calendar";
import {
    type DateFieldValue,
    DatePicker,
    DatePickerInput,
    type PlainDate,
} from "@fragiola/primitives-react/date-picker-input";
import { Field } from "@fragiola/primitives-react/field";
import { useState } from "react";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a row key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A date picker you can also type into: the segments take the departure date, the button beside
// them opens the calendar on it, and choosing a day fills the segments. A typed day before today is
// no value (the segments show it invalid) and leaves the field empty; the picker submits the day
// itself (spec/calendar.md, "Typed input").
export default function DepartureDate() {
    const [value, setValue] = useState<DateFieldValue | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(String(data.get("departure")));
            }}
        >
            <Field.Root name="departure" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Departure
                </Field.Label>
                <DatePickerInput.Root
                    value={value}
                    onValueChange={setValue}
                    min={today}
                    required
                    locale="en-US"
                >
                    <div className={styles.typed.group}>
                        <DatePickerInput.Segments className={styles.input}>
                            {(segment) => (
                                <DatePickerInput.Segment
                                    key={segment.index}
                                    segment={segment}
                                    className={styles.segment}
                                />
                            )}
                        </DatePickerInput.Segments>
                        <DatePicker.Trigger
                            aria-label="Choose date"
                            className={styles.typed.trigger}
                        >
                            <span aria-hidden="true">▾</span>
                        </DatePicker.Trigger>
                    </div>
                    <DatePicker.Portal>
                        <DatePicker.Positioner
                            sideOffset={4}
                            className={styles.picker.positioner}
                        >
                            <DatePicker.Popup
                                aria-label="Departure date"
                                className={styles.picker.popup}
                            >
                                <Calendar.Root className={styles.calendar.root}>
                                    <div className={styles.header}>
                                        <Calendar.PrevButton
                                            aria-label="Previous month"
                                            className={
                                                styles.calendar.prevButton
                                            }
                                        >
                                            ‹
                                        </Calendar.PrevButton>
                                        <Calendar.Heading
                                            className={styles.calendar.heading}
                                        />
                                        <Calendar.NextButton
                                            aria-label="Next month"
                                            className={
                                                styles.calendar.nextButton
                                            }
                                        >
                                            ›
                                        </Calendar.NextButton>
                                    </div>
                                    <Calendar.Grid
                                        className={styles.calendar.grid}
                                    >
                                        <Calendar.GridHeader>
                                            {(weekday) => (
                                                <Calendar.HeaderCell
                                                    key={weekday.index}
                                                    weekday={weekday}
                                                    className={
                                                        styles.calendar
                                                            .headerCell
                                                    }
                                                />
                                            )}
                                        </Calendar.GridHeader>
                                        <Calendar.GridBody>
                                            {(week) => (
                                                <Calendar.Row
                                                    key={iso(week[0] ?? today)}
                                                    week={week}
                                                >
                                                    {(date) => (
                                                        <Calendar.Cell
                                                            key={iso(date)}
                                                            date={date}
                                                            className={
                                                                styles.calendar
                                                                    .cell
                                                            }
                                                        />
                                                    )}
                                                </Calendar.Row>
                                            )}
                                        </Calendar.GridBody>
                                    </Calendar.Grid>
                                </Calendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </DatePickerInput.Root>
                <Field.Error className={styles.field.error}>
                    Enter a departure date from today on.
                </Field.Error>
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Save
            </button>
            <p role="status" className={styles.status}>
                {saved === null ? "" : `Saved: ${saved}`}
            </p>
        </form>
    );
}
