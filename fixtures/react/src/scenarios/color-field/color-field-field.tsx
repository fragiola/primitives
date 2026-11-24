import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { ColorField } from "../../kit/ui/color-field.tsx";
import { Field } from "../../kit/ui/field.tsx";

/** spec/color-field.md, `/color-field/field` */
export function ColorFieldField() {
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
                <Field.Root name="brand">
                    <Field.Label>Brand color</Field.Label>
                    <ColorField.Root defaultValue="#ff0000">
                        <ColorField.Input />
                    </ColorField.Root>
                    <Field.Description>A hex color.</Field.Description>
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ form }} />
        </>
    );
}
