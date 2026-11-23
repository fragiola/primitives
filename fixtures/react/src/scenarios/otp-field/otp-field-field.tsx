import { useState } from "react";
import { formEntries } from "../../kit/form-entries.ts";
import { Output } from "../../kit/output.tsx";
import { Field } from "../../kit/ui/field.tsx";
import { OTPField } from "../../kit/ui/otp-field.tsx";
import { useOtpOutput } from "./use-otp-output.ts";

const SLOTS = [1, 2, 3, 4];

/** spec/otp-field.md, `/otp-field/field` */
export function OtpFieldField() {
    const output = useOtpOutput();
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
                <Field.Root name="otp">
                    <Field.Label>Sign-in code</Field.Label>
                    <OTPField.Root
                        length={4}
                        required
                        validationType="alphanumeric"
                        mask
                        {...output.handlers}
                    >
                        {SLOTS.map((slot) => (
                            <OTPField.Input
                                key={slot}
                                aria-label={`Character ${slot} of 4`}
                            />
                        ))}
                    </OTPField.Root>
                    <Field.Description>Check your email.</Field.Description>
                    <Field.Error>Enter the 4-character code.</Field.Error>
                </Field.Root>
                <button type="submit">Submit</button>
            </form>
            <Output values={{ ...output.values, form }} />
        </>
    );
}
