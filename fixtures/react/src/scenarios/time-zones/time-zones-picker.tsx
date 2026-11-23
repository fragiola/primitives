import {
    type TimeZone,
    timeZone,
    toZoned,
} from "@fragiola/primitives/time-zone";
import { useMemo, useState } from "react";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import {
    DatePickerInput,
    DateRangePickerInput,
    TypedDate,
    TypedRange,
} from "../../kit/ui/date-picker-input.tsx";
import { Field } from "../../kit/ui/field.tsx";

type Zoned = Parameters<TimeZone["toIso"]>[0];

/** spec/time-zones.md, `/time-zones/picker` */
export function TimeZonesPicker() {
    const newYork = useMemo(() => timeZone("America/New_York"), []);
    const meetingDefault = useMemo(
        () =>
            toZoned(
                {
                    year: 2026,
                    month: 3,
                    day: 7,
                    hour: 2,
                    minute: 30,
                    second: 0,
                    millisecond: 0,
                },
                "America/New_York",
            ),
        [],
    );
    const [meeting, setMeeting] = useState<string>();
    const [trip, setTrip] = useState<string>();
    return (
        <>
            <div className="flex flex-col items-start gap-3">
                <Field.Root name="meeting">
                    <Field.Label>Meeting</Field.Label>
                    <DatePickerInput.Root
                        locale="en-US"
                        granularity="minute"
                        timeZone={newYork}
                        defaultValue={meetingDefault}
                        onValueChange={(value) =>
                            setMeeting(
                                value === null
                                    ? "none"
                                    : newYork.toIso(value as Zoned),
                            )
                        }
                    >
                        <TypedDate trigger="Choose date" />
                        <DatePicker.Portal>
                            <DatePicker.Positioner sideOffset={4}>
                                <DatePicker.Popup aria-label="Choose date">
                                    <Calendar.Root>
                                        <MonthView />
                                    </Calendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </DatePickerInput.Root>
                </Field.Root>
                <Field.Root name="trip">
                    <Field.Label>Trip</Field.Label>
                    <DateRangePickerInput.Root
                        locale="en-US"
                        granularity="minute"
                        timeZone={newYork}
                        onValueChange={(value) =>
                            setTrip(
                                value === null
                                    ? "none"
                                    : `${newYork.toIso(value.start as Zoned)}/${newYork.toIso(value.end as Zoned)}`,
                            )
                        }
                    >
                        <TypedRange
                            start="Start"
                            end="End"
                            trigger="Choose dates"
                        />
                        <DatePicker.Portal>
                            <DatePicker.Positioner sideOffset={4}>
                                <DatePicker.Popup aria-label="Choose dates">
                                    <RangeCalendar.Root>
                                        <MonthView />
                                    </RangeCalendar.Root>
                                </DatePicker.Popup>
                            </DatePicker.Positioner>
                        </DatePicker.Portal>
                    </DateRangePickerInput.Root>
                </Field.Root>
            </div>
            <Output values={{ meeting, trip }} />
        </>
    );
}
