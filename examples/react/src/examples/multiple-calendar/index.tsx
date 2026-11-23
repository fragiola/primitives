import {
    MultipleCalendar,
    type PlainDate,
} from "@fragiola/primitives-react/multiple-calendar";
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

// Several dates in one calendar: press the days you are available (from today on, five at most);
// a chosen day pressed again is removed. The calendar renders one hidden input per day, so the
// form submits `days` once per date (spec/calendar.md, "Multiple dates").
export default function Availability() {
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const days = new FormData(event.currentTarget).getAll("days");
                setSaved(days.length === 0 ? "no day" : days.join(", "));
            }}
        >
            <p id="availability-hint" className={styles.hint}>
                Choose up to five days you are available.
            </p>
            <MultipleCalendar.Root
                name="days"
                maxSelected={5}
                min={today}
                locale="en-US"
                className={styles.calendar.root}
            >
                <div className={styles.header}>
                    <MultipleCalendar.PrevButton
                        aria-label="Previous month"
                        className={styles.calendar.prevButton}
                    >
                        ‹
                    </MultipleCalendar.PrevButton>
                    <MultipleCalendar.Heading
                        className={styles.calendar.heading}
                    />
                    <MultipleCalendar.NextButton
                        aria-label="Next month"
                        className={styles.calendar.nextButton}
                    >
                        ›
                    </MultipleCalendar.NextButton>
                </div>
                <MultipleCalendar.Grid
                    aria-describedby="availability-hint"
                    className={styles.calendar.grid}
                >
                    <MultipleCalendar.GridHeader>
                        {(weekday) => (
                            <MultipleCalendar.HeaderCell
                                key={weekday.index}
                                weekday={weekday}
                                className={styles.calendar.headerCell}
                            />
                        )}
                    </MultipleCalendar.GridHeader>
                    <MultipleCalendar.GridBody>
                        {(week) => (
                            <MultipleCalendar.Row
                                key={iso(week[0] ?? today)}
                                week={week}
                            >
                                {(date) => (
                                    <MultipleCalendar.Cell
                                        key={iso(date)}
                                        date={date}
                                        className={styles.calendar.cell}
                                    />
                                )}
                            </MultipleCalendar.Row>
                        )}
                    </MultipleCalendar.GridBody>
                </MultipleCalendar.Grid>
            </MultipleCalendar.Root>
            <button type="submit" className={styles.submit}>
                Save
            </button>
            <p role="status" className={styles.status}>
                {saved === null ? "" : `Saved: ${saved}`}
            </p>
        </form>
    );
}
