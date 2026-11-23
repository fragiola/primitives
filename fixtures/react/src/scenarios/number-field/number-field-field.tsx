import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { NumberField } from "../../kit/ui/number-field.tsx";
import { useNumberOutput } from "./use-number-output.ts";

/** spec/number-field.md, `/number-field/field` */
export function NumberFieldField() {
    const output = useNumberOutput();
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
                <Field.Root name="guests">
                    <Field.Label>Guests</Field.Label>
                    <NumberField.Root
                        required
                        min={1}
                        max={8}
                        clampOnBlur={false}
                        locale="en-US"
                        onValueChange={output.onValueChange}
                    >
                        <NumberField.Group>
                            <NumberField.Input />
                        </NumberField.Group>
                    </NumberField.Root>
                    <Field.Description>Up to 8 guests.</Field.Description>
                    <Field.Error>Enter between 1 and 8 guests.</Field.Error>
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ ...output.values, form }} />
        </>
    );
}
