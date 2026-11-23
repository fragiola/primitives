import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { isoDateTime } from "../../kit/iso.ts";
import { Output } from "../../kit/output.tsx";
import { DateField } from "../../kit/ui/date-field.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { useFieldOutput } from "./use-field-output.ts";

/** spec/date-field.md, `/date-field/date-time` */
export function DateFieldDateTime({ locale }: { locale?: string }) {
    const output = useFieldOutput(isoDateTime);
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
                <Field.Root name="meeting">
                    <Field.Label>Meeting</Field.Label>
                    <DateField.Root
                        locale={locale}
                        granularity="minute"
                        onValueChange={output.onValueChange}
                    >
                        <DateField.Input />
                    </DateField.Root>
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ ...output.values, form }} />
        </>
    );
}
