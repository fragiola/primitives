import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Editable } from "../../kit/ui/editable.tsx";
import { Field } from "../../kit/ui/field.tsx";

/** A required Editable in a Field (spec/editable.md, `/editable/field`). */
export function EditableField() {
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
                <Field.Root>
                    <Field.Label>Project name</Field.Label>
                    <Editable.Root
                        required
                        name="project"
                        placeholder="Name your project"
                    >
                        <Editable.Area>
                            <Editable.Preview />
                            <Editable.Input />
                        </Editable.Area>
                        <Editable.EditTrigger aria-label="Edit project name" />
                    </Editable.Root>
                    <Field.Description>
                        Shown on the dashboard.
                    </Field.Description>
                    <Field.Error>Enter a project name.</Field.Error>
                </Field.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
