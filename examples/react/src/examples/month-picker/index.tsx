import { Field } from "@fragiola/primitives-react/field";
import { MonthCalendar } from "@fragiola/primitives-react/month-calendar";
import {
    MonthPicker,
    type PlainYearMonth,
} from "@fragiola/primitives-react/month-picker";
import { useState } from "react";
import { styles } from "./styles.ts";

/** `2026-11`: a row key. */
const key = (month: { year: number; month?: number }) =>
    `${month.year}-${month.month ?? 0}`;
/** `11/2026`: what the trigger shows, as a card prints it. */
const format = (month: PlainYearMonth) =>
    `${String(month.month).padStart(2, "0")}/${month.year}`;
const now = new Date();
const thisMonth: PlainYearMonth = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
};

// A card's expiry: a required month picker in a field. The popup holds the months of a year (the
// past ones disabled), choosing one closes it and returns focus to the trigger, and the picker
// submits the month as ISO `2026-11`; saving with no month shows the error and focuses the trigger
// (spec/month-calendar.md, "Forms").
export default function CardExpiry() {
    const [expiry, setExpiry] = useState<PlainYearMonth | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(`expiry=${String(data.get("expiry"))}`);
            }}
        >
            <Field.Root name="expiry" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Expiry date
                </Field.Label>
                <MonthPicker.Root
                    value={expiry}
                    onValueChange={setExpiry}
                    min={thisMonth}
                    required
                    locale="en-US"
                >
                    <MonthPicker.Trigger className={styles.picker.trigger}>
                        {expiry ? format(expiry) : "Choose a month"}
                    </MonthPicker.Trigger>
                    <MonthPicker.Portal>
                        <MonthPicker.Positioner
                            sideOffset={4}
                            className={styles.picker.positioner}
                        >
                            <MonthPicker.Popup
                                aria-label="Expiry month"
                                className={styles.picker.popup}
                            >
                                <MonthCalendar.Root
                                    className={styles.calendar.root}
                                >
                                    <div className={styles.header}>
                                        <MonthCalendar.PrevButton
                                            aria-label="Previous year"
                                            className={
                                                styles.calendar.prevButton
                                            }
                                        >
                                            ‹
                                        </MonthCalendar.PrevButton>
                                        <MonthCalendar.Heading
                                            className={styles.calendar.heading}
                                        />
                                        <MonthCalendar.NextButton
                                            aria-label="Next year"
                                            className={
                                                styles.calendar.nextButton
                                            }
                                        >
                                            ›
                                        </MonthCalendar.NextButton>
                                    </div>
                                    <MonthCalendar.Grid
                                        className={styles.calendar.grid}
                                    >
                                        <MonthCalendar.GridBody>
                                            {(row) => (
                                                <MonthCalendar.Row
                                                    key={key(
                                                        row[0] ?? thisMonth,
                                                    )}
                                                    row={row}
                                                >
                                                    {(month) => (
                                                        <MonthCalendar.Cell
                                                            key={key(month)}
                                                            value={month}
                                                            className={
                                                                styles.calendar
                                                                    .cell
                                                            }
                                                        />
                                                    )}
                                                </MonthCalendar.Row>
                                            )}
                                        </MonthCalendar.GridBody>
                                    </MonthCalendar.Grid>
                                </MonthCalendar.Root>
                            </MonthPicker.Popup>
                        </MonthPicker.Positioner>
                    </MonthPicker.Portal>
                </MonthPicker.Root>
                <Field.Error className={styles.field.error}>
                    Choose the card's expiry month.
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
