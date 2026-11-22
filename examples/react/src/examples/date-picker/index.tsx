import { Calendar } from "@fragiola/primitives-react/calendar";
import {
    DatePicker,
    type PlainDate,
} from "@fragiola/primitives-react/date-picker";
import { Field } from "@fragiola/primitives-react/field";
import { useState } from "react";
import { styles } from "./styles.ts";

const pad = (value: number) => String(value).padStart(2, "0");
/** `2026-11-24`: a row key. */
const iso = (date: PlainDate) =>
    `${date.year}-${pad(date.month)}-${pad(date.day)}`;
/** `Nov 24, 2026`: what the trigger shows. */
const format = (date: PlainDate) =>
    new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(
        new Date(date.year, date.month - 1, date.day),
    );
const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A booking form: a required date picker in a field. The trigger opens a calendar on today, past
// days are disabled, choosing a day closes it and returns focus to the trigger, and the picker
// submits the day itself; booking with no day shows the error and focuses the trigger
// (spec/calendar.md, "Forms").
export default function BookingForm() {
    const [checkIn, setCheckIn] = useState<PlainDate | null>(null);
    const [booked, setBooked] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setBooked(String(data.get("check-in")));
            }}
        >
            <Field.Root name="check-in" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Check-in
                </Field.Label>
                <DatePicker.Root
                    value={checkIn}
                    onValueChange={setCheckIn}
                    min={today}
                    required
                    locale="en-US"
                >
                    <DatePicker.Trigger className={styles.picker.trigger}>
                        {checkIn ? format(checkIn) : "Choose a date"}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner
                            sideOffset={4}
                            className={styles.picker.positioner}
                        >
                            <DatePicker.Popup
                                aria-label="Check-in date"
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
                </DatePicker.Root>
                <Field.Description className={styles.field.description}>
                    We hold the room until noon.
                </Field.Description>
                <Field.Error className={styles.field.error}>
                    Choose a check-in date.
                </Field.Error>
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Book
            </button>
            <p role="status" className={styles.status}>
                {booked === null ? "" : `Booked: ${booked}`}
            </p>
        </form>
    );
}
