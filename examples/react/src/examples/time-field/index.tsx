import { Field } from "@fragiola/primitives-react/field";
import {
    type PlainTime,
    TimeField,
} from "@fragiola/primitives-react/time-field";
import { useState } from "react";
import { styles } from "./styles.ts";

const time = (hour: number): PlainTime => ({
    hour,
    minute: 0,
    second: 0,
    millisecond: 0,
});
const OPENS = time(9);
const CLOSES = time(17);

// A meeting time typed in parts: the hour, the minutes and AM or PM (typed by its first letter,
// or toggled with the arrows). Office hours bound it: a time outside them is invalid, and the
// field submits the ISO time itself (spec/date-field.md, TimeField).
export default function MeetingTime() {
    const [value, setValue] = useState<PlainTime | null>(null);
    const [saved, setSaved] = useState<string | null>(null);
    return (
        <form
            className={styles.form}
            onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                setSaved(String(data.get("meeting")));
            }}
        >
            <Field.Root name="meeting" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Meeting time
                </Field.Label>
                <TimeField.Root
                    value={value}
                    onValueChange={setValue}
                    min={OPENS}
                    max={CLOSES}
                    required
                    locale="en-US"
                    className={styles.root}
                >
                    <TimeField.Input className={styles.input}>
                        {(segment) => (
                            <TimeField.Segment
                                key={segment.index}
                                segment={segment}
                                className={styles.segment}
                            />
                        )}
                    </TimeField.Input>
                </TimeField.Root>
                <Field.Description className={styles.field.description}>
                    Office hours: 9 AM to 5 PM.
                </Field.Description>
                <Field.Error
                    match={(validity) =>
                        validity.rangeUnderflow || validity.rangeOverflow
                    }
                    className={styles.field.error}
                >
                    Choose a time within office hours.
                </Field.Error>
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Enter a time.
                </Field.Error>
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Schedule
            </button>
            <p role="status" className={styles.status}>
                {saved === null ? "" : `Scheduled: ${saved}`}
            </p>
        </form>
    );
}
