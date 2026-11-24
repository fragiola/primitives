import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { pathText } from "./location-items.ts";
import { LocationSelect } from "./location-select.tsx";

const LYON = ["europe", "france", "lyon"];

/** spec/cascade-select.md, `/cascade-select/field` */
export function CascadeSelectField() {
    const [value, setValue] = useState<string>();
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
                <Field.Root name="place">
                    <Field.Label>Place</Field.Label>
                    <LocationSelect
                        defaultValue={LYON}
                        separator=" / "
                        onValueChange={(next) => setValue(pathText(next))}
                    />
                    <Field.Description>Where you live.</Field.Description>
                </Field.Root>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ value, form }} />
        </>
    );
}
