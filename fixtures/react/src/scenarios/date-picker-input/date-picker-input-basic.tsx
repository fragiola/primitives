import type { ChangeDetails } from "@fragiola/primitives-react/date-picker-input";
import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import { DatePickerInput, TypedDate } from "../../kit/ui/date-picker-input.tsx";
import { Field } from "../../kit/ui/field.tsx";

/** spec/calendar.md, `/date-picker-input/basic` */
export function DatePickerInputBasic() {
    const [last, setLast] = useState<{ value: string; reason: string }>();
    const [changes, setChanges] = useState(0);
    const [form, setForm] = useState<string>();
    return (
        <>
            <form
                className="flex flex-col items-start gap-2"
                onSubmit={(event) => {
                    event.preventDefault();
                    setForm(formEntries(event.currentTarget));
                }}
            >
                <Field.Root name="arrival">
                    <Field.Label>Arrival</Field.Label>
                    <DatePickerInput.Root
                        locale="en-US"
                        required
                        min={{ year: 2026, month: 11, day: 10 }}
                        onValueChange={(value, details: ChangeDetails) => {
                            setChanges((count) => count + 1);
                            setLast({
                                value: isoDateTime(value) ?? "none",
                                reason: details.reason,
                            });
                        }}
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
                <button type="submit">Submit</button>
            </form>
            <Output
                values={{
                    value: last?.value,
                    reason: last?.reason,
                    changes,
                    form,
                }}
            />
        </>
    );
}
