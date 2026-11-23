import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { SearchField } from "../../kit/ui/search-field.tsx";

/** A required SearchField in a Field (spec/search-field.md, `/search-field/field`). */
export function SearchFieldField() {
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
                    <Field.Label>City</Field.Label>
                    <SearchField.Root required name="city">
                        <SearchField.Input />
                        <SearchField.ClearButton aria-label="Clear city" />
                    </SearchField.Root>
                    <Field.Description>Where to look.</Field.Description>
                    <Field.Error>Enter a city.</Field.Error>
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
