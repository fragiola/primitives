import {
    DateRangeField,
    type DateRangeFieldValue,
    type PlainDate,
} from "@fragiola/primitives-react/date-range-field";
import { Field } from "@fragiola/primitives-react/field";
import { useState } from "react";
import { styles } from "./styles.ts";

const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A booking range typed in parts: the check-in date, then the check-out date, the typing moving on
// from one to the other. A day before today is invalid, and so is a check-out before the
// check-in; the field submits both ISO dates itself (spec/date-range-field.md).
export default function StayDates() {
    const [value, setValue] = useState<DateRangeFieldValue | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(`${data.get("check-in")} → ${data.get("check-out")}`);
            }}
        >
            <Field.Root className={styles.field.root}>
                <Field.Label className={styles.field.label}>Stay</Field.Label>
                <DateRangeField.Root
                    value={value}
                    onValueChange={setValue}
                    min={today}
                    required
                    startName="check-in"
                    endName="check-out"
                    locale="en-US"
                    className={styles.root}
                >
                    <div className={styles.ends}>
                        <DateRangeField.Input
                            range="start"
                            aria-label="Check-in"
                            className={styles.input}
                        >
                            {(segment) => (
                                <DateRangeField.Segment
                                    key={segment.index}
                                    segment={segment}
                                    className={styles.segment}
                                />
                            )}
                        </DateRangeField.Input>
                        <span aria-hidden="true" className={styles.separator}>
                            –
                        </span>
                        <DateRangeField.Input
                            range="end"
                            aria-label="Check-out"
                            className={styles.input}
                        >
                            {(segment) => (
                                <DateRangeField.Segment
                                    key={segment.index}
                                    segment={segment}
                                    className={styles.segment}
                                />
                            )}
                        </DateRangeField.Input>
                    </div>
                </DateRangeField.Root>
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Enter both dates.
                </Field.Error>
                <Field.Error
                    match="rangeUnderflow"
                    className={styles.field.error}
                >
                    The stay cannot start in the past.
                </Field.Error>
                <Field.Error
                    match="rangeOverflow"
                    className={styles.field.error}
                >
                    Check-out cannot be before check-in.
                </Field.Error>
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Book
            </button>
            <p role="status" className={styles.status}>
                {saved === null ? "" : `Booked: ${saved}`}
            </p>
        </form>
    );
}
