import {
    type TimeZone,
    timeZone,
    toZoned,
} from "@fragiola/primitives/time-zone";
import type { DateFieldValue } from "@fragiola/primitives-react/date-field";
import { useMemo, useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import {
    DateField,
    DateRangeField,
    RangeEnds,
} from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";

/** A zoned value's ISO text (`none` with none). */
function zonedIso(zone: TimeZone, value: DateFieldValue | null): string {
    return value !== null && "offset" in value
        ? zone.toIso(value as Parameters<TimeZone["toIso"]>[0])
        : "none";
}

/** One zoned DateField in a Field, its segments rendered as every scenario renders them. */
function Zoned({
    label,
    ...props
}: { label: string } & React.ComponentProps<typeof DateField.Root>) {
    return (
        <Field.Root>
            <Field.Label>{label}</Field.Label>
            <DateField.Root locale="en-US" granularity="minute" {...props}>
                <DateField.Input>
                    {(segment) => (
                        <DateField.Segment
                            key={segment.index}
                            segment={segment}
                        />
                    )}
                </DateField.Input>
            </DateField.Root>
        </Field.Root>
    );
}

/** spec/time-zones.md, `/time-zones/field` */
export function TimeZonesField() {
    const newYork = useMemo(() => timeZone("America/New_York"), []);
    const london = useMemo(() => timeZone("Europe/London"), []);
    const departureDefault = useMemo(
        () =>
            toZoned(
                {
                    year: 2026,
                    month: 11,
                    day: 1,
                    hour: 1,
                    minute: 30,
                    second: 0,
                    millisecond: 0,
                },
                "America/New_York",
                "earlier",
            ),
        [],
    );
    const [departure, setDeparture] = useState<string>();
    const [back, setBack] = useState<string>();
    const [stay, setStay] = useState<string>();
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-3"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Zoned
                    label="Departure"
                    name="departure"
                    timeZone={newYork}
                    defaultValue={departureDefault}
                    onValueChange={(value) =>
                        setDeparture(zonedIso(newYork, value))
                    }
                />
                <Zoned
                    label="Return"
                    name="return"
                    timeZone={newYork}
                    disambiguation="later"
                    onValueChange={(value) => setBack(zonedIso(newYork, value))}
                />
                <Zoned
                    label="Arrival"
                    name="arrival"
                    timeZone={london}
                    hideTimeZone
                />
                <Field.Root>
                    <Field.Label>Stay</Field.Label>
                    <DateRangeField.Root
                        locale="en-US"
                        granularity="minute"
                        timeZone={newYork}
                        startName="from"
                        endName="to"
                        onValueChange={(value) =>
                            setStay(
                                value === null
                                    ? "none"
                                    : `${zonedIso(newYork, value.start)}/${zonedIso(newYork, value.end)}`,
                            )
                        }
                    >
                        <RangeEnds start="Start" end="End" />
                    </DateRangeField.Root>
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ departure, return: back, stay, form }} />
        </>
    );
}
