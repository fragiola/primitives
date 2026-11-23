import {
    DateField,
    type DateFieldValue,
    type PlainDate,
} from "@fragiola/primitives-react/date-field";
import { Field } from "@fragiola/primitives-react/field";
import { useState } from "react";
import { styles } from "./styles.ts";

const now = new Date();
const today: PlainDate = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
};

// A birth date typed in parts: month, day and year, each a spinbutton the keys step and digits
// fill (moving on by themselves). A date after today is invalid, and saving with none shows the
// error; the field submits the ISO date itself (spec/date-field.md).
export default function BirthDate() {
    const [value, setValue] = useState<DateFieldValue | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(String(data.get("birth-date")));
            }}
        >
            <Field.Root name="birth-date" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Birth date
                </Field.Label>
                <DateField.Root
                    value={value}
                    onValueChange={setValue}
                    max={today}
                    required
                    locale="en-US"
                    className={styles.root}
                >
                    <DateField.Input className={styles.input}>
                        {(segment) => (
                            <DateField.Segment
                                key={segment.index}
                                segment={segment}
                                className={styles.segment}
                            />
                        )}
                    </DateField.Input>
                </DateField.Root>
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Enter your birth date.
                </Field.Error>
                <Field.Error
                    match="rangeOverflow"
                    className={styles.field.error}
                >
                    The date cannot be in the future.
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
