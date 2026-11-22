import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { Form } from "../../kit/ui/form.tsx";
import { validateWorkEmail } from "../field/validators.ts";

type Errors = Record<string, string | string[]>;

/** The keys of the errors left, as the scenario prints them (spec/form.md). */
const keys = (errors: Errors) => Object.keys(errors).join(",") || "empty";

export function FormBasic() {
    const [errors, setErrors] = useState<Errors>({});
    const [form, setForm] = useState<string>();
    const [cleared, setCleared] = useState<string>();
    return (
        <>
            <Form
                aria-label="Sign up"
                validationMode="onBlur"
                errors={errors}
                onClearErrors={(next: Errors) => {
                    setErrors(next);
                    setCleared(keys(next));
                }}
                onSubmit={(event) => {
                    event.preventDefault();
                    const data = new FormData(event.currentTarget);
                    setForm(formEntries(event.currentTarget));
                    // the server answers a task later
                    setTimeout(() => {
                        setErrors(
                            data.get("username") === "admin"
                                ? { username: "This username is taken." }
                                : {},
                        );
                    });
                }}
            >
                <Field.Root name="email" validate={validateWorkEmail}>
                    <Field.Label>Email</Field.Label>
                    <Field.Control type="email" required />
                    <Field.Error match="valueMissing">
                        Enter your email.
                    </Field.Error>
                    <Field.Error match="customError" />
                </Field.Root>
                <Field.Root name="username">
                    <Field.Label>Username</Field.Label>
                    <Field.Control />
                    <Field.Error />
                </Field.Root>
                <button type="submit">Submit</button>
            </Form>
            <Output values={{ form, cleared }} />
        </>
    );
}
