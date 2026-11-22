import type { PlainDate } from "@fragiola/primitives-react/calendar";
import { DatePicker as Picker } from "@fragiola/primitives-react/date-picker";
import {
    type DateRange,
    DateRangePicker as RangePicker,
} from "@fragiola/primitives-react/date-range-picker";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { iso, isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";

const NOV_30: PlainDate = { year: 2026, month: 11, day: 30 };

export function DatePickerForm() {
    const [arrival, setArrival] = useState<PlainDate | null>(null);
    const [stay, setStay] = useState<DateRange | null>(null);
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-4"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Picker.Root
                    name="arrival"
                    required
                    value={arrival}
                    onValueChange={setArrival}
                    locale="en-US"
                >
                    <DatePicker.Trigger>
                        Arrival: {iso(arrival) ?? "none"}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose date">
                                <Calendar.Root>
                                    <MonthView />
                                </Calendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </Picker.Root>
                <RangePicker.Root
                    name="stay"
                    required
                    value={stay}
                    onValueChange={setStay}
                    locale="en-US"
                >
                    <DatePicker.Trigger>
                        Stay: {isoRange(stay) ?? "none"}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose dates">
                                <RangeCalendar.Root>
                                    <MonthView />
                                </RangeCalendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </RangePicker.Root>
                <Picker.Root
                    name="departure"
                    readOnly
                    value={NOV_30}
                    locale="en-US"
                >
                    <DatePicker.Trigger>
                        Departure: {iso(NOV_30)}
                    </DatePicker.Trigger>
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Departure date">
                                <Calendar.Root>
                                    <MonthView />
                                </Calendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </Picker.Root>
                <Picker.Root name="return" disabled locale="en-US">
                    <DatePicker.Trigger>Return: none</DatePicker.Trigger>
                </Picker.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
