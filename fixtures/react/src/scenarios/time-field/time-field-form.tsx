import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { TimeField } from "../../kit/ui/date-field.tsx";

/** spec/date-field.md, `/time-field/form` */
export function TimeFieldForm() {
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
                <TimeField.Root
                    locale="en-US"
                    name="alarm"
                    required
                    hourCycle={24}
                >
                    <TimeField.Input aria-label="Alarm" />
                </TimeField.Root>
                <TimeField.Root
                    locale="en-US"
                    name="start"
                    readOnly
                    defaultValue={{
                        hour: 8,
                        minute: 0,
                        second: 0,
                        millisecond: 0,
                    }}
                >
                    <TimeField.Input aria-label="Start" />
                </TimeField.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
