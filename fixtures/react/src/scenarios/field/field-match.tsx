import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { outOfRange } from "./validators.ts";

export function FieldMatch() {
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
                <Field.Root name="age">
                    <Field.Label>Age</Field.Label>
                    <Field.Control type="number" required min="18" max="120" />
                    <Field.Error match="valueMissing">
                        Enter your age.
                    </Field.Error>
                    <Field.Error match={outOfRange}>
                        Enter an age from 18 to 120.
                    </Field.Error>
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ form }} />
        </>
    );
}
