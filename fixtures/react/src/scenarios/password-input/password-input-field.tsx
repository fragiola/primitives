import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { PasswordInput } from "../../kit/ui/password-input.tsx";

/** A required new password in a Field (spec/password-input.md, `/password-input/field`). */
export function PasswordInputField() {
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
                    <Field.Label>New password</Field.Label>
                    <PasswordInput.Root required name="new-password">
                        <PasswordInput.Input
                            autoComplete="new-password"
                            minLength={8}
                        />
                        <PasswordInput.VisibilityTrigger aria-label="Show password" />
                    </PasswordInput.Root>
                    <Field.Description>
                        At least 8 characters.
                    </Field.Description>
                    <Field.Error>
                        Enter a password of 8 characters or more.
                    </Field.Error>
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
