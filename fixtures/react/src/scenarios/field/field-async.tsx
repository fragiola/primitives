import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { checkUsername } from "./validators.ts";

export function FieldAsync() {
    const [resolved, setResolved] = useState<string>();
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
                <Field.Root
                    name="username"
                    validationMode="onChange"
                    validate={(value) => checkUsername(value, setResolved)}
                >
                    <Field.Label>Username</Field.Label>
                    <Field.Control />
                    <Field.Error />
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ resolved, form }} />
        </>
    );
}
