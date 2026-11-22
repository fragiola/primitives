import { Field } from "@fragiola/primitives-react/field";
import { styles } from "./styles.ts";

// A sign-up email: the label names the input, the description describes it, and "Sign up" with
// an empty or malformed address shows the matching error and focuses the input (spec/field.md).
export default function SignUpEmail() {
    return (
        <form
            className={styles.form}
            onSubmit={(event) => event.preventDefault()}
        >
            <Field.Root name="email" className={styles.root}>
                <Field.Label className={styles.label}>Email</Field.Label>
                <Field.Control
                    type="email"
                    required
                    className={styles.control}
                />
                <Field.Description className={styles.description}>
                    We never share it.
                </Field.Description>
                <Field.Error match="valueMissing" className={styles.error}>
                    Enter your email.
                </Field.Error>
                <Field.Error match="typeMismatch" className={styles.error}>
                    Enter a valid email.
                </Field.Error>
            </Field.Root>
            <button type="submit" className={styles.submit}>
                Sign up
            </button>
        </form>
    );
}
