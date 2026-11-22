import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { Fieldset } from "../../kit/ui/fieldset.tsx";

export function FieldsetBasic() {
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
                <Fieldset.Root>
                    <Fieldset.Legend>Shipping address</Fieldset.Legend>
                    <Field.Root name="street">
                        <Field.Label>Street</Field.Label>
                        <Field.Control />
                    </Field.Root>
                    <Field.Root name="city">
                        <Field.Label>City</Field.Label>
                        <Field.Control />
                    </Field.Root>
                </Fieldset.Root>
                <Fieldset.Root disabled>
                    <Fieldset.Legend>Billing address</Fieldset.Legend>
                    <Field.Root name="billing-street">
                        <Field.Label>Billing street</Field.Label>
                        <Field.Control />
                    </Field.Root>
                    <Fieldset.Root>
                        <Fieldset.Legend>Billing contact</Fieldset.Legend>
                        <Field.Root name="phone">
                            <Field.Label>Phone</Field.Label>
                            <Field.Control />
                        </Field.Root>
                    </Fieldset.Root>
                </Fieldset.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ form }} />
        </>
    );
}
