import type {
    ChangeDetails,
    PlainDate,
} from "@fragiola/primitives-react/date-picker-input";
import { useState } from "react";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar } from "../../kit/ui/calendar.tsx";
import { CalendarViews } from "../../kit/ui/calendar-view.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import { DatePickerInput, TypedDate } from "../../kit/ui/date-picker-input.tsx";
import { Field } from "../../kit/ui/field.tsx";

const MIN: PlainDate = { year: 2025, month: 1, day: 1 };

/** spec/month-calendar.md, `/calendar-view/typed` */
export function CalendarViewTyped() {
    const [value, setValue] = useState<string>();
    const [changes, setChanges] = useState(0);
    return (
        <>
            <Field.Root>
                <Field.Label>Arrival</Field.Label>
                <DatePickerInput.Root
                    locale="en-US"
                    min={MIN}
                    onValueChange={(next, _details: ChangeDetails) => {
                        setChanges((count) => count + 1);
                        setValue(isoDateTime(next) ?? "none");
                    }}
                >
                    <TypedDate trigger="Choose date" />
                    <DatePicker.Portal>
                        <DatePicker.Positioner sideOffset={4}>
                            <DatePicker.Popup aria-label="Choose date">
                                <Calendar.Root>
                                    <CalendarViews />
                                </Calendar.Root>
                            </DatePicker.Popup>
                        </DatePicker.Positioner>
                    </DatePicker.Portal>
                </DatePickerInput.Root>
            </Field.Root>
            <Output values={{ value, changes }} />
        </>
    );
}
