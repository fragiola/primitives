import type { PlainDate } from "@fragiola/primitives-react/calendar";
import { DatePicker as Picker } from "@fragiola/primitives-react/date-picker";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { iso } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";

/** spec/calendar.md, `/date-picker/mixed-form`: a picker before a native required input. */
export function DatePickerMixedForm() {
    const [arrival, setArrival] = useState<PlainDate | null>(null);
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
                <label className="flex flex-col gap-1 text-sm">
                    Guest name
                    <input name="guest" required />
                </label>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ form }} />
        </>
    );
}
