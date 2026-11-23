import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { DateField } from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";

/** spec/date-field.md, `/date-field/form` */
export function DateFieldForm() {
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
                <Field.Root name="birth">
                    <Field.Label>Birth date</Field.Label>
                    <DateField.Root locale="en-US" required>
                        <DateField.Input />
                    </DateField.Root>
                </Field.Root>
                <DateField.Root
                    locale="en-US"
                    name="start"
                    readOnly
                    defaultValue={{ year: 2026, month: 11, day: 20 }}
                >
                    <DateField.Input aria-label="Start" />
                </DateField.Root>
                <DateField.Root
                    locale="en-US"
                    name="end"
                    disabled
                    defaultValue={{ year: 2026, month: 11, day: 27 }}
                >
                    <DateField.Input aria-label="End" />
                </DateField.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
