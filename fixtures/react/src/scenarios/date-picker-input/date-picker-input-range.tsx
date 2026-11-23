import { isoRange } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { MonthView, RangeCalendar } from "../../kit/ui/calendar.tsx";
import { DatePicker } from "../../kit/ui/date-picker.tsx";
import {
    DateRangePickerInput,
    TypedRange,
} from "../../kit/ui/date-picker-input.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { useFieldOutput } from "../date-field/use-field-output.ts";

/** spec/calendar.md, `/date-picker-input/range` */
export function DatePickerInputRange() {
    const output = useFieldOutput(isoRange);
    return (
        <>
            <Field.Root>
                <Field.Label>Stay</Field.Label>
                <DateRangePickerInput.Root
                    locale="en-US"
                    onValueChange={output.onValueChange}
                >
                    <TypedRange
                        start="Check-in"
                        end="Check-out"
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
            <Output values={output.values} />
        </>
    );
}
