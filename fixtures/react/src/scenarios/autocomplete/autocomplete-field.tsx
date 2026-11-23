import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Autocomplete } from "../../kit/ui/autocomplete.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { CityPopup } from "./city-popup.tsx";
import { CITIES } from "./suggestions.ts";

/** The autocomplete inside a Field: labelled, described and validated by it. */
export function AutocompleteField() {
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
                <Field.Root name="city">
                    <Field.Label>City</Field.Label>
                    <Autocomplete.Root items={CITIES} required>
                        <Autocomplete.InputGroup>
                            <Autocomplete.Input />
                        </Autocomplete.InputGroup>
                        <CityPopup />
                    </Autocomplete.Root>
                    <Field.Description>Type or pick one.</Field.Description>
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
