import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { Listbox } from "../../kit/ui/listbox.tsx";
import { ListboxOptions } from "./listbox-options.tsx";
import { FRUITS, TOPPINGS } from "./options.ts";

/** A required list in a Field, and a multiple one in the same form (spec/listbox.md). */
export function ListboxField() {
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
                <Field.Root name="fruit">
                    <Field.Label>Fruit</Field.Label>
                    <Listbox.Root required>
                        <ListboxOptions options={FRUITS} />
                    </Listbox.Root>
                    <Field.Description>Pick one.</Field.Description>
                    <Field.Error>Choose a fruit.</Field.Error>
                </Field.Root>
                <div className="flex flex-col items-start gap-2">
                    <h2 id="toppings" className="text-sm font-semibold">
                        Toppings
                    </h2>
                    <Listbox.Root
                        aria-labelledby="toppings"
                        multiple
                        name="toppings"
                        defaultValue={["cheese"]}
                    >
                        <ListboxOptions options={TOPPINGS} />
                    </Listbox.Root>
                </div>
                <div className="flex gap-2">
                    <button type="submit">Submit</button>
                    <button type="reset">Reset</button>
                </div>
            </form>
            <Output values={{ form }} />
        </>
    );
}
