import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { Calendar, MonthView } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import { DatePickerInput, TypedDate } from "../../kit/ui/date-picker-input.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { useFieldOutput } from "../date-field/use-field-output.ts";

/** spec/calendar.md, `/date-picker-input/date-time` */
export function DatePickerInputDateTime() {
    const output = useFieldOutput(isoDateTime);
    return (
        <>
            <Field.Root>
                <Field.Label>Meeting</Field.Label>
                <DatePickerInput.Root
                    locale="en-US"
                    granularity="minute"
                    onValueChange={output.onValueChange}
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
            <Output values={output.values} />
        </>
    );
}
