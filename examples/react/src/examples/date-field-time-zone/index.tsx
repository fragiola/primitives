import {
    formatTimeZoneName,
    timeZone,
    toIsoZoned,
    toTimeZone,
    toZoned,
    type ZonedDateTime,
} from "@fragiola/primitives/time-zone";
import {
    DateField,
    type DateFieldValue,
} from "@fragiola/primitives-react/date-field";
import { Field } from "@fragiola/primitives-react/field";
import { useState } from "react";
import { styles } from "./styles.ts";

const newYork = timeZone("America/New_York");
/** The zones the meeting is shown in, besides the field's. */
const OTHERS = [
    { city: "London", zone: "Europe/London" },
    { city: "Kolkata", zone: "Asia/Kolkata" },
];
const pad = (value: number) => String(value).padStart(2, "0");
const DAY = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
});
/** `Tue, Nov 24, 14:00 GMT`: a zoned value's wall time, read in its own zone. */
const wallTime = (value: ZonedDateTime) =>
    `${DAY.format(Date.UTC(value.year, value.month - 1, value.day))}, ${pad(value.hour)}:${pad(value.minute)} ${formatTimeZoneName("en-US", value)}`;
/** A field's value is a `ZonedDateTime` once it has a time zone. */
const zoned = (value: DateFieldValue | null) =>
    value !== null && "offset" in value ? (value as ZonedDateTime) : null;

// A meeting typed in New York time: with `timeZone`, the field's value is a ZonedDateTime and its
// zone's name is a segment ("EST", then "EDT" once the clocks change). The other zones show the
// same instant, so a date after New York's spring change keeps 9:00 there while London and
// Kolkata move (spec/time-zones.md).
export default function MeetingTimeZones() {
    const [meeting, setMeeting] = useState<ZonedDateTime | null>(() =>
        toZoned(
            {
                year: 2026,
                month: 11,
                day: 24,
                hour: 9,
                minute: 0,
                second: 0,
                millisecond: 0,
            },
            newYork.id,
        ),
    );
    return (
        <div className={styles.example}>
            <Field.Root className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Meeting (New York)
                </Field.Label>
                <DateField.Root
                    timeZone={newYork}
                    granularity="minute"
                    locale="en-US"
                    value={meeting}
                    onValueChange={(value) => setMeeting(zoned(value))}
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
            </Field.Root>
            <dl className={styles.zones}>
                {OTHERS.map(({ city, zone }) => (
                    <div key={zone} className={styles.row}>
                        <dt className={styles.zone}>{city}</dt>
                        <dd className={styles.time}>
                            {meeting === null
                                ? "–"
                                : wallTime(toTimeZone(meeting, zone))}
                        </dd>
                    </div>
                ))}
            </dl>
            <p role="status" className={styles.status}>
                {meeting === null ? "ISO: none" : `ISO: ${toIsoZoned(meeting)}`}
            </p>
        </div>
    );
}
