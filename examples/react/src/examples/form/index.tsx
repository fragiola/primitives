import { Field } from "@fragiola/primitives-react/field";
import { Form, type FormErrors } from "@fragiola/primitives-react/form";
import { useState } from "react";
import { styles } from "./styles.ts";

// Create an account: the Form validates every field on submit and focuses the first invalid one;
// the server's answer shows on the field it names, and typing in that field clears it
// (spec/form.md). The example plays the server: `admin` is taken.
export default function CreateAccount() {
    const [errors, setErrors] = useState<FormErrors>({});
    const [status, setStatus] = useState("");
    return (
        <Form
            aria-label="Create account"
            errors={errors}
            onClearErrors={setErrors}
            onSubmit={(event) => {
                event.preventDefault();
                const username = String(
                    new FormData(event.currentTarget).get("username"),
                );
                if (username === "admin") {
                    setErrors({ username: "This username is taken." });
                    setStatus("");
                } else {
                    setStatus(`Account created for ${username}.`);
                }
            }}
            className={styles.form}
        >
            <Field.Root name="email" className={styles.field.root}>
                <Field.Label className={styles.field.label}>Email</Field.Label>
                <Field.Control
                    type="email"
                    required
                    className={styles.field.control}
                />
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Enter your email.
                </Field.Error>
                <Field.Error
                    match="typeMismatch"
                    className={styles.field.error}
                >
                    Enter a valid email.
                </Field.Error>
            </Field.Root>
            <Field.Root name="username" className={styles.field.root}>
                <Field.Label className={styles.field.label}>
                    Username
                </Field.Label>
                <Field.Control required className={styles.field.control} />
                <Field.Error
                    match="valueMissing"
                    className={styles.field.error}
                >
                    Choose a username.
                </Field.Error>
                {/* the server's answer: the Form's errors for the field */}
                {errors.username === undefined ? null : (
                    <Field.Error className={styles.field.error} />
                )}
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Create account
            </button>
            <p role="status" className={styles.status}>
                {status}
            </p>
        </Form>
    );
}
