import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { DateRangeField, RangeEnds } from "../../kit/ui/date-field.tsx";

/** spec/date-range-field.md, `/date-range-field/form` */
export function DateRangeFieldForm() {
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
                <DateRangeField.Root
                    locale="en-US"
                    startName="checkin"
                    endName="checkout"
                    required
                    min={{ year: 2026, month: 11, day: 20 }}
                >
                    <RangeEnds start="Check-in" end="Check-out" />
                </DateRangeField.Root>
                <DateRangeField.Root
                    locale="en-US"
                    startName="from"
                    endName="to"
                    readOnly
                    defaultValue={{
                        start: { year: 2026, month: 11, day: 20 },
                        end: { year: 2026, month: 11, day: 22 },
                    }}
                >
                    <RangeEnds start="From" end="To" />
                </DateRangeField.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
